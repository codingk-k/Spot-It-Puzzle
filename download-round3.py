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
    # Parent POMs from error
    ("org.slf4j", "slf4j-bom", "2.0.17", "pom"),
    ("org.apache.groovy", "groovy-bom", "4.0.22", "pom"),
    ("io.netty", "netty-parent", "4.1.119.Final", "pom"),
    ("org.springframework.data.build", "spring-data-build", "3.4.4", "pom"),
    ("org.assertj", "assertj-bom", "3.24.2", "pom"),
    ("net.bytebuddy", "byte-buddy-parent", "1.15.11", "pom"),
    ("org.awaitility", "awaitility-parent", "4.2.2", "pom"),
    ("org.objenesis", "objenesis-parent", "3.3", "pom"),
    ("org.xmlunit", "xmlunit-parent", "2.10.0", "pom"),
    
    # Missing dependency JARs and POMs
    ("io.projectreactor", "reactor-core", "3.7.4", "jar"),
    ("io.projectreactor", "reactor-core", "3.7.4", "pom"),
    ("net.minidev", "accessors-smart", "2.5.2", "jar"),
    ("net.minidev", "accessors-smart", "2.5.2", "pom"),
    ("jakarta.activation", "jakarta.activation-api", "2.1.3", "jar"),
    ("jakarta.activation", "jakarta.activation-api", "2.1.3", "pom"),
    ("org.opentest4j", "opentest4j", "1.3.0", "jar"),
    ("org.opentest4j", "opentest4j", "1.3.0", "pom"),
    ("org.apiguardian", "apiguardian-api", "1.1.2", "jar"),
    ("org.apiguardian", "apiguardian-api", "1.1.2", "pom"),
    
    # More parent POMs that will likely be needed
    ("io.netty", "netty-bom", "4.1.119.Final", "pom"),
    ("io.projectreactor", "reactor-bom", "2024.0.4", "pom"),
    ("org.reactivestreams", "reactive-streams", "1.0.4", "jar"),
    ("org.reactivestreams", "reactive-streams", "1.0.4", "pom"),
    
    # ASM for accessors-smart
    ("org.ow2.asm", "asm", "9.6", "jar"),
    ("org.ow2.asm", "asm", "9.6", "pom"),
    
    # Groovy parent
    ("org.apache.groovy", "groovy-bom", "4.0.26", "pom"),
    ("org.apache.groovy", "groovy-all", "4.0.22", "pom"),
    
    # More Spring Boot BOM deps
    ("org.springframework.boot", "spring-boot-starter-parent", "3.4.4", "pom"),
    ("org.springframework.boot", "spring-boot-dependencies", "3.4.4", "pom"),
    
    # Netty parent chain
    ("io.netty", "netty-common", "4.1.119.Final", "pom"),
    
    # Various missing parent POMs
    ("org.assertj", "assertj-parent-pom", "3.26.3", "pom"),
    ("org.assertj", "assertj-build", "3.26.3", "pom"),
    ("org.springframework.boot", "spring-boot-build", "3.4.4", "pom"),
    
    # Jakarta Activation parent
    ("org.eclipse.ee4j", "project", "1.0.9", "pom"),
    
    # More Spring Data parent chain
    ("org.springframework.data.build", "spring-data-parent", "3.4.4", "pom"),
    ("org.springframework.data", "spring-data-release", "3.4.4", "pom"),
    
    # Lettuce parent
    ("io.lettuce", "lettuce-core", "6.4.2.RELEASE", "pom"),
    
    # Micrometer parent
    ("io.micrometer", "micrometer-bom", "1.14.5", "pom"),
    ("io.micrometer", "micrometer-parent", "1.14.5", "pom"),
    ("io.micrometer", "micrometer-commons", "1.14.5", "pom"),
    ("io.micrometer", "micrometer-observation", "1.14.5", "pom"),
    
    # Spring Framework parent
    ("org.springframework", "spring-framework-bom", "6.2.5", "pom"),
    
    # Tomcat parent
    ("org.apache.tomcat", "tomcat", "10.1.39", "pom"),
    ("org.apache.tomcat.embed", "tomcat-embed-core", "10.1.39", "pom"),
    
    # Log4j parent chain
    ("org.apache.logging", "logging-parent", "11.3.0", "pom"),
    ("org.apache.logging.log4j", "log4j-bom", "2.24.3", "pom"),
    
    # More BOMs from spring-boot-dependencies
    ("com.querydsl", "querydsl-bom", "5.1.0", "pom"),
    ("io.micrometer", "micrometer-tracing-bom", "1.4.4", "pom"),
    ("io.opentelemetry", "opentelemetry-bom", "1.43.0", "pom"),
    ("io.prometheus", "prometheus-metrics-bom", "1.3.6", "pom"),
    ("io.prometheus", "simpleclient_bom", "0.16.0", "pom"),
    ("io.rest-assured", "rest-assured-bom", "5.5.1", "pom"),
    ("io.rsocket", "rsocket-bom", "1.1.5", "pom"),
    ("io.zipkin.brave", "brave-bom", "6.0.3", "pom"),
    ("io.zipkin.reporter2", "zipkin-reporter-bom", "3.4.3", "pom"),
    ("org.apache.activemq", "activemq-bom", "6.1.6", "pom"),
    ("org.apache.activemq", "artemis-bom", "2.37.0", "pom"),
    ("org.apache.cassandra", "java-driver-bom", "4.18.1", "pom"),
    ("org.apache.logging.log4j", "log4j-bom", "2.24.3", "pom"),
    ("org.apache.pulsar", "pulsar-bom", "3.3.5", "pom"),
    ("org.assertj", "assertj-bom", "3.26.3", "pom"),
    ("org.eclipse.jetty.ee10", "jetty-ee10-bom", "12.0.18", "pom"),
    ("org.eclipse.jetty", "jetty-bom", "12.0.18", "pom"),
    ("org.glassfish.jaxb", "jaxb-bom", "4.0.5", "pom"),
    ("org.glassfish.jersey", "jersey-bom", "3.1.10", "pom"),
    ("org.infinispan", "infinispan-bom", "15.0.14.Final", "pom"),
    ("org.jetbrains.kotlin", "kotlin-bom", "1.9.25", "pom"),
    ("org.jetbrains.kotlinx", "kotlinx-coroutines-bom", "1.8.1", "pom"),
    ("org.jetbrains.kotlinx", "kotlinx-serialization-bom", "1.6.3", "pom"),
    ("org.junit", "junit-bom", "5.11.4", "pom"),
    ("org.mockito", "mockito-bom", "5.14.2", "pom"),
    ("org.seleniumhq.selenium", "selenium-bom", "4.25.0", "pom"),
    ("org.springframework.amqp", "spring-amqp-bom", "3.2.4", "pom"),
    ("org.springframework.batch", "spring-batch-bom", "5.2.2", "pom"),
    ("org.springframework.data", "spring-data-bom", "2024.1.4", "pom"),
    ("org.springframework.integration", "spring-integration-bom", "6.4.3", "pom"),
    ("org.springframework.pulsar", "spring-pulsar-bom", "1.2.4", "pom"),
    ("org.springframework.restdocs", "spring-restdocs-bom", "3.0.3", "pom"),
    ("org.springframework.security", "spring-security-bom", "6.4.4", "pom"),
    ("org.springframework.session", "spring-session-bom", "3.4.2", "pom"),
    ("org.springframework.ws", "spring-ws-bom", "4.0.12", "pom"),
    ("org.testcontainers", "testcontainers-bom", "1.20.6", "pom"),
    ("org.springframework", "spring-framework-bom", "6.2.5", "pom"),
    
    # Jackson BOM parent chain
    ("com.fasterxml.jackson", "jackson-parent", "2.18.3", "pom"),
    ("com.fasterxml", "oss-parent", "61", "pom"),
    ("com.fasterxml.jackson", "jackson-bom", "2.18.3", "pom"),
    ("com.fasterxml.jackson", "jackson-base", "2.18.3", "pom"),
    
    # Spring Boot parent chain
    ("org.springframework.boot", "spring-boot-build", "3.4.4", "pom"),
]

count = 0
failed = 0
for group, artifact, version, ext in deps:
    if download(group, artifact, version, ext):
        count += 1
    else:
        failed += 1

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
