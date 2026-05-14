package com.game.spotthediff.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiffMark {

    private Integer x;
    private Integer y;
    private Integer radius;
    private String type;
    private String description;
}
