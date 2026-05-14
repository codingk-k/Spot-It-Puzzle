package com.game.spotthediff.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String refreshToken;
    private PlayerInfo playerInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerInfo {
        private Long id;
        private String username;
        private String nickname;
        private String avatar;
        private String role;
        private Integer level;
        private Integer elo;
    }
}
