import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLibraryStore } from "@/lib/store/library.store";
import { Recording } from "@/types/library.types";
import { Brain, Calendar, Download, FileAudio, FileText, Wand2, Zap } from "lucide-react";

const RecordingOptionsModal = ({ recording }: { recording: Recording }) => {
    const { setCurrentMonth, setSelectedDate, setRecordingToRename, setShowTranscriptDialog, setShowRenameDialog } = useLibraryStore()
    const handleDeepAnalysis = () => {
        alert("Deep Analysis feature coming soon");
    };

    const handleLiveAnalysis = () => {
        alert("Live Analysis feature coming soon");
    };

    const handleGoToDate = () => {
        const recordingDate = new Date(recording.created_at);
        console.log(recordingDate);
        setCurrentMonth(new Date(recordingDate.getFullYear(), recordingDate.getMonth(), 1));
        setSelectedDate(recordingDate);
    };

    const handleViewTranscript = () => {
        // Close the options dialog first
        setShowTranscriptDialog(false); // Reset transcript dialog state

        // Use a longer timeout to ensure the first dialog is fully closed
        // before opening the transcript view

        // viewTranscript(recording);

    };

    const handleDownloadTranscript = () => {
        // downloadTranscript(recording.id, recording.name);
    };

    const handleRenameClick = () => {
        setRecordingToRename(recording);
        setShowRenameDialog(true);
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader className="border-b border-emerald-100 dark:border-emerald-900 pb-4">
                <DialogTitle className="text-xl flex items-center">
                    <FileAudio className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    Recording Options
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    {recording.filename}
                </p>
            </DialogHeader>
            <div className="py-3">
                {/* Add Rename button */}
                <div className="flex gap-2 mb-4">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="flex items-center justify-start flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-900"
                            onClick={handleRenameClick}
                        >
                            <FileAudio className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium">Rename recording name</span>
                        </Button>
                    </DialogClose>
                </div>

                {/* Rest of the options */}
                <div className="flex gap-2 mb-4 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-md">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <Wand2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">Analysis Options</h3>
                        <div className="mt-2 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDeepAnalysis}
                            >
                                <Brain className="mr-2 h-4 w-4" />
                                Deep Analysis
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleLiveAnalysis}
                            >
                                <Zap className="mr-2 h-4 w-4" />
                                Live Analysis
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Button
                        variant="outline"
                        className="flex-1 justify-start"
                        onClick={handleGoToDate}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Go to Date
                    </Button>
                </div>

                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button
                            variant="outline"
                            className="flex-1 justify-start"
                            onClick={handleViewTranscript}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            View Transcript
                        </Button>
                    </DialogClose>
                    <Button
                        variant="outline"
                        className="flex-1 justify-start"
                        onClick={handleDownloadTranscript}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Transcript
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
};

export default RecordingOptionsModal;