import { Button } from "@/components/ui/button";
import { StarsIcon } from "lucide-react";

interface AiMenuBarProps {
    onProcess: () => void;
    isLoading: boolean;
    contextPack: { meetingGoal: string; participants: string };
    setContextPack: (context: { meetingGoal: string; participants: string }) => void;
}

export const AiMenuBar = ({
    onProcess,
    isLoading,
    contextPack,
    setContextPack,
}: AiMenuBarProps) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                    type="text"
                    value={contextPack.meetingGoal}
                    onChange={(e) => setContextPack({ ...contextPack, meetingGoal: e.target.value })}
                    placeholder="Meeting Goal (e.g., Discuss Q3 Roadmap)"
                    className="w-full bg-transparent focus:outline-none text-sm p-2 border border-gray-200 rounded-lg"
                    disabled={isLoading}
                />
                <input
                    type="text"
                    value={contextPack.participants}
                    onChange={(e) => setContextPack({ ...contextPack, participants: e.target.value })}
                    placeholder="Participants (comma-separated, e.g., Alice, Bob)"
                    className="w-full bg-transparent focus:outline-none text-sm p-2 border border-gray-200 rounded-lg"
                    disabled={isLoading}
                />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-end">
                    <Button variant="secondary" className="border border-gray-200 bg-indigo-500 text-white hover:bg-indigo-600" onClick={onProcess} disabled={isLoading || !contextPack.meetingGoal.trim()} size="sm">
                        <StarsIcon className="h-4 w-4" />
                        {isLoading ? 'Generating...' : 'Generate Notes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};