package com.game.spotthediff.dto.level;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterVO {

    private Long id;
    private Long themeId;
    private String name;
    private String description;
    private Integer sortOrder;
    private List<LevelListItemVO> levels;
}
