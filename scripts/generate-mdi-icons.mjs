import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import * as mdi from '@mdi/js'

const OUTPUT = 'app/utils/mdiIcons.ts'
const ICON_NAME = /\bmdi-[a-z0-9]+(?:-[a-z0-9]+)*\b/g
const SOURCE_FILE = /\.(?:vue|ts)$/

function sourceFiles(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory())
      sourceFiles(path, found)
    else if (SOURCE_FILE.test(name) && !path.endsWith('mdiIcons.ts'))
      found.push(path)
  }

  return found
}

const names = new Set()
for (const file of sourceFiles('app')) {
  for (const match of readFileSync(file, 'utf8').matchAll(ICON_NAME))
    names.add(match[0])
}

const exportName = name => `mdi${name.slice(4).split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('')}`
const unknown = [...names].filter(name => !(exportName(name) in mdi))
if (unknown.length > 0) {
  console.error(`Not in @mdi/js: ${unknown.join(', ')}`)
  process.exit(1)
}

const sorted = [...names].sort((a, b) => exportName(a).localeCompare(exportName(b), 'en', { sensitivity: 'base' }))
const imports = sorted.map(name => `  ${exportName(name)},`).join('\n')
const entries = sorted.map(name => `  '${name}': ${exportName(name)},`).join('\n')

writeFileSync(
  OUTPUT,
  `// Generated map of every mdi-* icon name used in the app to its @mdi/js SVG path.\n`
  + `// Regenerate with \`bun run icons:generate\` after adding an icon.\n`
  + `import {\n${imports}\n} from '@mdi/js'\n\n`
  + `export const mdiIconMap: Record<string, string> = {\n${entries}\n}\n`,
)
console.log(`${OUTPUT}: ${sorted.length} icons`)
