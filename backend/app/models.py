from pydantic import BaseModel
from typing import Literal, Optional, List, Dict, Any

Stage = Literal['parsing','indexing','summary','quiz','images','ppt','publish','complete','error','idle','running']

class GenerationConfig(BaseModel):
    webSearchEnabled: bool = False
    generatePPT: bool = False
    autoImages: bool = False
    imageStyle: Literal["academic","flat","realistic","wireframe"] = "flat"
    language: Literal["zh","en"] = "zh"
    summaryLevel: Literal["chapter","global","both"] = "global"
    quizCount: int = 10

class State(BaseModel):
    step: str = "parsing"
    percent: int = 0
    status: Literal["idle","running","complete","error"] = "idle"
    lastError: Optional[str] = None
    lock: Optional[Dict[str, Any]] = None
    history: List[Dict[str, Any]] = []
