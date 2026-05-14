package com.game.spotthediff.dto.auth;

import lombok.Data;

@Data
public class RegisterRequest {

    private String username;
    private String password;
    private String nickname;
}
