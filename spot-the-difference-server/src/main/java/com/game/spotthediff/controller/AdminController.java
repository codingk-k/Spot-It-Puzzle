package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.dto.admin.DashboardVO;
import com.game.spotthediff.dto.admin.DiffMark;
import com.game.spotthediff.dto.admin.LevelForm;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.player.PlayerProfileVO;
import com.game.spotthediff.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public Result<DashboardVO> getDashboard() {
        return Result.success(adminService.getDashboard());
    }

    @GetMapping("/online-count")
    public Result<Integer> getOnlineCount() {
        return Result.success(adminService.getOnlineCount());
    }

    @GetMapping("/levels")
    public Result<List<LevelDetailVO>> getLevels() {
        return Result.success(adminService.getLevels());
    }

    @PostMapping("/levels")
    public Result<LevelDetailVO> createLevel(@RequestBody LevelForm form) {
        return Result.success(adminService.createLevel(form));
    }

    @GetMapping("/levels/{id}")
    public Result<LevelDetailVO> getLevel(@PathVariable Long id) {
        return Result.success(adminService.getLevel(id));
    }

    @PutMapping("/levels/{id}")
    public Result<LevelDetailVO> updateLevel(@PathVariable Long id, @RequestBody LevelForm form) {
        return Result.success(adminService.updateLevel(id, form));
    }

    @PostMapping("/levels/{id}/publish")
    public Result<Void> publishLevel(@PathVariable Long id) {
        adminService.publishLevel(id);
        return Result.success();
    }

    @PostMapping("/levels/{id}/offline")
    public Result<Void> offlineLevel(@PathVariable Long id) {
        adminService.offlineLevel(id);
        return Result.success();
    }

    @PostMapping("/levels/{id}/diffs")
    public Result<Void> saveDiffs(@PathVariable Long id, @RequestBody List<DiffMark> diffs) {
        adminService.saveDiffs(id, diffs);
        return Result.success();
    }

    @GetMapping("/players")
    public Result<List<PlayerProfileVO>> getPlayers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(adminService.getPlayers(page, size));
    }

    @PostMapping("/players/{id}/ban")
    public Result<Void> banPlayer(@PathVariable Long id) {
        adminService.banPlayer(id);
        return Result.success();
    }

    @PostMapping("/players/{id}/unban")
    public Result<Void> unbanPlayer(@PathVariable Long id) {
        adminService.unbanPlayer(id);
        return Result.success();
    }

    @GetMapping("/stats/retention")
    public Result<Map<String, Object>> getRetentionStats() {
        return Result.success(adminService.getRetentionStats());
    }

    @GetMapping("/stats/funnel")
    public Result<Map<String, Object>> getFunnelStats() {
        return Result.success(adminService.getFunnelStats());
    }
}
