import type { Node } from 'reactflow'

export type SpecialChar = 'None' | 'SC' | 'CC'

export type ProcessNodeData = {
  opNo: string
  name: string
  station?: string
  special?: SpecialChar
  borderRadius?: number
  shadow?: 0 | 1 | 2 | 3
  locked?: boolean
}

export type ShapeNodeData = {
  label?: string
  text?: string
  shape?: 'square' | 'circle' | 'triangle' | 'diamond'
  color?: string
  borderRadius?: number
  shadow?: 0 | 1 | 2 | 3
  locked?: boolean
}

export type IconNodeData = {
  icon: string
  label?: string
  color?: string
  shadow?: 0 | 1 | 2 | 3
  locked?: boolean
}

export type AppNodeData = ProcessNodeData | ShapeNodeData | IconNodeData

export type Meta = {
  formTitle: string
  partNo: string
  formNo: string
  docNo: string
  publishDate: string
  revDate: string
  revNo: string
  showForm: boolean
}

export type FlowState = {
  nodes: Node<AppNodeData>[]
  edges: any[]
  meta?: Meta
}
