import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranscriptionStore } from "@/lib/store/transcription.store";

const LiveTranscription = () => {
  const { liveText } = useTranscriptionStore();

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Live Transcription</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
        >
          <Settings />
        </Button>
      </div>
      <div className="h-32 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 overflow-y-auto">
        {liveText ? (
          <div className="flex flex-col space-y-2">
            {liveText
              .split(".")
              .filter(Boolean)
              .map((sentence, idx) => {
                // TODO: Check if this is a Curiosity Engine entry

                return (
                  <p
                    key={idx}
                    className={`animate-fade rounded p-1.5 ${
                      idx % 2 === 0
                        ? "bg-primary-50 text-primary-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {sentence.trim()}.
                  </p>
                );
              })}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="animate-pulse">●</span>
              <span>Transcribing in real-time...</span>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default LiveTranscription;
