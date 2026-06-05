'use client'

/**
 * Global SVG filter defs — procedural, GPU-accelerated, animated (feTurbulence +
 * hue-rotate). Shader-like effects referenced via filter:url(#id) on names/frames.
 * No WebGL contexts → safe to apply to many elements at once.
 * Mount ONCE near the app root.
 */
export function SvgFilters() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        {/* Holographic iridescent sheen clipped to the source glyphs */}
        <filter id="qhatu-holo" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="2" seed="7" result="noise">
            <animate attributeName="baseFrequency" dur="16s" values="0.014 0.02;0.026 0.014;0.014 0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="noise" type="hueRotate" values="0" result="hue">
            <animate attributeName="values" dur="5s" values="0;360" repeatCount="indefinite" />
          </feColorMatrix>
          <feColorMatrix in="hue" type="saturate" values="6" result="sat" />
          {/* clip the iridescence to the text shape, then screen over it */}
          <feComposite in="sat" in2="SourceAlpha" operator="in" result="grain" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="grain" />
          </feMerge>
        </filter>

        {/* Liquid metal sheen (gold/chrome) — moving highlight bands */}
        <filter id="qhatu-foil" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.008 0.04" numOctaves="2" seed="2" result="n">
            <animate attributeName="baseFrequency" dur="9s" values="0.008 0.04;0.016 0.03;0.008 0.04" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.92  0 0 0 0 0.6  0 0 0 0.9 0" result="foil" />
          <feComposite in="foil" in2="SourceAlpha" operator="in" result="clip" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="clip" />
          </feMerge>
        </filter>

        {/* Organic wobble for mythic frame rings */}
        <filter id="qhatu-wobble" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="n">
            <animate attributeName="baseFrequency" dur="11s" values="0.02;0.034;0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
