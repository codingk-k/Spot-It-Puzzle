package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.dto.level.ChapterVO;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.level.LevelListItemVO;
import com.game.spotthediff.entity.GameLevel;
import com.game.spotthediff.entity.LevelChapter;
import com.game.spotthediff.mapper.GameLevelMapper;
import com.game.spotthediff.mapper.LevelChapterMapper;
import com.game.spotthediff.service.LevelService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class LevelServiceImpl implements LevelService {

    private final GameLevelMapper gameLevelMapper;
    private final LevelChapterMapper levelChapterMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    public LevelServiceImpl(GameLevelMapper gameLevelMapper, LevelChapterMapper levelChapterMapper,
                            RedisTemplate<String, Object> redisTemplate) {
        this.gameLevelMapper = gameLevelMapper;
        this.levelChapterMapper = levelChapterMapper;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public List<ChapterVO> getAllChapters() {
        List<LevelChapter> chapters = levelChapterMapper.selectList(
                new LambdaQueryWrapper<LevelChapter>().orderByAsc(LevelChapter::getSortOrder));

        return chapters.stream().map(chapter -> {
            List<GameLevel> levels = gameLevelMapper.selectList(
                    new LambdaQueryWrapper<GameLevel>()
                            .eq(GameLevel::getChapterId, chapter.getId())
                            .eq(GameLevel::getStatus, "PUBLISHED")
                            .orderByAsc(GameLevel::getSortOrder));

            List<LevelListItemVO> levelItems = levels.stream()
                    .map(this::toListItemVO)
                    .collect(Collectors.toList());

            return ChapterVO.builder()
                    .id(chapter.getId())
                    .themeId(chapter.getThemeId())
                    .name(chapter.getName())
                    .description(chapter.getDescription())
                    .sortOrder(chapter.getSortOrder())
                    .levels(levelItems)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<LevelListItemVO> getLevelsByChapter(Long chapterId) {
        List<GameLevel> levels = gameLevelMapper.selectList(
                new LambdaQueryWrapper<GameLevel>()
                        .eq(GameLevel::getChapterId, chapterId)
                        .eq(GameLevel::getStatus, "PUBLISHED")
                        .orderByAsc(GameLevel::getSortOrder));

        return levels.stream().map(this::toListItemVO).collect(Collectors.toList());
    }

    @Override
    public LevelDetailVO getLevelDetail(Long levelId) {
        String cacheKey = "level:config:" + levelId;
        Object cached = redisTemplate.opsForHash().get(cacheKey, "detail");
        if (cached != null) {
            return (LevelDetailVO) cached;
        }

        GameLevel level = gameLevelMapper.selectById(levelId);
        if (level == null) {
            return null;
        }

        LevelDetailVO vo = LevelDetailVO.builder()
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

        redisTemplate.opsForHash().put(cacheKey, "detail", vo);
        redisTemplate.expire(cacheKey, 10, TimeUnit.MINUTES);

        return vo;
    }

    private LevelListItemVO toListItemVO(GameLevel level) {
        return LevelListItemVO.builder()
                .id(level.getId())
                .name(level.getName())
                .difficulty(level.getDifficulty())
                .diffCount(level.getDiffCount())
                .timeLimit(level.getTimeLimit())
                .sortOrder(level.getSortOrder())
                .build();
    }
}
