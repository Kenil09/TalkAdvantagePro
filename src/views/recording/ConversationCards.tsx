import { useState, useEffect, useCallback } from 'react'
import { useTranscriptionStore } from '@/lib/store/transcription.store'
import {
  ConversationCard,
  useRecordingStore,
} from '@/lib/store/recording.store'
import { Card, CardState } from '@/types/conversationCards'
import ConversationCardsDialog from './ConversationCardsDialog'
import { Button } from "@/components/ui/button"

// Colors for cards
const cardColors = [
  'bg-blue-50 border-blue-200',
  'bg-green-50 border-green-200',
  'bg-yellow-50 border-yellow-200',
  'bg-purple-50 border-purple-200',
]
const animationStyles = {
  grow: `@keyframes grow {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.animate-grow { animation: grow 0.3s ease-in-out; }`,

  elongate: `@keyframes elongate {
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
  100% { transform: scaleY(1.05); }
}
.animate-elongate { animation: elongate 0.5s ease-in-out; }`,

  split: `@keyframes split {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1.02); }
}
.animate-split { animation: split 0.5s ease-in-out; }

.react-grid-item {
  transition: all 500ms ease;
}
`,
}
const ConversationCards = () => {
  const {
    conversationCards,
    fetchConversationCards,
    isLoading,
    updateConversationCards,
  } = useRecordingStore()
  const { liveText, detectWords } = useTranscriptionStore()

  // const [animatingCardId, setAnimatingCardId] = useState<string | null>(null)
  const [currentActiveCard, setCurrentActiveCard] = useState<{
    id: string
    state: 'growing' | 'elongated' | 'split'
  } | null>(null)
  const [matchedWords, setMatchedWords] = useState<
    { word: string; index: number }[]
  >([])

  const generateInitialCards = useCallback(() => {
    try {
      fetchConversationCards()
    } catch (error) {
      console.error('Error in card generation:', error)
    }
  }, [fetchConversationCards])

  useEffect(() => {
    generateInitialCards()
  }, [generateInitialCards])

  // Detect trigger words
  const getNextActiveCard = useCallback(
    (
      cards: Card[],
      transcription: string,
      currentActiveCard: { id: string; state: CardState } | null,
    ): { id: string; state: CardState } | null => {
      // Build lookup: word → { cardId, posInHotlinks }
      const lookup = new Map<string, { cardId: string; pos: number }>()
      cards.forEach(({ id, hotlinks }) =>
        hotlinks.forEach((word, pos) =>
          lookup.set(word.toLowerCase(), { cardId: id, pos }),
        ),
      )

      // Detect all hotlink words in the transcript
      const { matchedWords } = detectWords(
        Array.from(lookup.keys()),
        transcription,
      )
      if (!matchedWords.length) return null

      if (matchedWords.length) {
        setMatchedWords([matchedWords[matchedWords.length - 1]])
      }
      // Enrich each hit with cardId + pos, sort by text index
      const hits = matchedWords
        .map(({ word, index }) => {
          const info = lookup.get(word.toLowerCase())!
          return { ...info, index }
        })
        .sort((a, b) => a.index - b.index)

      // Start with an internal state:
      // if no activeCard ⇒ treat as "base" (id=null)
      let localId = currentActiveCard?.id ?? null
      let localState: 'base' | 'growing' | 'elongated' | 'split' =
        currentActiveCard?.state ?? 'base'

      // Step through each hit in order
      for (const hit of hits) {
        const { cardId, pos } = hit

        // 1) if it's a first-hotlink (pos=0) for ANY card → immediately grow that card
        if (pos === 0) {
          localId = cardId
          localState = 'growing'
          continue
        }

        // 2) if we're already growing that same card and see its second-hotlink → elongated
        if (localId === cardId && localState === 'growing' && pos === 1) {
          localState = 'elongated'
          continue
        }

        // 3) if we're elongated on that same card and see its third-hotlink → split
        if (localId === cardId && localState === 'elongated' && pos === 2) {
          localState = 'split'
          continue
        }

        // otherwise: ignore this hit
      }

      // If we ended up with a real state transition, return it
      if (localId && localState !== currentActiveCard?.state) {
        return { id: localId, state: localState }
      }
      return null
    },
    [detectWords],
  )

  useEffect(() => {
    if (!liveText) return
    const nextCard = getNextActiveCard(
      conversationCards,
      liveText,
      currentActiveCard,
    )
    if (nextCard) {
      updateConversationCards(nextCard)
      setCurrentActiveCard({
        id: nextCard.id,
        state: nextCard.state as 'growing' | 'elongated' | 'split',
      })
    }
  }, [
    liveText,
    conversationCards,
    getNextActiveCard,
    currentActiveCard,
    updateConversationCards,
  ])

  const getCardStyles = (card: Card) => {
    const isActive = currentActiveCard?.id === card.id
    const state = isActive ? currentActiveCard?.state : 'base'
    const isSplitState = currentActiveCard?.state === 'split'

    let baseClasses =
      'border rounded-xl p-4 overflow-auto transition-all duration-500'
    let zIndex = 1
    let extraClass = ''
    let widthClass = 'w-full'
    let heightClass = 'h-full'
    let animationClass = ''

    if (isActive) {
      switch (state) {
        case 'growing':
          animationClass = ' animate-grow'
          extraClass = ''
          baseClasses += ' shadow-md'
          zIndex = 2
          break
        case 'elongated':
          extraClass = 'col-span-2 '
          animationClass = ' animate-elongate'
          baseClasses += ' shadow-lg'
          zIndex = 3
          break
        case 'split':
          widthClass = 'w-full'
          heightClass = 'h-auto'
          animationClass = ' animate-split'
          baseClasses += ' shadow-xl'
          zIndex = 4
          break
        default:
          break
      }
    }

    // Hide inactive cards when a card is in split state
    const isHidden = isSplitState && !isActive

    return {
      className: `${baseClasses} ${extraClass} ${widthClass} ${heightClass} ${isHidden ? 'hidden' : ''
        } ${animationClass}`,
      zIndex,
      isHidden,
    }
  }

  const highlightMatchedWords = (
    text: string,
    matchedWords: string[],
  ): React.ReactNode => {
    if (!text || !matchedWords?.length) return text
    console.log(matchedWords)
    const wordsToHighlight = new Set(matchedWords.map((w) => w.toLowerCase()))
    const parts = text.split(/(\s+)/) // Split by whitespace but keep it

    return parts.map((part, index) => {
      const cleanWord = part.replace(/[^\w]/g, '').toLowerCase() // Strip punctuation for matching
      if (wordsToHighlight.has(cleanWord)) {
        return (
          <span key={index} className="font-bold">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const renderCard = (card: Card, index: number, isHidden: boolean) => {
    const { className, zIndex } = getCardStyles(card)
    const colorClass = cardColors[index % cardColors.length] || cardColors[0]
    const isActive = currentActiveCard?.id === card.id
    const cardState = isActive ? currentActiveCard?.state : 'base'
    return (
      <div
        className={`${className} ${colorClass} ${isHidden ? 'hidden' : ''}`}
        style={{
          zIndex,
          animationDuration: '0.5s',
          animationFillMode: 'forwards',
        }}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="font-bold text-2xl">{card.topic || 'Topic'}</h2>

          <div className="flex flex-wrap gap-2">
            {Array.isArray(card?.hotlinks) &&
              card.hotlinks.map((word, idx) => (
                <span
                  key={idx}
                  className="text-sm px-2 py-1 bg-white bg-opacity-50 rounded-full"
                >
                  {word}
                </span>
              ))}
          </div>
        </div>

        {isActive && (
          <>
            {(cardState === 'growing' ||
              cardState === 'elongated' ||
              cardState === 'split') && (
                // <p className="text-sm mb-3">{card?.content?.paragraph || ''}</p>
                <p className="text-sm mb-3">
                  {highlightMatchedWords(
                    card?.content?.paragraph || '',
                    matchedWords.map((m) => m.word),
                  )}
                </p>
              )}

            {(cardState === 'elongated' || cardState === 'split') && (
              <ul className="list-disc pl-5 mb-3 space-y-1">
                {/* {card.content?.bullets?.map((bullet, idx) => (
                  <li key={idx} className="text-sm">
                    {bullet}
                  </li>
                ))} */}
                {card.content?.bullets?.map((bullet, idx) => (
                  <li key={idx} className="text-sm">
                    {highlightMatchedWords(
                      bullet,
                      matchedWords.map((m) => m.word),
                    )}
                  </li>
                ))}
              </ul>
            )}

            {cardState === 'split' && (
              <div className="mt-4 pt-4 border-t">
                {/* <p className="text-sm font-medium">{card?.content?.expansion}</p> */}
                <p className="text-sm font-medium">
                  {highlightMatchedWords(
                    card?.content?.expansion || '',
                    matchedWords.map((m) => m.word),
                  )}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  const getGridLayout = () => {
    switch (currentActiveCard?.state) {
      case 'elongated':
        return 'grid grid-cols-2  auto-rows-[180px] h-auto gap-4'
      case 'split':
        return 'w-full'
      default:
        return 'grid grid-cols-2 auto-rows-[180px] gap-4'
    }
  }

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <style jsx>{`
        ${animationStyles.grow}
        ${animationStyles.elongate}
        ${animationStyles.split}
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Conversation Cards</h3>
        <div className="flex items-center gap-2">
          <Button variant="default" className="px-2 !py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs transition-colors cursor-pointer" onClick={() => generateInitialCards()}>
            Regenerate cards
          </Button>
          {process.env.NEXT_PUBLIC_IS_LOCAL_ENVIRONMENT === 'local' && (
            <ConversationCardsDialog />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto w-full p-2">
        <div
          className={getGridLayout()}
          style={{
            alignItems:
              currentActiveCard?.state === 'elongated' &&
                ['2', '3'].includes(currentActiveCard.id)
                ? 'end'
                : 'unset',
          }}
        >
          {isLoading ? (
            <div
              key="loading"
              className="col-span-2 flex items-center justify-center h-full"
            >
              <p className="text-gray-500">Loading conversation cards...</p>
            </div>
          ) : Array.isArray(conversationCards) &&
            conversationCards.length > 0 ? (
            conversationCards.map((card: ConversationCard, index: number) => {
              const activeIndex = conversationCards.findIndex(
                (c) => c.id === currentActiveCard?.id,
              )
              const isElongated = currentActiveCard?.state === 'elongated'

              // For any card, hide the card that's two positions away when in elongated state
              const isHidden =
                isElongated &&
                (index === (activeIndex + 2) % conversationCards.length || // Hide card two positions after
                  (activeIndex >= 2 && index === activeIndex - 2)) // Hide card two positions before
              return (
                <div
                  key={`${card.id}-${index}`}
                  className={`transition-all duration-500 h-full ${currentActiveCard?.id === card.id
                    ? `animate-${card.state} ${currentActiveCard?.state === 'elongated'
                      ? '!h-[208%] !z-10'
                      : ''
                    }`
                    : ''
                    }`}
                >
                  {renderCard(card, index, isHidden)}
                </div>
              )
            })
          ) : (
            <div
              key="no-cards"
              className="col-span-2 flex items-center justify-center h-full"
            >
              <p className="text-gray-500">No conversation cards available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationCards
