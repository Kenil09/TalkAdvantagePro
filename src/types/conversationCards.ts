export type CardState = 'base' | 'growing' | 'elongated' | 'split'

// Card interface
export interface Card {
    id: string
    topic: string
    hotlinks: string[]
    content: {
        paragraph: string
        bullets: string[]
        expansion: string
    }
    state: CardState
    triggerCount: number
    visible: boolean // whether the card is visible or not
}