// components/ChatSettingsDialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useContextPackStore } from "@/lib/store/context-pack.store";

const ChatSettingsDialog = () => {
    const {
        startWord,
        endWord,
        aiPersonalityName,
        systemPrompt,
        setStartWord,
        setEndWord,
        setAiPersonalityName,
        setSystemPrompt
    } = useContextPackStore();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-500 hover:text-gray-700"
                >
                    <Settings className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Chatbot settings</DialogTitle>
                    <DialogDescription>Customize the chatbot settings</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                        <Label>Start word</Label>
                        <Input
                            placeholder="Start word"
                            value={startWord || ""}
                            onChange={e => setStartWord(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>End word</Label>
                        <Input
                            placeholder="End word"
                            value={endWord || ""}
                            onChange={e => setEndWord(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>System Prompt</Label>
                        <Input
                            placeholder="System Prompt"
                            value={systemPrompt || ""}
                            onChange={e => setSystemPrompt(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>AI personality name</Label>
                        <Input
                            placeholder="AI personality name"
                            value={aiPersonalityName || ""}
                            onChange={e => setAiPersonalityName(e.target.value)}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatSettingsDialog;
