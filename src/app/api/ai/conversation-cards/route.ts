import { NextResponse } from 'next/server'
import { generateConversationCards } from '@/lib/ai/openai'

export async function POST(request: Request) {
  try {
    const {
      user_name,
      person,
      person_relationship,
      goal,
      goal_secondary,
      document_context,
      specificity_level,
      date,
    } = await request.json()
    // Validate payload
    // if (
    //   !user_name ||
    //   !person ||
    //   !person_relationship ||
    //   !goal ||
    //   !goal_secondary ||
    //   !document_context ||
    //   !specificity_level ||
    //   !date
    // ) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: 'All fields are required',
    //     },
    //     { status: 400 },
    //   )
    // }

    // Generate cards content
    const cardsContent = await generateConversationCards({
      user_name,
      person,
      person_relationship,
      goal,
      goal_secondary,
      document_context,
      specificity_level,
      date,
    })

    return NextResponse.json({
      success: true,
      content: cardsContent,
    })
  } catch (error) {
    console.error('Error in generating conversation cards:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
