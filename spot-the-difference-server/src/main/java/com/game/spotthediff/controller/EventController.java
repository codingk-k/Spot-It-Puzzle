package com.game.spotthediff.controller;

import com.game.spotthediff.common.Result;
import com.game.spotthediff.security.UserPrincipal;
import com.game.spotthediff.service.EventService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public Result<Void> trackEvent(@AuthenticationPrincipal UserPrincipal principal,
                                   @RequestBody Map<String, String> payload) {
        String eventType = payload.get("eventType");
        String eventData = payload.get("eventData");
        Long playerId = principal != null ? principal.getPlayerId() : null;
        eventService.publishEvent(eventType, playerId, eventData);
        return Result.success();
    }
}
