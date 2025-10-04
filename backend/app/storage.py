import json
from pathlib import Path
from typing import Any, Optional

ROOT = (Path(__file__).resolve().parents[1] / "data").resolve()
ROOT.mkdir(parents=True, exist_ok=True)

def pjoin(*parts) -> Path:
    p = ROOT.joinpath(*parts).resolve()
    if not str(p).startswith(str(ROOT)):
        raise ValueError("Invalid path")
    return p

def read_json(path: Path) -> Optional[Any]:
    if not path.exists(): return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    tmp.replace(path)

def project_dir(project_id: str) -> Path:
    return pjoin("projects", project_id)

def state_path(project_id: str) -> Path:
    return project_dir(project_id) / "state.json"

def config_path(project_id: str) -> Path:
    return project_dir(project_id) / "config.json"
