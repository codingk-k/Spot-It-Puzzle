#!/bin/bash
set -euo pipefail

REPO=/root/.m2/repository
MIRROR=https://maven.aliyun.com/repository/central
PROJECT_DIR=/workspace/spot-the-difference-server
MAX_ITERATIONS=150

download() {
    local g="$1" a="$2" v="$3" t="${4:-jar}"
    local p
    p=$(echo "$g" | tr '.' '/')
    local d="$REPO/$p/$a/$v"
    mkdir -p "$d"

    if [ "$t" = "pom" ] || [ "$t" = "jar" ]; then
        if [ ! -f "$d/$a-$v.pom" ] || [ ! -s "$d/$a-$v.pom" ]; then
            echo "  POM: $g:$a:$v"
            curl -sL "$MIRROR/$p/$a/$v/$a-$v.pom" -o "$d/$a-$v.pom.tmp" 2>/dev/null && \
                mv "$d/$a-$v.pom.tmp" "$d/$a-$v.pom" || rm -f "$d/$a-$v.pom.tmp"
        fi
    fi

    if [ "$t" = "jar" ]; then
        if [ ! -f "$d/$a-$v.jar" ] || [ ! -s "$d/$a-$v.jar" ]; then
            echo "  JAR: $g:$a:$v"
            curl -sL "$MIRROR/$p/$a/$v/$a-$v.jar" -o "$d/$a-$v.jar.tmp" 2>/dev/null && \
                mv "$d/$a-$v.jar.tmp" "$d/$a-$v.jar" || rm -f "$d/$a-$v.jar.tmp"
        fi
    fi
}

extract_missing() {
    local output="$1"
    {
        echo "$output" | grep -oP '[a-zA-Z][a-zA-Z0-9_.-]+:[a-zA-Z][a-zA-Z0-9_.-]+:(?:pom|jar|war):[0-9][a-zA-Z0-9_.-]*' || true
    } | sort -u
}

echo "=== Phase 1: Download parent POM chain ==="
download org.springframework.boot spring-boot-starter-parent 3.4.4 pom
download org.springframework.boot spring-boot-dependencies 3.4.4 pom

echo ""
echo "=== Phase 2: Iterative dependency resolution ==="
prev_missing_count=-1
stall_count=0
for i in $(seq 1 $MAX_ITERATIONS); do
    echo ""
    echo "=== Iteration $i ==="
    
    output=$(cd "$PROJECT_DIR" && mvn dependency:resolve -o 2>&1) || true
    
    if echo "$output" | grep -q "BUILD SUCCESS"; then
        echo "=== All dependencies resolved! ==="
        break
    fi
    
    missing=$(extract_missing "$output")
    
    if [ -z "$missing" ]; then
        echo "dependency:resolve found no extractable missing. Trying compile..."
        output=$(cd "$PROJECT_DIR" && mvn compile -o -DskipTests 2>&1) || true
        if echo "$output" | grep -q "BUILD SUCCESS"; then
            echo "=== Compile successful! ==="
            break
        fi
        missing=$(extract_missing "$output")
    fi
    
    if [ -z "$missing" ]; then
        echo "No extractable missing artifacts. Dumping errors:"
        echo "$output" | grep -E "\[ERROR\]|\[FATAL\]" | head -15
        break
    fi
    
    count=0
    while IFS= read -r artifact; do
        [ -z "$artifact" ] && continue
        IFS=':' read -r g a t v <<< "$artifact"
        echo "  Missing: $g:$a:$t:$v"
        download "$g" "$a" "$v" "$t"
        count=$((count + 1))
    done <<< "$missing"
    
    echo "  Downloaded $count artifacts this iteration"
    
    if [ $count -eq $prev_missing_count ]; then
        stall_count=$((stall_count + 1))
        if [ $stall_count -ge 3 ]; then
            echo "Stalled for 3 iterations. Breaking."
            break
        fi
    else
        stall_count=0
    fi
    prev_missing_count=$count
done

echo ""
echo "=== Phase 3: Final compile attempt ==="
cd "$PROJECT_DIR" && mvn compile -o -DskipTests 2>&1 | tail -40
