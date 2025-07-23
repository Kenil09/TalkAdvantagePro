import { Copy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranscriptionStore } from '@/lib/store/transcription.store'

const LiveTranscription = () => {
  const { liveText, transcriptHistory } = useTranscriptionStore()

  const handleCopy = () => {
    navigator.clipboard.writeText(liveText)
  }

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Live Transcription</h3>
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
            onClick={handleCopy}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
          >
            <Settings />
          </Button>
        </div>
      </div>
      <div
        className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 overflow-y-auto flex-1"
        style={{ minHeight: 'auto' }}
      >
        {transcriptHistory.length ? (
          <div className="flex flex-col space-y-2">
            {transcriptHistory.map((entry, idx) => {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between space-x-2"
                >
                  <p
                    className={`animate-fade rounded p-1.5 ${
                      idx % 2 === 0
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-gray-100'
                    }`}
                  >
                    {entry.text.trim()}.
                  </p>
                  <p
                    className={`${
                      idx % 2 === 0
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-gray-100'
                    } animate-fade rounded p-1.5`}
                  >
                    {new Date(entry.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </p>
                </div>
              )
            })}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="animate-pulse">●</span>
              <span>Transcribing in real-time...</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">
            No transcription available yet. Start speaking to see live
            transcription.
          </p>
        )}
      </div>
    </div>
  )
}

export default LiveTranscription
