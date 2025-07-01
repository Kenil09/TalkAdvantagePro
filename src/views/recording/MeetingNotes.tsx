import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

const MeetingNotes = () => {
  const [notes, setNotes] = useState("");

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Meeting Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
          onClick={() => {
            // Add settings functionality here
            console.log("Settings clicked");
          }}
        >
          <Settings className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Textarea
          className="w-full h-full p-3 border border-gray-200 rounded-2xl text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary-500"
          placeholder="Add your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ minHeight: "100%" }}
        />
      </div>
    </div>
  );
};

export default MeetingNotes;
