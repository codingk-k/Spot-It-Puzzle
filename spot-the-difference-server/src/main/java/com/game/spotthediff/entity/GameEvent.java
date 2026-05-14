package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("game_event")
public class GameEvent {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String eventType;

    private Long playerId;

    private String eventData;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
