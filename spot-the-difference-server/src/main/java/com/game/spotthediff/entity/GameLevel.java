package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("game_level")
public class GameLevel {

    @TableId(type = IdType.AUTO)
    private Long id;

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

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
