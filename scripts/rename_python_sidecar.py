import sys
import os
import subprocess
import re
import shutil
from pathlib import Path

def get_rustc_host() -> str:
    try:
        out = subprocess.check_output(['rustc', '-vV'], stderr=subprocess.STDOUT)
        text = out.decode('utf-8', errors='replace')
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f'Failed to run rustc: {e}', file=sys.stderr)
        sys.exit(1)

    m = re.search(r'host:\s+(\S+)', text)
    if not m:
        print('Failed to determine platform target triple', file=sys.stderr)
        sys.exit(1)
    target = m.group(1)
    return target

def main():
    ext = '.exe' if os.name == 'nt' else ''

    # find --target arg
    target = None
    if '--target' in sys.argv:
        idx = sys.argv.index('--target')
        if idx + 1 < len(sys.argv):
            target = sys.argv[idx + 1]

    # if not specified, get host from rustc -vV output
    if not target:
        target = get_rustc_host()

    # move executable file
    dest_executable = Path(f"src-tauri/bin/server-{target}{ext}")
    dest_executable_parent = dest_executable.parent
    dest_executable_parent.mkdir(parents=True, exist_ok=True)

    src_executable = Path(f"src-server/dist/main/main{ext}")
    if not src_executable.exists():
        print(f"Source file not found: {src_executable}", file=sys.stderr)
        sys.exit(1)

    try:
        shutil.move(str(src_executable), str(dest_executable))
    except Exception as e:
        print(f"Failed to move {src_executable} -> {dest_executable}: {e}", file=sys.stderr)
        sys.exit(1)
    
    # move dependency files
    dest_dependency_dir = Path(f"src-tauri/_internal/")
    src_dependency_dir = Path(f"src-server/dist/main/_internal/")
    if not src_dependency_dir.exists():
        print(f"Source directory not found: {src_dependency_dir}", file=sys.stderr)
        sys.exit(1)
        
    try:
        shutil.move(str(src_dependency_dir), str(dest_dependency_dir))
    except Exception as e:
        print(f"Failed to move {src_dependency_dir} -> {dest_dependency_dir}: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
