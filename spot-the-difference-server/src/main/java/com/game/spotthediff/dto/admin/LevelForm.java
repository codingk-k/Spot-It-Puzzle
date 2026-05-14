package com.game.spotthediff.dto.admin;

import lombok.Data;

import java.util.List;

@Data
public class LevelForm {

    private String name;
    private String description;
    private Long themeId;
    private Long chapterId;
    private String imageAUrl;
    private String imageBUrl;
    private Integer timeLimit;
    private Integer diffCount;
    private Integer diffRadius;
    private String difficulty;
    private Integer sortOrder;
    private List<DiffMark> diffs;
}
