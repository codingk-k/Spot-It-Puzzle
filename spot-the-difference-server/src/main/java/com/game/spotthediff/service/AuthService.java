package com.game.spotthediff.service;

import com.game.spotthediff.dto.auth.AuthResponse;
import com.game.spotthediff.dto.auth.LoginRequest;
import com.game.spotthediff.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);
}
