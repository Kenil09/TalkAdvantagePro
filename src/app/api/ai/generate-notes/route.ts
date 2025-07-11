import { NextResponse } from 'next/server';
import { generateMeetingNotes } from '@/lib/ai/openai';
import { TiptapDocument } from '@/lib/ai/openai';

export async function POST(request: Request) {
    try {
        const { recentTranscript, contextPack, currentCanvasState } = await request.json();
        // Validate transcript
        if (!recentTranscript || recentTranscript.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Transcript is empty or invalid'
                },
                { status: 400 }
            );
        }

        // Generate new content
        let newContent = await generateMeetingNotes({
            transcript: recentTranscript,
            context: {
                meetingGoal: contextPack?.meetingGoal || '',
                participants: Array.isArray(contextPack?.participants)
                    ? contextPack.participants
                    : (contextPack?.participants || '').split(',').map((p: string) => p.trim())
            },
            currentCanvasState,
            buildOnPrevious: true
        });

        // Make sure we have content to work with
        if (!newContent) {
            newContent = {
                type: 'doc' as const,
                content: []
            };
        }
        
        if (!newContent.content || newContent.content.length === 0) {
            // Provide a fallback content if the generated content is empty
            newContent.content = [{
                type: 'paragraph',
                attrs: { id: 'fallback-' + Date.now() },
                content: [{ type: 'text', text: 'No meeting notes could be generated from the transcript.' }]
            }];
        }

        // When there's no existing content, just return the new content
        if (!currentCanvasState || currentCanvasState === '{}') {
            return NextResponse.json({
                success: true,
                content: newContent
            });
        }

        // Only merge if there's existing content
        try {
            const parsedState = JSON.parse(currentCanvasState);
            const mergedContent = mergeContents(parsedState, newContent);
            
            return NextResponse.json({
                success: true,
                content: mergedContent
            });
        } catch (error) {
            console.error('Error merging content:', error);
            // If merging fails, return the new content
            return NextResponse.json({
                success: true,
                content: newContent
            });
        }

    } catch (error) {
        console.error('Error in generate-notes:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Merge existing content with new content
function mergeContents(prev: TiptapDocument, updates: TiptapDocument): TiptapDocument {
    // For simplicity and to fix the issue, we'll prioritize the new content
    // This ensures that the AI-generated notes are always displayed
    
    // Ensure both documents have content arrays
    if (!prev.content) prev.content = [];
    if (!updates.content) updates.content = [];    
    // If updates has content, use it directly instead of trying to merge
    // This ensures we always see the newly generated content
    if (updates.content && updates.content.length > 0) {
        return {
            type: 'doc',
            content: updates.content
        };
    }
    
    // If no updates, keep the previous content
    console.log('No new content, keeping existing content');
    return prev;
}