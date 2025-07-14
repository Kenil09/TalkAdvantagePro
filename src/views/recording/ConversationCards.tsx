import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import RGL, { Layout, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useContextPackStore } from "@/lib/store/context-pack.store";
import { useTranscriptionStore } from "@/lib/store/transcription.store";

// Colors for cards
const cardColors = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-yellow-50 border-yellow-200",
  "bg-purple-50 border-purple-200",
];

// cards positions
const cardPositions = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

// Card state types
type CardState = "base" | "growing" | "elongated" | "split";

// Card interface
interface Card {
  id: string;
  topic: string;
  hotlinks: string[];
  content: {
    paragraph: string;
    bullets: string[];
    expansion: string;
  };
  state: CardState;
  triggerCount: number;
  visible: boolean; // whether the card is visible or not
}

// We need to make sure the WidthProvider works correctly
const ReactGridLayout = WidthProvider(RGL);

const ConversationCards = () => {
  // Custom animation classes
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
    `
  };

   const { currentContextPack } = useContextPackStore();
   const { liveText } = useTranscriptionStore();

   console.log("Live Text:", liveText);

   console.log("Selected Context Pack:", currentContextPack);

  // Transcript state (would normally come from real-time transcription)
  // const [transcript, setTranscript] = useState<string>("");
  
  // Cards state
  const [cards, setCards] = useState<Card[]>([]);

  console.log("Cards:", cards);
  
  // Animation states
  const [animatingCardId, setAnimatingCardId] = useState<string | null>(null);
  
  // Dynamic layout state
  const [layout, setLayout] = useState([
    { i: "0", x: 0, y: 0, w: 1, h: 1 },
    { i: "1", x: 1, y: 0, w: 1, h: 1 },
    { i: "2", x: 0, y: 1, w: 1, h: 1 },
    { i: "3", x: 1, y: 1, w: 1, h: 1 },
  ]);
  
  // Add a loading state to track when cards are being fetched
  const [loading, setLoading] = useState(true);

  // Timer for topic shift detection
  const lastTriggerRef = useRef<number>(Date.now());
  
  // Initialize cards on component mount and ensure layout is calculated properly
  useEffect(() => {
    // Generate cards on component mount
    generateInitialCards();
    
    // Add a resize event listener to handle window resizing
    const handleResize = () => {
      setLayout(prevLayout => [...prevLayout]); // Force layout recalculation on resize
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to update layout when cards change
  useEffect(() => {
    if (!loading && cards.length > 0) {
      // Make sure layout ids match card ids
      const newLayout = layout.map((item, index) => {
        if (index < cards.length) {
          return { ...item, i: cards[index].id || String(index) };
        }
        return item;
      });
      
      if (JSON.stringify(newLayout) !== JSON.stringify(layout)) {
        setLayout(newLayout);
      }
      
      // Force a resize event to recalculate layout
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [cards, loading]);

  // Process transcript for trigger words
  useEffect(() => {
    if (liveText) {
      detectTriggerWords(liveText);
    }
  }, [liveText]);

  // Check for topic shift (30s without trigger matches)
  useEffect(() => {
    const checkTopicShift = setInterval(() => {
      const now = Date.now();
      if (now - lastTriggerRef.current > 300000) { // 30 seconds
        generateNewCardSet();
        lastTriggerRef.current = now;
      }
    }, 500000); // Check every 5 seconds
    
    return () => clearInterval(checkTopicShift);
  }, []);

  // Generate initial cards
  const generateInitialCards = async () => {
    setLoading(true);
    try {
      // Create mock cards in case API fails
      const mockCards = [
        {
          id: "0",
          topic: "Value Proposition",
          hotlinks: ["benefits", "solution", "results"],
          content: {
            paragraph: "Our solution offers unique benefits that directly address your needs while delivering measurable results.",
            bullets: [
              "Reduces operational costs by 30%",
              "Improves efficiency across departments",
              "Provides actionable insights through analytics"
            ],
            expansion: "Implementation can begin within two weeks with minimal disruption to your current workflow."
          },
          state: "base" as CardState,
          triggerCount: 0,
          visible: true
        },
        {
          id: "1",
          topic: "Timeline & Process",
          hotlinks: ["schedule", "phases", "milestones"],
          content: {
            paragraph: "Our implementation follows a proven schedule with clear phases and achievable milestones.",
            bullets: [
              "Discovery phase: 1-2 weeks",
              "Implementation: 3-4 weeks",
              "Training and onboarding: 1 week"
            ],
            expansion: "We can adjust the timeline based on your team's availability and priorities."
          },
          state: "base" as CardState,
          triggerCount: 0,
          visible: true
        },
        {
          id: "2",
          topic: "ROI Analysis",
          hotlinks: ["investment", "returns", "metrics"],
          content: {
            paragraph: "Your investment will yield significant returns with clear metrics for measuring success.",
            bullets: [
              "Break-even point within 6 months",
              "200% ROI within first year",
              "Ongoing cost savings of $100K annually"
            ],
            expansion: "We provide monthly reporting to track progress against these financial projections."
          },
          state: "base" as CardState,
          triggerCount: 0,
          visible: true
        },
        {
          id: "3",
          topic: "Next Steps",
          hotlinks: ["meeting", "proposal", "decision"],  
          content: {
            paragraph: "Let's schedule a follow-up meeting to review a detailed proposal and move toward a decision.",
            bullets: [
              "Technical team deep dive",
              "Customized proposal review",
              "Implementation planning session"
            ],
            expansion: "We can bring in subject matter experts for any specific areas you'd like to explore further."
          },
          state: "base" as CardState,
          triggerCount: 0,
          visible: true
        }
      ];
      
      try {
        const response = await fetch('/api/ai/conversation-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_name: currentContextPack?.properties?.name,
            person: currentContextPack?.properties?.nonUserName, 
            person_relationship: "client",
            goal: currentContextPack?.properties?.goal,
            goal_secondary: currentContextPack?.properties?.subGoals[0],
            document_context: currentContextPack?.properties?.contextFactors,
            specificity_level: "medium",
            date: currentContextPack?.properties?.timeline[0],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate cards');
        }

        const cardsData = await response.json();
        console.log("Raw cards data:", cardsData);
        
        // Process the cards data to ensure it matches the Card interface structure
        const processedCards = cardsData?.content?.cards?.map((card: Card, index: number) => ({
          ...card,
          id: String(index), // Ensure IDs are consistent with layout
          state: card.state || "base",
          triggerCount: card.triggerCount || 0,
          visible: card.visible !== undefined ? card.visible : true
        }));
        
        console.log("Processed cards data:", processedCards);
        
        if (Array.isArray(processedCards) && processedCards.length > 0) {
          // Update layout to match card IDs
          const newLayout = layout.map((item, index) => ({
            ...item,
            i: String(index) // Ensure layout IDs match card IDs
          }));
          setLayout(newLayout);
          setCards(processedCards);
        } else {
          console.error("No valid cards data received from API, using mock cards");
          setCards(mockCards);
        }
      } catch (error) {
        console.error("Error generating cards from API:", error);
        console.log("Using mock cards instead");
        setCards(mockCards);
      }
    } catch (error) {
      console.error("Error in card generation:", error);
    } finally {
      setLoading(false);
      // Force a resize event to ensure grid recalculates properly
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }  
  };

  // Detect trigger words in transcript
  const detectTriggerWords = (text: string) => {
    const updatedCards = [...cards];
    let cardUpdated = false;
    
    updatedCards.forEach(card => {
      let i = 0;
      card.hotlinks.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) {
          cardUpdated = true;
          lastTriggerRef.current = Date.now();
          
          // Increment trigger count and update state
          const newTriggerCount = card.triggerCount + 1;
          card.triggerCount = newTriggerCount;

          console.log("newTriggerCount", newTriggerCount);
          
          // Update card state based on trigger count
          if (newTriggerCount === 1) {
            // Growing state: Card grows to 120%, others shrink to 80%
            card.state = "growing";
            setAnimatingCardId(card.id);
            updateLayoutForGrowingCard(card.id, cardPositions[i]);
            
            // Make sure all cards are visible in growing state
            updatedCards.forEach(c => {
              c.visible = true;
            });
            
            setTimeout(() => setAnimatingCardId(null), 300);
          } else if (newTriggerCount === 2) {
            // Elongated state: Card expands vertically (2x1), removes card below/above
            card.state = "elongated";
            setAnimatingCardId(card.id);
            updateLayoutForElongatedCard(card.id, cardPositions[i]);
            setTimeout(() => setAnimatingCardId(null), 500);
          } else if (newTriggerCount === 3) {
            // Split state: Card expands horizontally to take full grid (2x2)
            card.state = "split";
            setAnimatingCardId(card.id);
            updateLayoutForSplitCard(card.id);
            setTimeout(() => setAnimatingCardId(null), 500);
            
            // In a real implementation, we would call the LLM to generate new content for the split card
          }
        }
        i++;
      });
    });
    
    if (cardUpdated) {
      setCards(updatedCards);
    }
  };
  
  // Update layout for growing card (120% height, others 80%)
  const updateLayoutForGrowingCard = (cardId: string | undefined, position: string) => {
    // Early return if cardId is undefined
    if (!cardId) {
      console.error("Card ID is undefined");
      return;
    }
    
    // Create a fresh layout to ensure React detects changes
    const newLayout = layout.map(item => ({ ...item }));
    
    // Find the card index in layout array by matching i value with cardId
    const cardIndex = newLayout.findIndex(item => item.i === cardId);
    const updatedCards = [...cards];
    
    // Check if cardIndex is a valid index in the layout array
    if (cardIndex === -1 || !newLayout[cardIndex]) {
      console.error("Cannot find card with ID:", cardId, "in layout");
      return; // Exit the function if we have an invalid index
    }
    
    // Set the growing card to 120% height
    newLayout[cardIndex].h = 1.2;
    
    // For bottom cards, adjust y position to grow upward
    if (position === "bottomLeft" || position === "bottomRight") {
      newLayout[cardIndex].y = 0.8; // Move up to grow upward
    }
    
    // Determine which card to shrink based on position
    let shrinkCardIndex;
    if (position === "topLeft" || position === "topRight") {
      // If top card is growing, shrink the card below it
      shrinkCardIndex = position === "topLeft" ? 2 : 3;
    } else {
      // If bottom card is growing, shrink the card above it
      shrinkCardIndex = position === "bottomLeft" ? 0 : 1;
    }
    
    // Check if shrinkCardIndex is valid before modifying
    if (shrinkCardIndex !== undefined && newLayout[shrinkCardIndex]) {
      // Shrink the corresponding card to 80%
      newLayout[shrinkCardIndex].h = 0.8;
      
      // Adjust the position of the shrinking card if it's on the bottom
      if (shrinkCardIndex === 2 || shrinkCardIndex === 3) {
        newLayout[shrinkCardIndex].y = 1.2; // Move down to make room for growing card
      }
    } else {
      console.error("Invalid shrink card index:", shrinkCardIndex);
    }
    
    // Apply animation class to the growing card
    setAnimatingCardId(cardId);
    
    console.log("Growing layout:", newLayout);
    
    // Force React to recognize the layout changes
    setTimeout(() => {
      setLayout([...newLayout]);
      setCards([...updatedCards]);
      
      // Force a resize event to ensure grid recalculates
      window.dispatchEvent(new Event('resize'));
    }, 0);
    
    // Reset animation after it completes
    setTimeout(() => setAnimatingCardId(null), 300);
  };

  // Update layout for elongated card (2x1, expands vertically into the corresponding vertical card)
  const updateLayoutForElongatedCard = (cardId: string | undefined, position: string) => {
    // Early return if cardId is undefined
    if (!cardId) {
      console.error("Card ID is undefined");
      return;
    }
    
    // Create a fresh layout to ensure React detects changes
    const newLayout = layout.map(item => ({ ...item }));
    
    // Find the card index in layout array by matching i value with cardId
    const cardIndex = newLayout.findIndex(item => item.i === cardId);
    const updatedCards = [...cards];
    
    // Check if cardIndex is a valid index in the layout array
    if (cardIndex === -1 || !newLayout[cardIndex]) {
      console.error("Cannot find card with ID:", cardId, "in layout");
      return; // Exit the function if we have an invalid index
    }
    
    // Determine which card to expand into based on position (vertical alignment)
    let expandIntoCardIndex;
    
    // First, reset all cards to their original size
    newLayout.forEach(item => {
      item.w = 1;
      item.h = 1;
    });
    
    if (position === "topLeft") {
      // Top-left expands into bottom-left
      expandIntoCardIndex = 2;
      newLayout[cardIndex].h = 2; // Double height
      newLayout[cardIndex].y = 0; // Keep at top
      newLayout[cardIndex].x = 0; // Keep at left
    } else if (position === "topRight") {
      // Top-right expands into bottom-right
      expandIntoCardIndex = 3;
      newLayout[cardIndex].h = 2; // Double height
      newLayout[cardIndex].y = 0; // Keep at top
      newLayout[cardIndex].x = 1; // Keep at right
    } else if (position === "bottomLeft") {
      // Bottom-left expands into top-left
      expandIntoCardIndex = 0;
      newLayout[cardIndex].h = 2; // Double height
      newLayout[cardIndex].y = 0; // Move to top
      newLayout[cardIndex].x = 0; // Keep at left
    } else { // bottomRight
      // Bottom-right expands into top-right
      expandIntoCardIndex = 1;
      newLayout[cardIndex].h = 2; // Double height
      newLayout[cardIndex].y = 0; // Move to top
      newLayout[cardIndex].x = 1; // Keep at right
    }
    
    // Hide the card being expanded into
    updatedCards[expandIntoCardIndex].visible = false;
    
    // Make sure the expanding card and other cards are visible
    updatedCards.forEach((card, idx) => {
      if (idx === cardIndex) {
        card.visible = true;
      } else if (idx !== expandIntoCardIndex) {
        card.visible = true;
      }
    });
    
    // Apply animation class to the elongating card
    setAnimatingCardId(cardId);
    
    console.log("Elongated layout:", newLayout);
    
    // Force React to recognize the layout changes
    setTimeout(() => {
      setLayout([...newLayout]);
      setCards([...updatedCards]);
      
      // Force a resize event to ensure grid recalculates
      window.dispatchEvent(new Event('resize'));
    }, 0);
    
    // Reset animation after it completes
    setTimeout(() => setAnimatingCardId(null), 500);
  };

  // Update layout for split card (expands horizontally to take up entire 4x4 layout)
  const updateLayoutForSplitCard = (cardId: string | undefined) => {
    // Early return if cardId is undefined
    if (!cardId) {
      console.error("Card ID is undefined");
      return;
    }
    
    // Create a fresh layout to ensure React detects changes
    const newLayout = layout.map(item => ({ ...item }));
    
    // Find the card index in layout array by matching i value with cardId
    const cardIndex = newLayout.findIndex(item => item.i === cardId);
    const updatedCards = [...cards];
    
    // Check if cardIndex is a valid index in the layout array
    if (cardIndex === -1 || !newLayout[cardIndex]) {
      console.error("Cannot find card with ID:", cardId, "in layout");
      return; // Exit the function if we have an invalid index
    }
    
    // First, reset all cards to their original size
    newLayout.forEach(item => {
      item.w = 1;
      item.h = 1;
    });
    
    // Set the split card to take up the entire grid (2x2)
    newLayout[cardIndex].w = 2; // Full width
    newLayout[cardIndex].h = 2; // Full height
    newLayout[cardIndex].x = 0; // Start at left
    newLayout[cardIndex].y = 0; // Start at top
    
    // Hide all other cards as the split card takes over the entire grid
    updatedCards.forEach((card, idx) => {
      if (idx !== cardIndex) {
        card.visible = false;
      } else {
        card.visible = true;
      }
    });
    
    // Apply animation class to the splitting card
    setAnimatingCardId(cardId);
    
    console.log("Split layout:", newLayout);
    
    // Force React to recognize the layout changes
    setTimeout(() => {
      setLayout([...newLayout]);
      setCards([...updatedCards]);
      
      // Force a resize event to ensure grid recalculates
      window.dispatchEvent(new Event('resize'));
    }, 0);
    
    // Reset animation after it completes
    setTimeout(() => setAnimatingCardId(null), 500);
  };

  // Generate new card set (would call LLM in real implementation)
  const generateNewCardSet = () => {
    // Reset layout to default 2x2 grid
    setLayout([
      { i: "0", x: 0, y: 0, w: 1, h: 1 },
      { i: "1", x: 1, y: 0, w: 1, h: 1 },
      { i: "2", x: 0, y: 1, w: 1, h: 1 },
      { i: "3", x: 1, y: 1, w: 1, h: 1 },
    ]);
    // For now, we'll just reset the cards to their initial state
    generateInitialCards();
  };

  // Get card styles based on state
  const getCardStyles = (card: Card) => {
    let baseClasses = `border rounded-xl p-4 overflow-auto`;
    let zIndex = 1;
    let animationClass = "";
    
    // Apply animation class if this card is currently animating
    if (animatingCardId === card.id) {
      switch (card.state) {
        case "growing":
          animationClass = " animate-grow";
          break;
        case "elongated":
          animationClass = " animate-elongate";
          break;
        case "split":
          animationClass = " animate-split";
          break;
      }
    }
    
    switch (card.state) {
      case "growing":
        baseClasses += " shadow-md";
        zIndex = 2;
        break;
      case "elongated":
        baseClasses += " shadow-lg";
        zIndex = 3;
        break;
      case "split":
        baseClasses += " shadow-xl";
        zIndex = 4;
        break;
      default:
        break;
    }
    
    return { baseClasses: baseClasses + animationClass, zIndex };
  };

  // Render a single card
  const renderCard = (card: Card, index: number) => {
    if (!card) return null;
    
    const { baseClasses, zIndex } = getCardStyles(card);
    const colorClass = cardColors[index % cardColors.length] || cardColors[0];

    return (
      <div 
        className={`${baseClasses} ${colorClass}`}
        style={{
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          width: '100%',
          zIndex: zIndex,
          transformOrigin: 'center center'
        }}
      >
        <h3 className="font-bold text-2xl mb-2">{card?.topic || 'Topic'}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(card?.hotlinks) ? card.hotlinks.map((word, idx) => (
            <span 
              key={idx} 
              className="text-sm px-2 py-1 bg-white bg-opacity-50 rounded-full"
            >
              {word}
            </span>
          )) : null}
        </div>
        
        {(card.state === "growing" || card.state === "elongated" || card.state === "split") && (
          <p className="text-sm mb-3">{card?.content?.paragraph || ''}</p>
        )}
        
        {(card.state === "elongated" || card.state === "split") && (
          <ul className="list-disc pl-5 mb-3 space-y-1">
            {Array.isArray(card?.content?.bullets) ? card.content.bullets.map((bullet, idx) => (
              <li key={idx} className="text-sm">{bullet}</li>
            )) : null}
          </ul>
        )}
        
        {card.state === "split" && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium">{card?.content?.expansion || ''}</p>
          </div>
        )}
      </div>
    );
  };
  
  // Reset all cards to initial state
  // const resetCards = () => {
  //   const initialLayout = [
  //     { i: "0", x: 0, y: 0, w: 1, h: 1 },
  //     { i: "1", x: 1, y: 0, w: 1, h: 1 },
  //     { i: "2", x: 0, y: 1, w: 1, h: 1 },
  //     { i: "3", x: 1, y: 1, w: 1, h: 1 },
  //   ];
  //   setLayout(initialLayout);
  //   generateInitialCards();
    
  //   // Force a resize event to recalculate layout properly
  //   setTimeout(() => {
  //     window.dispatchEvent(new Event('resize'));
  //     console.log("Layout reset");
  //   }, 0);
  // };

  const onLayoutChange = (newLayout: Layout[]) => {
    // Only update if there's an actual change to avoid infinite loops
    if (JSON.stringify(newLayout) !== JSON.stringify(layout)) {
      setLayout(newLayout);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      {/* Add animation styles */}
      <style jsx>{`
        ${animationStyles.grow}
        ${animationStyles.elongate}
        ${animationStyles.split}
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Conversation Cards</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={() => console.log("Settings clicked")}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto w-full">
        <ReactGridLayout
          className="layout"
          layout={layout}
          cols={2}
          rowHeight={180}
          // Remove the fixed width to allow WidthProvider to calculate it properly
          margin={[10, 10]}
          isDraggable={false}
          isResizable={false}
          compactType={null}
          autoSize={true}
          verticalCompact={false}
          useCSSTransforms={true}
          transformScale={1}
          onLayoutChange={onLayoutChange}
        >
          {loading ? (
            <div key="loading" className="col-span-2 flex items-center justify-center h-full">
              <p className="text-gray-500">Loading conversation cards...</p>
            </div>
          ) : Array.isArray(cards) && cards.length > 0 ? 
            cards.filter(card => card?.visible).map((card: Card, index: number) => {
              // console.log("card in map", card, "layout for card", layout.find(item => item.i === card.id));
              // Use the exact ID as key to ensure React correctly updates the component
              return (
                <div key={card.id || `card-${index}`} className={`transition-all duration-500 ${animatingCardId === card.id ? `animate-${card.state}` : ''}`}>
                  {renderCard(card, index)}
                </div>
              );
            })
          : (
            <div key="no-cards" className="col-span-2 flex items-center justify-center h-full">
              <p className="text-gray-500">No conversation cards available</p>
            </div>
          )}
        </ReactGridLayout>
      </div>
    </div>
  );
};

export default ConversationCards;
