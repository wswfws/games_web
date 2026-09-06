import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nm = join(root, 'node_modules')

const targets = [
  '@tailwindcss/vite',
  'tailwindcss',
  '@types/node',
  'vite',
  'typescript',
  'react',
  '@vitejs/plugin-react',
  '@originjs/vite-plugin-federation',
]

console.log(`node at ${process.version}`)
for (const t of targets) {
  console.log(`${existsSync(join(nm, t)) ? 'OK  ' : 'MISS'} ${t}`)
}
const workspaces = ['blackblast', 'build_cat', 'shell']
console.log('--- workspace-local node_modules ---')
for (const w of workspaces) {
  const dir = join(root, w, 'node_modules')
  if (existsSync(dir)) {
    console.log(`${w}: ${readdirSync(dir).join(', ')}`)
  } else {
    console.log(`${w}: (none)`)
  }
}
console.log('--- hoisted .bin ---')
const bin = join(nm, '.bin')
if (existsSync(bin)) {
  console.log(readdirSync(bin).filter((n) => n.includes('vite') || n.includes('tsc')).join(', '))
} else {
  console.log('(no .bin)')
}