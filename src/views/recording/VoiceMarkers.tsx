import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";

const VoiceMarkers = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Voice Markers</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
        >
          <Settings />
        </Button>
      </div>
      <div className="space-y-4">
        <Input placeholder="Enter trigger words..." className="rounded-full" />
        <div className="flex flex-wrap gap-2">
          <p className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
            action
          </p>
          <p className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
            decision
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceMarkers;
