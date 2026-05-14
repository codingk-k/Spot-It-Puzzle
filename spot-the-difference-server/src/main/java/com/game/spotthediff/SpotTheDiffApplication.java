package com.game.spotthediff;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.game.spotthediff.mapper")
@EnableScheduling
public class SpotTheDiffApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpotTheDiffApplication.class, args);
    }
}
