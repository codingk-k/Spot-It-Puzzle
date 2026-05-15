#!/bin/bash
BASE="https://maven.aliyun.com/repository/central"
REPO="/root/.m2/repository"

download() {
  local group=$1 artifact=$2 version=$3 ext=${4:-jar}
  local groupPath=$(echo "$group" | tr '.' '/')
  local dir="$REPO/$groupPath/$artifact/$version"
  local file="$artifact-$version.$ext"
  local url="$BASE/$groupPath/$artifact/$version/$file"
  mkdir -p "$dir"
  if [ ! -f "$dir/$file" ] || [ ! -s "$dir/$file" ]; then
    echo "  Downloading: $group:$artifact:$version:$ext"
    curl -sL "$url" -o "$dir/$file"
    if [ ! -s "$dir/$file" ]; then
      echo "    FAILED: $url"
      rm -f "$dir/$file"
    fi
  fi
}

echo "=== Downloading core Maven plugins ==="

# maven-resources-plugin and deps
download org.apache.maven.plugins maven-resources-plugin 3.3.1
download org.apache.maven.shared maven-filtering 3.3.2
download org.codehaus.plexus plexus-interpolation 1.26
download org.codehaus.plexus plexus-utils 3.5.1
download commons-io commons-io 2.11.0
download org.apache.commons commons-lang3 3.12.0
download org.apache.maven.shared maven-shared-utils 3.4.2

# maven-compiler-plugin and deps
download org.apache.maven.plugins maven-compiler-plugin 3.13.0
download org.codehaus.plexus plexus-java 1.2.0
download org.codehaus.plexus plexus-compiler-api 2.15.0
download org.codehaus.plexus plexus-compiler-manager 2.15.0
download org.codehaus.plexus plexus-compiler-javac 2.15.0
download org.apache.maven.shared maven-shared-incremental 1.1

# maven-surefire-plugin and deps
download org.apache.maven.plugins maven-surefire-plugin 3.5.2
download org.apache.maven.surefire surefire-api 3.5.2
download org.apache.maven.surefire surefire-extensions-api 3.5.2
download org.apache.maven.surefire maven-surefire-common 3.5.2
download org.apache.maven.surefire surefire-booter 3.5.2
download org.apache.maven.surefire surefire-logger-api 3.5.2
download org.apache.maven.surefire surefire-logger-spi 3.5.2

# maven-jar-plugin and deps
download org.apache.maven.plugins maven-jar-plugin 3.4.2
download org.apache.maven maven-archiver 3.6.2
download org.codehaus.plexus plexus-archiver 4.9.2
download org.apache.maven.shared file-management 3.1.0
download org.apache.maven.shared maven-common-artifact-filters 3.3.2
download org.codehaus.plexus plexus-io 3.4.2
download org.sonatype.plexus plexus-build-api 0.0.7
download org.iq80.snappy snappy 0.4
download org.tukaani xz 1.9
download com.github.luben zstd-jni 1.5.5-11
download org.apache.commons commons-compress 1.26.1
download commons-codec commons-codec 1.16.1

# spring-boot-maven-plugin and deps
download org.springframework.boot spring-boot-maven-plugin 3.4.4
download org.springframework.boot spring-boot-buildpack-platform 3.4.4
download org.springframework.boot spring-boot-loader-tools 3.4.4
download org.apache.httpcomponents.client5 httpclient5 5.4.2
download org.apache.httpcomponents.core5 httpcore5 5.3.2
download org.apache.httpcomponents.core5 httpcore5-h2 5.3.2
download org.springframework spring-core 6.2.5
download org.springframework spring-context 6.2.5
download org.springframework spring-jcl 6.2.5
download org.springframework spring-aop 6.2.5
download org.springframework spring-beans 6.2.5
download org.springframework spring-expression 6.2.5
download io.micrometer micrometer-observation 1.14.5
download io.micrometer micrometer-commons 1.14.5
download com.fasterxml.jackson.core jackson-databind 2.18.3
download com.fasterxml.jackson.core jackson-core 2.18.3
download com.fasterxml.jackson.core jackson-annotations 2.18.3
download com.fasterxml.jackson.module jackson-module-parameter-names 2.18.3
download net.java.dev.jna jna 5.13.0
download net.java.dev.jna jna-platform 5.13.0
download org.tomlj tomlj 1.0.0
download javax.inject javax.inject 1
download org.slf4j slf4j-api 1.7.36

# Additional deps that may be needed
download org.apache.maven maven-plugin-api 3.9.6
download org.apache.maven maven-core 3.9.6
download org.apache.maven maven-model 3.9.6
download org.apache.maven maven-artifact 3.9.6
download org.apache.maven maven-settings 3.9.6
download org.apache.maven maven-repository-metadata 3.9.6
download org.apache.maven maven-model-builder 3.9.6
download org.codehaus.plexus plexus-component-annotations 1.5.5
download org.apache.maven maven-builder-support 3.9.6
download org.eclipse.sisu org.eclipse.sisu.plexus 0.9.0.M2
download org.eclipse.sisu org.eclipse.sisu.inject 0.9.0.M2
download com.google.inject guice 7.0.0
download com.google.guava guava 33.0.0-jre
download com.google.guava failureaccess 1.0.2
download com.google.code.findbugs jsr305 3.0.2
download org.checkerframework checker-qual 3.42.0
download com.google.errorprone error_prone_annotations 2.23.0
download com.google.j2objc j2objc-annotations 2.8
download org.codehaus.mojo animal-sniffer-annotations 1.23

echo "=== Done downloading plugin JARs ==="
