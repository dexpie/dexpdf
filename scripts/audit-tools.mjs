import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, 'src/config/tools.tsx')
const containerPath = path.join(root, 'src/components/tools/ToolContainer.jsx')
const configSource = fs.readFileSync(configPath, 'utf8').split('export const TOOLS =')[1] || ''
const containerSource = fs.readFileSync(containerPath, 'utf8')

const tools = [...configSource.matchAll(/\{\s*id:\s*['"]([^'"]+)['"][\s\S]*?category:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?description:\s*['"]([^'"]+)['"][\s\S]*?href:\s*['"]([^'"]+)['"]\s*\}/g)]
  .map(match => ({ id: match[1], category: match[2], title: match[3], description: match[4], href: match[5] }))

const mappings = new Map(
  [...containerSource.matchAll(/^\s*['"]?([a-z0-9-]+)['"]?\s*:\s*loadTool\(\(\)\s*=>\s*import\(['"]\.\.\/\.\.\/tools\/([^'"]+)['"]\)\)/gm)]
    .map(match => [match[1], match[2]])
)

const errors = []
const warnings = []
const ids = tools.map(tool => tool.id)
const hrefs = tools.map(tool => tool.href)

if (tools.length === 0) errors.push('No public tools were parsed from src/config/tools.tsx.')

for (const duplicate of ids.filter((id, index) => ids.indexOf(id) !== index)) {
  errors.push(`Duplicate public tool id: ${duplicate}`)
}

for (const duplicate of hrefs.filter((href, index) => hrefs.indexOf(href) !== index)) {
  errors.push(`Duplicate public tool route: ${duplicate}`)
}

for (const tool of tools) {
  if (tool.href !== `/${tool.id}`) errors.push(`${tool.id} route must match its id (found ${tool.href}).`)
  if (!tool.title.trim()) errors.push(`${tool.id} has an empty title.`)
  if (tool.description.trim().length < 12) errors.push(`${tool.id} needs a clearer description.`)

  const componentName = mappings.get(tool.id)
  if (!componentName) {
    errors.push(`${tool.id} is missing from ToolContainer.`)
    continue
  }

  const candidates = ['.jsx', '.tsx', '.js'].map(extension => path.join(root, 'src/tools', componentName + extension))
  const componentPath = candidates.find(candidate => fs.existsSync(candidate))
  if (!componentPath) {
    errors.push(`${tool.id} maps to missing component ${componentName}.`)
    continue
  }

  const source = fs.readFileSync(componentPath, 'utf8')
  if (!source.includes('<ToolLayout')) errors.push(`${tool.id} does not use the shared ToolLayout.`)
  if (/\b(?:window\.)?alert\s*\(/.test(source)) errors.push(`${tool.id} still uses a blocking browser alert.`)
  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js/i.test(source)) errors.push(`${tool.id} depends on a remote PDF.js worker.`)
  if (/coming soon|not implemented/i.test(source)) warnings.push(`${tool.id} contains unfinished feature copy.`)
}

console.log(`DexPDF tool audit: ${tools.length} public tools, ${mappings.size} runtime mappings.`)
for (const warning of [...new Set(warnings)]) console.warn(`WARN: ${warning}`)

if (errors.length > 0) {
  for (const error of [...new Set(errors)]) console.error(`ERROR: ${error}`)
  process.exitCode = 1
} else {
  console.log('All public tools have unique routes, runnable components, shared UI, and non-blocking error handling.')
}
