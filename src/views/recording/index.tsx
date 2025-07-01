"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Folder, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrentContext from "./CurrentContext";
import LiveTranscription from "./LiveTranscription";
import AnalyticsProfile from "./AnalyticsProfile";
import VoiceMarkers from "./VoiceMarkers";
import ConversationCards from "./ConversationCards";
import MeetingNotes from "./MeetingNotes";
import RecordingSpeech from "./RecordingSpeech";
import ContextPackSelect from "./ContextPackSelect";
import { HotLinkSettingsModal } from "./HotLinkSettingModal";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import dynamic from "next/dynamic";
import HotLinkWidgetDisplay from "./HotLinkWidget";
import AddAnalyticsModal from "./AnalyticsModal/AddAnalyticsModal";
import { AnalyticsProfileFormData } from "@/types/contextPack";

const ContextPack = dynamic(() => import("./ContextPackModal/ContextPack"), {
  ssr: false,
});

const ResponsiveGridLayout = WidthProvider(Responsive);

const STORAGE_KEY = "recording-layout";

const Recording = () => {
  const [editMode, setEditMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hotLinkModal, setHotLinkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [addAnalyticsModal, setAddAnalyticsModal] = useState(false);
  const [editProfile, setEditProfile] =
    useState<AnalyticsProfileFormData | null>(null);

  // Components mapped to layout keys
  const components = useMemo(
    () => ({
      a: <LiveTranscription key="a" />,
      b: (
        <AnalyticsProfile
          key="b"
          setAddAnalyticsModal={setAddAnalyticsModal}
          setEditProfile={setEditProfile}
        />
      ),
      c: <VoiceMarkers key="c" />,
      d: <ConversationCards key="d" />,
      e: <MeetingNotes key="e" />,
    }),
    []
  );
  // Default layout
  const defaultLayout = useMemo<Layout[]>(() => {
    const componentKeys = Object.keys(components) as string[];
    const itemsPerRow = 3;
    const itemHeight = 3;

    return componentKeys.map((key, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const y = row * itemHeight;

      return {
        i: key,
        x: col,
        y: y,
        w: 1,
        h: itemHeight,
        minW: 1,
        maxW: 3,
        minH: 3,
        maxH: 12,
        isResizable: true,
        isDraggable: true,
      };
    });
  }, [components]);

  const [layouts, setLayouts] = useState<Layouts>({ lg: defaultLayout });

  // Load layout from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLayout = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.lg) {
            setLayouts(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load layout:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();

    const handleResize = () => {
      window.dispatchEvent(new Event("resize"));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save layout to localStorage on change
  const onLayoutChange = useCallback((_: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
    } catch (error) {
      console.error("Failed to save layout:", error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header & Buttons */}
      <div className="p-8 flex-1 overflow-y-auto bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Recording Canvas</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setEditMode(!editMode)}
              className={`rounded-4xl text-white flex items-center gap-2 cursor-pointer ${
                editMode
                  ? "bg-primary-400"
                  : "bg-primary-600 hover:bg-primary-500"
              }`}
            >
              <Pencil />
              Edit Mode
            </Button>
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-4xl bg-gray-100 text-gray-900 hover:bg-gray-200 flex items-center gap-2 cursor-pointer"
            >
              <Folder />
              Context Pack
            </Button>
          </div>
        </div>
        {/* Current Context */}
        <CurrentContext />
        {/* Grid Layout */}
        <div className="min-h-screen flex flex-col gap-5 mt-6">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
              rowHeight={55}
              isResizable={true}
              isDraggable={true}
              compactType="vertical"
              onLayoutChange={onLayoutChange}
              margin={[24, 24]}
              useCSSTransforms={false}
              autoSize={true}
              draggableCancel="button, input, textarea, select, option, [role='button']"
            >
              {Object.entries(components).map(([key, component]) => {
                return (
                  <div
                    key={key}
                    className="bg-white shadow rounded-3xl hover:shadow-md cursor-pointer border border-gray-200 transition-shadow  "
                  >
                    {component}
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 w-full bg-white shadow-md z-10">
        <ContextPackSelect setIsOpen={setIsOpen} />
        <RecordingSpeech
          editMode={editMode}
          setHotLinkModal={setHotLinkModal}
        />
      </div>
      <HotLinkWidgetDisplay />

      {/* Modals */}
      <ContextPack isOpen={isOpen} setIsOpen={setIsOpen} />
      <HotLinkSettingsModal
        isOpen={hotLinkModal}
        onClose={() => setHotLinkModal(false)}
      />
      <AddAnalyticsModal
        isOpen={addAnalyticsModal}
        onClose={() => setAddAnalyticsModal(false)}
        defaultValues={editProfile}
      />
    </div>
  );
};

export default Recording;
