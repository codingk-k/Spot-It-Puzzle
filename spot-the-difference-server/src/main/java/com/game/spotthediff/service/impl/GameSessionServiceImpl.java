package com.game.spotthediff.service.impl;

import com.game.spotthediff.common.Constants;
import com.game.spotthediff.service.GameSessionService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class GameSessionServiceImpl implements GameSessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    public GameSessionServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void createSession(Long playerId, Long levelId, int timeLimit) {
        String key = Constants.GAME_SESSION_PREFIX + playerId + ":" + levelId;
        Map<String, Object> session = new HashMap<>();
        session.put("startTime", String.valueOf(System.currentTimeMillis()));
        session.put("foundDiffs", "");
        session.put("combo", "0");
        session.put("score", "0");
        session.put("hintsUsed", "0");
        session.put("totalPenalty", "0");

        redisTemplate.opsForHash().putAll(key, session);
        redisTemplate.expire(key, timeLimit + 60, TimeUnit.SECONDS);
    }

    @Override
    public Map<Object, Object> getSession(Long playerId, Long levelId) {
        String key = Constants.GAME_SESSION_PREFIX + playerId + ":" + levelId;
        return redisTemplate.opsForHash().entries(key);
    }

    @Override
    public void updateSessionField(Long playerId, Long levelId, String field, String value) {
        String key = Constants.GAME_SESSION_PREFIX + playerId + ":" + levelId;
        redisTemplate.opsForHash().put(key, field, value);
    }

    @Override
    public void deleteSession(Long playerId, Long levelId) {
        String key = Constants.GAME_SESSION_PREFIX + playerId + ":" + levelId;
        redisTemplate.delete(key);
    }

    @Override
    public boolean sessionExists(Long playerId, Long levelId) {
        String key = Constants.GAME_SESSION_PREFIX + playerId + ":" + levelId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
