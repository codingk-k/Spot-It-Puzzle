package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.dto.admin.DashboardVO;
import com.game.spotthediff.dto.admin.DiffMark;
import com.game.spotthediff.dto.admin.LevelForm;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.player.PlayerProfileVO;
import com.game.spotthediff.entity.*;
import com.game.spotthediff.mapper.*;
import com.game.spotthediff.service.AdminService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final PlayerMapper playerMapper;
    private final GameLevelMapper gameLevelMapper;
    private final LevelDifferenceMapper levelDifferenceMapper;
    private final PlayerLevelProgressMapper progressMapper;
    private final BattleRecordMapper battleRecordMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    public AdminServiceImpl(PlayerMapper playerMapper, GameLevelMapper gameLevelMapper,
                            LevelDifferenceMapper levelDifferenceMapper,
                            PlayerLevelProgressMapper progressMapper,
                            BattleRecordMapper battleRecordMapper,
                            RedisTemplate<String, Object> redisTemplate) {
        this.playerMapper = playerMapper;
        this.gameLevelMapper = gameLevelMapper;
        this.levelDifferenceMapper = levelDifferenceMapper;
        this.progressMapper = progressMapper;
        this.battleRecordMapper = battleRecordMapper;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public DashboardVO getDashboard() {
        Long totalPlayers = playerMapper.selectCount(null);
        Long totalLevels = gameLevelMapper.selectCount(
                new LambdaQueryWrapper<GameLevel>().eq(GameLevel::getStatus, "PUBLISHED"));
        Long totalGamesPlayed = progressMapper.selectCount(null);

        Set<Object> onlinePlayersRaw = redisTemplate.opsForSet().members("online:players");
        long onlineCount = onlinePlayersRaw != null ? onlinePlayersRaw.size() : 0;

        String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        Long activeToday = playerMapper.selectCount(
                new LambdaQueryWrapper<Player>()
                        .apply("DATE(last_login_at) = {0}", today));

        return DashboardVO.builder()
                .totalPlayers(totalPlayers)
                .totalLevels(totalLevels)
                .totalGamesPlayed(totalGamesPlayed)
                .onlinePlayers(onlineCount)
                .activePlayersToday(activeToday)
                .build();
    }

    @Override
    public int getOnlineCount() {
        Set<Object> onlinePlayersRaw = redisTemplate.opsForSet().members("online:players");
        return onlinePlayersRaw != null ? onlinePlayersRaw.size() : 0;
    }

    @Override
    public List<LevelDetailVO> getLevels() {
        List<GameLevel> levels = gameLevelMapper.selectList(
                new LambdaQueryWrapper<GameLevel>().orderByDesc(GameLevel::getCreatedAt));
        return levels.stream().map(this::toLevelDetailVO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LevelDetailVO createLevel(LevelForm form) {
        GameLevel level = new GameLevel();
        level.setName(form.getName());
        level.setDescription(form.getDescription());
        level.setThemeId(form.getThemeId());
        level.setChapterId(form.getChapterId());
        level.setImageAUrl(form.getImageAUrl());
        level.setImageBUrl(form.getImageBUrl());
        level.setTimeLimit(form.getTimeLimit());
        level.setDiffCount(form.getDiffCount());
        level.setDiffRadius(form.getDiffRadius());
        level.setDifficulty(form.getDifficulty());
        level.setSortOrder(form.getSortOrder() != null ? form.getSortOrder() : 0);
        level.setStatus("DRAFT");
        level.setCreatedAt(LocalDateTime.now());
        level.setUpdatedAt(LocalDateTime.now());
        gameLevelMapper.insert(level);

        if (form.getDiffs() != null) {
            saveDiffList(level.getId(), form.getDiffs());
        }

        return toLevelDetailVO(level);
    }

    @Override
    @Transactional
    public LevelDetailVO updateLevel(Long levelId, LevelForm form) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }

        if (form.getName() != null) level.setName(form.getName());
        if (form.getDescription() != null) level.setDescription(form.getDescription());
        if (form.getThemeId() != null) level.setThemeId(form.getThemeId());
        if (form.getChapterId() != null) level.setChapterId(form.getChapterId());
        if (form.getImageAUrl() != null) level.setImageAUrl(form.getImageAUrl());
        if (form.getImageBUrl() != null) level.setImageBUrl(form.getImageBUrl());
        if (form.getTimeLimit() != null) level.setTimeLimit(form.getTimeLimit());
        if (form.getDiffCount() != null) level.setDiffCount(form.getDiffCount());
        if (form.getDiffRadius() != null) level.setDiffRadius(form.getDiffRadius());
        if (form.getDifficulty() != null) level.setDifficulty(form.getDifficulty());
        if (form.getSortOrder() != null) level.setSortOrder(form.getSortOrder());
        level.setUpdatedAt(LocalDateTime.now());
        gameLevelMapper.updateById(level);

        String cacheKey = "level:config:" + levelId;
        redisTemplate.delete(cacheKey);

        return toLevelDetailVO(level);
    }

    @Override
    public LevelDetailVO getLevel(Long levelId) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }
        return toLevelDetailVO(level);
    }

    @Override
    public void publishLevel(Long levelId) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }
        level.setStatus("PUBLISHED");
        level.setUpdatedAt(LocalDateTime.now());
        gameLevelMapper.updateById(level);
        redisTemplate.delete("level:config:" + levelId);
    }

    @Override
    public void offlineLevel(Long levelId) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }
        level.setStatus("OFFLINE");
        level.setUpdatedAt(LocalDateTime.now());
        gameLevelMapper.updateById(level);
        redisTemplate.delete("level:config:" + levelId);
    }

    @Override
    @Transactional
    public void saveDiffs(Long levelId, List<DiffMark> diffs) {
        levelDifferenceMapper.delete(
                new LambdaQueryWrapper<LevelDifference>().eq(LevelDifference::getLevelId, levelId));
        saveDiffList(levelId, diffs);
    }

    @Override
    public List<DiffMark> getDiffs(Long levelId) {
        List<LevelDifference> diffs = levelDifferenceMapper.selectList(
                new LambdaQueryWrapper<LevelDifference>()
                        .eq(LevelDifference::getLevelId, levelId)
                        .orderByAsc(LevelDifference::getSortOrder));
        return diffs.stream().map(d -> DiffMark.builder()
                .x(d.getDiffX())
                .y(d.getDiffY())
                .radius(d.getRadius())
                .type(d.getType())
                .description(d.getDescription())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<PlayerProfileVO> getPlayers(int page, int size) {
        List<Player> players = playerMapper.selectList(
                new LambdaQueryWrapper<Player>()
                        .orderByDesc(Player::getCreatedAt)
                        .last("LIMIT " + (page - 1) * size + "," + size));

        return players.stream().map(p -> PlayerProfileVO.builder()
                .id(p.getId())
                .username(p.getUsername())
                .nickname(p.getNickname())
                .avatar(p.getAvatar())
                .level(p.getLevel())
                .exp(p.getExp())
                .gold(p.getGold())
                .diamonds(p.getDiamonds())
                .elo(p.getElo())
                .hintItems(p.getHintItems())
                .build()).toList();
    }

    @Override
    public void banPlayer(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }
        player.setStatus("BANNED");
        player.setUpdatedAt(LocalDateTime.now());
        playerMapper.updateById(player);
    }

    @Override
    public void unbanPlayer(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }
        player.setStatus("ACTIVE");
        player.setUpdatedAt(LocalDateTime.now());
        playerMapper.updateById(player);
    }

    @Override
    public Map<String, Object> getRetentionStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < 7; i++) {
            String date = now.minusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Long count = playerMapper.selectCount(
                    new LambdaQueryWrapper<Player>()
                            .apply("DATE(last_login_at) = {0}", date));
            stats.put(date, count);
        }

        return stats;
    }

    @Override
    public Map<String, Object> getFunnelStats() {
        Map<String, Object> funnel = new LinkedHashMap<>();

        Long totalRegistered = playerMapper.selectCount(null);
        Long playedOnce = progressMapper.selectCount(
                new LambdaQueryWrapper<PlayerLevelProgress>().ge(PlayerLevelProgress::getAttempts, 1));
        Long completedOnce = progressMapper.selectCount(
                new LambdaQueryWrapper<PlayerLevelProgress>().eq(PlayerLevelProgress::getCompleted, true));
        Long battled = battleRecordMapper.selectCount(
                new LambdaQueryWrapper<BattleRecord>().eq(BattleRecord::getMode, "REALTIME"));

        funnel.put("registered", totalRegistered);
        funnel.put("playedOnce", playedOnce);
        funnel.put("completedOnce", completedOnce);
        funnel.put("battled", battled);

        return funnel;
    }

    private void saveDiffList(Long levelId, List<DiffMark> diffs) {
        for (int i = 0; i < diffs.size(); i++) {
            DiffMark mark = diffs.get(i);
            LevelDifference diff = new LevelDifference();
            diff.setLevelId(levelId);
            diff.setDiffX(mark.getX());
            diff.setDiffY(mark.getY());
            diff.setRadius(mark.getRadius());
            diff.setType(mark.getType() != null ? mark.getType() : "COLOR_CHANGE");
            diff.setDescription(mark.getDescription());
            diff.setSortOrder(i);
            levelDifferenceMapper.insert(diff);
        }
    }

    private LevelDetailVO toLevelDetailVO(GameLevel level) {
        return LevelDetailVO.builder()
                .id(level.getId())
                .name(level.getName())
                .description(level.getDescription())
                .imageAUrl(level.getImageAUrl())
                .imageBUrl(level.getImageBUrl())
                .timeLimit(level.getTimeLimit())
                .diffCount(level.getDiffCount())
                .diffRadius(level.getDiffRadius())
                .difficulty(level.getDifficulty())
                .sortOrder(level.getSortOrder())
                .build();
    }
}
