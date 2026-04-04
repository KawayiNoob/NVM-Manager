import { defineConfig, presetUno, presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      success: {
        DEFAULT: '#22c55e',
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer border-none',
    'btn-primary': 'bg-gradient-to-r from-primary-600 to-primary-400 text-white hover:translate-y--1 hover:shadow-lg hover:shadow-primary-500/40',
    'btn-success': 'bg-gradient-to-r from-success-600 to-success-400 text-white hover:translate-y--1 hover:shadow-lg hover:shadow-success-500/40',
    'btn-refresh': 'flex items-center gap-2 px-5 py-2.5 bg-white/8 text-white/70 border border-white/12 hover:bg-white/12 hover:text-white/90',
    'version-item': 'flex justify-between items-center p-3.5 bg-white/5 rounded-lg border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all duration-200',
    'version-item-current': 'bg-success-500/10 border-success-500/30',
    'badge': 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold',
    'badge-current': 'bg-success-500/20 text-success-400',
    'badge-installed': 'bg-primary-500/20 text-primary-400',
  },
})
