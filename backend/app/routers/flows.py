from fastapi import APIRouter, Body, HTTPException
from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "flows"
DATA_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter()

def _file(flow_id: str) -> Path:
  return DATA_DIR / f"{flow_id}.json"

@router.get("/flows/{flow_id}")
def read_flow(flow_id: str):
  p = _file(flow_id)
  if p.exists():
    try:
      return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
      return {"nodes": [], "edges": []}
  return {"nodes": [], "edges": []}

@router.post("/flows/{flow_id}/save")
def save_flow(flow_id: str, payload: dict = Body(...)):
  if not isinstance(payload, dict) or "nodes" not in payload or "edges" not in payload:
    raise HTTPException(status_code=422, detail="Payload {nodes, edges} içermeli.")
  p = _file(flow_id)
  p.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
  return {"ok": True, "file": str(p)}
