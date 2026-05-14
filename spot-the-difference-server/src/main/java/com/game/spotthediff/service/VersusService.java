package com.game.spotthediff.service;

import com.game.spotthediff.dto.versus.LeaderboardVO;
import com.game.spotthediff.dto.versus.MatchRequest;
import com.game.spotthediff.dto.versus.RankInfoVO;
import com.game.spotthediff.dto.versus.RoomStateVO;

import java.util.List;

public interface VersusService {

    void joinQueue(Long playerId, MatchRequest request);

    void cancelQueue(Long playerId, String difficulty);

    RoomStateVO startAsyncBattle(Long playerId, Long levelId);

    RoomStateVO submitAsyncResult(Long playerId, String roomId, int score, int duration);

    List<LeaderboardVO> getLeaderboard(Long levelId);

    RankInfoVO getRank(Long playerId);
}
