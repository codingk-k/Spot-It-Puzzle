package com.game.spotthediff.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.dto.player.PlayerProfileVO;
import com.game.spotthediff.dto.player.PlayerStatsVO;
import com.game.spotthediff.entity.BattleRecord;
import com.game.spotthediff.entity.Player;
import com.game.spotthediff.entity.PlayerLevelProgress;
import com.game.spotthediff.mapper.BattleRecordMapper;
import com.game.spotthediff.mapper.PlayerLevelProgressMapper;
import com.game.spotthediff.mapper.PlayerMapper;
import com.game.spotthediff.service.PlayerService;
import org.springframework.stereotype.Service;

@Service
public class PlayerServiceImpl implements PlayerService {

    private final PlayerMapper playerMapper;
    private final PlayerLevelProgressMapper progressMapper;
    private final BattleRecordMapper battleRecordMapper;

    public PlayerServiceImpl(PlayerMapper playerMapper, PlayerLevelProgressMapper progressMapper,
                             BattleRecordMapper battleRecordMapper) {
        this.playerMapper = playerMapper;
        this.progressMapper = progressMapper;
        this.battleRecordMapper = battleRecordMapper;
    }

    @Override
    public PlayerProfileVO getProfile(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }
        return toProfileVO(player);
    }

    @Override
    public PlayerProfileVO updateProfile(Long playerId, String nickname, String avatar) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }
        if (nickname != null) {
            player.setNickname(nickname);
        }
        if (avatar != null) {
            player.setAvatar(avatar);
        }
        playerMapper.updateById(player);
        return toProfileVO(player);
    }

    @Override
    public PlayerStatsVO getStats(Long playerId) {
        Player player = playerMapper.selectById(playerId);
        if (player == null) {
            throw new BusinessException("玩家不存在");
        }

        Long totalGames = progressMapper.selectCount(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId));

        Long completedGames = progressMapper.selectCount(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId)
                        .eq(PlayerLevelProgress::getCompleted, true));

        Integer totalStars = progressMapper.selectList(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId))
                .stream()
                .mapToInt(PlayerLevelProgress::getStars)
                .sum();

        Integer bestScore = progressMapper.selectList(
                new LambdaQueryWrapper<PlayerLevelProgress>()
                        .eq(PlayerLevelProgress::getPlayerId, playerId))
                .stream()
                .mapToInt(PlayerLevelProgress::getBestScore)
                .max()
                .orElse(0);

        Long wins = battleRecordMapper.selectCount(
                new LambdaQueryWrapper<BattleRecord>()
                        .eq(BattleRecord::getPlayerId, playerId)
                        .eq(BattleRecord::getRank, 1));

        Long losses = battleRecordMapper.selectCount(
                new LambdaQueryWrapper<BattleRecord>()
                        .eq(BattleRecord::getPlayerId, playerId)
                        .ne(BattleRecord::getRank, 1));

        return PlayerStatsVO.builder()
                .playerId(playerId)
                .totalGames(totalGames.intValue())
                .completedGames(completedGames.intValue())
                .totalStars(totalStars)
                .bestScore(bestScore)
                .elo(player.getElo())
                .wins(wins.intValue())
                .losses(losses.intValue())
                .build();
    }

    @Override
    public PlayerProfileVO getProfileByUsername(String username) {
        Player player = playerMapper.selectOne(
                new LambdaQueryWrapper<Player>().eq(Player::getUsername, username));
        if (player == null) {
            return null;
        }
        return toProfileVO(player);
    }

    private PlayerProfileVO toProfileVO(Player player) {
        return PlayerProfileVO.builder()
                .id(player.getId())
                .username(player.getUsername())
                .nickname(player.getNickname())
                .avatar(player.getAvatar())
                .level(player.getLevel())
                .exp(player.getExp())
                .gold(player.getGold())
                .diamonds(player.getDiamonds())
                .elo(player.getElo())
                .hintItems(player.getHintItems())
                .build();
    }
}
