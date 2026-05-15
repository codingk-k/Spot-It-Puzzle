#!/usr/bin/env python3
import os, subprocess, re, sys

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

def extract_missing_from_mvn_output(output):
    """Extract missing artifact coordinates from Maven error output."""
    missing = set()
    # Pattern: groupId:artifactId:type:version
    pattern1 = re.compile(r'Could not be resolved:\s+(\S+):(\S+):(\S+):(\S+)')
    for m in pattern1.finditer(output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    
    # Pattern: The following artifacts could not be resolved: groupId:artifactId:type:version
    pattern2 = re.compile(r'could not be resolved:\s+(\S+):(\S+):(\S+):(\S+)')
    for m in pattern2.finditer(output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    
    # Pattern: artifact groupId:artifactId:jar:version has not been downloaded
    pattern3 = re.compile(r'artifact\s+(\S+):(\S+):(\S+):(\S+)\s+has not been downloaded')
    for m in pattern3.finditer(output):
        group, artifact, ext, version = m.groups()
        missing.add((group, artifact, version, ext))
    
    return missing

# Run Maven compile and capture output
print("=== Running Maven compile ===")
result = subprocess.run(
    ["mvn", "compile", "-DskipTests", "-o"],
    capture_output=True, text=True, cwd="/workspace/spot-the-difference-server"
)
output = result.stdout + result.stderr

# Extract missing artifacts
missing = extract_missing_from_mvn_output(output)
print(f"\n=== Found {len(missing)} missing artifacts ===")

# Download them
count = 0
failed = 0
for group, artifact, version, ext in missing:
    # Download both jar and pom for each
    if ext == "jar":
        if download(group, artifact, version, "jar"):
            count += 1
        else:
            failed += 1
        if download(group, artifact, version, "pom"):
            count += 1
        else:
            failed += 1
    else:
        if download(group, artifact, version, ext):
            count += 1
        else:
            failed += 1

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
