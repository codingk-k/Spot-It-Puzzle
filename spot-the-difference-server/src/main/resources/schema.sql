CREATE TABLE IF NOT EXISTS player (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    gold INT DEFAULT 0,
    diamonds INT DEFAULT 0,
    elo INT DEFAULT 1000,
    hint_items INT DEFAULT 3,
    role VARCHAR(20) NOT NULL DEFAULT 'PLAYER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_player_username (username),
    KEY idx_player_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS level_theme (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT DEFAULT 0,
    KEY idx_theme_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS level_chapter (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    theme_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    sort_order INT DEFAULT 0,
    KEY idx_chapter_theme (theme_id),
    KEY idx_chapter_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_level (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    theme_id BIGINT,
    chapter_id BIGINT,
    image_a_url VARCHAR(500),
    image_b_url VARCHAR(500),
    time_limit INT NOT NULL DEFAULT 120,
    diff_count INT NOT NULL,
    diff_radius INT NOT NULL DEFAULT 30,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'EASY',
    sort_order INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_level_chapter (chapter_id),
    KEY idx_level_status (status),
    KEY idx_level_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS level_difference (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level_id BIGINT NOT NULL,
    diff_x INT NOT NULL,
    diff_y INT NOT NULL,
    radius INT NOT NULL DEFAULT 30,
    type VARCHAR(30) NOT NULL DEFAULT 'COLOR_CHANGE',
    description VARCHAR(200),
    sort_order INT DEFAULT 0,
    KEY idx_diff_level (level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS player_level_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT NOT NULL,
    level_id BIGINT NOT NULL,
    best_score INT DEFAULT 0,
    stars INT DEFAULT 0,
    completed TINYINT(1) DEFAULT 0,
    attempts INT DEFAULT 0,
    completed_at DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_progress_player_level (player_id, level_id),
    KEY idx_progress_player (player_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS battle_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(100),
    player_id BIGINT NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'REALTIME',
    score INT DEFAULT 0,
    rank INT DEFAULT 0,
    elo_change INT DEFAULT 0,
    duration INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_battle_player (player_id),
    KEY idx_battle_room (room_id),
    KEY idx_battle_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS game_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    player_id BIGINT,
    event_data TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_event_type_created (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
