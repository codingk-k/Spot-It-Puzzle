package com.game.spotthediff.dto.versus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankInfoVO {

    private Long playerId;
    private String nickname;
    private Integer elo;
    private Integer rank;
    private Integer wins;
    private Integer losses;
}
