import { useTranscriptionStore } from "@/lib/store/transcription.store";
import { HotLinkWidget } from "@/types/widget.types";
import { useEffect, useState } from "react";

// const STORAGE_KEY = "hotlink-widgets";
const TRIGGER_COOLDOWN = 5000;

const useHotLinkDetection = (widgets: HotLinkWidget[]) => {
  const { liveText } = useTranscriptionStore();

  const [activeWidget, setActiveWidget] = useState<HotLinkWidget | null>(null);
  const [lastTriggerTime, setLastTriggerTime] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentWidgets, setCurrentWidgets] =
    useState<HotLinkWidget[]>(widgets);

  //   // Update currentWidgets when widgets prop changes
  //   useEffect(() => {
  //     setCurrentWidgets(widgets);
  //   }, [widgets]);

  //   // Listen for changes in localStorage
  //   useEffect(() => {
  //     const handleStorageChange = () => {
  //       const savedWidgets = localStorage.getItem(STORAGE_KEY);
  //       if (savedWidgets) {
  //         try {
  //           const parsedWidgets = JSON.parse(savedWidgets);
  //           setCurrentWidgets(parsedWidgets);
  //         } catch (error) {
  //           console.error("Error parsing widgets from localStorage:", error);
  //         }
  //       }
  //     };

  //     // Listen for storage events
  //     window.addEventListener("storage", handleStorageChange);

  //     // Also check localStorage on mount
  //     handleStorageChange();

  //     return () => {
  //       window.removeEventListener("storage", handleStorageChange);
  //     };
  //   }, []);

  useEffect(() => {
    if (!liveText || !currentWidgets?.length) return;

    // Check if we're within the cooldown period
    const currentTime = Date.now();
    if (currentTime - lastTriggerTime < TRIGGER_COOLDOWN) {
      console.log("Skipping trigger check - within cooldown period");
      return;
    }

    // Check the last few words of the liveText for trigger words
    const words = liveText.split(/\s+/).filter(Boolean);
    const lastFiveWords = words.slice(-5);

    // Debug log the words being checked
    console.log("Checking words:", lastFiveWords);
    console.log("Current widgets:", currentWidgets);

    // Check each widget's trigger words
    for (const widget of currentWidgets) {
      // Check each trigger word
      for (const triggerWord of widget.triggerWords) {
        // Check if any of the last five words match the trigger word (case-insensitive)
        // Remove punctuation from the word before comparison
        const hasMatch = lastFiveWords.some((word) => {
          const cleanWord = word.replace(/[.,?!]/g, "").toLowerCase();
          return cleanWord === triggerWord.toLowerCase();
        });

        if (hasMatch) {
          console.log(
            "Widget triggered:",
            widget.name,
            "by word:",
            triggerWord
          );
          setActiveWidget(widget);
          setLastTriggerTime(currentTime);
          return;
        }
      }
    }
  }, [liveText, currentWidgets, lastTriggerTime]);

  const clearActiveWidget = () => {
    console.log("clearing active widget");
    setActiveWidget(null);
  };

  const setDummy = () => {
    setActiveWidget({
      id: "github",
      name: "GitHub Widget",
      triggerWords: ["github", "code", "repository"],
      model: "Mistral 7B Instruct (Free)",
      prompt:
        "Based on the conversation provided below, your job is to carefully analyze the recent discussion to identify any problems, challenges, issues, or gaps mentioned. Then automatically search for relevant GitHub repositories that could help address these problems, prioritizing repositories with high star counts, recent activity, and good documentation...",
    });
  };

  return { activeWidget, clearActiveWidget, setDummy };
};

export default useHotLinkDetection;
