package com.game.spotthediff.service.impl;

import com.game.spotthediff.common.BusinessException;
import com.game.spotthediff.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private final String uploadDir;

    public FileServiceImpl(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录", e);
        }
    }

    @Override
    public String upload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString().replace("-", "") + extension;

        try {
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), filePath);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public byte[] load(String filename) {
        try {
            Path filePath = Paths.get(uploadDir, filename);
            if (!Files.exists(filePath)) {
                throw new BusinessException("文件不存在");
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new BusinessException("文件读取失败: " + e.getMessage());
        }
    }
}
