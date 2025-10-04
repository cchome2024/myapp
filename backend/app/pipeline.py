import time
from pathlib import Path
from typing import Dict, Any
from .storage import write_json, read_json, project_dir, state_path

STEPS = ["parsing","indexing","summary","quiz","images","ppt","publish"]

def _update_state(project_id: str, **kv):
    st = read_json(state_path(project_id)) or {}
    st.update(kv)
    write_json(state_path(project_id), st)

def _do_step(project_id: str, step: str, config: Dict[str, Any]):
    base = project_dir(project_id)
    time.sleep(1)  # 模拟耗时
    if step == "parsing":
        write_json(base / "parsed.json", {"text": "解析结果占位"})
    elif step == "indexing":
        write_json(base / "index.json", {"ok": True})
    elif step == "summary":
        write_json(base / "summary.json", {"text": "摘要占位"})
    elif step == "quiz":
        write_json(base / "quiz.json", {"questions": []})
    elif step == "images":
        write_json(base / "images.json", {"items": []})
    elif step == "ppt":
        write_json(base / "slides.json", {"slides": []})
    elif step == "publish":
        write_json(base / "publish" / "xiaohongshu" / "manifest.json", {
            "title":"示例标题","content":"示例文案 #话题","images":[]
        })

def run_pipeline(project_id: str, config: Dict[str, Any]):
    st = read_json(state_path(project_id)) or {"step":"parsing","percent":0,"status":"running","history":[]}
    write_json(state_path(project_id), st)

    steps = [s for s in STEPS]
    if not config.get("autoImages", False):
        steps = [s for s in steps if s != "images"]
    if not config.get("generatePPT", False):
        steps = [s for s in steps if s != "ppt"]

    for i, step in enumerate(steps, start=1):
        _update_state(project_id, step=step, status="running")
        try:
            _do_step(project_id, step, config)
            st = read_json(state_path(project_id)) or {}
            hist = st.get("history", [])
            hist.append({"step": step, "ok": True, "at": int(time.time())})
            percent = int(i/len(steps)*100)
            _update_state(project_id, percent=percent, history=hist)
        except Exception as e:
            st = read_json(state_path(project_id)) or {}
            hist = st.get("history", [])
            hist.append({"step": step, "ok": False, "at": int(time.time()), "error": str(e)})
            _update_state(project_id, status="error", lastError=str(e), history=hist)
            return

    _update_state(project_id, step="complete", percent=100, status="complete")
