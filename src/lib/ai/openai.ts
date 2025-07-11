import { ChatOpenAI } from '@langchain/openai'
export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
  deleted?: boolean
}

export interface TiptapDocument {
  type: 'doc'
  content: TiptapNode[]
}

interface GenerateMeetingNotesOptions {
  transcript: string
  context: {
    meetingGoal: string
    participants: string[]
  }
  currentCanvasState: string
  buildOnPrevious?: boolean
}

const openai = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'openai/gpt-4o-mini',
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
  temperature: 0.7,
  maxTokens: 2000,
})

export async function generateMeetingNotes({
  transcript,
  context,
  currentCanvasState,
  buildOnPrevious = false,
}: GenerateMeetingNotesOptions): Promise<TiptapDocument> {
  try {
    // Validate transcript
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript is empty or invalid')
    }

    // Prepare the system prompt with better instructions for dynamic content structure
    const systemPrompt = `You are an expert meeting assistant that creates detailed meeting notes from transcripts.

Your task is to ANALYZE the provided transcript and GENERATE COMPREHENSIVE meeting notes. DO NOT simply repeat the transcript verbatim.

Instructions:
- Create a well-structured document with a VARIETY of content elements
- SUMMARIZE key points from the transcript - don't just copy the text
- Identify action items and decisions made
- Highlight important information
- Extract dates, deadlines, and assignments
- Format the notes professionally
- TRANSFORM the raw transcript into organized, professional meeting notes
- NEVER return the raw transcript text as-is

Meeting Goal: ${context.meetingGoal || 'Not specified'}
Participants: ${context.participants?.join(', ') || 'Not specified'}

${
  buildOnPrevious && currentCanvasState
    ? 'IMPORTANT: You are being asked to BUILD ON PREVIOUS NOTES. The current canvas state contains previous notes that you should use as a foundation. Incorporate new information from the transcript while maintaining the structure and key points from the previous notes.'
    : ''
}

Output Format Requirements:
- Return the meeting notes in HTML format for insertion into a Tiptap editor
- USE A VARIETY OF HTML ELEMENTS, including but not limited to:
  * <h1>, <h2>, <h3> for section titles and subtitles
  * <p> for general text
  * <ul>, <ol>, <li> for structured points and lists
  * <blockquote> for important quotes or highlights
  * <hr> for section dividers
  * <pre><code> for technical content or examples
  * <table>, <tr>, <th>, <td> for structured data, comparisons, or schedules
- Use text formatting tags like <strong>, <em>, <u>, <s>, <code> for emphasis
- Create tables for structured information like schedules, comparisons, or data
- Use proper nesting of elements (e.g., <li> inside <ul> or <ol>)
- Add appropriate CSS classes for styling (e.g., class="action-item", class="decision", etc.)

IMPORTANT CONTENT MODIFICATION RULES:
- When asked to DELETE content OR Cancel the action OR can't perform action, DO NOT remove it. Instead, apply HTML strikethrough formatting to the content.
- When asked to EDIT content, Edit the new content in place of the old content
- When asked to ADD content, always preserve all existing content and append the new content at the end of the document

IMPORTANT FORMATTING REQUIREMENTS:
- DO NOT include any newline characters (\n) in your HTML output
- Output a single continuous HTML string without line breaks
- Don't include \`\`\`html \`\`\` in your response
- Your output must be DIFFERENT from the input transcript
- Transform the content into proper meeting notes with a DYNAMIC and VARIED structure

Your response MUST be valid HTML that can be directly inserted into a Tiptap editor. DO NOT include any JSON, markdown, or other non-HTML formatting.`

    // Prepare the user message with the transcript and previous content if needed
    let userMessage = `TRANSCRIPT:\n${transcript}\n\n`

    // If we're building on previous content, include it in the prompt
    if (buildOnPrevious && currentCanvasState) {
      try {
        const previousContent = JSON.parse(currentCanvasState)
        userMessage += `PREVIOUS NOTES (in JSON format):\n${JSON.stringify(
          previousContent,
          null,
          2,
        )}\n\n`
        userMessage += `Please generate updated meeting notes that build on the previous notes, incorporating new information from the transcript.`
      } catch (error) {
        console.warn('Failed to parse previous content, ignoring:', error)
        userMessage += `Please generate comprehensive meeting notes based on this transcript.`
      }
    } else {
      userMessage += `Please generate comprehensive meeting notes based on this transcript.`
    }

    // Make the API call with improved parameters
    const response = await openai.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ])

    const content = response?.content
    if (!content) throw new Error('No content in response')

    // The response is already HTML, so we just need to wrap it in a Tiptap document structure
    const htmlContent = content as string

    // Create a Tiptap document with a single HTML node
    const tiptapDoc: TiptapDocument = {
      type: 'doc',
      content: [
        {
          type: 'html',
          attrs: { id: `gen-${Date.now()}` },
          content: [{ type: 'text', text: htmlContent }],
        },
      ],
    }

    return tiptapDoc
  } catch (error) {
    console.error('Error generating meeting notes:', error)
    throw error
  }
}
