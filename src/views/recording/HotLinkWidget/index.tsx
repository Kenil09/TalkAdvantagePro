import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOTLINK_WIDGETS } from "@/constants/hotlink-widget.constants";
import { useAuthStore } from "@/lib/store/auth.store";
import useHotLinkDetection from "@/hooks/useHotLinkDetection";
import { contextService } from "@/lib/services/context.service";
import { useTranscriptionStore } from "@/lib/store/transcription.store";
import { Participant } from "@/types/knowledge-graph.types";
import { Copy, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const HotLinkWidgetDisplay = () => {
  const { activeWidget, clearActiveWidget } =
    useHotLinkDetection(HOTLINK_WIDGETS);
  const { liveText } = useTranscriptionStore();
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const { name, triggerWords, model, prompt } = activeWidget || {};

  const runAnalysis = async () => {
    setIsLoading(true);

    try {
      // Get the last 400 words of the transcript
      const words = liveText.split(/\s+/);
      const lastWords = words.slice(-400).join(" ");

      // Get today's date
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Get context for hotlink analysis
      const { contextPack, relevantChunks } =
        await contextService.getContextForAnalysis(
          user?.id || "",
          "hotlink",
          lastWords,
          name
        );

      // Construct the system prompt
      const contextInfo = contextPack
        ? `
    Goal: ${contextPack.goal}
    Sub Goals: ${contextPack.subGoals.join(", ")}
    User Name: ${contextPack.name}
    User Role: ${contextPack.userRole}
    Person: ${contextPack.person}
    Relationship: ${contextPack.personRelationship}

    Participants:
    ${contextPack.participants
      .map(
        (p: Participant) =>
          `- ${p.name} (${p.role}, ${p.relationship_to_user})${
            p.apex_profile
              ? `\n  Profile: ${JSON.stringify(p.apex_profile)}`
              : ""
          }`
      )
      .join("\n")}

    Key Topics: ${contextPack.keyTopics.join(", ")}
    Context Description: ${contextPack.contextDescription}
    Notes: ${contextPack.notes}

    ${
      contextPack.timeline
        ? `Timeline:\n${contextPack.timeline.map((t) => `- ${t}`).join("\n")}`
        : ""
    }
    ${
      contextPack.conflictMap ? `Conflict Map:\n${contextPack.conflictMap}` : ""
    }
    ${
      contextPack.environmentalFactors
        ? `Environmental Factors:\n${contextPack.environmentalFactors}`
        : ""
    }

    Documents:
    ${contextPack.documents
      .map((d) => `- ${d.name}${d.tags ? ` (Tags: ${d.tags.join(", ")})` : ""}`)
      .join("\n")}
    `
        : "";

      const relevantDocs = relevantChunks.length
        ? `\nRelevant Documents:\n${relevantChunks
            .map((chunk) => `- ${chunk.content}`)
            .join("\n")}`
        : "";

      const systemPrompt = `You are an expert in ${name}. Today's date is ${today}. Please perform the analysis according to the template provided. If no template is provided, use your knowledge and provide the result in a well-structured format. Must use Markdown formatting for better readability.

    Context Information:
    ${contextInfo}${relevantDocs}`;

      // Send the request to OpenRouter API
      const response = await fetch("/api/openrouter/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: lastWords,
          systemPrompt,
          prompt: `Here is the template:\n\n${prompt}\n\nHere is the latest transcript:\n\n${lastWords}`,
          model: model,
          isHotLink: true,
          contextPack,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please refresh the page.");
        }
        throw new Error("Failed to analyze transcript");
      }

      const data = await response.json();
      setResult(data?.text);
    } catch (error) {
      console.log("Analysis error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;

    try {
      navigator.clipboard.writeText(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!isLoading && !result && activeWidget) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, result, activeWidget]);

  if (!activeWidget) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="bg-background">
        <div className="p-4 flex flex-col h-full w-full max-w-[60vw] shadow-md max-h-[80vh]">
          <div className="flex w-full items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{name}</h2>
              <div className="flex gap-1">
                {triggerWords?.map((word, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={!result || isLoading}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearActiveWidget}
                className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No analysis results yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotLinkWidgetDisplay;
