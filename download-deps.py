#!/usr/bin/env python3
import xml.etree.ElementTree as ET
import os
import subprocess
import sys
import re
from urllib.parse import quote

REPO = "/root/.m2/repository"
MIRROR = "https://maven.aliyun.com/repository/central"
PROJECT_DIR = "/workspace/spot-the-difference-server"

ns = {"mvn": "http://maven.apache.org/POM/4.0.0"}

def group_path(g):
    return g.replace(".", "/")

def download_file(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    tmp = dest + ".tmp"
    try:
        r = subprocess.run(
            ["curl", "-sL", "--connect-timeout", "10", "--max-time", "120", url, "-o", tmp],
            capture_output=True, timeout=130
        )
        if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
            os.rename(tmp, dest)
            return True
        if os.path.exists(tmp):
            os.remove(tmp)
    except Exception:
        if os.path.exists(tmp):
            os.remove(tmp)
    return False

def download_artifact(g, a, v, t="jar"):
    p = group_path(g)
    d = os.path.join(REPO, p, a, v)
    result = False
    if t in ("pom", "jar"):
        pom_file = os.path.join(d, f"{a}-{v}.pom")
        if download_file(f"{MIRROR}/{p}/{a}/{v}/{a}-{v}.pom", pom_file):
            result = True
    if t == "jar":
        jar_file = os.path.join(d, f"{a}-{v}.jar")
        if download_file(f"{MIRROR}/{p}/{a}/{v}/{a}-{v}.jar", jar_file):
            result = True
    return result

def parse_pom(pom_file):
    if not os.path.exists(pom_file) or os.path.getsize(pom_file) == 0:
        return None
    try:
        tree = ET.parse(pom_file)
        root = tree.getroot()
        return root
    except ET.ParseError:
        return None

def find_ns(root):
    tag = root.tag
    if tag.startswith("{"):
        return tag[1:tag.index("}")]
    return ""

def get_text(root, path, custom_ns=None):
    if custom_ns:
        full_path = f"{{{custom_ns}}}" + path.replace("/", f"/{{{custom_ns}}}")
        el = root.find(full_path)
    else:
        el = root.find(path)
    if el is not None and el.text:
        return el.text.strip()
    return None

def get_parent(root, custom_ns):
    parent = root.find(f"{{{custom_ns}}}parent")
    if parent is None:
        return None
    g = parent.find(f"{{{custom_ns}}}groupId")
    a = parent.find(f"{{{custom_ns}}}artifactId")
    v = parent.find(f"{{{custom_ns}}}version")
    if g is not None and a is not None and v is not None:
        return (g.text.strip(), a.text.strip(), v.text.strip())
    return None

def get_dependencies(root, custom_ns):
    deps = []
    deps_section = root.find(f"{{{custom_ns}}}dependencies")
    if deps_section is None:
        return deps
    for dep in deps_section.findall(f"{{{custom_ns}}}dependency"):
        g_el = dep.find(f"{{{custom_ns}}}groupId")
        a_el = dep.find(f"{{{custom_ns}}}artifactId")
        v_el = dep.find(f"{{{custom_ns}}}version")
        s_el = dep.find(f"{{{custom_ns}}}scope")
        t_el = dep.find(f"{{{custom_ns}}}type")
        opt_el = dep.find(f"{{{custom_ns}}}optional")
        
        g = g_el.text.strip() if g_el is not None else None
        a = a_el.text.strip() if a_el is not None else None
        v = v_el.text.strip() if v_el is not None else None
        scope = s_el.text.strip() if s_el is not None else None
        dep_type = t_el.text.strip() if t_el is not None else "jar"
        optional = opt_el.text.strip() if opt_el is not None else "false"
        
        if g and a:
            deps.append({
                "groupId": g,
                "artifactId": a,
                "version": v,
                "scope": scope,
                "type": dep_type,
                "optional": optional == "true"
            })
    return deps

def get_dependency_management(root, custom_ns):
    deps = []
    dm = root.find(f"{{{custom_ns}}}dependencyManagement")
    if dm is None:
        return deps
    deps_section = dm.find(f"{{{custom_ns}}}dependencies")
    if deps_section is None:
        return deps
    for dep in deps_section.findall(f"{{{custom_ns}}}dependency"):
        g_el = dep.find(f"{{{custom_ns}}}groupId")
        a_el = dep.find(f"{{{custom_ns}}}artifactId")
        v_el = dep.find(f"{{{custom_ns}}}version")
        s_el = dep.find(f"{{{custom_ns}}}scope")
        t_el = dep.find(f"{{{custom_ns}}}type")
        
        g = g_el.text.strip() if g_el is not None else None
        a = a_el.text.strip() if a_el is not None else None
        v = v_el.text.strip() if v_el is not None else None
        scope = s_el.text.strip() if s_el is not None else None
        dep_type = t_el.text.strip() if t_el is not None else "jar"
        
        if g and a:
            deps.append({
                "groupId": g,
                "artifactId": a,
                "version": v,
                "scope": scope,
                "type": dep_type,
            })
    return deps

def get_imports(root, custom_ns):
    imports = []
    dm = root.find(f"{{{custom_ns}}}dependencyManagement")
    if dm is None:
        return imports
    deps_section = dm.find(f"{{{custom_ns}}}dependencies")
    if deps_section is None:
        return imports
    for dep in deps_section.findall(f"{{{custom_ns}}}dependency"):
        s_el = dep.find(f"{{{custom_ns}}}scope")
        if s_el is not None and s_el.text and s_el.text.strip() == "import":
            g_el = dep.find(f"{{{custom_ns}}}groupId")
            a_el = dep.find(f"{{{custom_ns}}}artifactId")
            v_el = dep.find(f"{{{custom_ns}}}version")
            t_el = dep.find(f"{{{custom_ns}}}type")
            g = g_el.text.strip() if g_el is not None else None
            a = a_el.text.strip() if a_el is not None else None
            v = v_el.text.strip() if v_el is not None else None
            dep_type = t_el.text.strip() if t_el is not None else "pom"
            if g and a and v:
                imports.append((g, a, v, dep_type))
    return imports

def get_pom_path(g, a, v):
    p = group_path(g)
    return os.path.join(REPO, p, a, v, f"{a}-{v}.pom")

resolved = set()
to_resolve = []

def add_to_resolve(g, a, v, t="jar"):
    key = f"{g}:{a}:{t}:{v}"
    if key not in resolved:
        resolved.add(key)
        to_resolve.append((g, a, v, t))

def resolve_pom(g, a, v):
    pom_path = get_pom_path(g, a, v)
    if not os.path.exists(pom_path) or os.path.getsize(pom_path) == 0:
        download_artifact(g, a, v, "pom")
    
    if not os.path.exists(pom_path) or os.path.getsize(pom_path) == 0:
        return
    
    root = parse_pom(pom_path)
    if root is None:
        return
    
    custom_ns = find_ns(root)
    if not custom_ns:
        return
    
    parent = get_parent(root, custom_ns)
    if parent:
        pg, pa, pv = parent
        add_to_resolve(pg, pa, pv, "pom")
    
    for ig, ia, iv, it in get_imports(root, custom_ns):
        add_to_resolve(ig, ia, iv, it)
    
    for dep in get_dependencies(root, custom_ns):
        if dep.get("scope") in ("test", "provided", "system"):
            continue
        if dep.get("optional", False):
            continue
        dg = dep["groupId"]
        da = dep["artifactId"]
        dv = dep["version"]
        dt = dep.get("type", "jar")
        if dv:
            add_to_resolve(dg, da, dv, dt)

print("=== Phase 1: Resolve project POM and its dependencies ===")

project_pom = os.path.join(PROJECT_DIR, "pom.xml")
root = parse_pom(project_pom)
custom_ns = find_ns(root)

parent = get_parent(root, custom_ns)
if parent:
    pg, pa, pv = parent
    add_to_resolve(pg, pa, pv, "pom")

for ig, ia, iv, it in get_imports(root, custom_ns):
    add_to_resolve(ig, ia, iv, it)

for dep in get_dependencies(root, custom_ns):
    if dep.get("scope") in ("test", "system"):
        continue
    dg = dep["groupId"]
    da = dep["artifactId"]
    dv = dep["version"]
    dt = dep.get("type", "jar")
    if dv:
        add_to_resolve(dg, da, dv, dt)

print(f"Initial artifacts to resolve: {len(to_resolve)}")

iteration = 0
while to_resolve:
    iteration += 1
    batch = to_resolve[:]
    to_resolve = []
    
    print(f"\n=== Resolution iteration {iteration}: {len(batch)} artifacts ===")
    
    for g, a, v, t in batch:
        print(f"  Resolving: {g}:{a}:{t}:{v}")
        download_artifact(g, a, v, t)
        if t in ("pom", "jar"):
            resolve_pom(g, a, v)
    
    if not to_resolve:
        break

print(f"\n=== Total artifacts resolved: {len(resolved)} ===")

print("\n=== Phase 2: Also resolve Maven plugin dependencies ===")
plugin_poms = [
    ("org.apache.maven.plugins", "maven-resources-plugin", "3.3.1", "pom"),
    ("org.apache.maven.plugins", "maven-compiler-plugin", "3.13.0", "pom"),
    ("org.apache.maven.plugins", "maven-surefire-plugin", "3.5.2", "pom"),
    ("org.apache.maven.plugins", "maven-jar-plugin", "3.4.2", "pom"),
    ("org.springframework.boot", "spring-boot-maven-plugin", "3.4.4", "pom"),
]

for g, a, v, t in plugin_poms:
    add_to_resolve(g, a, v, t)

while to_resolve:
    batch = to_resolve[:]
    to_resolve = []
    
    print(f"\n=== Plugin resolution: {len(batch)} artifacts ===")
    
    for g, a, v, t in batch:
        print(f"  Resolving: {g}:{a}:{t}:{v}")
        download_artifact(g, a, v, t)
        if t in ("pom", "jar"):
            resolve_pom(g, a, v)
    
    if not to_resolve:
        break

print(f"\n=== Total artifacts resolved: {len(resolved)} ===")

print("\n=== Phase 3: Try Maven compile ===")
result = subprocess.run(
    ["mvn", "compile", "-o", "-DskipTests"],
    cwd=PROJECT_DIR,
    capture_output=True,
    text=True
)
print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
print(result.stderr[-1000:] if result.stderr else "")

if result.returncode != 0:
    print("\n=== Phase 4: Parse Maven debug output for remaining missing artifacts ===")
    result2 = subprocess.run(
        ["mvn", "compile", "-o", "-DskipTests", "-X"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    
    full_output = result2.stdout + "\n" + result2.stderr
    
    missing = set(re.findall(
        r'([a-zA-Z][a-zA-Z0-9_.-]+:[a-zA-Z][a-zA-Z0-9_.-]+:(?:pom|jar|war):[0-9][a-zA-Z0-9_.-]*)',
        full_output
    ))
    missing -= {k for k in missing if k.startswith("com.game:spot-the-difference-server")}
    
    if missing:
        print(f"Found {len(missing)} additional missing artifacts from debug output")
        for m in sorted(missing):
            parts = m.split(":")
            if len(parts) == 4:
                g, a, t, v = parts
                print(f"  Missing: {m}")
                download_artifact(g, a, v, t)
                if t in ("pom", "jar"):
                    resolve_pom(g, a, v)
        
        while to_resolve:
            batch = to_resolve[:]
            to_resolve = []
            for g, a, v, t in batch:
                print(f"  Resolving: {g}:{a}:{t}:{v}")
                download_artifact(g, a, v, t)
                if t in ("pom", "jar"):
                    resolve_pom(g, a, v)
            if not to_resolve:
                break
    
    print(f"\n=== Total artifacts resolved: {len(resolved)} ===")
    
    print("\n=== Phase 5: Final compile attempt ===")
    result3 = subprocess.run(
        ["mvn", "compile", "-o", "-DskipTests"],
        cwd=PROJECT_DIR,
        capture_output=True,
        text=True
    )
    print(result3.stdout[-2000:] if len(result3.stdout) > 2000 else result3.stdout)
    print(result3.stderr[-1000:] if result3.stderr else "")
    
    if result3.returncode != 0:
        print("\n=== Phase 6: Second round of debug parsing ===")
        result4 = subprocess.run(
            ["mvn", "compile", "-o", "-DskipTests", "-X"],
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True
        )
        full_output2 = result4.stdout + "\n" + result4.stderr
        missing2 = set(re.findall(
            r'([a-zA-Z][a-zA-Z0-9_.-]+:[a-zA-Z][a-zA-Z0-9_.-]+:(?:pom|jar|war):[0-9][a-zA-Z0-9_.-]*)',
            full_output2
        ))
        missing2 -= {k for k in missing2 if k.startswith("com.game:spot-the-difference-server")}
        
        if missing2:
            print(f"Found {len(missing2)} more missing artifacts")
            for m in sorted(missing2):
                parts = m.split(":")
                if len(parts) == 4:
                    g, a, t, v = parts
                    print(f"  Missing: {m}")
                    download_artifact(g, a, v, t)
                    if t in ("pom", "jar"):
                        resolve_pom(g, a, v)
            
            while to_resolve:
                batch = to_resolve[:]
                to_resolve = []
                for g, a, v, t in batch:
                    download_artifact(g, a, v, t)
                    if t in ("pom", "jar"):
                        resolve_pom(g, a, v)
                if not to_resolve:
                    break
        
        print(f"\n=== Total artifacts resolved: {len(resolved)} ===")
        
        print("\n=== Phase 7: Final final compile attempt ===")
        result5 = subprocess.run(
            ["mvn", "compile", "-o", "-DskipTests"],
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True
        )
        out = result5.stdout
        print(out[-3000:] if len(out) > 3000 else out)
