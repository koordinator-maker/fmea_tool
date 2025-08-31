# Basit bellek içi depo (MVP)
from typing import Dict
from .models import FlowState


_db: Dict[str, FlowState] = {}


def save_flow(flow_id: str, data: FlowState):
_db[flow_id] = data


def get_flow(flow_id: str):
return _db.get(flow_id)