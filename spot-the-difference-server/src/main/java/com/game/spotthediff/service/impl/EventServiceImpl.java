package com.game.spotthediff.service.impl;

import com.game.spotthediff.common.Constants;
import com.game.spotthediff.entity.GameEvent;
import com.game.spotthediff.mapper.GameEventMapper;
import com.game.spotthediff.service.EventService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.LinkedBlockingQueue;

@Slf4j
@Service
public class EventServiceImpl implements EventService {

    private final GameEventMapper gameEventMapper;
    private final LinkedBlockingQueue<GameEvent> eventQueue;
    private volatile boolean running = true;
    private Thread consumerThread;

    public EventServiceImpl(GameEventMapper gameEventMapper) {
        this.gameEventMapper = gameEventMapper;
        this.eventQueue = new LinkedBlockingQueue<>(Constants.EVENT_QUEUE_CAPACITY);
    }

    @PostConstruct
    public void init() {
        consumerThread = new Thread(this::consumeEvents, "event-consumer");
        consumerThread.setDaemon(true);
        consumerThread.start();
    }

    @PreDestroy
    public void destroy() {
        running = false;
        if (consumerThread != null) {
            consumerThread.interrupt();
        }
        flushEvents();
    }

    @Override
    public void publishEvent(String eventType, Long playerId, String eventData) {
        GameEvent event = new GameEvent();
        event.setEventType(eventType);
        event.setPlayerId(playerId);
        event.setEventData(eventData);
        if (!eventQueue.offer(event)) {
            log.warn("Event queue is full, dropping event: type={}, playerId={}", eventType, playerId);
        }
    }

    private void consumeEvents() {
        while (running || !eventQueue.isEmpty()) {
            try {
                Thread.sleep(Constants.EVENT_FLUSH_INTERVAL);
                flushEvents();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private void flushEvents() {
        List<GameEvent> batch = new ArrayList<>();
        eventQueue.drainTo(batch, Constants.EVENT_BATCH_SIZE);
        if (!batch.isEmpty()) {
            try {
                for (GameEvent event : batch) {
                    gameEventMapper.insert(event);
                }
                log.debug("Flushed {} events", batch.size());
            } catch (Exception e) {
                log.error("Failed to flush events", e);
            }
        }
    }
}
