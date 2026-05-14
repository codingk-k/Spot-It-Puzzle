package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("level_chapter")
public class LevelChapter {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long themeId;

    private String name;

    private String description;

    private Integer sortOrder;
}
