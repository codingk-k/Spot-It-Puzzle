package com.game.spotthediff.service;

import com.game.spotthediff.dto.level.ChapterVO;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.level.LevelListItemVO;

import java.util.List;

public interface LevelService {

    List<ChapterVO> getAllChapters();

    List<LevelListItemVO> getLevelsByChapter(Long chapterId);

    LevelDetailVO getLevelDetail(Long levelId);
}
