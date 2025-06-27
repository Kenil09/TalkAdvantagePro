import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

const MeetingNotes = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Meeting Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
        >
          <Settings />
        </Button>
      </div>
      <Textarea
        className="w-full h-24 p-2 border border-gray-200 rounded-3xl text-sm resize-none"
        placeholder="Add your notes here..."
      />
    </div>
  );
};

export default MeetingNotes;
