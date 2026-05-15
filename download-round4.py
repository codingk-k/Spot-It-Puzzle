#!/usr/bin/env python3
import os, subprocess

BASE = "https://maven.aliyun.com/repository/central"
REPO = "/root/.m2/repository"

def download(group, artifact, version, ext="jar"):
    groupPath = group.replace('.', '/')
    dir_path = os.path.join(REPO, groupPath, artifact, version)
    file_name = f"{artifact}-{version}.{ext}"
    url = f"{BASE}/{groupPath}/{artifact}/{version}/{file_name}"
    os.makedirs(dir_path, exist_ok=True)
    file_path = os.path.join(dir_path, file_name)
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        return True
    result = subprocess.run(["curl", "-sL", url, "-o", file_path], capture_output=True, timeout=60)
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        print(f"  FAILED: {group}:{artifact}:{version}:{ext}")
        if os.path.exists(file_path):
            os.remove(file_path)
        return False
    print(f"  OK: {group}:{artifact}:{version}:{ext}")
    return True

deps = [
    # Missing from error
    ("com.fasterxml.jackson", "jackson-bom", "2.17.2", "pom"),
    ("com.fasterxml.jackson", "jackson-base", "2.17.2", "pom"),
    ("com.fasterxml.jackson", "jackson-parent", "2.17.2", "pom"),
    ("org.sonatype.oss", "oss-parent", "9", "pom"),
    ("org.sonatype.oss", "oss-parent", "7", "pom"),
    ("io.netty", "netty-bom", "4.1.115.Final", "pom"),
    ("io.zipkin.brave", "brave-bom", "5.16.0", "pom"),
    ("org.ow2.asm", "asm", "9.7.1", "jar"),
    ("org.ow2.asm", "asm", "9.7.1", "pom"),
    ("com.vaadin.external.google", "android-json", "0.0.20131108.vaadin1", "pom"),
    
    # More parent POMs that will likely be needed
    ("org.sonatype.forge", "forge-parent", "5", "pom"),
    ("org.sonatype.spice", "spice-parent", "15", "pom"),
    ("io.zipkin", "zipkin", "2.26.0", "pom"),
    ("io.zipkin.reporter2", "zipkin-reporter-bom", "2.16.4", "pom"),
    ("io.zipkin.brave", "brave", "5.16.0", "pom"),
    ("io.zipkin.brave", "brave-parent", "5.16.0", "pom"),
    ("io.zipkin.reporter2", "zipkin-reporter", "2.16.4", "pom"),
    ("io.zipkin.reporter2", "zipkin-reporter-parent", "2.16.4", "pom"),
    
    # Netty parent for 4.1.115
    ("io.netty", "netty-parent", "4.1.115.Final", "pom"),
    
    # More BOMs from mybatis-plus parent
    ("org.springframework.boot", "spring-boot-dependencies", "3.2.0", "pom"),
    
    # Jackson 2.17 deps
    ("com.fasterxml", "oss-parent", "59", "pom"),
    ("com.fasterxml", "oss-parent", "58", "pom"),
    ("com.fasterxml", "oss-parent", "57", "pom"),
    ("com.fasterxml.jackson", "jackson-parent", "2.17", "pom"),
    
    # OW2 ASM parent
    ("org.ow2", "ow2", "23.1", "pom"),
    ("org.ow2", "ow2", "24.1", "pom"),
    
    # More Spring Data parent chain
    ("org.springframework.data.build", "spring-data-changelog", "3.4.4", "pom"),
    
    # Mockito parent
    ("org.mockito", "mockito-parent", "5.14.2", "pom"),
    ("org.mockito", "mockito-bom", "5.14.2", "pom"),
    
    # JUnit parent
    ("org.junit", "junit-parent", "5.11.4", "pom"),
    ("org.junit", "junit-bom", "5.11.4", "pom"),
    
    # Hamcrest parent
    ("org.hamcrest", "hamcrest-parent", "2.2", "pom"),
    
    # JSON Smart parent
    ("net.minidev", "json-smart", "2.5.2", "pom"),
    ("net.minidev", "json-smart-action", "2.5.2", "pom"),
    ("net.minidev", "accessors-smart", "2.5.2", "pom"),
    
    # JsonPath parent
    ("com.jayway.jsonpath", "json-path", "2.9.0", "pom"),
]

count = 0
failed = 0
for group, artifact, version, ext in deps:
    if download(group, artifact, version, ext):
        count += 1
    else:
        failed += 1

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
