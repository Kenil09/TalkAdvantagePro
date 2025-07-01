import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const FlashWidgets = () => {
  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Flash Widgets</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:text-gray-700"
          onClick={() => console.log("Widget settings clicked")}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        <Button className="w-full p-2 bg-gray-50 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm cursor-pointer">
          GitHub Research
        </Button>
        <Button className="w-full p-2 bg-gray-50 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm cursor-pointer">
          Ticket Analysis
        </Button>
      </div>
    </div>
  );
};

export default FlashWidgets;
