import ELK, { ElkExtendedEdge, ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Edge, Node } from 'reactflow'

const elk = new ELK()

export async function layoutWithElk(nodes: Node[], edges: Edge[]) {
  const elkNodes: ElkNode[] = nodes.map((n) => ({
    id: n.id,
    width: Math.max(160, (n as any).measured?.width ?? 160),
    height: Math.max(60,  (n as any).measured?.height ?? 60)
  }))

  const elkEdges: ElkExtendedEdge[] = edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '48',
      'elk.layered.spacing.nodeNodeBetweenLayers': '64',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.nodePlacement.favorStraightEdges': 'true',
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true'
    },
    children: elkNodes,
    edges: elkEdges
  }

  const res = await elk.layout(graph)
  const positions: Record<string, { x: number; y: number }> = {}
  res.children?.forEach((c: any) => { positions[c.id] = { x: c.x ?? 0, y: c.y ?? 0 } })
  return nodes.map((n) => ({ ...n, position: positions[n.id] ?? (n as any).position }))
}
