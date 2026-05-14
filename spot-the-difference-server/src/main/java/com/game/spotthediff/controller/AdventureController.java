package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.adventure.CompleteRequest;
import com.game.spotthediff.dto.adventure.CompleteResponse;
import com.game.spotthediff.dto.adventure.ProgressVO;
import com.game.spotthediff.dto.level.CheckRequest;
import com.game.spotthediff.dto.level.CheckResponse;
import com.game.spotthediff.security.UserPrincipal;
import com.game.spotthediff.service.AdventureService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventure")
public class AdventureController {

    private final AdventureService adventureService;

    public AdventureController(AdventureService adventureService) {
        this.adventureService = adventureService;
    }

    @PostMapping("/levels/{id}/start")
    public Result<Void> startGame(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        adventureService.startGame(principal.getPlayerId(), id);
        return Result.success();
    }

    @PostMapping("/levels/{id}/check")
    public Result<CheckResponse> checkClick(@AuthenticationPrincipal UserPrincipal principal,
                                            @PathVariable Long id,
                                            @RequestBody CheckRequest request) {
        return Result.success(adventureService.checkClick(principal.getPlayerId(), id, request));
    }

    @PostMapping("/levels/{id}/complete")
    public Result<CompleteResponse> completeGame(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long id,
                                                 @RequestBody CompleteRequest request) {
        return Result.success(adventureService.completeGame(principal.getPlayerId(), id, request));
    }

    @GetMapping("/progress")
    public Result<List<ProgressVO>> getProgress(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(adventureService.getPlayerProgress(principal.getPlayerId()));
    }
}
