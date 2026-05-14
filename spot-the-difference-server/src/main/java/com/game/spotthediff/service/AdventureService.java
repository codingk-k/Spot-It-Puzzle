package com.game.spotthediff.service;

import com.game.spotthediff.dto.adventure.CompleteRequest;
import com.game.spotthediff.dto.adventure.CompleteResponse;
import com.game.spotthediff.dto.adventure.ProgressVO;
import com.game.spotthediff.dto.level.CheckRequest;
import com.game.spotthediff.dto.level.CheckResponse;

import java.util.List;

public interface AdventureService {

    void startGame(Long playerId, Long levelId);

    CheckResponse checkClick(Long playerId, Long levelId, CheckRequest request);

    CompleteResponse completeGame(Long playerId, Long levelId, CompleteRequest request);

    List<ProgressVO> getPlayerProgress(Long playerId);
}
