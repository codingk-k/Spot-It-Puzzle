package com.game.spotthediff.common;

public class Constants {

    public static final String GAME_SESSION_PREFIX = "game:session:";
    public static final String LEVEL_CONFIG_PREFIX = "level:config:";
    public static final String MATCHING_QUEUE_PREFIX = "matching:queue:";
    public static final String ROOM_PREFIX = "room:";
    public static final String ONLINE_PLAYERS_KEY = "online:players";

    public static final int BASE_SCORE = 100;
    public static final double COMBO_MULTIPLIER = 0.1;
    public static final int MISS_PENALTY = -20;
    public static final int MISS_TIME_PENALTY = 3;
    public static final int HINT_PENALTY = 50;
    public static final int TIME_BONUS_MULTIPLIER = 5;

    public static final double STAR3_THRESHOLD = 0.8;
    public static final double STAR2_THRESHOLD = 0.5;

    public static final int ELO_RANGE_INITIAL = 200;
    public static final int ELO_RANGE_EXPAND = 50;
    public static final int ELO_RANGE_MAX = 500;

    public static final int MATCHING_SCHEDULE_RATE = 1000;
    public static final int ROOM_BROADCAST_RATE = 100;

    public static final int EVENT_QUEUE_CAPACITY = 10000;
    public static final int EVENT_BATCH_SIZE = 100;
    public static final int EVENT_FLUSH_INTERVAL = 5000;
}
