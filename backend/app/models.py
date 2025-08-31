from pydantic import BaseModel
from typing import List, Optional, Literal


class ProcessNodeData(BaseModel):
opNo: str
name: str
station: Optional[str] = None
special: Optional[Literal['SC','CC','None']] = 'None'


class Node(BaseModel):
id: str
type: str
position: dict
data: ProcessNodeData


class Edge(BaseModel):
id: str
source: str
target: str
label: Optional[str] = None
type: Optional[str] = None


class FlowState(BaseModel):
nodes: List[Node]
edges: List[Edge]