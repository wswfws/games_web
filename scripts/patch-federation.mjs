import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const files = ['index.mjs', 'index.js'].map((f) =>
  join(process.cwd(), 'node_modules', '@originjs', 'vite-plugin-federation', 'dist', f),
)

function patch(content) {
  let out = content

  // 1. Allow the CSS marker replacement regex to match the backtick-wrapped marker.
  out = out.replace(
    /new RegExp\(`\(\[[^\]]*\]\)\$\{DYNAMIC_LOADING_CSS_PREFIX\}/,
    (m) => {
      const cls = m.match(/\[([^\]]*)\]/)[1]
      return m.includes('\\`') ? m : m.replace('[' + cls + ']', '[' + cls + '\\`' + ']')
    },
  )

  // 2. Extract the marker path regardless of the opening quote character.
  out = out.replace(/(\(`'` \+ DYNAMIC_LOADING_CSS_PREFIX\)\.length,)/, '(str[0] + DYNAMIC_LOADING_CSS_PREFIX).length,')

  // 3. Cleanup walk should also drop TemplateLiteral CSS markers (not just plain strings).
  //    Consume the fully balanced marker expression (`_b2.value.indexOf(\`${...}\`) > -1)` so the
  //    replacement keeps parens balanced: the original wrapper `((_b2 = ...) == null ? ... )` has
  //    two opening parens that the tail `)) > -1)` matches; the replacement must not leave the tail.
  out = out.replace(
    /var _a2, _b2;\n(\s*)if \(node && node\.type === "CallExpression" && typeof \(\(_a2 = node\.arguments\[0\]\) == null \? void 0 : _a2\.value\) === "string" && \(\(_b2 = node\.arguments\[0\]\) == null \? void 0 : _b2\.value\.indexOf\(\s*`\$\{DYNAMIC_LOADING_CSS_PREFIX\}`\s*\)\) > -1\) \{/,
    (_m, ws) =>
      'const _arg0 = node && node.arguments ? node.arguments[0] : void 0;\n' +
      ws +
      'const _argStr = _arg0 ? typeof _arg0.value === "string" ? _arg0.value : _arg0.quasis && _arg0.quasis[0] && _arg0.quasis[0].value && _arg0.quasis[0].value.raw : void 0;\n' +
      ws +
      'if (node && node.type === "CallExpression" && typeof _argStr === "string" && (_argStr.indexOf(`${DYNAMIC_LOADING_CSS_PREFIX}`) > -1)) {',
  )

  return out
}

const markers = [
  (c) => c.includes('\\`') && c.includes('new RegExp(`(['),
  (c) => c.includes('(str[0] + DYNAMIC_LOADING_CSS_PREFIX).length'),
  (c) => c.includes('_argStr') && c.includes('_arg0.quasis'),
]

let applied = 0
for (const file of files) {
  if (!existsSync(file)) {
    continue
  }
  const original = readFileSync(file, 'utf8')
  const out = patch(original)
  if (out === original) {
    const missing = markers.filter((m) => !m(original))
    if (missing.length) {
      console.warn(`patch-federation: pattern changed differently in ${file}, manual check needed`)
    } else {
      console.log(`patch-federation: already applied in ${file}`)
    }
    continue
  }
  writeFileSync(file, out)
  applied++
  console.log(`patch-federation: patched ${file}`)
}

if (!applied) {
  const anyMissing = files.some((f) => !existsSync(f))
  if (anyMissing) {
    console.warn('patch-federation: @originjs/vite-plugin-federation not found in node_modules, skipping')
  }
}