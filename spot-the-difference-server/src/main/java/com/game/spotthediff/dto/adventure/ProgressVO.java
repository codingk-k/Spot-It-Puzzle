package com.game.spotthediff.dto.adventure;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressVO {

    private Long levelId;
    private String levelName;
    private Integer bestScore;
    private Integer stars;
    private Boolean completed;
    private Integer attempts;
}
