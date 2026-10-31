const DATABASE = 'valley-freedom-companion-photos'
const STORE = 'avatars'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) { reject(new Error('此瀏覽器不支援本機圖片保存。')); return }
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('無法開啟本機圖片資料庫。'))
  })
}

export async function saveCompanionPhoto(key: string, file: Blob): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(file, key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) })
  db.close()
}

export async function loadCompanionPhoto(key: string): Promise<Blob | undefined> {
  const db = await openDatabase()
  const value = await new Promise<Blob | undefined>((resolve, reject) => { const request = db.transaction(STORE).objectStore(STORE).get(key); request.onsuccess = () => resolve(request.result as Blob | undefined); request.onerror = () => reject(request.error) })
  db.close()
  return value
}

export async function deleteCompanionPhoto(key: string): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) })
  db.close()
}
