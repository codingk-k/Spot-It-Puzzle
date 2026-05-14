package com.game.spotthediff.websocket;

import com.game.spotthediff.common.Constants;
import com.game.spotthediff.dto.versus.MatchRequest;
import com.game.spotthediff.service.VersusService;
import com.game.spotthediff.service.impl.VersusServiceImpl;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MatchingHandler {

    private final VersusServiceImpl versusServiceImpl;
    private final SimpMessagingTemplate messagingTemplate;

    public MatchingHandler(VersusServiceImpl versusServiceImpl, SimpMessagingTemplate messagingTemplate) {
        this.versusServiceImpl = versusServiceImpl;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/match/join")
    public void handleJoin(MatchRequest request, Long playerId) {
        versusServiceImpl.joinQueue(playerId, request);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(playerId), "/game/match/status", "QUEUED");
    }

    @MessageMapping("/match/cancel")
    public void handleCancel(String difficulty, Long playerId) {
        versusServiceImpl.cancelQueue(playerId, difficulty);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(playerId), "/game/match/status", "CANCELLED");
    }

    @Scheduled(fixedRate = Constants.MATCHING_SCHEDULE_RATE)
    public void scheduleMatch() {
        versusServiceImpl.matchPlayers();
    }
}
