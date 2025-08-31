import React from 'react'

type CommonProps = {
  data: any
  onPatch: (patch: Record<string, any>) => void
}

export function ProcessInspector({ data, onPatch }: CommonProps) {
  return (
    <div className="prop-grid">
      <label>Operasyon No</label>
      <input value={data?.opNo ?? ''} onChange={(e) => onPatch({ opNo: e.target.value })} />

      <label>Ad</label>
      <input value={data?.name ?? ''} onChange={(e) => onPatch({ name: e.target.value })} />

      <label>İstasyon</label>
      <input value={data?.station ?? ''} onChange={(e) => onPatch({ station: e.target.value })} />

      <label>Özel Karakteristik</label>
      <select
        value={data?.special ?? 'None'}
        onChange={(e) => onPatch({ special: e.target.value })}
      >
        <option value="None">-</option>
        <option value="SC">SC</option>
        <option value="CC">CC</option>
      </select>

      <label>Köşe Yuvarlaklık</label>
      <input
        type="range" min={0} max={24}
        value={data?.borderRadius ?? 14}
        onChange={(e) => onPatch({ borderRadius: Number(e.target.value) })}
      />

      <label>Gölge</label>
      <select
        value={data?.shadow ?? 2}
        onChange={(e) => onPatch({ shadow: Number(e.target.value) })}
      >
        <option value={0}>Yok</option>
        <option value={1}>Az</option>
        <option value={2}>Orta</option>
        <option value={3}>Yüksek</option>
      </select>
    </div>
  )
}

export function ShapeInspector({ data, onPatch }: CommonProps) {
  return (
    <div className="prop-grid">
      <label>Başlık</label>
      <input value={data?.label ?? ''} onChange={(e) => onPatch({ label: e.target.value })} />

      <label>Açıklama</label>
      <textarea
        rows={3}
        value={data?.text ?? ''}
        onChange={(e) => onPatch({ text: e.target.value })}
        style={{ resize:'vertical', padding:'6px 8px', border:'1px solid #d1d5db', borderRadius:8 }}
      />

      <label>Renk</label>
      <input
        type="color"
        value={data?.color ?? '#4b5563'}
        onChange={(e) => onPatch({ color: e.target.value })}
      />

      <label>Köşe Yuvarlaklık</label>
      <input
        type="range" min={0} max={24}
        value={data?.borderRadius ?? 12}
        onChange={(e) => onPatch({ borderRadius: Number(e.target.value) })}
      />

      <label>Gölge</label>
      <select
        value={data?.shadow ?? 1}
        onChange={(e) => onPatch({ shadow: Number(e.target.value) })}
      >
        <option value={0}>Yok</option>
        <option value={1}>Az</option>
        <option value={2}>Orta</option>
        <option value={3}>Yüksek</option>
      </select>
    </div>
  )
}

export function IconInspector({ data, onPatch }: CommonProps) {
  return (
    <div className="prop-grid">
      <label>Başlık</label>
      <input value={data?.label ?? ''} onChange={(e) => onPatch({ label: e.target.value })} />

      <label>Renk</label>
      <input
        type="color"
        value={data?.color ?? '#374151'}
        onChange={(e) => onPatch({ color: e.target.value })}
      />

      <label>Gölge</label>
      <select
        value={data?.shadow ?? 1}
        onChange={(e) => onPatch({ shadow: Number(e.target.value) })}
      >
        <option value={0}>Yok</option>
        <option value={1}>Az</option>
        <option value={2}>Orta</option>
        <option value={3}>Yüksek</option>
      </select>
    </div>
  )
}
