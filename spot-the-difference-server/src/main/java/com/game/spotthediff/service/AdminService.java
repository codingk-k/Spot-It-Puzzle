package com.game.spotthediff.service;

import com.game.spotthediff.dto.admin.DashboardVO;
import com.game.spotthediff.dto.admin.DiffMark;
import com.game.spotthediff.dto.admin.LevelForm;
import com.game.spotthediff.dto.level.LevelDetailVO;
import com.game.spotthediff.dto.player.PlayerProfileVO;

import java.util.List;
import java.util.Map;

public interface AdminService {

    DashboardVO getDashboard();

    int getOnlineCount();

    List<LevelDetailVO> getLevels();

    LevelDetailVO createLevel(LevelForm form);

    LevelDetailVO updateLevel(Long levelId, LevelForm form);

    LevelDetailVO getLevel(Long levelId);

    void publishLevel(Long levelId);

    void offlineLevel(Long levelId);

    void saveDiffs(Long levelId, List<DiffMark> diffs);

    List<PlayerProfileVO> getPlayers(int page, int size);

    void banPlayer(Long playerId);

    void unbanPlayer(Long playerId);

    Map<String, Object> getRetentionStats();

    Map<String, Object> getFunnelStats();
}
