import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const root = process.cwd()
const port = Number(process.env.DEXPDF_SMOKE_PORT || 4178)
const baseUrl = `http://127.0.0.1:${port}`
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
const configSource = fs.readFileSync(path.join(root, 'src/config/tools.tsx'), 'utf8').split('export const TOOLS =')[1] || ''
const toolIds = [...configSource.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map(match => match[1])
const routes = ['/', ...toolIds.map(id => `/${id}`), '/sitemap.xml']

const server = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let serverOutput = ''
server.stdout.on('data', chunk => { serverOutput += chunk.toString() })
server.stderr.on('data', chunk => { serverOutput += chunk.toString() })

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1500) })
      if (response.ok) return
    } catch {}
    if (server.exitCode !== null) throw new Error(`Production server exited early.\n${serverOutput}`)
    await delay(500)
  }
  throw new Error(`Production server did not start.\n${serverOutput}`)
}

async function checkRoute(route) {
  const response = await fetch(baseUrl + route, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  const body = await response.text()
  if (response.status !== 200) throw new Error(`${route} returned HTTP ${response.status}`)
  if (route !== '/sitemap.xml' && /404:|This page could not be found|Tool unavailable/i.test(body)) {
    throw new Error(`${route} rendered an unavailable page`)
  }
  if (route !== '/sitemap.xml' && !/<title>[^<]+<\/title>/i.test(body)) throw new Error(`${route} is missing a title`)
  return route
}

try {
  await waitForServer()
  const queue = [...routes]
  const completed = []
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const route = queue.shift()
      completed.push(await checkRoute(route))
    }
  })
  await Promise.all(workers)
  console.log(`DexPDF route smoke test passed: ${completed.length} routes returned healthy production HTML.`)
} catch (error) {
  console.error(error.message || error)
  process.exitCode = 1
} finally {
  server.kill('SIGTERM')
}
