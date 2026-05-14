package com.game.spotthediff.dto.level;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelListItemVO {

    private Long id;
    private String name;
    private String difficulty;
    private Integer diffCount;
    private Integer timeLimit;
    private Integer sortOrder;
}
