package com.game.spotthediff.dto.level;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckResponse {

    private Boolean hit;
    private Integer diffIndex;
    private String description;
    private Integer score;
    private Integer combo;
    private Integer penalty;
    private Integer timePenalty;
}
