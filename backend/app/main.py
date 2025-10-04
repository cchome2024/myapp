from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from .models import GenerationConfig, State
from .storage import write_json, read_json, project_dir, state_path, config_path, pjoin, ROOT
from .pipeline import run_pipeline
import json
import os
from pathlib import Path

app = FastAPI(title="V0 Backend")

# 获取允许的源域名
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health(): return {"ok": True}

@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)

@app.post("/projects/{project_id}/start")
def start(project_id: str, cfg: GenerationConfig, bg: BackgroundTasks):
    write_json(state_path(project_id), State(step="parsing", status="running").model_dump())
    write_json(config_path(project_id), cfg.model_dump())
    bg.add_task(run_pipeline, project_id, cfg.model_dump())
    return {"ok": True}

@app.get("/projects/{project_id}/status")
def status(project_id: str):
    st = read_json(state_path(project_id))
    return st or {"status": "idle", "step": "parsing", "percent": 0}

@app.post("/projects/{project_id}/upload")
def upload(project_id: str, file: UploadFile = File(...)):
    proj = project_dir(project_id)
    updir = proj / "uploads"
    updir.mkdir(parents=True, exist_ok=True)
    dest = updir / file.filename
    with dest.open("wb") as f:
        f.write(file.file.read())
    return {"ok": True, "filename": file.filename, "path": str(dest)}

@app.get("/projects/{project_id}/files/{path:path}")
def get_file(project_id: str, path: str):
    fp = project_dir(project_id) / path
    if not str(fp.resolve()).startswith(str(project_dir(project_id).resolve())):
        raise HTTPException(403, "forbidden")
    if not fp.exists():
        raise HTTPException(404, "not found")
    return FileResponse(fp)

# Projects API endpoint
@app.get("/api/projects")
def get_projects():
    """Get all projects list"""
    try:
        projects_file = pjoin("projects.json")
        print(f"DEBUG: Looking for projects.json at: {projects_file}")
        print(f"DEBUG: File exists: {projects_file.exists()}")
        print(f"DEBUG: DATA_ROOT: {os.getenv('DATA_ROOT', 'data')}")
        print(f"DEBUG: ROOT path: {ROOT}")
        
        if not projects_file.exists():
            return {"success": True, "data": [], "debug": f"projects.json not found at {projects_file}"}
        
        with projects_file.open("r", encoding="utf-8") as f:
            project_ids = json.load(f)
        
        print(f"DEBUG: Found {len(project_ids)} project IDs")
        
        projects = []
        for item in project_ids:
            project_id = item["id"]
            meta_file = project_dir(project_id) / "meta.json"
            print(f"DEBUG: Checking meta.json for {project_id} at: {meta_file}")
            if meta_file.exists():
                with meta_file.open("r", encoding="utf-8") as f:
                    meta = json.load(f)
                    projects.append(meta)
                    print(f"DEBUG: Added project {project_id}")
            else:
                print(f"DEBUG: meta.json not found for {project_id}")
        
        return {"success": True, "data": projects, "debug": f"Found {len(projects)} projects"}
    except Exception as e:
        print(f"DEBUG: Exception in get_projects: {str(e)}")
        return {"success": False, "error": str(e)}

@app.put("/api/projects/{project_id}")
def update_project(project_id: str, data: dict):
    """Update project metadata"""
    try:
        # Create project directory if not exists
        proj_dir = project_dir(project_id)
        proj_dir.mkdir(parents=True, exist_ok=True)
        
        # Update meta.json
        meta_file = proj_dir / "meta.json"
        meta = {
            "id": project_id,
            "name": data.get("name", "新项目"),
            "date": data.get("lastModified", ""),
            "status": data.get("status", "draft"),
            "createdAt": data.get("lastModified", ""),
            "updatedAt": data.get("lastModified", ""),
            "description": "",
            "tags": []
        }
        
        # If meta.json exists, merge with existing data
        if meta_file.exists():
            with meta_file.open("r", encoding="utf-8") as f:
                existing_meta = json.load(f)
                meta.update(existing_meta)
                meta["name"] = data.get("name", meta.get("name", "新项目"))
                meta["status"] = data.get("status", meta.get("status", "draft"))
                meta["updatedAt"] = data.get("lastModified", meta.get("updatedAt", ""))
        
        write_json(meta_file, meta)
        
        # Update projects.json
        projects_file = pjoin("projects.json")
        project_ids = []
        if projects_file.exists():
            with projects_file.open("r", encoding="utf-8") as f:
                project_ids = json.load(f)
        
        # Add project if not exists
        if not any(p["id"] == project_id for p in project_ids):
            project_ids.append({"id": project_id})
            write_json(projects_file, project_ids)
        
        return {"success": True, "data": meta}
    except Exception as e:
        return {"success": False, "error": str(e)}
