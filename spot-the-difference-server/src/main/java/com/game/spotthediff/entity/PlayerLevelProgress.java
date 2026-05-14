package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("player_level_progress")
public class PlayerLevelProgress {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long playerId;

    private Long levelId;

    private Integer bestScore;

    private Integer stars;

    private Boolean completed;

    private Integer attempts;

    private LocalDateTime completedAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
