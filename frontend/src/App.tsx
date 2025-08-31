import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlowProvider,
  MarkerType,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Position,
  type Edge, type Node, type Connection, type EdgeChange, type NodeChange
} from 'reactflow'
import Sidebar from './components/Sidebar'
import FlowEditor from './components/FlowEditor'
import type { FlowState, AppNodeData, ProcessNodeData, Meta } from './types'
import { loadFlow, saveFlow } from './api'
import { nanoid } from 'nanoid'
import { layoutWithElk } from './lib/elkLayout'
import { toPng, toSvg } from 'html-to-image'
import './styles.css'

export default function App() {
  const [flowId, setFlowId] = useState('demo')
  const [loaded, setLoaded] = useState(false)

  const [nodes, setNodes] = useState<Node<AppNodeData>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedId) ?? null, [nodes, selectedId])
  const selectedEdge = useMemo(() => edges.find(e => e.id === selectedEdgeId) ?? null, [edges, selectedEdgeId])

  const centerRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [gridGap, setGridGap] = useState(15)
  const [exportScale, setExportScale] = useState(4)

  const [meta, setMeta] = useState<Meta>({
    formTitle: 'İŞ AKIŞ ŞEMASI',
    partNo: '',
    formNo: '',
    docNo: '',
    publishDate: '',
    revDate: '',
    revNo: '',
    showForm: true
  })

  // Normalize
  const ensureNodePositions = (n: Node<AppNodeData>): Node<AppNodeData> => ({
    ...n,
    sourcePosition: Position.Right,
    targetPosition: Position.Left
  })
  const ensureEdgeMarkers = (e: Edge): Edge => ({
    type: 'smoothstep',
    ...e,
    style: { ...(e.style||{}), stroke: (e.style as any)?.stroke || '#111827', strokeWidth: (e.style as any)?.strokeWidth || 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: (e.markerEnd as any)?.color || (e.style as any)?.stroke || '#111827', width: 14, height: 14 }
  })

  useEffect(() => {
    if (loaded) return
    loadFlow(flowId).then((data) => {
      if (data) {
        const nds = ((data.nodes as any) ?? []).map(ensureNodePositions)
        const eds = ((data.edges as any) ?? []).map(ensureEdgeMarkers)
        setNodes(nds)
        setEdges(eds)
        if (data.meta) setMeta(data.meta)
      } else {
        setNodes([]); setEdges([])
      }
      setLoaded(true)
    })
  }, [flowId, loaded])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds).map(ensureEdgeMarkers))
  }, [])

  const onConnect = useCallback((conn: Connection) => {
    const color = '#111827'
    setEdges((eds) => addEdge({
      ...conn,
      id: nanoid(),
      type: 'smoothstep',
      style: { stroke: color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 }
    }, eds))
  }, [])

  // Seçim/klik
  const onSelection = useCallback((n: Node<AppNodeData> | null) => { setSelectedId(n?.id ?? null); setSelectedEdgeId(null) }, [])
  const onSelectionNodes = useCallback((arr: Node<AppNodeData>[]) => { setSelectedIds(arr.map(a => a.id)) }, [])
  const onEdgeSelect = useCallback((e: Edge | null) => { setSelectedEdgeId(e?.id ?? null); setSelectedId(null); setSelectedIds([]) }, [])
  const onNodeClickHard = useCallback((n: Node<AppNodeData>) => { setSelectedId(n.id); setSelectedEdgeId(null); setSelectedIds([n.id]) }, [])
  const onEdgeClickHard = useCallback((e: Edge) => { setSelectedEdgeId(e.id); setSelectedId(null); setSelectedIds([]) }, [])
  const onPaneClickHard = useCallback(() => { setSelectedId(null); setSelectedEdgeId(null); setSelectedIds([]) }, [])

  const onAddNode = useCallback((n: Node<AppNodeData>) => { setNodes((nds) => nds.concat(ensureNodePositions(n))) }, [])
  const onLayout = useCallback(async () => { const laid = await layoutWithElk(nodes, edges); setNodes(laid.map(ensureNodePositions)) }, [nodes, edges])

  const updateSelectedNode = (patch: Partial<any>) => {
    if (!selectedNode) return
    setNodes((nds) => nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, ...patch } } : n)))
  }
  const updateSelectedEdge = (patch: Partial<Edge>) => {
    if (!selectedEdge) return
    setEdges((eds) => eds.map((e) => (e.id === selectedEdge.id ? ensureEdgeMarkers({ ...e, ...patch }) : e)))
  }

  const onSave = async () => {
    const snapshot: FlowState = { nodes: nodes as any, edges, meta }
    await saveFlow(flowId, snapshot)
    alert(`Kaydedildi: backend/data/flows/${flowId}.json`)
  }
  const onLoad = async () => setLoaded(false)

  const isProcess = (d: any): d is ProcessNodeData => d && typeof d === 'object' && 'opNo' in d

  // Export (merkez kapsayıcıyı alıyoruz ki üstteki form şablonu da dahile olsun)
  const exportPNG = async () => {
    const host = centerRef.current as HTMLElement
    if (!host) return
    const dataUrl = await toPng(host, { backgroundColor: '#ffffff', pixelRatio: exportScale, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `flow-${flowId}@${exportScale}x.png`
    a.click()
  }
  const exportSVG = async () => {
    const host = centerRef.current as HTMLElement
    if (!host) return
    const svg = await toSvg(host, { backgroundColor: '#ffffff', cacheBust: true })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flow-${flowId}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Kısayollar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (e.key === 'Delete') {
        if (selectedEdgeId) setEdges((eds) => eds.filter(e => e.id !== selectedEdgeId))
        else if (selectedIds.length) {
          setNodes((nds) => nds.filter(n => !selectedIds.includes(n.id)))
          setEdges((eds) => eds.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)))
        }
      } else if (ctrl && e.key.toLowerCase() === 'd') {
        setNodes((nds) => nds.concat(
          nds.filter(n => selectedIds.includes(n.id)).map(n => ({
            ...ensureNodePositions(n),
            id: nanoid(),
            position: { x: n.position.x + 24, y: n.position.y + 24 }
          }))
        ))
      } else if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); onSave() }
        else if (ctrl && e.key.toLowerCase() === 'l') { e.preventDefault(); onLoad() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIds, selectedEdgeId, onSave])

  const align = (mode: 'left'|'top'|'hcenter'|'vcenter') => {
    if (!selectedIds.length) return
    const sel = nodes.filter(n => selectedIds.includes(n.id) && n.width && n.height)
    if (sel.length < 2) return
    const minX = Math.min(...sel.map(n => n.position.x))
    const minY = Math.min(...sel.map(n => n.position.y))
    const maxX = Math.max(...sel.map(n => (n.position.x + (n.width || 0))))
    const maxY = Math.max(...sel.map(n => (n.position.y + (n.height || 0))))
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2
    setNodes(nds => nds.map(n => {
      if (!selectedIds.includes(n.id)) return n
      if (mode === 'left')   return { ...n, position: { x: minX, y: n.position.y } }
      if (mode === 'top')    return { ...n, position: { x: n.position.x, y: minY } }
      if (mode === 'hcenter' && n.width)  return { ...n, position: { x: midX - n.width/2,  y: n.position.y } }
      if (mode === 'vcenter' && n.height) return { ...n, position: { x: n.position.x,      y: midY - n.height/2 } }
      return n
    }))
  }

  const bringToFront = () => setNodes(nds => nds.map(n => selectedIds.includes(n.id) ? { ...n, zIndex: (n as any).zIndex ? (n as any).zIndex + 1 : 1 } : n))
  const sendToBack  = () => setNodes(nds => nds.map(n => selectedIds.includes(n.id) ? { ...n, zIndex: (n as any).zIndex ? (n as any).zIndex - 1 : -1 } : n))
  const toggleLock  = () => {
    if (!selectedNode) return
    setNodes(nds => nds.map(n => (n.id === selectedNode.id ? {
      ...n,
      draggable: !( (n.data as any).locked ?? false ),
      data: { ...n.data, locked: !((n.data as any).locked ?? false) }
    } : n)))
  }

  return (
    <div className={`app-shell${preview ? ' preview' : ''}`}>
      <div className="toolbar">
        <strong>PFMEA Flow</strong>
        <input style={{ marginLeft: 12 }} value={flowId} onChange={(e) => setFlowId(e.target.value)} />
        <button className="btn" onClick={onLoad} title="Ctrl+L">Yükle</button>
        <button className="btn" onClick={onSave} title="Ctrl+S">Kaydet</button>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:16 }}>
          <span className="hint">Grid</span>
          <label className="switch">
            <input type="checkbox" checked={showGrid} onChange={(e)=>setShowGrid(e.target.checked)} />
            <span />
          </label>
          <input type="range" min={8} max={40} value={gridGap} onChange={(e)=>setGridGap(parseInt(e.target.value))} />
          <span className="hint">Minimap</span>
          <label className="switch">
            <input type="checkbox" checked={showMinimap} onChange={(e)=>setShowMinimap(e.target.checked)} />
            <span />
          </label>
          <label className="switch" title="Form şablonu göster">
            <input type="checkbox" checked={meta.showForm} onChange={(e)=>setMeta(m=>({...m, showForm: e.target.checked}))} />
            <span />
          </label>
          <span className="hint">Form</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:16 }}>
          <button className="btn" onClick={() => setPreview(p => !p)}>{preview ? 'Önizlemeden Çık' : 'Önizleme'}</button>
          <span className="hint">PNG ölçek</span>
          <select value={exportScale} onChange={(e)=>setExportScale(parseInt(e.target.value))}>
            {[1,2,3,4,5].map(s => <option key={s} value={s}>{s}x</option>)}
          </select>
          <button className="btn" onClick={exportPNG}>PNG</button>
          <button className="btn" onClick={exportSVG}>SVG</button>
        </div>
      </div>

      <div className="left"><Sidebar /></div>

      <div className="center" ref={centerRef}>
        {/* ŞABLON BAŞLIK OVERLAY */}
        {meta.showForm && (
          <div className="form-overlay">
            <div className="form-row title">{meta.formTitle || 'İŞ AKIŞ ŞEMASI'}</div>
            <div className="form-row">
              <div><strong>Parça No:</strong> {meta.partNo || '—'}</div>
              <div><strong>İş Akış Form No:</strong> {meta.formNo || '—'}</div>
              <div><strong>Doküman No:</strong> {meta.docNo || '—'}</div>
            </div>
            <div className="form-row">
              <div><strong>Yayın Tarihi:</strong> {meta.publishDate || '—'}</div>
              <div><strong>Revizyon Tarihi:</strong> {meta.revDate || '—'}</div>
              <div><strong>Revizyon No:</strong> {meta.revNo || '—'}</div>
            </div>
          </div>
        )}

        <ReactFlowProvider>
          <FlowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelection={onSelection}
            onSelectionNodes={onSelectionNodes}
            onEdgeSelect={onEdgeSelect}
            onAddNode={onAddNode}
            onLayout={onLayout}
            showMinimap={showMinimap}
            showGrid={showGrid}
            gridGap={gridGap}
            onNodeClickHard={onNodeClickHard}
            onEdgeClickHard={onEdgeClickHard}
            onPaneClickHard={onPaneClickHard}
          />
        </ReactFlowProvider>

        {selectedIds.length >= 2 && (
          <div className="floating-tools">
            <button className="btn" onClick={()=>align('left')}>Sol Hizala</button>
            <button className="btn" onClick={()=>align('top')}>Üst Hizala</button>
            <button className="btn" onClick={()=>align('hcenter')}>Yatay Merkez</button>
            <button className="btn" onClick={()=>align('vcenter')}>Dikey Merkez</button>
          </div>
        )}
      </div>

      <div className="right">
        <h3>Özellikler</h3>

        {selectedEdge ? (
          <div className="prop-grid">
            <label>Kenar Etiketi</label>
            <input value={selectedEdge.label as any ?? ''} onChange={(e) => updateSelectedEdge({ label: e.target.value })} />

            <label>Tip</label>
            <select value={selectedEdge.type ?? 'smoothstep'} onChange={(e)=>updateSelectedEdge({ type: e.target.value as any })}>
              <option value="smoothstep">Smooth</option>
              <option value="step">Step</option>
              <option value="straight">Straight</option>
              <option value="bezier">Bezier</option>
            </select>

            <label>Renk</label>
            <input type="color"
              value={(selectedEdge.style as any)?.stroke ?? '#111827'}
              onChange={(e) => {
                const color = e.target.value
                updateSelectedEdge({
                  style: { ...(selectedEdge.style||{}), stroke: color },
                  markerEnd: { ...(selectedEdge.markerEnd||{}), color }
                })
              }}
            />

            <label>Kalınlık</label>
            <input type="range" min={1} max={6}
              value={(selectedEdge.style as any)?.strokeWidth ?? 2}
              onChange={(e)=>updateSelectedEdge({ style: { ...(selectedEdge.style||{}), strokeWidth: parseInt(e.target.value) } })} />

            <label>Kesikli Çizgi</label>
            <select value={(selectedEdge.style as any)?.strokeDasharray ?? 'none'}
              onChange={(e)=>updateSelectedEdge({ style: { ...(selectedEdge.style||{}), strokeDasharray: e.target.value==='none'? undefined : '6 4' } })}>
              <option value="none">Kapalı</option>
              <option value="dash">Açık</option>
            </select>

            <label>Ok Ucu</label>
            <select value={(selectedEdge.markerEnd as any)?.type ?? 'ArrowClosed'}
              onChange={(e) => updateSelectedEdge({ markerEnd: { ...(selectedEdge.markerEnd||{}), type: (e.target.value as any) } })}>
              <option value="ArrowClosed">Dolu Ok</option>
              <option value="Arrow">Boş Ok</option>
            </select>

            <label>Ok Boyutu</label>
            <input type="range" min={8} max={24}
              value={(selectedEdge.markerEnd as any)?.width ?? 14}
              onChange={(e) => {
                const s = parseInt(e.target.value)
                updateSelectedEdge({ markerEnd: { ...(selectedEdge.markerEnd||{}), width: s, height: s } })
              }} />
          </div>
        ) : selectedNode ? (
          isProcess(selectedNode.data) ? (
            <div className="prop-grid">
              <label>Operasyon No</label>
              <input value={selectedNode.data.opNo} onChange={(e) => updateSelectedNode({ opNo: e.target.value })} />

              <label>Ad</label>
              <input value={selectedNode.data.name} onChange={(e) => updateSelectedNode({ name: e.target.value })} />

              <label>İstasyon</label>
              <input value={selectedNode.data.station ?? ''} onChange={(e) => updateSelectedNode({ station: e.target.value })} />

              <label>Özel Karakteristik</label>
              <select value={selectedNode.data.special ?? 'None'} onChange={(e) => updateSelectedNode({ special: e.target.value as any })}>
                <option value="None">—</option>
                <option value="SC">SC</option>
                <option value="CC">CC</option>
              </select>

              <label>Köşe Yuvarlaklığı</label>
              <input type="range" min={0} max={24} value={selectedNode.data.borderRadius ?? 14}
                onChange={(e)=>updateSelectedNode({ borderRadius: parseInt(e.target.value) })} />

              <label>Gölge</label>
              <select value={selectedNode.data.shadow ?? 1} onChange={(e)=>updateSelectedNode({ shadow: parseInt(e.target.value) as any })}>
                <option value={0}>Yok</option>
                <option value={1}>Hafif</option>
                <option value={2}>Orta</option>
                <option value={3}>Derin</option>
              </select>

              <label>Kilitle</label>
              <button className="btn" onClick={toggleLock}>{(selectedNode.data as any).locked ? 'Kilidi Aç' : 'Kilitle'}</button>

              <label>Katman</label>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn" onClick={bringToFront}>Öne</button>
                <button className="btn" onClick={sendToBack}>Arkaya</button>
              </div>
            </div>
          ) : (
            <div className="prop-grid">
              <label>Metin/Etiket</label>
              <input value={(selectedNode.data as any).label ?? (selectedNode.data as any).text ?? ''} onChange={(e) => {
                if ('text' in (selectedNode.data as any)) setNodes(nds => nds.map(n => n.id === selectedNode.id ? { ...n, data: { ...(n.data as any), text: e.target.value } } : n))
                else updateSelectedNode({ label: e.target.value })
              }} />

              <label>Renk</label>
              <input type="color" value={(selectedNode.data as any).color ?? '#4b5563'} onChange={(e) => updateSelectedNode({ color: e.target.value })} />

              <label>Köşe Yuvarlaklığı</label>
              <input type="range" min={0} max={24} value={(selectedNode.data as any).borderRadius ?? 12}
                onChange={(e)=>updateSelectedNode({ borderRadius: parseInt(e.target.value) })} />

              <label>Gölge</label>
              <select value={(selectedNode.data as any).shadow ?? 1} onChange={(e)=>updateSelectedNode({ shadow: parseInt(e.target.value) as any })}>
                <option value={0}>Yok</option>
                <option value={1}>Hafif</option>
                <option value={2}>Orta</option>
                <option value={3}>Derin</option>
              </select>

              <label>Kilitle</label>
              <button className="btn" onClick={toggleLock}>{(selectedNode.data as any).locked ? 'Kilidi Aç' : 'Kilitle'}</button>

              <label>Katman</label>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn" onClick={bringToFront}>Öne</button>
                <button className="btn" onClick={sendToBack}>Arkaya</button>
              </div>
            </div>
          )
        ) : (
          // Hiç seçim yoksa: Form şablonu alanlarını düzenleme
          <div className="prop-grid">
            <label>Başlık</label>
            <input value={meta.formTitle} onChange={(e)=>setMeta(m=>({ ...m, formTitle: e.target.value }))} />
            <label>Parça No</label>
            <input value={meta.partNo} onChange={(e)=>setMeta(m=>({ ...m, partNo: e.target.value }))} />
            <label>İş Akış Form No</label>
            <input value={meta.formNo} onChange={(e)=>setMeta(m=>({ ...m, formNo: e.target.value }))} />
            <label>Doküman No</label>
            <input value={meta.docNo} onChange={(e)=>setMeta(m=>({ ...m, docNo: e.target.value }))} />
            <label>Yayın Tarihi</label>
            <input value={meta.publishDate} onChange={(e)=>setMeta(m=>({ ...m, publishDate: e.target.value }))} />
            <label>Revizyon Tarihi</label>
            <input value={meta.revDate} onChange={(e)=>setMeta(m=>({ ...m, revDate: e.target.value }))} />
            <label>Revizyon No</label>
            <input value={meta.revNo} onChange={(e)=>setMeta(m=>({ ...m, revNo: e.target.value }))} />
          </div>
        )}
      </div>
    </div>
  )
}
