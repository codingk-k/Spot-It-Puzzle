package com.game.spotthediff.dto.versus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomStateVO {

    private String roomId;
    private List<PlayerState> players;
    private Integer foundCount;
    private Integer totalDiffs;
    private Long startTime;
    private Integer timeLimit;
    private Boolean finished;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerState {
        private Long playerId;
        private String nickname;
        private Integer score;
        private List<Integer> foundDiffs;
    }
}
