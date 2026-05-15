#!/bin/bash
set -euo pipefail

REPO=/root/.m2/repository
MIRROR=https://maven.aliyun.com/repository/central
PROJECT_DIR=/workspace/spot-the-difference-server
MAX_ITERATIONS=200

download() {
    local g="$1" a="$2" v="$3" t="${4:-jar}"
    local p
    p=$(echo "$g" | tr '.' '/')
    local d="$REPO/$p/$a/$v"
    mkdir -p "$d"

    if [ "$t" = "pom" ] || [ "$t" = "jar" ]; then
        if [ ! -f "$d/$a-$v.pom" ] || [ ! -s "$d/$a-$v.pom" ]; then
            echo "  POM: $g:$a:$v"
            curl -sL --connect-timeout 10 --max-time 60 "$MIRROR/$p/$a/$v/$a-$v.pom" -o "$d/$a-$v.pom.tmp" 2>/dev/null && \
                [ -s "$d/$a-$v.pom.tmp" ] && mv "$d/$a-$v.pom.tmp" "$d/$a-$v.pom" || rm -f "$d/$a-$v.pom.tmp"
        fi
    fi

    if [ "$t" = "jar" ]; then
        if [ ! -f "$d/$a-$v.jar" ] || [ ! -s "$d/$a-$v.jar" ]; then
            echo "  JAR: $g:$a:$v"
            curl -sL --connect-timeout 10 --max-time 120 "$MIRROR/$p/$a/$v/$a-$v.jar" -o "$d/$a-$v.jar.tmp" 2>/dev/null && \
                [ -s "$d/$a-$v.jar.tmp" ] && mv "$d/$a-$v.jar.tmp" "$d/$a-$v.jar" || rm -f "$d/$a-$v.jar.tmp"
        fi
    fi
}

extract_missing() {
    local output="$1"
    {
        echo "$output" | grep -oP '[a-zA-Z][a-zA-Z0-9_.-]+:[a-zA-Z][a-zA-Z0-9_.-]+:(?:pom|jar|war):[0-9][a-zA-Z0-9_.-]*' || true
    } | grep -v 'com.game:spot-the-difference-server' | sort -u
}

echo "=== Phase 2: Iterative dependency resolution ==="
for i in $(seq 1 $MAX_ITERATIONS); do
    echo ""
    echo "=== Iteration $i ==="
    
    output=$(cd "$PROJECT_DIR" && mvn compile -o -DskipTests 2>&1) || true
    
    if echo "$output" | grep -q "BUILD SUCCESS"; then
        echo "=== Compile successful! ==="
        break
    fi
    
    missing=$(extract_missing "$output")
    
    if [ -z "$missing" ]; then
        echo "No extractable missing artifacts. Error output:"
        echo "$output" | grep -E "\[ERROR\]|\[FATAL\]|\[WARNING\]" | head -15
        
        # Try dependency:resolve as fallback
        output2=$(cd "$PROJECT_DIR" && mvn dependency:resolve -o 2>&1) || true
        if echo "$output2" | grep -q "BUILD SUCCESS"; then
            echo "=== Dependencies resolved! ==="
            break
        fi
        missing=$(extract_missing "$output2")
        if [ -z "$missing" ]; then
            echo "Still no progress. Breaking."
            break
        fi
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
done

echo ""
echo "=== Final compile attempt ==="
cd "$PROJECT_DIR" && mvn compile -o -DskipTests 2>&1 | tail -50
