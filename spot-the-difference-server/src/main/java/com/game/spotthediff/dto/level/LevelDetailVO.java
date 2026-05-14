package com.game.spotthediff.dto.level;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelDetailVO {

    private Long id;
    private String name;
    private String description;
    private String imageAUrl;
    private String imageBUrl;
    private Integer timeLimit;
    private Integer diffCount;
    private Integer diffRadius;
    private String difficulty;
    private Integer sortOrder;
}
