import type { Metadata } from 'next'
import Recording from '@/views/recording'

// Skip static generation for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'TalkAdvantage - Dashboard',
  description: 'Manage your recordings and transcripts',
}

export default function RecordingPage() {
  return (
    <div>
      <Recording />
    </div>
  )
}
