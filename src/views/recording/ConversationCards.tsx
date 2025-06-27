import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const ConversationCards = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Conversation Cards</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
        >
          <Settings />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-3xl">
          <p className="text-sm font-medium text-blue-900">
            Key Decision Point
          </p>
          <p className="text-xs text-blue-700">Detected at 00:15:32</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-3xl">
          <p className="text-sm font-medium text-green-900">Action Item</p>
          <p className="text-xs text-green-700">Detected at 00:18:45</p>
        </div>
      </div>
      {/* Next: "Add conversation card templates" */}
    </div>
  );
};

export default ConversationCards;
