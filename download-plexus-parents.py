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

# Plexus parent POMs
deps = [
    # plexus-java parent
    ("org.codehaus.plexus", "plexus-languages", "1.2.0", "pom"),
    
    # plexus-compiler parent
    ("org.codehaus.plexus", "plexus-compiler", "2.15.0", "pom"),
    
    # plexus-utils 4.0.0 parent
    ("org.codehaus.plexus", "plexus", "17", "pom"),
    ("org.codehaus.plexus", "plexus-utils", "4.0.0", "pom"),
    
    # More plexus parent POMs
    ("org.codehaus.plexus", "plexus-containers", "2.15.0", "pom"),
    ("org.codehaus.plexus", "plexus-components", "2.15.0", "pom"),
    
    # Check plexus-java POM for its parent
    # Let me also download the POMs we already have JARs for but might be missing parent POMs
    ("org.codehaus.plexus", "plexus-classworlds", "2.8.0", "pom"),
    ("org.codehaus.plexus", "plexus-interpolation", "1.26", "pom"),
    ("org.codehaus.plexus", "plexus-component-annotations", "2.15.0", "jar"),
    ("org.codehaus.plexus", "plexus-component-annotations", "2.15.0", "pom"),
    ("org.codehaus.plexus", "plexus-container-default", "2.1.1", "jar"),
    ("org.codehaus.plexus", "plexus-container-default", "2.1.1", "pom"),
    
    # Google Guava parent
    ("com.google.guava", "guava-parent", "33.0.0-jre", "pom"),
    
    # Apache Commons parent
    ("org.apache.commons", "commons-parent", "65", "pom"),
    ("org.apache.commons", "commons-parent", "66", "pom"),
    ("org.apache.commons", "commons-parent", "64", "pom"),
    ("org.apache.commons", "commons-parent", "52", "pom"),
    
    # Eclipse Sisu parent
    ("org.eclipse.sisu", "org.eclipse.sisu.parent", "0.9.0.M2", "pom"),
    
    # Maven parent POMs
    ("org.apache.maven", "maven-parent", "43", "pom"),
    ("org.apache.maven", "maven-parent", "42", "pom"),
    ("org.apache.maven", "maven-parent", "41", "pom"),
    ("org.apache.maven", "maven-parent", "40", "pom"),
    ("org.apache.maven", "maven-parent", "39", "pom"),
    ("org.apache.maven", "maven-parent", "37", "pom"),
    ("org.apache.maven", "maven-parent", "36", "pom"),
    ("org.apache.maven", "maven-parent", "23", "pom"),
    ("org.apache.maven", "maven-parent", "22", "pom"),
    
    # Apache parent
    ("org.apache", "apache", "33", "pom"),
    ("org.apache", "apache", "32", "pom"),
    ("org.apache", "apache", "31", "pom"),
    ("org.apache", "apache", "30", "pom"),
    ("org.apache", "apache", "29", "pom"),
    ("org.apache", "apache", "27", "pom"),
    ("org.apache", "apache", "26", "pom"),
    ("org.apache", "apache", "23", "pom"),
    ("org.apache", "apache", "13", "pom"),
    ("org.apache", "apache", "11", "pom"),
    
    # Maven shared components parent
    ("org.apache.maven.shared", "maven-shared-components", "39", "pom"),
    ("org.apache.maven.shared", "maven-shared-components", "37", "pom"),
    ("org.apache.maven.shared", "maven-shared-components", "36", "pom"),
    ("org.apache.maven.shared", "maven-shared-components", "19", "pom"),
    ("org.apache.maven.shared", "maven-shared-components", "18", "pom"),
    
    # Maven plugins parent
    ("org.apache.maven.plugins", "maven-plugins", "39", "pom"),
    ("org.apache.maven.plugins", "maven-plugins", "41", "pom"),
    ("org.apache.maven.plugins", "maven-plugins", "42", "pom"),
    
    # Plexus parent POMs for various versions
    ("org.codehaus.plexus", "plexus", "16", "pom"),
    ("org.codehaus.plexus", "plexus", "15", "pom"),
    ("org.codehaus.plexus", "plexus", "14", "pom"),
    ("org.codehaus.plexus", "plexus", "13", "pom"),
    ("org.codehaus.plexus", "plexus", "10", "pom"),
    ("org.codehaus.plexus", "plexus", "8", "pom"),
    ("org.codehaus.plexus", "plexus", "5.1", "pom"),
    ("org.codehaus.plexus", "plexus", "2.0.2", "pom"),
]

count = 0
failed = 0
for group, artifact, version, ext in deps:
    if download(group, artifact, version, ext):
        count += 1
    else:
        failed += 1

print(f"\n=== Downloaded: {count}, Failed: {failed} ===")
