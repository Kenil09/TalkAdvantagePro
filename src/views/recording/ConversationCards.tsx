import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

type CardType = "decision" | "action" | "question" | "insight";

interface ConversationCard {
  id: string;
  type: CardType;
  title: string;
  timestamp: string;
  content?: string;
}

const ConversationCards = () => {
  const [cards] = useState<ConversationCard[]>([
    {
      id: "1",
      type: "decision",
      title: "Key Decision Point",
      timestamp: "00:15:32",
    },
    {
      id: "2",
      type: "action",
      title: "Action Item",
      timestamp: "00:18:45",
    },
  ]);

  const getCardStyles = (type: CardType) => {
    const baseStyles = "px-4 py-2 border rounded-2xl";
    switch (type) {
      case "decision":
        return `${baseStyles} bg-blue-50 border-blue-200`;
      case "action":
        return `${baseStyles} bg-green-50 border-green-200`;
      case "question":
        return `${baseStyles} bg-yellow-50 border-yellow-200`;
      case "insight":
        return `${baseStyles} bg-purple-50 border-purple-200`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200`;
    }
  };

  const getTextStyles = (type: CardType) => {
    switch (type) {
      case "decision":
        return { title: "text-blue-900", content: "text-blue-700" };
      case "action":
        return { title: "text-green-900", content: "text-green-700" };
      case "question":
        return { title: "text-yellow-900", content: "text-yellow-700" };
      case "insight":
        return { title: "text-purple-900", content: "text-purple-700" };
      default:
        return { title: "text-gray-900", content: "text-gray-700" };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
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

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {cards.length > 0 ? (
          cards.map((card) => {
            const styles = getCardStyles(card.type);
            const textStyles = getTextStyles(card.type);
            return (
              <div
                key={card.id}
                className={`${styles} transition-colors hover:shadow-sm cursor-pointer`}
                onClick={() => console.log("Card clicked:", card.id)}
              >
                <p className={`text-sm font-medium ${textStyles.title}`}>
                  {card.title}
                </p>
                <p className={`text-xs ${textStyles.content} opacity-75`}>
                  Detected at {card.timestamp}
                </p>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No conversation cards yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationCards;
