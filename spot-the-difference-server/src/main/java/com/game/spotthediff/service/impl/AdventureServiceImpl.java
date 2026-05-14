package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.common.Constants;
import com.game.spotthediff.dto.adventure.CompleteRequest;
import com.game.spotthediff.dto.adventure.CompleteResponse;
import com.game.spotthediff.dto.adventure.ProgressVO;
import com.game.spotthediff.dto.level.CheckRequest;
import com.game.spotthediff.dto.level.CheckResponse;
import com.game.spotthediff.entity.GameLevel;
import com.game.spotthediff.entity.LevelDifference;
import com.game.spotthediff.entity.Player;
import com.game.spotthediff.entity.PlayerLevelProgress;
import com.game.spotthediff.mapper.GameLevelMapper;
import com.game.spotthediff.mapper.LevelDifferenceMapper;
import com.game.spotthediff.mapper.PlayerLevelProgressMapper;
import com.game.spotthediff.mapper.PlayerMapper;
import com.game.spotthediff.service.AdventureService;
import com.game.spotthediff.service.GameSessionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdventureServiceImpl implements AdventureService {

    private final GameLevelMapper gameLevelMapper;
    private final LevelDifferenceMapper levelDifferenceMapper;
    private final PlayerLevelProgressMapper progressMapper;
    private final PlayerMapper playerMapper;
    private final GameSessionService gameSessionService;

    public AdventureServiceImpl(GameLevelMapper gameLevelMapper,
                                LevelDifferenceMapper levelDifferenceMapper,
                                PlayerLevelProgressMapper progressMapper,
                                PlayerMapper playerMapper,
                                GameSessionService gameSessionService) {
        this.gameLevelMapper = gameLevelMapper;
        this.levelDifferenceMapper = levelDifferenceMapper;
        this.progressMapper = progressMapper;
        this.playerMapper = playerMapper;
        this.gameSessionService = gameSessionService;
    }

    @Override
    public void startGame(Long playerId, Long levelId) {
        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null || !"PUBLISHED".equals(level.getStatus())) {
            throw new BusinessException("关卡不存在或未发布");
        }

        if (gameSessionService.sessionExists(playerId, levelId)) {
            gameSessionService.deleteSession(playerId, levelId);
        }

        gameSessionService.createSession(playerId, levelId, level.getTimeLimit());

        PlayerLevelProgress progress = progressMapper.selectOne(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId)
                        .eq(PlayerLevelProgress::getLevelId, levelId));

        if (progress == null) {
            progress = new PlayerLevelProgress();
            progress.setPlayerId(playerId);
            progress.setLevelId(levelId);
            progress.setBestScore(0);
            progress.setStars(0);
            progress.setCompleted(false);
            progress.setAttempts(0);
            progress.setUpdatedAt(LocalDateTime.now());
            progressMapper.insert(progress);
        } else {
            progress.setAttempts(progress.getAttempts() + 1);
            progress.setUpdatedAt(LocalDateTime.now());
            progressMapper.updateById(progress);
        }
    }

    @Override
    public CheckResponse checkClick(Long playerId, Long levelId, CheckRequest request) {
        Map<Object, Object> session = gameSessionService.getSession(playerId, levelId);
        if (session == null || session.isEmpty()) {
            throw new BusinessException("游戏会话不存在，请先开始游戏");
        }

        List<LevelDifference> allDiffs = levelDifferenceMapper.selectList(
                new LambdaQueryWrapper<LevelDifference>()
                        .eq(LevelDifference::getLevelId, levelId)
                        .orderByAsc(LevelDifference::getSortOrder));

        String foundDiffsStr = (String) session.get("foundDiffs");
        Set<Integer> foundDiffs = new HashSet<>();
        if (foundDiffsStr != null && !foundDiffsStr.isEmpty()) {
            Arrays.stream(foundDiffsStr.split(","))
                    .filter(s -> !s.isEmpty())
                    .forEach(s -> foundDiffs.add(Integer.parseInt(s.trim())));
        }

        int combo = Integer.parseInt(session.getOrDefault("combo", "0").toString());
        int score = Integer.parseInt(session.getOrDefault("score", "0").toString());
        int totalPenalty = Integer.parseInt(session.getOrDefault("totalPenalty", "0").toString());

        int hitIndex = -1;
        LevelDifference hitDiff = null;

        for (int i = 0; i < allDiffs.size(); i++) {
            if (foundDiffs.contains(i)) {
                continue;
            }
            LevelDifference diff = allDiffs.get(i);
            double distance = Math.sqrt(
                    Math.pow(request.getClickX() - diff.getDiffX(), 2) +
                    Math.pow(request.getClickY() - diff.getDiffY(), 2));
            if (distance <= diff.getRadius() * 1.2) {
                hitIndex = i;
                hitDiff = diff;
                break;
            }
        }

        if (hitDiff != null) {
            foundDiffs.add(hitIndex);
            combo++;
            int baseScore = Constants.BASE_SCORE;
            double comboMultiplier = 1 + combo * Constants.COMBO_MULTIPLIER;
            int finalScore = (int) (baseScore * comboMultiplier);
            score += finalScore;

            gameSessionService.updateSessionField(playerId, levelId, "foundDiffs",
                    foundDiffs.stream().map(String::valueOf).collect(Collectors.joining(",")));
            gameSessionService.updateSessionField(playerId, levelId, "combo", String.valueOf(combo));
            gameSessionService.updateSessionField(playerId, levelId, "score", String.valueOf(score));

            return CheckResponse.builder()
                    .hit(true)
                    .diffIndex(hitIndex)
                    .description(hitDiff.getDescription())
                    .score(finalScore)
                    .combo(combo)
                    .penalty(0)
                    .timePenalty(0)
                    .build();
        } else {
            combo = 0;
            score += Constants.MISS_PENALTY;
            totalPenalty += Math.abs(Constants.MISS_PENALTY);

            gameSessionService.updateSessionField(playerId, levelId, "combo", "0");
            gameSessionService.updateSessionField(playerId, levelId, "score", String.valueOf(score));
            gameSessionService.updateSessionField(playerId, levelId, "totalPenalty", String.valueOf(totalPenalty));

            return CheckResponse.builder()
                    .hit(false)
                    .diffIndex(-1)
                    .description("")
                    .score(Constants.MISS_PENALTY)
                    .combo(0)
                    .penalty(Math.abs(Constants.MISS_PENALTY))
                    .timePenalty(Constants.MISS_TIME_PENALTY)
                    .build();
        }
    }

    @Override
    public CompleteResponse completeGame(Long playerId, Long levelId, CompleteRequest request) {
        Map<Object, Object> session = gameSessionService.getSession(playerId, levelId);
        if (session == null || session.isEmpty()) {
            throw new BusinessException("游戏会话不存在");
        }

        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            throw new BusinessException("关卡不存在");
        }

        int sessionScore = Integer.parseInt(session.getOrDefault("score", "0").toString());
        int totalPenalty = Integer.parseInt(session.getOrDefault("totalPenalty", "0").toString());
        String foundDiffsStr = (String) session.get("foundDiffs");
        int foundCount = 0;
        if (foundDiffsStr != null && !foundDiffsStr.isEmpty()) {
            foundCount = (int) Arrays.stream(foundDiffsStr.split(","))
                    .filter(s -> !s.isEmpty())
                    .count();
        }

        int timeUsed = request.getTimeUsed() != null ? request.getTimeUsed() : 0;
        int hintsUsed = request.getHintsUsed() != null ? request.getHintsUsed() : 0;
        int remainingTime = Math.max(0, level.getTimeLimit() - timeUsed);

        int timeBonus = remainingTime * Constants.TIME_BONUS_MULTIPLIER;
        int comboBonus = foundCount > 0 ? foundCount * 20 : 0;
        int hintPenalty = hintsUsed * Constants.HINT_PENALTY;

        int finalScore = sessionScore + timeBonus + comboBonus - hintPenalty;
        if (finalScore < 0) {
            finalScore = 0;
        }

        int maxPossibleScore = level.getDiffCount() * Constants.BASE_SCORE + level.getTimeLimit() * Constants.TIME_BONUS_MULTIPLIER;
        double scoreRatio = maxPossibleScore > 0 ? (double) finalScore / maxPossibleScore : 0;

        int stars;
        if (scoreRatio >= Constants.STAR3_THRESHOLD) {
            stars = 3;
        } else if (scoreRatio >= Constants.STAR2_THRESHOLD) {
            stars = 2;
        } else if (finalScore > 0) {
            stars = 1;
        } else {
            stars = 0;
        }

        PlayerLevelProgress progress = progressMapper.selectOne(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId)
                        .eq(PlayerLevelProgress::getLevelId, levelId));

        if (progress != null) {
            if (finalScore > progress.getBestScore()) {
                progress.setBestScore(finalScore);
            }
            if (stars > progress.getStars()) {
                progress.setStars(stars);
            }
            if (foundCount >= level.getDiffCount()) {
                progress.setCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
            }
            progress.setUpdatedAt(LocalDateTime.now());
            progressMapper.updateById(progress);
        }

        Player player = playerMapper.selectById(playerId);
        if (player != null) {
            int goldEarned = finalScore / 10;
            int expEarned = finalScore / 5;
            player.setGold(player.getGold() + goldEarned);
            player.setExp(player.getExp() + expEarned);

            int expForLevel = player.getLevel() * 100;
            while (player.getExp() >= expForLevel) {
                player.setExp(player.getExp() - expForLevel);
                player.setLevel(player.getLevel() + 1);
                expForLevel = player.getLevel() * 100;
            }
            playerMapper.updateById(player);
        }

        gameSessionService.deleteSession(playerId, levelId);

        return CompleteResponse.builder()
                .score(finalScore)
                .stars(stars)
                .timeBonus(timeBonus)
                .comboBonus(comboBonus)
                .penalty(totalPenalty)
                .hintPenalty(hintPenalty)
                .build();
    }

    @Override
    public List<ProgressVO> getPlayerProgress(Long playerId) {
        List<PlayerLevelProgress> progresses = progressMapper.selectList(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId));

        List<ProgressVO> result = new ArrayList<>();
        for (PlayerLevelProgress p : progresses) {
            GameLevel level = gameLevelMapper.selectById(p.getLevelId());
            String levelName = level != null ? level.getName() : "未知关卡";
            result.add(ProgressVO.builder()
                    .levelId(p.getLevelId())
                    .levelName(levelName)
                    .bestScore(p.getBestScore())
                    .stars(p.getStars())
                    .completed(p.getCompleted())
                    .attempts(p.getAttempts())
                    .build());
        }
        return result;
    }
}
