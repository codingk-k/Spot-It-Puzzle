package com.game.spotthediff.dto.player;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStatsVO {

    private Long playerId;
    private Integer totalGames;
    private Integer completedGames;
    private Integer totalStars;
    private Integer bestScore;
    private Integer elo;
    private Integer wins;
    private Integer losses;
}
