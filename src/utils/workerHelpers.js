// Utilities to create inline module workers and manage message/termination
export function createInlineModuleWorker(code) {
  const blob = new Blob([code], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url, { type: 'module' })
  // store URL so caller can revoke when terminating
  worker._blobUrl = url
  return worker
}

export function terminateWorker(worker) {
  if (!worker) return
  try { worker.terminate() } catch (e) { }
  if (worker._blobUrl) {
    try { URL.revokeObjectURL(worker._blobUrl) } catch (e) { }
    worker._blobUrl = null
  }
}

export function postStart(worker, payload, transferables = []) {
  if (!worker) throw new Error('Worker not provided')
  worker.postMessage({ cmd: 'start', ...payload }, transferables)
}
