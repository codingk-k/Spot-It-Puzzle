package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.common.Constants;
import com.game.spotthediff.dto.versus.LeaderboardVO;
import com.game.spotthediff.dto.versus.MatchRequest;
import com.game.spotthediff.dto.versus.RankInfoVO;
import com.game.spotthediff.dto.versus.RoomStateVO;
import com.game.spotthediff.entity.BattleRecord;
import com.game.spotthediff.entity.GameLevel;
import com.game.spotthediff.entity.Player;
import com.game.spotthediff.mapper.BattleRecordMapper;
import com.game.spotthediff.mapper.GameLevelMapper;
import com.game.spotthediff.mapper.PlayerMapper;
import com.game.spotthediff.service.VersusService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class VersusServiceImpl implements VersusService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PlayerMapper playerMapper;
    private final GameLevelMapper gameLevelMapper;
    private final BattleRecordMapper battleRecordMapper;

    public VersusServiceImpl(RedisTemplate<String, Object> redisTemplate,
                             PlayerMapper playerMapper,
                             GameLevelMapper gameLevelMapper,
                             BattleRecordMapper battleRecordMapper) {
        this.redisTemplate = redisTemplate;
        this.playerMapper = playerMapper;
        this.gameLevelMapper = gameLevelMapper;
        this.battleRecordMapper = battleRecordMapper;
    }

    @Override
    public void joinQueue(Long playerId, MatchRequest request) {
        String queueKey = Constants.MATCHING_QUEUE_PREFIX + request.getDifficulty();
        redisTemplate.opsForZSet().add(queueKey, String.valueOf(playerId), System.currentTimeMillis());
    }

    @Override
    public void cancelQueue(Long playerId, String difficulty) {
        String queueKey = Constants.MATCHING_QUEUE_PREFIX + difficulty;
        redisTemplate.opsForZSet().remove(queueKey, String.valueOf(playerId));
    }

    @Override
    public RoomStateVO startAsyncBattle(Long playerId, Long levelId) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }

        String roomId = UUID.randomUUID().toString().replace("-", "");
        String roomKey = Constants.ROOM_PREFIX + roomId;

        Player player = playerMapper.selectById(playerId);
        String nickname = player != null ? player.getNickname() : "未知玩家";

        RoomStateVO.PlayerState playerState = RoomStateVO.PlayerState.builder()
                .playerId(playerId)
                .nickname(nickname)
                .score(0)
                .foundDiffs(new ArrayList<>())
                .build();

        Map<String, Object> roomData = new HashMap<>();
        roomData.put("roomId", roomId);
        roomData.put("levelId", String.valueOf(levelId));
        roomData.put("timeLimit", String.valueOf(level.getTimeLimit()));
        roomData.put("startTime", String.valueOf(System.currentTimeMillis()));
        roomData.put("finished", "false");
        roomData.put("player1Id", String.valueOf(playerId));
        roomData.put("player1Nickname", nickname);
        roomData.put("player1Score", "0");
        roomData.put("player1FoundDiffs", "");
        roomData.put("mode", "ASYNC");

        redisTemplate.opsForHash().putAll(roomKey, roomData);
        redisTemplate.expire(roomKey, level.getTimeLimit() + 120, TimeUnit.SECONDS);

        return RoomStateVO.builder()
                .roomId(roomId)
                .players(List.of(playerState))
                .foundCount(0)
                .totalDiffs(level.getDiffCount())
                .startTime(System.currentTimeMillis())
                .timeLimit(level.getTimeLimit())
                .finished(false)
                .build();
    }

    @Override
    public RoomStateVO submitAsyncResult(Long playerId, String roomId, int score, int duration) {
        String roomKey = Constants.ROOM_PREFIX + roomId;
        Map<Object, Object> roomData = redisTemplate.opsForHash().entries(roomKey);
        if (roomData.isEmpty()) {
            throw new BusinessException("房间不存在");
        }

        redisTemplate.opsForHash().put(roomKey, "player1Score", String.valueOf(score));
        redisTemplate.opsForHash().put(roomKey, "finished", "true");

        BattleRecord record = new BattleRecord();
        record.setRoomId(roomId);
        record.setPlayerId(playerId);
        record.setMode("ASYNC");
        record.setScore(score);
        record.setRank(1);
        record.setEloChange(0);
        record.setDuration(duration);
        battleRecordMapper.insert(record);

        Player player = playerMapper.selectById(playerId);
        String nickname = player != null ? player.getNickname() : "未知玩家";

        RoomStateVO.PlayerState playerState = RoomStateVO.PlayerState.builder()
                .playerId(playerId)
                .nickname(nickname)
                .score(score)
                .foundDiffs(new ArrayList<>())
                .build();

        return RoomStateVO.builder()
                .roomId(roomId)
                .players(List.of(playerState))
                .foundCount(0)
                .totalDiffs(0)
                .startTime(Long.parseLong(roomData.getOrDefault("startTime", "0").toString()))
                .timeLimit(Integer.parseInt(roomData.getOrDefault("timeLimit", "0").toString()))
                .finished(true)
                .build();
    }

    @Override
    public List<LeaderboardVO> getLeaderboard(Long levelId) {
        List<BattleRecord> records = battleRecordMapper.selectList(
                new LambdaQueryWrapper<BattleRecord>()
                        .eq(BattleRecord::getMode, "REALTIME")
                        .orderByDesc(BattleRecord::getScore)
                        .last("LIMIT 50"));

        List<LeaderboardVO> leaderboard = new ArrayList<>();
        int rank = 1;
        for (BattleRecord record : records) {
            Player player = playerMapper.selectById(record.getPlayerId());
            if (player != null) {
                leaderboard.add(LeaderboardVO.builder()
                        .playerId(player.getId())
                        .nickname(player.getNickname())
                        .avatar(player.getAvatar())
                        .score(record.getScore())
                        .rank(rank++)
                        .elo(player.getElo())
                        .build());
            }
        }
        return leaderboard;
    }

    @Override
    public RankInfoVO getRank(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }

        Long wins = battleRecordMapper.selectCount(
                new LambdaQueryWrapper<BattleRecord>()
                        .eq(BattleRecord::getPlayerId, playerId)
                        .eq(BattleRecord::getRank, 1));

        Long losses = battleRecordMapper.selectCount(
                new LambdaQueryWrapper<BattleRecord>()
                        .eq(BattleRecord::getPlayerId, playerId)
                        .ne(BattleRecord::getRank, 1));

        Long higherElo = playerMapper.selectCount(
                new LambdaQueryWrapper<Player>()
                        .gt(Player::getElo, player.getElo()));

        return RankInfoVO.builder()
                .playerId(playerId)
                .nickname(player.getNickname())
                .elo(player.getElo())
                .rank(higherElo.intValue() + 1)
                .wins(wins.intValue())
                .losses(losses.intValue())
                .build();
    }

    public void matchPlayers() {
        String[] difficulties = {"EASY", "MEDIUM", "HARD", "MASTER"};
        for (String difficulty : difficulties) {
            String queueKey = Constants.MATCHING_QUEUE_PREFIX + difficulty;
            Set<ZSetOperations.TypedTuple<Object>> players = redisTemplate.opsForZSet()
                    .rangeWithScores(queueKey, 0, -1);

            if (players == null || players.size() < 2) {
                continue;
            }

            List<ZSetOperations.TypedTuple<Object>> playerList = new ArrayList<>(players);
            long now = System.currentTimeMillis();

            for (int i = 0; i < playerList.size() - 1; i++) {
                String playerId1 = String.valueOf(playerList.get(i).getValue());
                Player p1 = playerMapper.selectById(Long.parseLong(playerId1));
                if (p1 == null) continue;

                for (int j = i + 1; j < playerList.size(); j++) {
                    String playerId2 = String.valueOf(playerList.get(j).getValue());
                    Player p2 = playerMapper.selectById(Long.parseLong(playerId2));
                    if (p2 == null) continue;

                    int eloDiff = Math.abs(p1.getElo() - p2.getElo());
                    long waitTime = now - playerList.get(i).getScore().longValue();
                    int expandRange = (int) (waitTime / 10000) * Constants.ELO_RANGE_EXPAND;
                    int maxRange = Math.min(Constants.ELO_RANGE_INITIAL + expandRange, Constants.ELO_RANGE_MAX);

                    if (eloDiff <= maxRange) {
                        createRoom(p1, p2, difficulty);
                        redisTemplate.opsForZSet().remove(queueKey, playerId1);
                        redisTemplate.opsForZSet().remove(queueKey, playerId2);
                        break;
                    }
                }
            }
        }
    }

    private void createRoom(Player p1, Player p2, String difficulty) {
        String roomId = UUID.randomUUID().toString().replace("-", "");
        String roomKey = Constants.ROOM_PREFIX + roomId;

        List<GameLevel> levels = gameLevelMapper.selectList(
                new LambdaQueryWrapper<GameLevel>()
                        .eq(GameLevel::getDifficulty, difficulty)
                        .eq(GameLevel::getStatus, "PUBLISHED")
                        .orderByAsc(GameLevel::getSortOrder)
                        .last("LIMIT 1"));

        int timeLimit = levels.isEmpty() ? 90 : levels.get(0).getTimeLimit();
        Long levelId = levels.isEmpty() ? 1L : levels.get(0).getId();

        Map<String, Object> roomData = new HashMap<>();
        roomData.put("roomId", roomId);
        roomData.put("levelId", String.valueOf(levelId));
        roomData.put("timeLimit", String.valueOf(timeLimit));
        roomData.put("startTime", String.valueOf(System.currentTimeMillis()));
        roomData.put("finished", "false");
        roomData.put("mode", "REALTIME");
        roomData.put("player1Id", String.valueOf(p1.getId()));
        roomData.put("player1Nickname", p1.getNickname());
        roomData.put("player1Score", "0");
        roomData.put("player1FoundDiffs", "");
        roomData.put("player2Id", String.valueOf(p2.getId()));
        roomData.put("player2Nickname", p2.getNickname());
        roomData.put("player2Score", "0");
        roomData.put("player2FoundDiffs", "");

        redisTemplate.opsForHash().putAll(roomKey, roomData);
        redisTemplate.expire(roomKey, timeLimit + 120, TimeUnit.SECONDS);
    }
}
