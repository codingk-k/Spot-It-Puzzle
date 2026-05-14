package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.auth.AuthResponse;
import com.game.spotthediff.dto.auth.LoginRequest;
import com.game.spotthediff.dto.auth.RegisterRequest;
import com.game.spotthediff.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @PostMapping("/refresh")
    public Result<AuthResponse> refresh(@RequestParam String refreshToken) {
        return Result.success(authService.refresh(refreshToken));
    }
}
