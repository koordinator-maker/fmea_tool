import axios from 'axios'
import type { FlowState } from './types'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 8000,
})

export async function loadFlow(id: string): Promise<FlowState | null> {
  try {
    const { data } = await api.get(`/flows/${id}`)
    return data as FlowState
  } catch {
    return { nodes: [], edges: [] }
  }
}

export async function saveFlow(id: string, state: FlowState): Promise<void> {
  await api.post(`/flows/${id}/save`, state)
}
