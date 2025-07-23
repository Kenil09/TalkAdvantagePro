import { AssemblyAI } from 'assemblyai'

export const assemblyClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

// Update the transcribeAudioFromUrl function to include additional features
export async function transcribeAudioFromUrl(
  audioUrl: string,
  options: {
    speakerLabels?: boolean
    timestamps?: boolean
    sentimentAnalysis?: boolean
    topicDetection?: boolean
    summarization?: boolean
    summaryType?: 'bullets' | 'paragraph' | 'headline'
    summaryModel?: 'informative' | 'conversational'
    webhookUrl?: string
    entityDetection?: boolean
  },
) {
  try {
    // Validate file size if possible
    // Note: This would require additional implementation for local files

    const transcript = await assemblyClient.transcripts.transcribe({
      audio: audioUrl,
      speaker_labels: options.speakerLabels,
      word_boost: [
        'meeting',
        'project',
        'deadline',
        'action item',
        'follow up',
      ],
      auto_highlights: true,
      punctuate: true,
      format_text: true,
      sentiment_analysis: options.sentimentAnalysis,
      iab_categories: options.topicDetection,
      summarization: options.summarization,
      summary_type: options.summaryType,
      summary_model: options.summaryModel,
      webhook_url: options.webhookUrl,
      entity_detection: options.entityDetection,
    })

    return {
      success: true,
      transcript: transcript.text,
      id: transcript.id,
      words: transcript.words,
      utterances: transcript.utterances,
      sentiment: transcript.sentiment_analysis_results,
      topics: transcript.iab_categories_result,
      summary: transcript.summary,
      entities: transcript.entities,
      error: null,
    }
  } catch (error) {
    console.error('Error transcribing audio:', error)

    // Improved error handling with more specific messages
    let errorMessage = 'Unknown error occurred during transcription'

    if (error instanceof Error) {
      errorMessage = error.message

      // Parse API-specific errors if available
      if ('status' in error && typeof error.status === 'number') {
        if (error.status === 413) {
          errorMessage =
            'File size exceeds the maximum limit (5GB or 10 hours of audio)'
        } else if (error.status === 400) {
          errorMessage = 'Invalid request: ' + errorMessage
        } else if (error.status >= 500) {
          errorMessage = 'Server error occurred. Please try again later.'
        }
      }
    }

    return {
      success: false,
      transcript: null,
      id: null,
      words: null,
      utterances: null,
      error: errorMessage,
    }
  }
}

export async function generateRealtimeToken(apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      'https://api.assemblyai.com/v2/realtime/token',
      {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expires_in: 3600, // Token valid for 1 hour
        }),
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to generate token')
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error generating token:', error)
    throw error
  }
}
