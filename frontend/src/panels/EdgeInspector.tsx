import React from 'react'
import type { Edge } from 'reactflow'

type Props = {
  edge: Edge
  onPatch: (patch: Partial<Edge>) => void
}

export default function EdgeInspector({ edge, onPatch }: Props) {
  const stroke = (edge.style as any)?.stroke ?? '#111827'
  const strokeWidth = (edge.style as any)?.strokeWidth ?? 2

  return (
    <div className="prop-grid">
      <label>Renk</label>
      <input
        type="color"
        value={stroke}
        onChange={(e) => onPatch({ style: { ...(edge.style || {}), stroke: e.target.value } })}
      />

      <label>Kalınlık</label>
      <input
        type="range" min={1} max={8}
        value={strokeWidth}
        onChange={(e) => onPatch({ style: { ...(edge.style || {}), strokeWidth: Number(e.target.value) } })}
      />
    </div>
  )
}
