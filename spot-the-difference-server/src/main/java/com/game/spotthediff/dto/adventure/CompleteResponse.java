package com.game.spotthediff.dto.adventure;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompleteResponse {

    private Integer score;
    private Integer stars;
    private Integer timeBonus;
    private Integer comboBonus;
    private Integer penalty;
    private Integer hintPenalty;
}
