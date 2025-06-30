import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText, Goal, Loader2, User, Users, X } from "lucide-react";
import BasicContextPack from "./BasicContextPack";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import PeopleContextPack from "./PeopleContextPack";
import GoalsContextPack from "./GoalsContextPack";
import {
  ContextPackProps,
  Document as DocumentType,
  FormValues,
  Participant,
} from "@/types/contextPack";
import DocumentsContextPack from "./DocumentsContextPack";
import { createContextPack } from "@/lib/weaviate/actions";
import TimelineContextPack from "./TimelineContextPack";
import { useAuth } from "@/context/auth.context";
import useFormSubmit from "@/hooks/useFormSubmit";

const ContextPack = ({
  isOpen,
  setIsOpen,
  existingPack = {},
}: ContextPackProps) => {
  const { user } = useAuth();

  const methods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      name: existingPack?.name || "",
      description: existingPack?.description || "",
      userInfo: {
        name: existingPack?.userInfo?.name || "",
        role: existingPack?.userInfo?.role || "",
        nonUser: existingPack?.userInfo?.nonUser || "",
        prospect: existingPack?.userInfo?.prospect || "",
      },
      participants: existingPack?.participants || [],
      strategicObjectives: {
        mainGoal: existingPack?.strategicObjectives?.mainGoal || "",
        subGoals: existingPack?.strategicObjectives?.subGoals?.length
          ? existingPack.strategicObjectives.subGoals
          : [""],
      },
      documents: existingPack?.documents || [],
      timeline: existingPack?.timeline || "",
      context: existingPack?.context || "",
      preInteractionNotes: {
        description: existingPack?.preInteractionNotes?.description || "",
        keyTopics: existingPack?.preInteractionNotes?.keyTopics || [],
        additionalNotes:
          existingPack?.preInteractionNotes?.additionalNotes || "",
      },
      timelineContext: {
        timelineItems: existingPack?.timelineContext?.timelineItems || [],
        alliancesRivalries:
          existingPack?.timelineContext?.alliancesRivalries || "",
        contextFactors: existingPack?.timelineContext?.contextFactors || "",
      },
    },
  });
  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: "",
      role: "",
      relationship: "",
    };
    const currentParticipants = methods.getValues("participants") || [];
    methods.setValue("participants", [...currentParticipants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    const currentParticipants = methods.getValues("participants") || [];
    methods.setValue(
      "participants",
      currentParticipants.filter(
        (participant: Participant) => participant.id !== id
      )
    );
  };

  const addSubGoal = () => {
    const currentSubGoals = methods.getValues("strategicObjectives.subGoals");
    methods.setValue("strategicObjectives.subGoals", [...currentSubGoals, ""]);
  };

  const removeSubGoal = (index: number) => {
    const currentSubGoals = methods.getValues("strategicObjectives.subGoals");
    methods.setValue(
      "strategicObjectives.subGoals",
      currentSubGoals.filter((_, i) => i !== index)
    );
  };

  const addDocument = () => {
    const newDoc: DocumentType = {
      id: Date.now().toString(),
      name: "",
      file: "",
      type: "pdf",
      tags: "",
    };
    const currentDocuments = methods.getValues("documents") as DocumentType[];
    if (!currentDocuments) return;
    methods.setValue("documents", [...(currentDocuments || []), newDoc]);
    return newDoc;
  };

  const removeDocument = (id: string) => {
    const currentDocuments = methods.getValues("documents") as DocumentType[];
    if (!currentDocuments) return;

    methods.setValue(
      "documents",
      currentDocuments.filter((doc) => {
        // Ensure we're comparing strings and handle potential undefined values
        const docId = doc?.id?.toString();
        const fieldId = id?.toString();
        return docId !== fieldId;
      })
    );
  };

  const onSubmit = async (data: FormValues) => {
    await createContextPack(data, user?.id || "");
  };

  const { handleSubmit, loading, error } = useFormSubmit<FormValues>({
    onSubmit: (data) => onSubmit(data),
    onSuccess: () => setIsOpen(false),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="!max-w-[800px] bg-white-50 p-0 max-h-[90vh] overflow-y-auto gap-0 [&>button]:hidden">
        {/* Header */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 ">
              <div className="flex items-start space-x-3 mb-2">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Create Context Pack
                  </DialogTitle>
                  <p className="text-blue-100 text-sm">
                    Organize people, documents, and objectives for meaningful
                    conversations
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            {error && (
              <div className="px-6 py-2 text-red-500 text-sm">{error}</div>
            )}

            <div className="px-6 py-4">
              <Tabs defaultValue="account">
                <TabsList className="shadow-none bg-white gap-4">
                  <TabsTrigger
                    value="account"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <User className="size-5" /> Basic
                  </TabsTrigger>
                  <TabsTrigger
                    value="people"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <Users className="size-5" /> People
                  </TabsTrigger>
                  <TabsTrigger
                    value="goals"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer w-24 h-8"
                  >
                    <Goal className="size-5" /> Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer h-8"
                  >
                    <FileText className="size-5" /> Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="!shadow-none data-[state=active]:border-b data-[state=active]:border-primary-700 data-[state=active]:text-primary-500 text-base !py-3 !px-2 cursor-pointer h-8"
                  >
                    <Clock className="size-5" /> Timeline
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <BasicContextPack />
                </TabsContent>
                <TabsContent value="people">
                  <PeopleContextPack
                    onAddParticipant={addParticipant}
                    onRemoveParticipant={removeParticipant}
                  />
                </TabsContent>
                <TabsContent value="goals">
                  <GoalsContextPack
                    addSubGoal={addSubGoal}
                    removeSubGoal={removeSubGoal}
                  />
                </TabsContent>
                <TabsContent value="documents">
                  <DocumentsContextPack
                    addDocument={addDocument}
                    removeDocument={removeDocument}
                  />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineContextPack />
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="sticky bottom-0 z-10">
              <div className="w-full border-t bg-white px-8 py-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {methods.watch("participants").length} participants •{" "}
                  {methods.watch("documents").length} documents •{" "}
                  {
                    methods
                      .watch("strategicObjectives.subGoals")
                      .filter(Boolean).length
                  }{" "}
                  objectives
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="h-11 text-base px-8 w-24 cursor-pointer"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base h-11 px-8 w-52 cursor-pointer"
                    disabled={loading}
                  >
                    {!loading ? (
                      <>
                        <FileText className="w-6 h-6" />
                        Save Context Pack
                      </>
                    ) : (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ContextPack;
