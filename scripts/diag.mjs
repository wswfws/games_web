import { execSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nm = join(root, 'node_modules')

console.log(`node at ${process.version}`)
console.log(`npm at ${execSync('npm --version', { encoding: 'utf8' }).trim()}`)
for (const k of ['npm_config_omit', 'npm_config_include', 'npm_config_install_strategy', 'npm_config_workspaces_legacy', 'NODE_ENV', 'npm_config_node_gyp']) {
  console.log(`env ${k}=${process.env[k] ?? ''}`)
}

const target = '@tailwindcss/vite'
for (const scope of ['node_modules/@tailwindcss/vite', 'node_modules/tailwindcss', 'node_modules/@tailwindcss/oxide']) {
  console.log(`${existsSync(join(root, scope)) ? 'OK  ' : 'MISS'} ${scope}`)
}

console.log('--- top-level node_modules count ---')
const top = existsSync(nm) ? readdirSync(nm) : []
console.log(top.length, 'entries')
console.log(top.filter((n) => /tailwind|oxide|lightningcss|@types|vite/.test(n)).join(', '))

console.log('--- npm ls tailwind (root) ---')
try {
  console.log(execSync('npm ls @tailwindcss/vite tailwindcss @tailwindcss/oxide --all', { encoding: 'utf8', cwd: root }).toString())
} catch (e) {
  console.log(String(e.stdout ?? e))
}

console.log('--- npm ls --depth=0 (root) ---')
try {
  console.log(execSync('npm ls --depth=0', { encoding: 'utf8', cwd: root }).toString())
} catch (e) {
  console.log(String(e.stdout ?? e))
}