import React from 'react'

type ItemProps = { label: string; payload: string; svg?: React.FC<React.SVGProps<SVGSVGElement>> }
const PalItem = ({ label, payload, svg: Svg }: ItemProps) => (
  <div
    className="pal-item"
    draggable
    onDragStart={(e) => e.dataTransfer.setData('application/reactflow', payload)}
    title={payload}
  >
    {Svg ? <Svg width="20" height="20" /> : <span style={{ fontSize: 12 }}>◼</span>}
    <span>{label}</span>
  </div>
)

// Basit ikonlar (placeholder)
const SvgWh = (p: any) => (<svg viewBox="0 0 24 24" {...p}><rect x="3" y="8" width="18" height="12" stroke="currentColor" fill="none"/><path d="M3 8l9-5 9 5" stroke="currentColor" /></svg>)
const SvgTruck = (p: any) => (<svg viewBox="0 0 24 24" {...p}><rect x="3" y="7" width="10" height="8" stroke="currentColor" fill="none"/><rect x="13" y="9" width="8" height="6" stroke="currentColor" fill="none"/><circle cx="8" cy="17" r="2" stroke="currentColor"/><circle cx="18" cy="17" r="2" stroke="currentColor"/></svg>)
const SvgPerson = (p: any) => (<svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="8" r="3" stroke="currentColor" fill="none"/><path d="M5 20c0-4 14-4 14 0" stroke="currentColor"/></svg>)

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="hint" style={{ fontWeight: 600 }}>Şekiller</div>
      <PalItem label="Proses"      payload="process" />
      <PalItem label="Dikdörtgen"  payload="shape:square" />
      <PalItem label="Oval"        payload="shape:circle" />
      <PalItem label="Üçgen"       payload="shape:triangle" />
      <PalItem label="Elmas"       payload="shape:diamond" />
      <PalItem label="Açıklama"    payload="callout" />

      <div className="hint" style={{ fontWeight:600, marginTop:12 }}>Piktogramlar</div>
      <PalItem label="Depo"        payload="icon:warehouse" svg={SvgWh} />
      <PalItem label="Kamyon"      payload="icon:truck"     svg={SvgTruck} />
      <PalItem label="Operatör"    payload="icon:person"    svg={SvgPerson} />
    </div>
  )
}
