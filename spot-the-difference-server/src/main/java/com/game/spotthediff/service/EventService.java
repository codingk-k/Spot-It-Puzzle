package com.game.spotthediff.service;

public interface EventService {

    void publishEvent(String eventType, Long playerId, String eventData);
}
