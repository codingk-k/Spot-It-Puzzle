package com.game.spotthediff.websocket;

import com.game.spotthediff.common.Constants;
import com.game.spotthediff.dto.versus.RoomStateVO;
import com.game.spotthediff.entity.Player;
import com.game.spotthediff.mapper.PlayerMapper;
import com.game.spotthediff.service.impl.VersusServiceImpl;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameRoomHandler {

    private final RedisTemplate<String, Object> redisTemplate;
    private final PlayerMapper playerMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> activeRooms = ConcurrentHashMap.newKeySet();

    public GameRoomHandler(RedisTemplate<String, Object> redisTemplate,
                           PlayerMapper playerMapper,
                           SimpMessagingTemplate messagingTemplate) {
        this.redisTemplate = redisTemplate;
        this.playerMapper = playerMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/room/join")
    public void handleJoin(String roomId) {
        activeRooms.add(roomId);
    }

    @MessageMapping("/room/leave")
    public void handleLeave(String roomId) {
        activeRooms.remove(roomId);
    }

    @MessageMapping("/room/found")
    public void handleFound(Map<String, Object> payload) {
        String roomId = (String) payload.get("roomId");
        Long playerId = Long.valueOf(payload.get("playerId").toString());
        Integer diffIndex = Integer.valueOf(payload.get("diffIndex").toString());

        String roomKey = Constants.ROOM_PREFIX + roomId;
        String playerKey = getPlayerKey(roomId, playerId);

        String foundDiffsStr = (String) redisTemplate.opsForHash().get(roomKey, playerKey + "FoundDiffs");
        Set<Integer> foundDiffs = new HashSet<>();
        if (foundDiffsStr != null && !foundDiffsStr.isEmpty()) {
            Arrays.stream(foundDiffsStr.split(","))
                    .filter(s -> !s.isEmpty())
                    .forEach(s -> foundDiffs.add(Integer.parseInt(s.trim())));
        }
        foundDiffs.add(diffIndex);

        String updatedFoundDiffs = foundDiffs.stream()
                .map(String::valueOf)
                .reduce((a, b) -> a + "," + b)
                .orElse("");
        redisTemplate.opsForHash().put(roomKey, playerKey + "FoundDiffs", updatedFoundDiffs);

        int currentScore = Integer.parseInt(
                redisTemplate.opsForHash().get(roomKey, playerKey + "Score").toString());
        int newScore = currentScore + Constants.BASE_SCORE;
        redisTemplate.opsForHash().put(roomKey, playerKey + "Score", String.valueOf(newScore));
    }

    @Scheduled(fixedRate = Constants.ROOM_BROADCAST_RATE)
    public void broadcastRoomStates() {
        for (String roomId : activeRooms) {
            try {
                RoomStateVO state = buildRoomState(roomId);
                if (state != null) {
                    messagingTemplate.convertAndSend("/game/room/" + roomId, state);
                    if (Boolean.TRUE.equals(state.getFinished())) {
                        activeRooms.remove(roomId);
                    }
                }
            } catch (Exception e) {
                activeRooms.remove(roomId);
            }
        }
    }

    private RoomStateVO buildRoomState(String roomId) {
        String roomKey = Constants.ROOM_PREFIX + roomId;
        Map<Object, Object> roomData = redisTemplate.opsForHash().entries(roomKey);
        if (roomData.isEmpty()) {
            return null;
        }

        boolean finished = Boolean.parseBoolean(roomData.getOrDefault("finished", "false").toString());
        int timeLimit = Integer.parseInt(roomData.getOrDefault("timeLimit", "0").toString());
        long startTime = Long.parseLong(roomData.getOrDefault("startTime", "0").toString());

        List<RoomStateVO.PlayerState> players = new ArrayList<>();

        String p1Id = roomData.getOrDefault("player1Id", "").toString();
        if (!p1Id.isEmpty()) {
            Player p1 = playerMapper.selectById(Long.parseLong(p1Id));
            String p1FoundDiffs = roomData.getOrDefault("player1FoundDiffs", "").toString();
            List<Integer> p1Found = parseFoundDiffs(p1FoundDiffs);
            int p1Score = Integer.parseInt(roomData.getOrDefault("player1Score", "0").toString());

            players.add(RoomStateVO.PlayerState.builder()
                    .playerId(Long.parseLong(p1Id))
                    .nickname(p1 != null ? p1.getNickname() : "玩家1")
                    .score(p1Score)
                    .foundDiffs(p1Found)
                    .build());
        }

        String p2Id = roomData.getOrDefault("player2Id", "").toString();
        if (!p2Id.isEmpty()) {
            Player p2 = playerMapper.selectById(Long.parseLong(p2Id));
            String p2FoundDiffs = roomData.getOrDefault("player2FoundDiffs", "").toString();
            List<Integer> p2Found = parseFoundDiffs(p2FoundDiffs);
            int p2Score = Integer.parseInt(roomData.getOrDefault("player2Score", "0").toString());

            players.add(RoomStateVO.PlayerState.builder()
                    .playerId(Long.parseLong(p2Id))
                    .nickname(p2 != null ? p2.getNickname() : "玩家2")
                    .score(p2Score)
                    .foundDiffs(p2Found)
                    .build());
        }

        int totalFound = players.stream()
                .mapToInt(p -> p.getFoundDiffs().size())
                .max()
                .orElse(0);

        int totalDiffs = Integer.parseInt(roomData.getOrDefault("totalDiffs", "0").toString());

        long elapsed = (System.currentTimeMillis() - startTime) / 1000;
        if (elapsed >= timeLimit) {
            finished = true;
        }

        return RoomStateVO.builder()
                .roomId(roomId)
                .players(players)
                .foundCount(totalFound)
                .totalDiffs(totalDiffs)
                .startTime(startTime)
                .timeLimit(timeLimit)
                .finished(finished)
                .build();
    }

    private String getPlayerKey(String roomId, Long playerId) {
        String roomKey = Constants.ROOM_PREFIX + roomId;
        String p1Id = (String) redisTemplate.opsForHash().get(roomKey, "player1Id");
        return String.valueOf(playerId).equals(p1Id) ? "player1" : "player2";
    }

    private List<Integer> parseFoundDiffs(String foundDiffsStr) {
        if (foundDiffsStr == null || foundDiffsStr.isEmpty()) {
            return new ArrayList<>();
        }
        List<Integer> result = new ArrayList<>();
        Arrays.stream(foundDiffsStr.split(","))
                .filter(s -> !s.isEmpty())
                .forEach(s -> result.add(Integer.parseInt(s.trim())));
        return result;
    }
}
