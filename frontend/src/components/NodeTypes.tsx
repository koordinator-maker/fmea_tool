import React, { memo } from 'react'
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow'
import type { ProcessNodeData, ShapeNodeData, IconNodeData } from '../types'

/** Gölge yardımcı */
const shadowClass = (lv?: number) =>
  lv === 3 ? 'shadow-3' : lv === 2 ? 'shadow-2' : lv === 1 ? 'shadow-1' : 'shadow-0'

/** Görünmez (ama tıklanabilir) handle: tek nokta görünümünü korumak için */
const ghostHandle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: 18,
  height: 18,
  borderRadius: 9999,
  background: 'transparent',
  border: 'none',
  opacity: 0,                 // görünmez
  pointerEvents: 'auto',      // tıklanabilir
  zIndex: 7,
  ...extra,
})

/** Görsel tek nokta (sadece dekoratif) */
const visualDot = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  width: 14,
  height: 14,
  borderRadius: 9999,
  border: '2px solid #0ea5e9',
  background: '#fff',
  zIndex: 6,
  ...extra,
})

/** Her yüzde TEK NOKTA görünümü:
 *  - Ortaya bir dekoratif dot
 *  - Aynı noktanın ±6px çevresine iki “hayalet” handle (source + target)
 */
function SingleDotPerSide({
  showTop = true,
  showRight = true,
  showBottom = true,
  showLeft = true,
}: {
  showTop?: boolean
  showRight?: boolean
  showBottom?: boolean
  showLeft?: boolean
}) {
  return (
    <>
      {/* SOL */}
      {showLeft && (
        <>
          <div style={visualDot({ left: -7, top: '50%', transform: 'translateY(-50%)' })} />
          <Handle type="source" position={Position.Left}  id="L-src" style={ghostHandle({ top: 'calc(50% - 6px)', transform: 'translateY(-50%)' })} />
          <Handle type="target" position={Position.Left}  id="L-tgt" style={ghostHandle({ top: 'calc(50% + 6px)', transform: 'translateY(-50%)' })} />
        </>
      )}

      {/* SAĞ */}
      {showRight && (
        <>
          <div style={visualDot({ right: -7, top: '50%', transform: 'translateY(-50%)' })} />
          <Handle type="source" position={Position.Right} id="R-src" style={ghostHandle({ top: 'calc(50% + 6px)', transform: 'translateY(-50%)' })} />
          <Handle type="target" position={Position.Right} id="R-tgt" style={ghostHandle({ top: 'calc(50% - 6px)', transform: 'translateY(-50%)' })} />
        </>
      )}

      {/* ÜST */}
      {showTop && (
        <>
          <div style={visualDot({ top: -7, left: '50%', transform: 'translateX(-50%)' })} />
          <Handle type="source" position={Position.Top} id="T-src" style={ghostHandle({ left: 'calc(50% - 6px)', transform: 'translateX(-50%)' })} />
          <Handle type="target" position={Position.Top} id="T-tgt" style={ghostHandle({ left: 'calc(50% + 6px)', transform: 'translateX(-50%)' })} />
        </>
      )}

      {/* ALT */}
      {showBottom && (
        <>
          <div style={visualDot({ bottom: -7, left: '50%', transform: 'translateX(-50%)' })} />
          <Handle type="source" position={Position.Bottom} id="B-src" style={ghostHandle({ left: 'calc(50% + 6px)', transform: 'translateX(-50%)' })} />
          <Handle type="target" position={Position.Bottom} id="B-tgt" style={ghostHandle({ left: 'calc(50% - 6px)', transform: 'translateX(-50%)' })} />
        </>
      )}
    </>
  )
}

/* ========================= Process Node ========================= */
export const ProcessNode = memo((props: NodeProps<ProcessNodeData>) => {
  const { data, selected } = props
  const br = data.borderRadius ?? 14
  const sh = shadowClass(data.shadow)
  const badge = data.special && data.special !== 'None' ? data.special : ''

  return (
    <div className={`node-card ${sh}`} style={{ borderRadius: br, outline: selected ? '2px solid #2563eb' : 'none', position: 'relative' }}>
      <NodeResizer isVisible={selected} minWidth={120} minHeight={54} handleStyle={{ width: 8, height: 8 }} />
      <div className="node-title">{data.opNo} - {data.name || 'Proses'}</div>
      <div className="node-sub">{data.station || 'İstasyon'}</div>
      {badge && <div className="node-sub" style={{ marginTop: 6 }}>Özel Karakteristik: <strong>{badge}</strong></div>}
      <SingleDotPerSide />
    </div>
  )
})

/* ========================= Shape Node ========================= */
export const ShapeNode = memo((props: NodeProps<ShapeNodeData>) => {
  const { data, selected } = props
  const color = data.color ?? '#4b5563'
  const br = data.borderRadius ?? 12
  const sh = shadowClass(data.shadow)

  const base: React.CSSProperties = {
    width: 140,
    height: 64,
    background: '#fff',
    border: `2px solid ${color}`,
    borderRadius: br,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const renderShape = () => {
    switch (data.shape) {
      case 'circle':  return <div style={{ ...base, width: 68, height: 68, borderRadius: 9999 }} />
      case 'diamond': return <div style={{ ...base, transform: 'rotate(45deg)', width: 90, height: 90 }} />
      case 'triangle':
        return (
          <div style={{
            width: 0, height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: `100px solid ${color}`
          }} />
        )
      default:        return <div style={base} />
    }
  }

  return (
    <div className={`node-card ${sh}`} style={{ outline: selected ? '2px solid #2563eb' : 'none', borderRadius: br, position: 'relative' }}>
      <NodeResizer isVisible={selected} minWidth={80} minHeight={50} handleStyle={{ width: 8, height: 8 }} />
      <div style={{ display:'flex', gap:10, alignItems:'center', justifyContent:'center' }}>{renderShape()}</div>
      <div className="node-sub" style={{ marginTop: 6, color }}>{data.label || data.shape?.toUpperCase() || 'Şekil'}</div>
      <SingleDotPerSide />
    </div>
  )
})

/* ========================= Icon Node ========================= */
export const IconNode = memo((props: NodeProps<IconNodeData>) => {
  const { data, selected } = props
  const sh = shadowClass(data.shadow)

  return (
    <div className={`node-card ${sh}`} style={{ outline: selected ? '2px solid #2563eb' : 'none', borderRadius: 12, position: 'relative' }}>
      <NodeResizer isVisible={selected} minWidth={90} minHeight={54} handleStyle={{ width: 8, height: 8 }} />
      <div className="node-title">{data.label || data.icon}</div>
      <div className="node-sub" style={{ color: '#374151' }}>Piktogram</div>
      <SingleDotPerSide />
    </div>
  )
})

export const nodeTypes = { processNode: ProcessNode, shapeNode: ShapeNode, iconNode: IconNode }
