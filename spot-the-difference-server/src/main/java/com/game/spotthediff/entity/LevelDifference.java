package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("level_difference")
public class LevelDifference {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long levelId;

    private Integer diffX;

    private Integer diffY;

    private Integer radius;

    private String type;

    private String description;

    private Integer sortOrder;
}
