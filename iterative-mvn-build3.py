#!/usr/bin/env python3
import os, subprocess, re

BASE = "https://maven.aliyun.com/repository/central"
REPO = "/root/.m2/repository"
MAX_ITERATIONS = 50

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
        if os.path.exists(file_path):
            os.remove(file_path)
        return False
    return True

def extract_missing(output):
    missing = set()
    # Pattern 1: could not be resolved: groupId:artifactId:type:version
    for m in re.finditer(r'could not be resolved:\s+([^\s:]+):([^\s:]+):([^\s:]+):([^\s:]+)', output, re.IGNORECASE):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    # Pattern 2: artifact groupId:artifactId:type:version has not been downloaded
    for m in re.finditer(r'artifact\s+([^\s:]+):([^\s:]+):([^\s:]+):([^\s:]+)\s+has not been downloaded', output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    # Pattern 3: POM for groupId:artifactId:jar:version is missing
    for m in re.finditer(r'POM for\s+([^\s:]+):([^\s:]+):([^\s:]+):([^\s:]+)\s+is missing', output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    # Pattern 4: Failed to read artifact descriptor for groupId:artifactId:type:version
    for m in re.finditer(r'Failed to read artifact descriptor for\s+([^\s:]+):([^\s:]+):([^\s:]+):([^\s:]+)', output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    return missing

for iteration in range(1, MAX_ITERATIONS + 1):
    print(f"\n=== Iteration {iteration} ===")
    
    result = subprocess.run(
        ["mvn", "compile", "-DskipTests", "-o"],
        capture_output=True, text=True, cwd="/workspace/spot-the-difference-server"
    )
    output = result.stdout + result.stderr
    
    if "BUILD SUCCESS" in output:
        print("BUILD SUCCESS!")
        break
    
    missing = extract_missing(output)
    if not missing:
        print("No missing artifacts found but build failed. Last lines:")
        for line in output.split('\n')[-20:]:
            if line.strip():
                print(line)
        break
    
    print(f"Found {len(missing)} missing artifacts")
    downloaded = 0
    failed = 0
    for group, artifact, version, ext in sorted(missing):
        for e in set([ext, "pom"]):
            if download(group, artifact, version, e):
                downloaded += 1
                print(f"  DL: {group}:{artifact}:{version}:{e}")
            else:
                failed += 1
                print(f"  FAIL: {group}:{artifact}:{version}:{e}")
    
    print(f"Downloaded: {downloaded}, Failed: {failed}")
    
    if downloaded == 0 and failed > 0:
        print("Could not download any artifacts. Stopping.")
        break
else:
    print(f"Reached max iterations ({MAX_ITERATIONS})")
