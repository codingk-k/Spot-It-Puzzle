package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.versus.LeaderboardVO;
import com.game.spotthediff.dto.versus.MatchRequest;
import com.game.spotthediff.dto.versus.RankInfoVO;
import com.game.spotthediff.dto.versus.RoomStateVO;
import com.game.spotthediff.security.UserPrincipal;
import com.game.spotthediff.service.VersusService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/versus")
public class VersusController {

    private final VersusService versusService;

    public VersusController(VersusService versusService) {
        this.versusService = versusService;
    }

    @PostMapping("/match")
    public Result<Void> joinQueue(@AuthenticationPrincipal UserPrincipal principal,
                                  @RequestBody MatchRequest request) {
        versusService.joinQueue(principal.getPlayerId(), request);
        return Result.success();
    }

    @DeleteMapping("/match")
    public Result<Void> cancelQueue(@AuthenticationPrincipal UserPrincipal principal,
                                    @RequestParam String difficulty) {
        versusService.cancelQueue(principal.getPlayerId(), difficulty);
        return Result.success();
    }

    @GetMapping("/leaderboard/{levelId}")
    public Result<List<LeaderboardVO>> getLeaderboard(@PathVariable Long levelId) {
        return Result.success(versusService.getLeaderboard(levelId));
    }

    @GetMapping("/rank")
    public Result<RankInfoVO> getRank(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(versusService.getRank(principal.getPlayerId()));
    }

    @PostMapping("/async/start")
    public Result<RoomStateVO> startAsyncBattle(@AuthenticationPrincipal UserPrincipal principal,
                                                 @RequestParam Long levelId) {
        return Result.success(versusService.startAsyncBattle(principal.getPlayerId(), levelId));
    }

    @PostMapping("/async/submit")
    public Result<RoomStateVO> submitAsyncResult(@AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestParam String roomId,
                                                  @RequestParam int score,
                                                  @RequestParam int duration) {
        return Result.success(versusService.submitAsyncResult(principal.getPlayerId(), roomId, score, duration));
    }
}
