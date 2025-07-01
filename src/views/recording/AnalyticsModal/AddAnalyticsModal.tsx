import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnalyticsProfileFormData } from "@/types/contextPack";
import { Model } from "@/types/widget.types";
import { X, Settings, Zap, BarChart3, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const AddAnalyticsModal = ({
  isOpen,
  onClose,
  defaultValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultValues: AnalyticsProfileFormData | null;
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [models, setModels] = useState<Model[]>([]);

  const { handleSubmit, reset, setValue, watch } =
    useForm<AnalyticsProfileFormData>({
      defaultValues: {
        profileName: defaultValues?.profileName || "",
        description: defaultValues?.description || "",
        aiModel:
          defaultValues?.aiModel || "mistralai/mistral-small-3.2-24b-instruct",
        conversationMode:
          defaultValues?.conversationMode || "Tracking (Passive)",
        userPrompt: defaultValues?.userPrompt || "",
        systemPrompt: defaultValues?.systemPrompt || "",
        templatePrompt: defaultValues?.templatePrompt || "",
        curiosityEnginePrompt: defaultValues?.curiosityEnginePrompt || "",
        defaultLayout: defaultValues?.defaultLayout || "radial",
        colorScheme: defaultValues?.colorScheme || "Default",
        maxTokens: defaultValues?.maxTokens || 1000,
        temperature: defaultValues?.temperature || 0.7,
      },
    });

  useEffect(() => {
    reset(defaultValues || {});
  }, [defaultValues, isOpen, reset]);

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models");
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      const modelsSet = new Map(
        data.data.map((model: { slug: string }) => [model.slug, model])
      );

      const uniqueModels = Array.from(modelsSet.values());

      setModels(uniqueModels as Model[]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const onSubmit = (data: AnalyticsProfileFormData) => {
    console.log("Submitted data:", data);
    onClose();
  };

  const values = watch();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[700px] max-h-[90vh] p-0 overflow-y-auto bg-white border-gray-200 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {defaultValues
                  ? "Edit Analytics Profile"
                  : "Create New Analytics Profile"}{" "}
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                {defaultValues
                  ? "Update existing profile settings."
                  : "Create a new analytics profile from scratch."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onClose()}
              className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-hidden px-6"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="flex items-center justify-center space-x-2 w-full h-12 px-2">
              <TabsTrigger value="basic" className="h-9 cursor-pointer">
                <BarChart3 className="w-3 h-3" />
                Basic Settings
              </TabsTrigger>
              <TabsTrigger value="prompts" className="h-9 cursor-pointer">
                <Brain className="w-3 h-3" />
                AI Prompts
              </TabsTrigger>
              <TabsTrigger value="advanced" className="h-9 cursor-pointer">
                <Settings className="w-3 h-3" />
                Advanced Settings
              </TabsTrigger>
            </TabsList>
            {/* Tab Navigation */}

            {/* Content */}
            <TabsContent value="basic" className="mt-6 space-y-6 bg-white-50">
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="profileName"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Profile Name
                  </Label>
                  <Input
                    id="profileName"
                    value={values.profileName}
                    placeholder="Enter profile name"
                    onChange={(e) => setValue("profileName", e.target.value)}
                    className="h-12 text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={values.description}
                    onChange={(e) => setValue("description", e.target.value)}
                    rows={4}
                    placeholder="Enter description"
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="aiModel"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    AI Model
                  </Label>
                  <Select
                    value={values.aiModel}
                    onValueChange={(value: string) =>
                      setValue("aiModel", value)
                    }
                  >
                    <SelectTrigger className="h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                      <SelectValue placeholder="Select an AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model) => {
                        const uniqueKey = `${model.slug}-${model.name}-${model.context_length}`;

                        return (
                          <SelectItem key={uniqueKey} value={model.slug}>
                            {model.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Select the AI model to use for this profile&apos;s analysis.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="conversationMode"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Conversation Mode
                  </Label>
                  <Select
                    value={values.conversationMode}
                    onValueChange={(value: string) =>
                      setValue("conversationMode", value)
                    }
                  >
                    <SelectTrigger className="h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer">
                      <SelectValue placeholder="Select a conversation mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tracking (Passive)">
                        Tracking (Passive)
                      </SelectItem>
                      <SelectItem value="Guided (Active)">
                        Guided (Active)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Tracking mode passively analyzes conversations. Guided mode
                    provides real-time suggestions.
                  </p>
                </div>
              </div>
            </TabsContent>
            {/* AI Prompts */}
            <TabsContent
              value="prompts"
              className="mt-6 space-y-6  bg-white-50"
            >
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="userPrompt"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    User Prompt
                  </Label>
                  <Textarea
                    id="userPrompt"
                    value={values.userPrompt}
                    placeholder="Enter user prompt"
                    onChange={(e) => setValue("userPrompt", e.target.value)}
                    rows={3}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    The initial instruction to the AI. Keep it concise and
                    clear.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="systemPrompt"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    System Prompt
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    value={values.systemPrompt}
                    placeholder="Enter system prompt"
                    onChange={(e) => setValue("systemPrompt", e.target.value)}
                    rows={8}
                    className="text-base border-gray-300  bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Instructions that define the AI&apos;s role and behavior.
                    This sets the tone and approach.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="templatePrompt"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Template Prompt
                  </Label>
                  <Textarea
                    id="templatePrompt"
                    value={values.templatePrompt}
                    placeholder="Enter template prompt"
                    onChange={(e) => setValue("templatePrompt", e.target.value)}
                    rows={8}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    The structured format for the AI&apos;s response. Use
                    numbered lists and sections for better organization.
                  </p>
                </div>
              </div>
            </TabsContent>
            {/* Advanced Settings */}
            <TabsContent
              value="advanced"
              className="mt-6 space-y-6  bg-white-50"
            >
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="curiosityEnginePrompt"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Curiosity Engine Prompt
                  </Label>
                  <Textarea
                    id="curiosityEnginePrompt"
                    value={values.curiosityEnginePrompt}
                    placeholder="Enter curiosity engine prompt"
                    onChange={(e) =>
                      setValue("curiosityEnginePrompt", e.target.value)
                    }
                    rows={12}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none font-mono "
                  />
                  <p className="text-sm text-black mt-3">
                    Instructions for generating questions about the
                    conversation. This powers the Curiosity Engine.
                  </p>
                </div>

                <div className="p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Visualization Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="defaultLayout"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Default Layout
                      </Label>
                      <Select
                        value={values.defaultLayout}
                        onValueChange={(value: string) =>
                          setValue("defaultLayout", value)
                        }
                      >
                        <SelectTrigger className="h-11 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select default layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="radial">Radial</SelectItem>
                          <SelectItem value="flowchart">Flow Chart</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="colorScheme"
                        className="text-sm font-medium text-gray-700 mb-2 block "
                      >
                        Color Scheme
                      </Label>
                      <Select
                        value={values.colorScheme}
                        onValueChange={(value: string) =>
                          setValue("colorScheme", value)
                        }
                      >
                        <SelectTrigger className="h-11 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Default">Default</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="professional">
                            Professional
                          </SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="p-6 mt-6 ">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bookmarks
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Bookmark configuration is available in the advanced editor.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
        </form>
        <DialogFooter className="sticky bottom-0">
          <div className=" bg-white w-full px-6 py-4">
            <div className="w-full flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {activeTab === "basic" && "Basic settings"}
                {activeTab === "prompts" && "AI behavior settings"}
                {activeTab === "advanced" && "Advanced model settings"}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  className="px-6 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 text-sm font-medium cursor-pointer"
                  onClick={() => handleSubmit(onSubmit)}
                >
                  <Settings className="w-4 h-4 " />
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnalyticsModal;
