import fs from 'fs'
import path from 'path'
import os from 'os'
import { INITIAL_PLATFORM_STATE, PlatformStateData } from '@/lib/platform-store'

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'platform-store.json')
const TMP_FILE_PATH = path.join(os.tmpdir(), 'maestrotech-platform-store.json')

let memoryCache: PlatformStateData | null = null

export function readStore(): PlatformStateData {
  try {
    if (fs.existsSync(TMP_FILE_PATH)) {
      const raw = fs.readFileSync(TMP_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw) as PlatformStateData
      memoryCache = parsed
      return parsed
    }
  } catch {
    // Continue to DATA_FILE_PATH
  }

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8')
      const parsed = JSON.parse(raw) as PlatformStateData
      memoryCache = parsed
      return parsed
    }
  } catch {
    // Continue to memoryCache or INITIAL_PLATFORM_STATE
  }

  if (memoryCache) return memoryCache
  const initial = structuredClone(INITIAL_PLATFORM_STATE)
  memoryCache = initial
  return initial
}

export function writeStore(state: PlatformStateData): void {
  memoryCache = state
  const serialized = JSON.stringify(state, null, 2)

  try {
    fs.writeFileSync(TMP_FILE_PATH, serialized, 'utf8')
  } catch {
    // Ignore tmp write error
  }
}

export function mutateStore(mutator: (state: PlatformStateData) => void): PlatformStateData {
  const state = readStore()
  mutator(state)
  writeStore(state)
  return state
}
