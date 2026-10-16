import cascadeLayers from '@csstools/postcss-cascade-layers'
import oklabFunction from '@csstools/postcss-oklab-function'

// Runs on Tailwind's output. Tailwind 4 and DaisyUI 5 target Chrome 111+, but Cast devices (the TV
// receiver at /cast) can run Chromium 92. These make the site usable there:
//  - @layer (Chrome 99): every Tailwind utility is inside one, so old browsers dropped them all.
//    Flattened into plain rules, with specificity bumps that keep the layer order.
//  - oklch() (Chrome 111): every theme color. Converted to rgb() fallbacks.
//  - translate (Chrome 104): centers the overlays. Copied to `transform` where it isn't supported.
// Older browsers still miss :has() and DaisyUI's color-mix() with variables (borders, hover shades).

/** Splits a CSS value on top-level whitespace, and between `)` and the next token (`var(--a)var(--b)`). */
const splitTopLevel = (value) => {
  const parts = []
  let depth = 0
  let current = ''
  for (const ch of value.trim()) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth === 0 && /\s/.test(ch)) {
      if (current) parts.push(current)
      current = ''
      continue
    }
    current += ch
    if (depth === 0 && ch === ')') {
      parts.push(current)
      current = ''
    }
  }
  if (current) parts.push(current)
  return parts
}

/** `translate: X Y` → `@supports not (translate: 0) { <same selector> { transform: translate(X, Y) } }`. */
const translateFallback = () => ({
  postcssPlugin: 'translate-fallback',
  Once(root, { AtRule }) {
    root.walkDecls('translate', (decl) => {
      const rule = decl.parent
      if (rule?.type !== 'rule' || decl.value === 'none') return
      // Keyframe steps can't hold an @supports (only Chrome 104+ animates `translate` anyway).
      if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return
      const fallback = rule.clone({ nodes: [] })
      fallback.append({ prop: 'transform', value: `translate(${splitTopLevel(decl.value).join(', ')})` })
      const supports = new AtRule({ name: 'supports', params: 'not (translate: 0)' })
      supports.append(fallback)
      rule.after(supports)
    })
  },
})
translateFallback.postcss = true

// Build only: in dev, Tailwind leaves DaisyUI's CSS nested, which the layer plugin mangles. In a build,
// Tailwind flattens nesting before PostCSS runs. Test the TV look with a build, not `pnpm dev`.
export default (ctx) => ({
  plugins: ctx.env === 'production' ? [
    translateFallback(),
    cascadeLayers(),
    oklabFunction({ preserve: true }),
  ] : [],
})
