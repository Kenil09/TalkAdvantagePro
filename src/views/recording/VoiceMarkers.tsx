import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, X } from "lucide-react";

const VoiceMarkers = () => {
  const [markers, setMarkers] = useState<string[]>(["action", "decision"]);
  const [inputValue, setInputValue] = useState("");

  const handleAddMarker = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!markers.includes(inputValue.trim().toLowerCase())) {
        setMarkers([...markers, inputValue.trim().toLowerCase()]);
      }
      setInputValue("");
    }
  };

  const removeMarker = (markerToRemove: string) => {
    setMarkers(markers.filter((marker) => marker !== markerToRemove));
  };

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Voice Markers</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:text-gray-700"
          onClick={() => console.log("Settings clicked")}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <Input
          placeholder="Type and press Enter to add a marker..."
          className="rounded-full"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddMarker}
        />

        <div className="flex-1 overflow-y-auto pr-1">
          {markers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {markers.map((marker) => (
                <div
                  key={marker}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm group"
                >
                  <span>{marker}</span>
                  <button
                    type="button"
                    onClick={() => removeMarker(marker)}
                    className="transition-opacity text-primary-500 "
                    aria-label={`Remove ${marker}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              No voice markers added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMarkers;
