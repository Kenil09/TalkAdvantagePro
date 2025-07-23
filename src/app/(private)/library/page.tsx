import Library from '@/views/library'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TalkAdvantage - Library',
  description: 'Manage your library',
}

const LibraryPage = () => {
  return <Library />
}

export default LibraryPage
