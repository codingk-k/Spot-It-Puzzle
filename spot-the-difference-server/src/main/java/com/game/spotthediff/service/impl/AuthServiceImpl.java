package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.dto.auth.AuthResponse;
import com.game.spotthediff.dto.auth.LoginRequest;
import com.game.spotthediff.dto.auth.RegisterRequest;
import com.game.spotthediff.entity.Player;
import com.game.spotthediff.mapper.PlayerMapper;
import com.game.spotthediff.security.JwtTokenProvider;
import com.game.spotthediff.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final PlayerMapper playerMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(PlayerMapper playerMapper, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.playerMapper = playerMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        Long count = playerMapper.selectCount(
                new LambdaQueryWrapper<Player>().eq(Player::getUsername, request.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        Player player = new Player();
        player.setUsername(request.getUsername());
        player.setPassword(passwordEncoder.encode(request.getPassword()));
        player.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        player.setLevel(1);
        player.setExp(0);
        player.setGold(0);
        player.setDiamonds(0);
        player.setElo(1000);
        player.setHintItems(3);
        player.setRole("PLAYER");
        player.setStatus("ACTIVE");
        player.setLastLoginAt(LocalDateTime.now());
        player.setCreatedAt(LocalDateTime.now());
        player.setUpdatedAt(LocalDateTime.now());
        playerMapper.insert(player);

        return buildAuthResponse(player);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Player player = playerMapper.selectOne(
                new LambdaQueryWrapper<Player>().eq(Player::getUsername, request.getUsername()));
        if (player == null) {
            throw new BusinessException("用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), player.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        if ("BANNED".equals(player.getStatus())) {
            throw new BusinessException("账号已被封禁");
        }

        player.setLastLoginAt(LocalDateTime.now());
        playerMapper.updateById(player);

        return buildAuthResponse(player);
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        try {
            String newAccessToken = jwtTokenProvider.refreshToken(refreshToken);
            Long playerId = jwtTokenProvider.getPlayerIdFromToken(refreshToken);
            String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
            String role = jwtTokenProvider.getRoleFromToken(refreshToken);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(playerId, username, role);

            Player player = playerMapper.selectById(playerId);
            if (player == null) {
                throw new BusinessException("用户不存在");
            }

            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .playerInfo(AuthResponse.PlayerInfo.builder()
                            .id(player.getId())
                            .username(player.getUsername())
                            .nickname(player.getNickname())
                            .avatar(player.getAvatar())
                            .role(player.getRole())
                            .level(player.getLevel())
                            .elo(player.getElo())
                            .build())
                    .build();
        } catch (Exception e) {
            throw new BusinessException(401, "刷新令牌无效或已过期");
        }
    }

    private AuthResponse buildAuthResponse(Player player) {
        String accessToken = jwtTokenProvider.generateAccessToken(player.getId(), player.getUsername(), player.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(player.getId(), player.getUsername(), player.getRole());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .playerInfo(AuthResponse.PlayerInfo.builder()
                        .id(player.getId())
                        .username(player.getUsername())
                        .nickname(player.getNickname())
                        .avatar(player.getAvatar())
                        .role(player.getRole())
                        .level(player.getLevel())
                        .elo(player.getElo())
                        .build())
                .build();
    }
}
