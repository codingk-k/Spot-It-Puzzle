package com.game.spotthediff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("battle_record")
public class BattleRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String roomId;

    private Long playerId;

    private String mode;

    private Integer score;

    private Integer rank;

    private Integer eloChange;

    private Integer duration;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
