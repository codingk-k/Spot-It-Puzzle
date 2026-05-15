#!/bin/bash
set -euo pipefail

REPO=/root/.m2/repository
MIRROR=https://maven.aliyun.com/repository/central
PROJECT_DIR=/workspace/spot-the-difference-server

download_file() {
    local url="$1" dest="$2"
    if [ -f "$dest" ] && [ -s "$dest" ]; then
        return 0
    fi
    curl -sL --connect-timeout 10 --max-time 120 "$url" -o "$dest.tmp" 2>/dev/null
    if [ -s "$dest.tmp" ]; then
        mv "$dest.tmp" "$dest"
        return 0
    fi
    rm -f "$dest.tmp"
    return 1
}

download_artifact() {
    local g="$1" a="$2" v="$3" t="${4:-jar}"
    local p
    p=$(echo "$g" | tr '.' '/')
    local d="$REPO/$p/$a/$v"
    mkdir -p "$d"

    if [ "$t" = "pom" ] || [ "$t" = "jar" ]; then
        if download_file "$MIRROR/$p/$a/$v/$a-$v.pom" "$d/$a-$v.pom"; then
            resolve_parent_poms "$d/$a-$v.pom"
        fi
    fi

    if [ "$t" = "jar" ]; then
        download_file "$MIRROR/$p/$a/$v/$a-$v.jar" "$d/$a-$v.jar" || true
    fi
}

resolve_parent_poms() {
    local pom_file="$1"
    if [ ! -f "$pom_file" ] || [ ! -s "$pom_file" ]; then
        return
    fi

    local in_parent=0 found_parent=0
    local parent_g="" parent_a="" parent_v=""
    while IFS= read -r line; do
        if echo "$line" | grep -q '<parent>'; then
            in_parent=1
            found_parent=1
            continue
        fi
        if echo "$line" | grep -q '</parent>'; then
            in_parent=0
            break
        fi
        if [ $in_parent -eq 1 ]; then
            if echo "$line" | grep -qP '<groupId>'; then
                parent_g=$(echo "$line" | sed -n 's/.*<groupId>\([^<]*\)<\/groupId>.*/\1/p')
            elif echo "$line" | grep -qP '<artifactId>'; then
                parent_a=$(echo "$line" | sed -n 's/.*<artifactId>\([^<]*\)<\/artifactId>.*/\1/p')
            elif echo "$line" | grep -qP '<version>'; then
                parent_v=$(echo "$line" | sed -n 's/.*<version>\([^<]*\)<\/version>.*/\1/p')
            fi
        fi
    done < "$pom_file"

    if [ $found_parent -eq 1 ] && [ -n "$parent_g" ] && [ -n "$parent_a" ] && [ -n "$parent_v" ]; then
        local pp
        pp=$(echo "$parent_g" | tr '.' '/')
        local parent_pom="$REPO/$pp/$parent_a/$parent_v/$parent_a-$parent_v.pom"
        if [ ! -f "$parent_pom" ] || [ ! -s "$parent_pom" ]; then
            echo "    Parent POM: $parent_g:$parent_a:$parent_v"
            download_artifact "$parent_g" "$parent_a" "$parent_v" "pom"
        fi
    fi
}

extract_missing() {
    local output="$1"
    {
        echo "$output" | grep -oP '[a-zA-Z][a-zA-Z0-9_.-]+:[a-zA-Z][a-zA-Z0-9_.-]+:(?:pom|jar|war):[0-9][a-zA-Z0-9_.-]*' || true
    } | grep -v 'com.game:spot-the-difference-server' | sort -u
}

echo "=== Phase 1: Download core parent POM chain ==="
download_artifact org.springframework.boot spring-boot-starter-parent 3.4.4 pom
download_artifact org.springframework.boot spring-boot-dependencies 3.4.4 pom

echo ""
echo "=== Phase 2: Iterative resolution with -e flag ==="
MAX_ITERATIONS=200
prev_missing=""
stall_count=0
for i in $(seq 1 $MAX_ITERATIONS); do
    echo ""
    echo "=== Iteration $i ==="
    
    output=$(cd "$PROJECT_DIR" && mvn compile -o -DskipTests -e 2>&1) || true
    
    if echo "$output" | grep -q "BUILD SUCCESS"; then
        echo "=== BUILD SUCCESS! ==="
        break
    fi
    
    missing=$(extract_missing "$output")
    
    if [ -z "$missing" ]; then
        echo "No extractable missing from compile -e. Trying dependency:resolve..."
        output=$(cd "$PROJECT_DIR" && mvn dependency:resolve -o -e 2>&1) || true
        if echo "$output" | grep -q "BUILD SUCCESS"; then
            echo "=== Dependencies resolved! ==="
            break
        fi
        missing=$(extract_missing "$output")
    fi
    
    if [ -z "$missing" ]; then
        echo "No extractable missing artifacts. Errors:"
        echo "$output" | grep -E "\[ERROR\]|\[FATAL\]" | head -10
        break
    fi
    
    if [ "$missing" = "$prev_missing" ]; then
        stall_count=$((stall_count + 1))
        if [ $stall_count -ge 5 ]; then
            echo "Stalled for 5 iterations with same missing list. Forcing re-download..."
            while IFS= read -r artifact; do
                [ -z "$artifact" ] && continue
                IFS=':' read -r g a t v <<< "$artifact"
                local_p=$(echo "$g" | tr '.' '/')
                rm -f "$REPO/$local_p/$a/$v/$a-$v.pom" "$REPO/$local_p/$a/$v/$a-$v.jar"
            done <<< "$missing"
            stall_count=0
        fi
    else
        stall_count=0
    fi
    prev_missing="$missing"
    
    count=0
    while IFS= read -r artifact; do
        [ -z "$artifact" ] && continue
        IFS=':' read -r g a t v <<< "$artifact"
        echo "  Missing: $g:$a:$t:$v"
        download_artifact "$g" "$a" "$v" "$t"
        count=$((count + 1))
    done <<< "$missing"
    
    echo "  Processed $count artifacts this iteration"
done

echo ""
echo "=== Final compile attempt ==="
cd "$PROJECT_DIR" && mvn compile -o -DskipTests 2>&1 | tail -50
