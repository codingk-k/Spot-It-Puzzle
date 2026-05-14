package com.game.spotthediff.service;

import java.util.Map;

public interface GameSessionService {

    void createSession(Long playerId, Long levelId, int timeLimit);

    Map<Object, Object> getSession(Long playerId, Long levelId);

    void updateSessionField(Long playerId, Long levelId, String field, String value);

    void deleteSession(Long playerId, Long levelId);

    boolean sessionExists(Long playerId, Long levelId);
}
