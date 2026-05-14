package com.game.spotthediff.service;

import com.game.spotthediff.dto.player.PlayerProfileVO;
import com.game.spotthediff.dto.player.PlayerStatsVO;

public interface PlayerService {

    PlayerProfileVO getProfile(Long playerId);

    PlayerProfileVO updateProfile(Long playerId, String nickname, String avatar);

    PlayerStatsVO getStats(Long playerId);

    PlayerProfileVO getProfileByUsername(String username);
}
