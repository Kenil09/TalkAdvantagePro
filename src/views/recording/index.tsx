"use client";

import { useState } from "react";
import { Folder, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrentContext from "./CurrentContext";
import LiveTranscription from "./LiveTranscription";
import AnalyticsProfile from "./AnalyticsProfile";
import VoiceMarkers from "./VoiceMarkers";
import ConversationCards from "./ConversationCards";
import FlashWidgets from "./FlashWidgets";
import MeetingNotes from "./MeetingNotes";
import RecordingSpeech from "./RecordingSpeech";
import ContextPack from "./ContextPackModal/ContextPack";
import ContextPackSelect from "./ContextPackSelect";
import { HotLinkSettingsModal } from "./HotLinkSettingModal";

const Recording = () => {
  const [editMode, setEditMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hotLinkModal, setHotLinkModal] = useState<boolean>(false);
  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-8 flex-1 overflow-y-auto bg-white-50">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-2xl font-bold">Recording Canvas</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              className={`bg-primary-600 text-white rounded-4xl hover:bg-primary-700 cursor-pointer ${
                editMode ? "bg-primary-400" : ""
              }`}
              onClick={() => setEditMode(!editMode)}
            >
              <Pencil />
              Edit Mode
            </Button>
            <Button
              variant="destructive"
              className="rounded-4xl bg-gray-100 text-gray-900 hover:bg-gray-200 cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <Folder />
              Context Pack
            </Button>
          </div>
        </div>

        <CurrentContext />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <LiveTranscription />
          <AnalyticsProfile />
          <VoiceMarkers />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <ConversationCards />
          <FlashWidgets />
          <MeetingNotes />
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-white shadow-md z-10">
        <ContextPackSelect setIsOpen={setIsOpen} />
        <RecordingSpeech
          editMode={editMode}
          setHotLinkModal={setHotLinkModal}
        />
      </div>
      <ContextPack isOpen={isOpen} setIsOpen={setIsOpen} />
      <HotLinkSettingsModal
        isOpen={hotLinkModal}
        onClose={() => setHotLinkModal(false)}
      />
    </div>
  );
};

export default Recording;
