package com.game.spotthediff.dto.player;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfileVO {

    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private Integer level;
    private Integer exp;
    private Integer gold;
    private Integer diamonds;
    private Integer elo;
    private Integer hintItems;
}
