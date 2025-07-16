import { useState, useEffect, useRef, useCallback } from "react";
import { useTranscriptionStore } from "@/lib/store/transcription.store";
import { motion } from "framer-motion";
import { useRecordingStore } from "@/lib/store/recording.store";
import ChatSettingsDialog from "./ChatSettingsDialog";
import { containerVariants, dotVariants } from "@/lib/framer-motion";
import { generateChatBotService } from "@/lib/llm/services/chatbot.service";
import { format } from "date-fns";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  id?: string | number;
  timestamp?: string;
}

const ChatBot = () => {
  const { liveText, getLastFewMinTranscript } = useTranscriptionStore();
  const { startWord, endWord, aiPersonalityName } = useRecordingStore();
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const lastProcessedRef = useRef("");
  const lastTriggerIdxRef = useRef(-1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Process transcript to detect commands
  const processTranscript = useCallback((transcript: string) => {
    if (!transcript) {
      console.log("[DEBUG] Empty transcript, skipping");
      return;
    }

    if (transcript === lastProcessedRef.current) {
      console.log("[DEBUG] Duplicate transcript, skipping");
      return;
    }

    // Store the current transcript for comparison
    lastProcessedRef.current = transcript;

    // Convert to lowercase for case-insensitive matching
    const lowerTranscript = transcript.toLowerCase();
    const startWords = (startWord || "Alexa").toLowerCase();
    const endWords = (endWord || "Done").toLowerCase();

    // Find the last occurrence of the start and end words
    const startIdx = lowerTranscript.lastIndexOf(startWords);
    const endIdx = lowerTranscript.lastIndexOf(endWords);
    // If we have both start and end words in the right order
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      // Only process if we haven't processed this end marker before
      if (endIdx > lastTriggerIdxRef.current) {
        // Extract the question between start and end words
        const questionStart = startIdx + startWords.length;
        let questionText = transcript.slice(questionStart, endIdx).trim();

        // Clean up the question text (remove any extra spaces, punctuation, etc.)
        questionText = questionText.replace(/^[\s,.!?]+|[\s,.!?]+$/g, '');

        if (questionText) {
          // Update the chat with user's question
          setChat(prev => {
            return [...prev, { role: "user" as const, text: questionText, timestamp: new Date().toISOString() }];
          });
          // Set the question to trigger LLM response
          setQuestion(questionText);
          lastTriggerIdxRef.current = endIdx;
          return; // Exit early after processing a complete command
        } else {
          console.log("[DEBUG] Extracted question text was empty after cleaning");
        }
      } else {
        console.log("[DEBUG] End marker already processed, skipping");
      }
    } else {
      if (startIdx === -1) console.log("[DEBUG] - No start word found");
      if (endIdx === -1) console.log("[DEBUG] - No end word found");
      if (startIdx > endIdx) console.log("[DEBUG] - Start word appears after end word");
    }
  }, [startWord, endWord]);

  // Detect command in transcript
  useEffect(() => {
    const transcript = getLastFewMinTranscript ? getLastFewMinTranscript() : liveText;
    processTranscript(transcript);
  }, [liveText, getLastFewMinTranscript, processTranscript]);

  // Invoke LLM when a new question is detected
  useEffect(() => {
    if (!question || !aiPersonalityName) {
      console.log("[LLM] No question or aiPersonalityName to process");
      return;
    }
    let cancelled = false;
    const typingId = Date.now(); // Unique ID for the typing indicator

    // Add a typing indicator
    setChat(prev => {
      return [...prev, { role: "ai" as const, text: "...", id: typingId }];
    });

    const generateResponse = async () => {
      try {
        const response = await generateChatBotService({ question, aiPersonalityName });
        if (cancelled) {
          console.log("[LLM] Request was cancelled, aborting...");
          return;
        }

        // Remove typing indicator and add the actual response
        setChat(prev => {
          const updatedChat = [
            ...prev.filter(msg => msg.id !== typingId),
            { role: "ai" as const, text: response }
          ];
          return updatedChat;
        });

      } catch (err) {
        console.error("Exception during LLM call:", err);

        if (!cancelled) {
          const errorMessage = err instanceof Error ?
            `${err.message}${err.stack ? '\n' + err.stack : ''}` :
            String(err);
          console.error("Full error details:", errorMessage);
          // Remove typing indicator and show error
          setChat(prev => {
            const errorChat = [
              ...prev.filter(msg => msg.id !== typingId),
              {
                role: "ai" as const,
                text: `I'm having trouble connecting to the AI service. Please check your API key and try again.\n\nError: ${errorMessage.substring(0, 200)}`
              }
            ];
            return errorChat;
          });
        }
      } finally {
        if (!cancelled) {
          setQuestion("");
        }
      }
    };

    generateResponse().catch(err => {
      console.error("Unhandled error in generateResponse:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [question, aiPersonalityName]);

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Chat Bot</h3>
        <ChatSettingsDialog />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-2 relative" ref={chatContainerRef}>
        {chat.length === 0 ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-4 bg-white rounded-lg p-4 max-w-sm mx-auto">
              {/* Text content */}
              <div>
                <p className="text-gray-700 text-base font-medium">
                  Hello, I&apos;m your chatbot <span className="text-indigo-600">&quot;{aiPersonalityName}&quot;</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-lg p-4">
              <div className="text-gray-700 mb-3">
                <p className="font-medium mb-2">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Start with <span className="font-mono">&quot;{startWord}&quot;</span></li>
                  <li>Ask anything you want!</li>
                  <li>End with <span className="font-mono">&quot;{endWord}&quot;</span></li>
                </ol>
              </div>

              <div className="bg-white rounded-md border border-gray-200 p-3 text-sm font-mono text-gray-500 overflow-auto max-h-24 whitespace-pre-wrap">
                <p className="font-semibold">Live transcript:</p>
                <p><span className="font-semibold">{startWord}</span>. Ask a question <span className="font-semibold">{endWord}</span>.</p>
              </div>
            </div>
          </div>
        ) : (
          chat.map((msg, idx) => (
            <div
              key={msg.id ?? idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className={`flex items-end gap-2 ${msg.role === "ai" ? "flex-row" : "flex-row-reverse"}`}>
                {/* AI avatar */}
                {msg.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-semibold">
                    {(aiPersonalityName)[0].toUpperCase()}
                  </div>
                )}

                {/* Message bubble with tail */}
                <div className={`relative max-w-xs`}>
                  <div
                    className={`
            px-4 py-2 ${msg.role === "ai" ? "rounded-r-lg rounded-tl-2xl" : "rounded-l-lg rounded-tr-2xl"} shadow text-sm whitespace-pre-line relative
            ${msg.role === "user"
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-100 text-gray-900 mr-auto"
                      }
            ${msg.role === "user" ? "message-tail-right" : "message-tail-left"}
          `}
                  >
                    {msg.text === "..." ? <TypingDots /> : msg.text}
                  </div>
                </div>
              </div>
              {/* Timestamp */}
              <span className="text-xs text-gray-400 mt-1">
                {msg.timestamp ? format(new Date(msg.timestamp), "hh:mm a") : ""}
              </span>
            </div>
          )))
        }
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatBot;

export const TypingDots = () => (
  <motion.div
    className="flex items-center space-x-1 py-1 px-2"
    variants={containerVariants}
    initial="hidden"
    animate="animate"
  >
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-gray-500 rounded-full"
        variants={dotVariants}
      />
    ))}
  </motion.div>
);
