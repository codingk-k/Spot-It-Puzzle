INSERT INTO level_theme (id, name, description, sort_order) VALUES
(1, '城市风光', '探索城市中的霓虹与建筑', 1),
(2, '自然风光', '感受大自然的美丽与奥秘', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO level_chapter (id, theme_id, name, description, sort_order) VALUES
(1, 1, '霓虹都市', '在璀璨的霓虹灯下寻找不同', 1),
(2, 2, '繁花似锦', '在花丛中发现隐藏的差异', 1),
(3, 1, '星空幻境', '在星空下挑战极限观察力', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO game_level (id, name, description, theme_id, chapter_id, image_a_url, image_b_url, time_limit, diff_count, diff_radius, difficulty, sort_order, status) VALUES
(1, '霓虹初现', '在霓虹灯下发现3处不同', 1, 1, '/images/level1a.png', '/images/level1b.png', 120, 3, 35, 'EASY', 1, 'PUBLISHED'),
(2, '花园漫步', '在花园中寻找3处不同', 2, 2, '/images/level2a.png', '/images/level2b.png', 120, 3, 35, 'EASY', 2, 'PUBLISHED'),
(3, '温馨小屋', '在温馨的小屋里找出3处不同', 2, 2, '/images/level3a.png', '/images/level3b.png', 120, 3, 30, 'EASY', 3, 'PUBLISHED'),
(4, '不夜城', '在不夜城中找出5处不同', 1, 1, '/images/level4a.png', '/images/level4b.png', 90, 5, 28, 'MEDIUM', 4, 'PUBLISHED'),
(5, '秘密花园', '在秘密花园中寻找5处不同', 2, 2, '/images/level5a.png', '/images/level5b.png', 90, 5, 25, 'MEDIUM', 5, 'PUBLISHED'),
(6, '书房探秘', '在书房中探索5处不同', 2, 2, '/images/level6a.png', '/images/level6b.png', 90, 5, 25, 'MEDIUM', 6, 'PUBLISHED'),
(7, '赛博之夜', '在赛博朋克之夜找出7处不同', 1, 1, '/images/level7a.png', '/images/level7b.png', 60, 7, 22, 'HARD', 7, 'PUBLISHED'),
(8, '暗夜森林', '在暗夜森林中发现7处不同', 2, 2, '/images/level8a.png', '/images/level8b.png', 60, 7, 20, 'HARD', 8, 'PUBLISHED'),
(9, '厨房迷踪', '在厨房中追踪7处不同', 2, 2, '/images/level9a.png', '/images/level9b.png', 60, 7, 18, 'HARD', 9, 'PUBLISHED'),
(10, '终极挑战', '终极挑战：找出9处不同', 1, 3, '/images/level10a.png', '/images/level10b.png', 45, 9, 16, 'MASTER', 10, 'PUBLISHED')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO level_difference (level_id, diff_x, diff_y, radius, type, description, sort_order) VALUES
(1, 176, 145, 35, 'COLOR_CHANGE', '霓虹灯颜色变化', 1),
(1, 535, 385, 35, 'OBJECT_ADDED', '多了一个路标', 2),
(1, 115, 100, 35, 'POSITION_SHIFT', '窗户位置偏移', 3),

(2, 200, 382, 35, 'COLOR_CHANGE', '花朵颜色变化', 1),
(2, 350, 460, 35, 'OBJECT_REMOVED', '少了一只蝴蝶', 2),
(2, 680, 80, 35, 'OBJECT_ADDED', '多了一朵云', 3),

(3, 140, 260, 30, 'COLOR_CHANGE', '窗帘颜色变化', 1),
(3, 500, 100, 30, 'OBJECT_REMOVED', '少了一幅画', 2),
(3, 390, 110, 30, 'SIZE_CHANGE', '花瓶大小变化', 3),

(4, 160, 200, 28, 'COLOR_CHANGE', '招牌颜色变化', 1),
(4, 460, 180, 28, 'OBJECT_ADDED', '多了一个广告牌', 2),
(4, 350, 270, 25, 'POSITION_SHIFT', '路灯位置偏移', 3),
(4, 135, 410, 28, 'OBJECT_REMOVED', '少了一个垃圾桶', 4),
(4, 500, 365, 25, 'SIZE_CHANGE', '建筑大小变化', 5),

(5, 200, 465, 25, 'COLOR_CHANGE', '花瓣颜色变化', 1),
(5, 450, 485, 25, 'OBJECT_ADDED', '多了一只蜜蜂', 2),
(5, 400, 100, 25, 'OBJECT_REMOVED', '少了一片叶子', 3),
(5, 120, 490, 25, 'POSITION_SHIFT', '石头位置偏移', 4),
(5, 350, 60, 25, 'SIZE_CHANGE', '太阳大小变化', 5),

(6, 120, 260, 25, 'COLOR_CHANGE', '书脊颜色变化', 1),
(6, 650, 90, 25, 'OBJECT_ADDED', '多了一盏台灯', 2),
(6, 160, 300, 22, 'POSITION_SHIFT', '相框位置偏移', 3),
(6, 535, 95, 25, 'OBJECT_REMOVED', '少了一个杯子', 4),
(6, 100, 290, 22, 'SIZE_CHANGE', '地球仪大小变化', 5),

(7, 150, 220, 22, 'COLOR_CHANGE', '霓虹灯颜色变化', 1),
(7, 450, 180, 22, 'OBJECT_ADDED', '多了一个全息投影', 2),
(7, 640, 200, 22, 'OBJECT_REMOVED', '少了一个无人机', 3),
(7, 235, 285, 20, 'POSITION_SHIFT', '管道位置偏移', 4),
(7, 540, 267, 20, 'SIZE_CHANGE', '屏幕大小变化', 5),
(7, 115, 430, 22, 'COLOR_CHANGE', '车灯颜色变化', 6),
(7, 400, 365, 20, 'OBJECT_ADDED', '多了一个天线', 7),

(8, 100, 460, 20, 'COLOR_CHANGE', '树叶颜色变化', 1),
(8, 250, 470, 18, 'OBJECT_REMOVED', '少了一只萤火虫', 2),
(8, 200, 352, 20, 'OBJECT_ADDED', '多了一个蘑菇', 3),
(8, 450, 322, 18, 'POSITION_SHIFT', '树枝位置偏移', 4),
(8, 150, 492, 18, 'SIZE_CHANGE', '石头大小变化', 5),
(8, 130, 480, 18, 'COLOR_CHANGE', '花朵颜色变化', 6),
(8, 700, 80, 20, 'OBJECT_ADDED', '多了一只猫头鹰', 7),

(9, 110, 220, 18, 'COLOR_CHANGE', '碗的颜色变化', 1),
(9, 250, 230, 18, 'OBJECT_ADDED', '多了一个勺子', 2),
(9, 400, 290, 18, 'OBJECT_REMOVED', '少了一个盘子', 3),
(9, 500, 285, 16, 'POSITION_SHIFT', '调料瓶位置偏移', 4),
(9, 200, 240, 16, 'SIZE_CHANGE', '锅的大小变化', 5),
(9, 700, 60, 18, 'COLOR_CHANGE', '窗帘颜色变化', 6),
(9, 650, 360, 18, 'OBJECT_ADDED', '多了一个挂钟', 7),

(10, 130, 180, 16, 'COLOR_CHANGE', '星星颜色变化', 1),
(10, 310, 160, 16, 'OBJECT_ADDED', '多了一颗流星', 2),
(10, 490, 170, 16, 'OBJECT_REMOVED', '少了一个星座', 3),
(10, 660, 190, 16, 'POSITION_SHIFT', '行星位置偏移', 4),
(10, 220, 242, 16, 'SIZE_CHANGE', '月亮大小变化', 5),
(10, 422, 225, 16, 'COLOR_CHANGE', '星云颜色变化', 6),
(10, 115, 390, 16, 'OBJECT_ADDED', '多了一颗卫星', 7),
(10, 635, 395, 16, 'OBJECT_REMOVED', '少了一个望远镜', 8),
(10, 150, 315, 16, 'POSITION_SHIFT', '极光位置偏移', 9);

INSERT INTO player (username, password, nickname, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE role=VALUES(role);
