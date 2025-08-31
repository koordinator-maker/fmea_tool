import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  MarkerType,
  ConnectionMode,
  OnSelectionChangeParams,
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import { nanoid } from 'nanoid'
import { nodeTypes } from './NodeTypes'
import type { AppNodeData } from '../types'

type Props = {
  nodes: Node<AppNodeData>[]
  edges: Edge[]
  onNodesChange: any
  onEdgesChange: any
  onConnect: (conn: Connection) => void
  onSelection: (n: Node<AppNodeData> | null) => void
  onSelectionNodes: (arr: Node<AppNodeData>[]) => void
  onEdgeSelect: (e: Edge | null) => void
  onAddNode: (n: Node<AppNodeData>) => void
  onLayout: () => void
  showMinimap: boolean
  showGrid: boolean
  gridGap: number
  onNodeClickHard: (n: Node<AppNodeData>) => void
  onEdgeClickHard: (e: Edge) => void
  onPaneClickHard: () => void
}

const FlowEditor = (props: Props) => {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    onSelection, onSelectionNodes, onEdgeSelect, onAddNode, onLayout,
    showMinimap, showGrid, gridGap,
    onNodeClickHard, onEdgeClickHard, onPaneClickHard
  } = props

  const wrapperRef = useRef<HTMLDivElement>(null)
  const rf = useReactFlow()

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const payload = event.dataTransfer.getData('application/reactflow') || ''
    if (!payload) return

    const bounds = wrapperRef.current!.getBoundingClientRect()
    const client = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
    const position = rf.project(client)

    // Payload örnekleri: 'process', 'shape:square', 'shape:circle', 'icon:warehouse' ...
    let type = 'processNode' as Node<AppNodeData>['type']
    let data: any = {}
    if (payload === 'process') {
      type = 'processNode'
      data = { opNo: nanoid().slice(0,4).toUpperCase(), name: 'Yeni Proses', station: 'İstasyon', special: 'None' }
    } else if (payload.startsWith('shape:')) {
      type = 'shapeNode'
      const shape = payload.split(':')[1]
      data = { shape, label: shape.toUpperCase(), borderRadius: 12, shadow: 1, color: '#4b5563' }
    } else if (payload.startsWith('icon:')) {
      type = 'iconNode'
      const icon = payload.split(':')[1]
      data = { icon, label: icon, color: '#374151', shadow: 1 }
    } else {
      // Güvenli varsayılan: proses
      type = 'processNode'
      data = { opNo: nanoid().slice(0,4).toUpperCase(), name: 'Yeni Proses', station: 'İstasyon', special: 'None' }
    }

    const id = nanoid()
    const newNode: Node<AppNodeData> = {
      id,
      type,
      position,
      data,
      // App.tsx tarafında sourcePosition/targetPosition normalize ediliyor; yine de ilk izlenim için ekleyelim:
      sourcePosition: rf.getNodes().length % 2 === 0 ? 'right' : 'right',
      targetPosition: 'left',
    }
    onAddNode(newNode)
  }, [rf, onAddNode])

  const handleSelectionChange = useCallback((p: OnSelectionChangeParams) => {
    const node = (p.nodes?.[0] as Node<AppNodeData>) ?? null
    const edge = (p.edges?.[0] as Edge) ?? null
    // Çoklu seçim listesi:
    onSelectionNodes((p.nodes as Node<AppNodeData>[]) || [])
    // Tekil odak:
    if (edge) {
      onEdgeSelect(edge)
      onSelection(null)
    } else {
      onEdgeSelect(null)
      onSelection(node)
    }
  }, [onSelection, onSelectionNodes, onEdgeSelect])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={handleSelectionChange}
        onNodeClick={(_, n) => onNodeClickHard(n as Node<AppNodeData>)}
        onEdgeClick={(_, e) => onEdgeClickHard(e)}
        onPaneClick={() => onPaneClickHard()}
        fitView
        snapToGrid
        snapGrid={[gridGap, gridGap]}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        edgesFocusable
        nodesFocusable
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#111827', width: 14, height: 14 },
          style: { stroke: '#111827', strokeWidth: 2 }
        }}
      >
        {showMinimap && <MiniMap pannable zoomable />}
        <Controls position="top-left" />
        {showGrid && <Background variant="lines" gap={gridGap} size={1} />}
      </ReactFlow>

      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={onLayout}>Otomatik Yerleşim</button>
      </div>
    </div>
  )
}

export default FlowEditor
