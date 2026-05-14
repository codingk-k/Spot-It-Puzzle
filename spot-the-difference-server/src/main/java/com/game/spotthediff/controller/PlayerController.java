package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.player.PlayerProfileVO;
import com.game.spotthediff.dto.player.PlayerStatsVO;
import com.game.spotthediff.security.UserPrincipal;
import com.game.spotthediff.service.PlayerService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping("/profile")
    public Result<PlayerProfileVO> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(playerService.getProfile(principal.getPlayerId()));
    }

    @PutMapping("/profile")
    public Result<PlayerProfileVO> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestParam(required = false) String nickname,
                                                  @RequestParam(required = false) String avatar) {
        return Result.success(playerService.updateProfile(principal.getPlayerId(), nickname, avatar));
    }

    @GetMapping("/stats")
    public Result<PlayerStatsVO> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(playerService.getStats(principal.getPlayerId()));
    }
}
