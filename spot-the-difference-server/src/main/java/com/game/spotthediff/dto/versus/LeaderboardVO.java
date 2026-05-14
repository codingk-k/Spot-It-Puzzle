package com.game.spotthediff.dto.versus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardVO {

    private Long playerId;
    private String nickname;
    private String avatar;
    private Integer score;
    private Integer rank;
    private Integer elo;
}
