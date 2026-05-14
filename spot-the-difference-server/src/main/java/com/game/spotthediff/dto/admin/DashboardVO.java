package com.game.spotthediff.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardVO {

    private Long totalPlayers;
    private Long totalLevels;
    private Long totalGamesPlayed;
    private Long onlinePlayers;
    private Long activePlayersToday;
}
