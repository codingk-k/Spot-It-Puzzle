package com.game.spotthediff.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    String upload(MultipartFile file);

    byte[] load(String filename);
}
