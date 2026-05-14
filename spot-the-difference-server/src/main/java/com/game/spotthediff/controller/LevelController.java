package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.level.ChapterVO;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.level.LevelListItemVO;
import com.game.spotthediff.service.LevelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventure")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping("/chapters")
    public Result<List<ChapterVO>> getAllChapters() {
        return Result.success(levelService.getAllChapters());
    }

    @GetMapping("/chapters/{id}/levels")
    public Result<List<LevelListItemVO>> getLevelsByChapter(@PathVariable Long id) {
        return Result.success(levelService.getLevelsByChapter(id));
    }

    @GetMapping("/levels/{id}")
    public Result<LevelDetailVO> getLevelDetail(@PathVariable Long id) {
        return Result.success(levelService.getLevelDetail(id));
    }
}
