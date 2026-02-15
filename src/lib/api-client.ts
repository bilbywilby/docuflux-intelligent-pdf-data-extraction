import { ApiResponse } from "../../shared/types"

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    let errorMsg = json.error || 'Request failed';
    if (json.detail) errorMsg += ` (detail: ${json.detail})`;
    throw new Error(errorMsg)
  }
  return json.data
}