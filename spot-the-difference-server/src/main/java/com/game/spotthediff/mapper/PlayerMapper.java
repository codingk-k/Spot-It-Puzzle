package com.game.spotthediff.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.game.spotthediff.entity.Player;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PlayerMapper extends BaseMapper<Player> {
}
