/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Studio Analogique Core Palette
        'studio-bg': '#121214',          // Matte deep black (fond principal)
        'studio-surface': '#1A1A1E',     // Warm anthracite (surfaces, racks, decks)
        'studio-raised': '#222228',      // Raised tactile panels, buttons
        'studio-border': '#2A2A30',      // Precise hairline separator
        'studio-border-light': '#383842',// Subtle hover border
        'studio-text': '#EDEDED',        // Off-white primary text
        'studio-text-dim': '#9E9EA8',    // Secondary technical text, markings
        'studio-muted': '#656572',       // Subdued captions & rack labels

        // Primary Accent: Analog VU Meter / Studio Amber
        'amber-studio': '#FF6B35',       // Primary warm VU-meter orange
        'amber-glow': '#FF854D',         // Warm hover highlight
        'amber-dim': '#2E1A14',          // Recessed background / badge back
        'studio-gold': '#F59E0B',        // Peak / secondary amber indicator

        // Studio Hardware Status LEDs
        'led-green': '#10B981',          // Analog green LED (signal / connected)
        'led-amber': '#F59E0B',          // Analog amber LED (pending / processing)
        'led-red': '#EF4444',            // Analog red LED (clip / alert)

        // Legacy compatibility mappings (re-routed strictly to warm studio palette)
        obsidian: '#121214',
        'dark-gray': '#1A1A1E',
        'light-gray': '#9E9EA8',
        'electric-cyan': '#FF6B35',
        'teal-glow': '#F59E0B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'studio-panel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 4px 20px rgba(0, 0, 0, 0.5)',
        'studio-inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'vu-glow': '0 0 16px rgba(255, 107, 53, 0.25)',
      }
    },
  },
  plugins: [],
}
