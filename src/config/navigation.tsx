import { ChartBar, Mic, SquareLibrary, Upload } from 'lucide-react'

// src/config/navigation.tsx
export const mainNavigation = [
  { name: 'Recording', url: '/', icon: <Mic /> },
  { name: 'Library', url: '/library', icon: <SquareLibrary /> },
  { name: 'Import', url: '/import', icon: <Upload /> },
  { name: 'Analysis', url: '/analysis', icon: <ChartBar /> },
]
