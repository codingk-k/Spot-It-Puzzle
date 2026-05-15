#!/usr/bin/env python3
import os
import subprocess

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
    else:
        print(f"  OK: {group}:{artifact}:{version}:{ext}")
        return True

# Missing parent POMs and BOMs
missing_poms = [
    # Parent POMs
    ("ch.qos.logback", "logback-parent", "1.5.18", "pom"),
    ("org.apache.logging.log4j", "log4j", "2.24.3", "pom"),
    ("org.eclipse.ee4j", "project", "1.0.7", "pom"),
    ("org.springframework.data.build", "spring-data-parent", "3.4.4", "pom"),
    ("org.springframework.boot", "spring-boot-dependencies", "3.2.0", "pom"),
    ("io.jsonwebtoken", "jjwt-root", "0.12.3", "pom"),
    ("jakarta.xml.bind", "jakarta.xml.bind-api-parent", "4.0.2", "pom"),
    
    # JUnit BOMs
    ("org.junit", "junit-bom", "5.10.2", "pom"),
    ("org.junit", "junit-bom", "5.7.2", "pom"),
    ("org.junit", "junit-bom", "5.7.1", "pom"),
    ("org.junit", "junit-bom", "5.11.4", "pom"),
    
    # More parent POMs that may be needed
    ("ch.qos.logback", "logback-access", "1.5.18", "pom"),
    ("org.apache.logging", "logging-parent", "11.3.0", "pom"),
    ("org.apache.logging.log4j", "log4j-bom", "2.24.3", "pom"),
    ("com.fasterxml.jackson", "jackson-parent", "2.18.3", "pom"),
    ("com.fasterxml", "oss-parent", "61", "pom"),
    ("org.springframework.data", "spring-data-commons", "3.4.4", "pom"),
    ("org.springframework.security", "spring-security-bom", "6.4.4", "pom"),
    ("org.springframework.security", "spring-security-parent", "6.4.4", "pom"),
    ("org.springframework.boot", "spring-boot-parent", "3.4.4", "pom"),
    ("org.springframework.boot", "spring-boot-starter-parent", "3.4.4", "pom"),
    ("org.springframework.boot", "spring-boot-dependencies", "3.4.4", "pom"),
    ("org.springframework", "spring-framework-bom", "6.2.5", "pom"),
    
    # Missing dependency JARs and POMs (from warnings)
    ("org.slf4j", "jul-to-slf4j", "2.0.17", "jar"),
    ("org.slf4j", "jul-to-slf4j", "2.0.17", "pom"),
    ("org.slf4j", "slf4j-api", "2.0.17", "jar"),
    ("org.slf4j", "slf4j-api", "2.0.17", "pom"),
    ("io.lettuce", "lettuce-core", "6.4.2.RELEASE", "jar"),
    ("io.lettuce", "lettuce-core", "6.4.2.RELEASE", "pom"),
    ("com.jayway.jsonpath", "json-path", "2.9.0", "jar"),
    ("com.jayway.jsonpath", "json-path", "2.9.0", "pom"),
    ("net.minidev", "json-smart", "2.5.2", "jar"),
    ("net.minidev", "json-smart", "2.5.2", "pom"),
    ("net.minidev", "json-smart-action", "2.5.2", "jar"),
    ("net.minidev", "json-smart-action", "2.5.2", "pom"),
    ("org.assertj", "assertj-core", "3.26.3", "jar"),
    ("org.assertj", "assertj-core", "3.26.3", "pom"),
    ("org.awaitility", "awaitility", "4.2.2", "jar"),
    ("org.awaitility", "awaitility", "4.2.2", "pom"),
    ("org.hamcrest", "hamcrest", "2.2", "jar"),
    ("org.hamcrest", "hamcrest", "2.2", "pom"),
    ("org.junit.jupiter", "junit-jupiter", "5.11.4", "jar"),
    ("org.junit.jupiter", "junit-jupiter", "5.11.4", "pom"),
    ("org.junit.jupiter", "junit-jupiter-api", "5.11.4", "jar"),
    ("org.junit.jupiter", "junit-jupiter-api", "5.11.4", "pom"),
    ("org.junit.jupiter", "junit-jupiter-params", "5.11.4", "jar"),
    ("org.junit.jupiter", "junit-jupiter-params", "5.11.4", "pom"),
    ("org.junit.jupiter", "junit-jupiter-engine", "5.11.4", "jar"),
    ("org.junit.jupiter", "junit-jupiter-engine", "5.11.4", "pom"),
    ("org.junit.platform", "junit-platform-commons", "1.11.4", "jar"),
    ("org.junit.platform", "junit-platform-commons", "1.11.4", "pom"),
    ("org.junit.platform", "junit-platform-engine", "1.11.4", "jar"),
    ("org.junit.platform", "junit-platform-engine", "1.11.4", "pom"),
    ("org.junit.platform", "junit-platform-launcher", "1.11.4", "jar"),
    ("org.junit.platform", "junit-platform-launcher", "1.11.4", "pom"),
    ("org.mockito", "mockito-core", "5.14.2", "jar"),
    ("org.mockito", "mockito-core", "5.14.2", "pom"),
    ("org.mockito", "mockito-junit-jupiter", "5.14.2", "jar"),
    ("org.mockito", "mockito-junit-jupiter", "5.14.2", "pom"),
    ("org.skyscreamer", "jsonassert", "1.5.3", "jar"),
    ("org.skyscreamer", "jsonassert", "1.5.3", "pom"),
    ("org.xmlunit", "xmlunit-core", "2.10.0", "jar"),
    ("org.xmlunit", "xmlunit-core", "2.10.0", "pom"),
    ("net.bytebuddy", "byte-buddy", "1.15.11", "jar"),
    ("net.bytebuddy", "byte-buddy", "1.15.11", "pom"),
    ("net.bytebuddy", "byte-buddy-agent", "1.15.11", "jar"),
    ("net.bytebuddy", "byte-buddy-agent", "1.15.11", "pom"),
    ("org.objenesis", "objenesis", "3.3", "jar"),
    ("org.objenesis", "objenesis", "3.3", "pom"),
    ("com.vaadin.external.google", "android-json", "0.0.20131108.vaadin1", "jar"),
    
    # Additional parent POMs
    ("org.springframework", "spring-parent", "6.2.5", "pom"),
    ("org.springframework.beans", "spring-beans", "6.2.5", "pom"),
    ("org.springframework", "spring-aop", "6.2.5", "pom"),
    
    # More transitive deps
    ("org.springframework.boot", "spring-boot-starter-test", "3.4.4", "jar"),
    ("org.springframework.boot", "spring-boot-test", "3.4.4", "jar"),
    ("org.springframework.boot", "spring-boot-test-autoconfigure", "3.4.4", "jar"),
    ("org.springframework", "spring-test", "6.2.5", "jar"),
    
    # Lettuce 6.4.2 parent
    ("io.lettuce", "lettuce", "6.4.2.RELEASE", "pom"),
    
    # More Jackson parent POMs
    ("com.fasterxml.jackson.core", "jackson-core", "2.18.3", "jar"),
    ("com.fasterxml.jackson.core", "jackson-annotations", "2.18.3", "jar"),
    ("com.fasterxml.jackson.core", "jackson-databind", "2.18.3", "jar"),
    
    # Jakarta parent POMs
    ("jakarta.annotation", "jakarta.annotation-api-parent", "2.1.1", "pom"),
    
    # Spring Data parent
    ("org.springframework.data", "spring-data-redis", "3.4.4", "pom"),
    
    # Spring Security parent
    ("org.springframework.security", "spring-security-parent", "6.4.4", "pom"),
    
    # Logback parent chain
    ("ch.qos.logback", "logback-core", "1.5.18", "pom"),
    
    # Various BOMs needed
    ("io.micrometer", "micrometer-bom", "1.14.5", "pom"),
    ("io.netty", "netty-bom", "4.1.119.Final", "pom"),
    ("org.springframework.security", "spring-security-bom", "6.4.4", "pom"),
    ("org.springframework.session", "spring-session-bom", "3.4.2", "pom"),
    ("com.fasterxml.jackson", "jackson-bom", "2.18.3", "pom"),
    
    # Tomcat parent
    ("org.apache.tomcat.embed", "tomcat-embed-core", "10.1.39", "pom"),
    
    # MyBatis Plus parent
    ("com.baomidou", "mybatis-plus", "3.5.5", "pom"),
    
    # MySQL connector parent
    ("com.mysql", "mysql-connector-j", "9.1.0", "pom"),
    
    # JJWT parent
    ("io.jsonwebtoken", "jjwt-root", "0.12.3", "pom"),
    ("io.jsonwebtoken", "jjwt-api", "0.12.3", "pom"),
    ("io.jsonwebtoken", "jjwt-impl", "0.12.3", "pom"),
    ("io.jsonwebtoken", "jjwt-jackson", "0.12.3", "pom"),
    
    # SLF4J parent
    ("org.slf4j", "slf4j-parent", "2.0.16", "pom"),
    ("org.slf4j", "slf4j-parent", "2.0.17", "pom"),
    
    # More parent POMs
    ("org.apache", "apache", "33", "pom"),
    ("org.apache", "apache", "31", "pom"),
    ("org.apache", "apache", "29", "pom"),
    ("org.apache", "apache", "27", "pom"),
    ("org.apache", "apache", "30", "pom"),
    ("org.apache", "apache", "26", "pom"),
    ("org.apache", "apache", "23", "pom"),
    ("org.apache", "apache", "13", "pom"),
    ("org.apache", "apache", "11", "pom"),
]

count = 0
failed = 0
for group, artifact, version, ext in missing_poms:
    if download(group, artifact, version, ext):
        count += 1
    else:
        failed += 1

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
