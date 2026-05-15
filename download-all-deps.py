#!/usr/bin/env python3
import os
import subprocess
import json
import re
import time

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
    print(f"  DL: {group}:{artifact}:{version}:{ext}")
    result = subprocess.run(["curl", "-sL", url, "-o", file_path], capture_output=True, timeout=60)
    if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
        print(f"    FAILED: {url}")
        if os.path.exists(file_path):
            os.remove(file_path)
        return False
    return True

def parse_pom_deps(pom_path):
    """Extract dependencies from a POM file using simple regex parsing."""
    deps = []
    try:
        with open(pom_path, 'r', errors='ignore') as f:
            content = f.read()
    except:
        return deps
    
    # Find all dependency blocks
    dep_pattern = re.compile(
        r'<dependency>\s*<groupId>(.*?)</groupId>\s*<artifactId>(.*?)</artifactId>'
        r'(?:\s*<version>(.*?)</version>)?'
        r'(?:\s*<scope>(.*?)</scope>)?'
        r'(?:\s*<type>(.*?)</type>)?'
        r'(?:\s*<classifier>(.*?)</classifier>)?'
        , re.DOTALL)
    
    for m in dep_pattern.finditer(content):
        groupId = m.group(1).strip()
        artifactId = m.group(2).strip()
        version = m.group(3).strip() if m.group(3) else None
        scope = m.group(4).strip() if m.group(4) else None
        typ = m.group(5).strip() if m.group(5) else None
        classifier = m.group(6).strip() if m.group(6) else None
        
        # Skip test/provided/system scopes
        if scope in ('test', 'provided', 'system'):
            continue
        # Skip optional
        if '<optional>true</optional>' in content[max(0, m.start()-200):m.end()+200]:
            continue
            
        deps.append({
            'groupId': groupId,
            'artifactId': artifactId,
            'version': version,
            'type': typ or 'jar'
        })
    
    return deps

def resolve_version(version_str, properties):
    """Resolve ${property} references in version strings."""
    if not version_str:
        return None
    matches = re.findall(r'\$\{([^}]+)\}', version_str)
    for match in matches:
        if match in properties:
            version_str = version_str.replace(f'${{{match}}}', properties[match])
    if '${' in version_str:
        return None  # Still unresolved
    return version_str

def parse_pom_properties(pom_path):
    """Extract properties from a POM file."""
    props = {}
    try:
        with open(pom_path, 'r', errors='ignore') as f:
            content = f.read()
    except:
        return props
    
    prop_pattern = re.compile(r'<([\w.-]+)>([^<]+)</[\w.-]+>', re.DOTALL)
    in_properties = False
    for line in content.split('\n'):
        if '<properties>' in line:
            in_properties = True
            continue
        if '</properties>' in line:
            in_properties = False
            continue
        if in_properties:
            m = re.match(r'\s*<([\w.-]+)>([^<]+)</', line)
            if m:
                props[m.group(1)] = m.group(2).strip()
    return props

# Comprehensive list of all dependencies needed for the project
# Direct dependencies
DIRECT_DEPS = [
    # Spring Boot Starters
    ("org.springframework.boot", "spring-boot-starter-web", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-security", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-data-redis", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-websocket", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-test", "3.4.4"),
    
    # MyBatis Plus
    ("com.baomidou", "mybatis-plus-spring-boot3-starter", "3.5.5"),
    ("com.baomidou", "mybatis-plus-core", "3.5.5"),
    ("com.baomidou", "mybatis-plus-extension", "3.5.5"),
    ("com.baomidou", "mybatis-plus-annotation", "3.5.5"),
    ("com.baomidou", "mybatis-plus-generator", "3.5.5"),
    
    # MySQL
    ("com.mysql", "mysql-connector-j", "9.1.0"),
    
    # JJWT
    ("io.jsonwebtoken", "jjwt-api", "0.12.3"),
    ("io.jsonwebtoken", "jjwt-impl", "0.12.3"),
    ("io.jsonwebtoken", "jjwt-jackson", "0.12.3"),
    
    # Lombok
    ("org.projectlombok", "lombok", "1.18.40"),
]

# Spring Boot starter sub-dependencies (what each starter pulls in)
SPRING_BOOT_DEPS = [
    # spring-boot-starter-web
    ("org.springframework.boot", "spring-boot-starter", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-json", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-tomcat", "3.4.4"),
    ("org.springframework.boot", "spring-boot", "3.4.4"),
    ("org.springframework.boot", "spring-boot-autoconfigure", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-logging", "3.4.4"),
    ("org.springframework", "spring-web", "6.2.5"),
    ("org.springframework", "spring-webmvc", "6.2.5"),
    
    # spring-boot-starter
    ("org.springframework.boot", "spring-boot", "3.4.4"),
    ("org.springframework.boot", "spring-boot-autoconfigure", "3.4.4"),
    ("org.springframework.boot", "spring-boot-starter-logging", "3.4.4"),
    ("jakarta.annotation", "jakarta.annotation-api", "2.1.1"),
    ("org.springframework", "spring-core", "6.2.5"),
    ("org.yaml", "snakeyaml", "2.3"),
    
    # spring-boot-starter-logging
    ("ch.qos.logback", "logback-classic", "1.5.18"),
    ("ch.qos.logback", "logback-core", "1.5.18"),
    ("org.apache.logging.log4j", "log4j-to-slf4j", "2.24.3"),
    ("org.slf4j", "jul-to-slf4j", "2.0.16"),
    
    # spring-boot-starter-json
    ("com.fasterxml.jackson.core", "jackson-databind", "2.18.3"),
    ("com.fasterxml.jackson.core", "jackson-core", "2.18.3"),
    ("com.fasterxml.jackson.core", "jackson-annotations", "2.18.3"),
    ("com.fasterxml.jackson.datatype", "jackson-datatype-jdk8", "2.18.3"),
    ("com.fasterxml.jackson.datatype", "jackson-datatype-jsr310", "2.18.3"),
    ("com.fasterxml.jackson.module", "jackson-module-parameter-names", "2.18.3"),
    
    # spring-boot-starter-tomcat
    ("org.apache.tomcat.embed", "tomcat-embed-core", "10.1.39"),
    ("org.apache.tomcat.embed", "tomcat-embed-el", "10.1.39"),
    ("org.apache.tomcat.embed", "tomcat-embed-websocket", "10.1.39"),
    
    # spring-boot-starter-security
    ("org.springframework", "spring-aop", "6.2.5"),
    ("org.springframework.security", "spring-security-web", "6.4.4"),
    ("org.springframework.security", "spring-security-config", "6.4.4"),
    ("org.springframework.security", "spring-security-core", "6.4.4"),
    
    # spring-boot-starter-data-redis
    ("org.springframework.data", "spring-data-redis", "3.4.4"),
    ("org.springframework.data", "spring-data-commons", "3.4.4"),
    ("io.lettuce", "lettuce-core", "6.4.1.RELEASE"),
    ("io.netty", "netty-common", "4.1.119.Final"),
    ("io.netty", "netty-handler", "4.1.119.Final"),
    ("io.netty", "netty-buffer", "4.1.119.Final"),
    ("io.netty", "netty-transport", "4.1.119.Final"),
    ("io.netty", "netty-resolver", "4.1.119.Final"),
    ("io.netty", "netty-transport-native-unix-common", "4.1.119.Final"),
    
    # spring-boot-starter-websocket
    ("org.springframework", "spring-websocket", "6.2.5"),
    ("org.springframework", "spring-messaging", "6.2.5"),
    
    # Spring core dependencies
    ("org.springframework", "spring-jcl", "6.2.5"),
    ("org.springframework", "spring-beans", "6.2.5"),
    ("org.springframework", "spring-context", "6.2.5"),
    ("org.springframework", "spring-expression", "6.2.5"),
    ("org.springframework", "spring-tx", "6.2.5"),
    ("org.springframework", "spring-oxm", "6.2.5"),
    ("org.springframework", "spring-context-support", "6.2.5"),
    
    # Jakarta APIs
    ("jakarta.servlet", "jakarta.servlet-api", "6.0.0"),
    ("jakarta.validation", "jakarta.validation-api", "3.0.2"),
    ("jakarta.persistence", "jakarta.persistence-api", "3.1.0"),
    ("jakarta.websocket", "jakarta.websocket-api", "2.1.1"),
    ("jakarta.websocket", "jakarta.websocket-client-api", "2.1.1"),
    ("jakarta.xml.bind", "jakarta.xml.bind-api", "4.0.2"),
    ("jakarta.inject", "jakarta.inject-api", "2.0.1"),
    
    # SLF4J
    ("org.slf4j", "slf4j-api", "2.0.16"),
    ("org.slf4j", "jcl-over-slf4j", "2.0.16"),
    
    # MyBatis Plus dependencies
    ("org.mybatis", "mybatis-spring", "3.0.3"),
    ("org.mybatis", "mybatis", "3.5.13"),
    ("com.github.jsqlparser", "jsqlparser", "4.9"),
    ("org.springframework.boot", "spring-boot-starter-jdbc", "3.4.4"),
    ("com.zaxxer", "HikariCP", "6.2.1"),
    ("org.springframework", "spring-jdbc", "6.2.5"),
    
    # JJWT dependencies
    ("com.fasterxml.jackson.core", "jackson-databind", "2.18.3"),
    
    # Spring Security crypto
    ("org.springframework.security", "spring-security-crypto", "6.4.4"),
    
    # Lettuce dependencies
    ("io.netty", "netty-codec", "4.1.119.Final"),
    ("io.netty", "netty-resolver-dns", "4.1.119.Final"),
    ("io.netty", "netty-codec-dns", "4.1.119.Final"),
    ("io.netty", "netty-resolver-dns-classes-macos", "4.1.119.Final"),
    ("io.netty", "netty-transport-native-epoll", "4.1.119.Final"),
    ("io.netty", "netty-transport-native-kqueue", "4.1.119.Final"),
    ("io.netty", "netty-transport-classes-epoll", "4.1.119.Final"),
    ("io.netty", "netty-transport-classes-kqueue", "4.1.119.Final"),
    
    # Log4j
    ("org.apache.logging.log4j", "log4j-api", "2.24.3"),
    ("org.apache.logging.log4j", "log4j-to-slf4j", "2.24.3"),
    
    # Misc
    ("io.micrometer", "micrometer-observation", "1.14.5"),
    ("io.micrometer", "micrometer-commons", "1.14.5"),
    
    # HikariCP
    ("com.zaxxer", "HikariCP", "6.2.1"),
    
    # Spring Boot test
    ("org.springframework.boot", "spring-boot-test", "3.4.4"),
    ("org.springframework.boot", "spring-boot-test-autoconfigure", "3.4.4"),
    ("org.springframework", "spring-test", "6.2.5"),
    
    # AOP
    ("org.aspectj", "aspectjweaver", "1.9.23"),
    
    # SnakeYAML
    ("org.yaml", "snakeyaml", "2.3"),
    
    # Jackson BOM items
    ("com.fasterxml.jackson", "jackson-bom", "2.18.3"),
    ("com.fasterxml.jackson", "jackson-base", "2.18.3"),
]

# Download all
all_deps = DIRECT_DEPS + SPRING_BOOT_DEPS
seen = set()
count = 0
failed = 0

for group, artifact, version in all_deps:
    key = f"{group}:{artifact}:{version}"
    if key in seen:
        continue
    seen.add(key)
    
    # Download JAR
    if download(group, artifact, version, "jar"):
        count += 1
    else:
        failed += 1
    
    # Download POM
    if download(group, artifact, version, "pom"):
        count += 1
    else:
        # Some artifacts might not have separate POMs (like BOMs)
        pass

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
