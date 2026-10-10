const DB_NAME = 'maestrotech_binary_files_v1'
const STORE_NAME = 'files'
const DB_VERSION = 1

interface StoredFileRecord {
  path: string
  blob: Blob
  name: string
  type: string
  size: number
  createdAt: number
}

const objectUrlCache = new Map<string, string>()

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'path' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

/**
 * Guarda un archivo binario (PDF, DOCX, PPTX, Video MP4/WebM hasta 500MB+)
 * directamente en IndexedDB del navegador para persistencia instantánea sin límite de 4.5MB.
 */
export async function saveClientFile(virtualPath: string, file: File | Blob, fileName?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const objUrl = URL.createObjectURL(file)
    objectUrlCache.set(virtualPath, objUrl)
  } catch {
    // ignore
  }

  const db = await openDatabase()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const record: StoredFileRecord = {
        path: virtualPath,
        blob: file,
        name: fileName || (file instanceof File ? file.name : 'archivo'),
        type: file.type || 'application/octet-stream',
        size: file.size,
        createdAt: Date.now(),
      }
      const req = store.put(record)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

/**
 * Obtiene un Object URL (blob:...) para reproducir o descargar un archivo guardado en IndexedDB.
 */
export async function getClientFileObjectUrl(virtualPath: string): Promise<string | null> {
  if (!virtualPath || typeof window === 'undefined') return null

  const cached = objectUrlCache.get(virtualPath)
  if (cached) return cached

  const db = await openDatabase()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(virtualPath)
      req.onsuccess = () => {
        const record = req.result as StoredFileRecord | undefined
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob)
          objectUrlCache.set(virtualPath, url)
          resolve(url)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}
