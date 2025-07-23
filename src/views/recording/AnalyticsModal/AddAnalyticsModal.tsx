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
import { useRecordingStore } from "@/lib/store/recording.store";
import { Model } from "@/types/widget.types";
import {
  analyticsProfileSchema,
  AnalyticsProfileFormDataSchema,
} from "@/utils/schema/analyticsmodel.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Settings, Zap, BarChart3, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

const AddAnalyticsModal = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [models, setModels] = useState<Model[]>([]);
  const { addAnalyticsModal, setAddAnalyticsModal, editProfile } = useRecordingStore();
  const { handleSubmit, register, control, formState: { errors } } =
    useForm<AnalyticsProfileFormDataSchema>({
      resolver: zodResolver(analyticsProfileSchema),
      defaultValues: {
        profileName: editProfile?.profileName || "",
        description: editProfile?.description || "",
        aiModel:
          editProfile?.aiModel || "mistralai/mistral-small-3.2-24b-instruct",
        conversationMode:
          editProfile?.conversationMode || "Tracking (Passive)",
        userPrompt: editProfile?.userPrompt || "",
        systemPrompt: editProfile?.systemPrompt || "",
        templatePrompt: editProfile?.templatePrompt || "",
        curiosityEnginePrompt: editProfile?.curiosityEnginePrompt || "",
        defaultLayout: editProfile?.defaultLayout || "radial",
        colorScheme: editProfile?.colorScheme || "Default",
        maxTokens: editProfile?.maxTokens || 1000,
        temperature: editProfile?.temperature || 0.7,
      },
    });

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

  const onSubmit = (data: AnalyticsProfileFormDataSchema) => {
    console.log("Submitted data:", data);
    setAddAnalyticsModal(false);
  };

  const handleClose = () => {
    setAddAnalyticsModal(false)
  }
  return (
    <Dialog open={addAnalyticsModal} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[700px] max-h-[90vh] p-0 overflow-y-auto bg-white border-gray-200 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {editProfile
                  ? "Edit Analytics Profile"
                  : "Create New Analytics Profile"}{" "}
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                {editProfile
                  ? "Update existing profile settings."
                  : "Create a new analytics profile from scratch."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleClose}
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
                    {...register("profileName")}
                    placeholder="Enter profile name"
                    className="h-12 text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.profileName && (
                    <p className="text-red-500 text-sm mt-1">{errors.profileName.message}</p>
                  )}
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
                    {...register("description")}
                    rows={4}
                    placeholder="Enter description"
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="aiModel"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    AI Model
                  </Label>
                  <Controller
                    name="aiModel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger
                          className={`h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.aiModel ? "border-red-500" : ""
                            }`}
                        >
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
                    )}
                  />
                  {errors.aiModel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.aiModel.message}
                    </p>
                  )}
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
                  <Controller
                    name="conversationMode"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className={`h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.conversationMode ? "border-red-500" : ""
                            }`}
                        >
                          <SelectValue placeholder="Select a conversation mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tracking (Passive)">Tracking (Passive)</SelectItem>
                          <SelectItem value="Guided (Active)">Guided (Active)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.conversationMode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.conversationMode.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Tracking mode passively analyzes conversations. Guided mode provides real-time suggestions.
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
                    {...register("userPrompt")}
                    placeholder="Enter user prompt"
                    rows={3}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  {errors.userPrompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.userPrompt.message}</p>
                  )}
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
                    {...register("systemPrompt")}
                    placeholder="Enter system prompt"
                    rows={8}
                    className="text-base border-gray-300  bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  {errors.systemPrompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.systemPrompt.message}</p>
                  )}
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
                    {...register("templatePrompt")}
                    placeholder="Enter template prompt"
                    rows={8}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                  {errors.templatePrompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.templatePrompt.message}</p>
                  )}
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
                    {...register("curiosityEnginePrompt")}
                    placeholder="Enter curiosity engine prompt"
                    rows={12}
                    className="text-base border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500 resize-none font-mono "
                  />
                  {errors.curiosityEnginePrompt && (
                    <p className="text-red-500 text-sm mt-1">{errors.curiosityEnginePrompt.message}</p>
                  )}
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
                      <Controller
                        name="defaultLayout"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={`h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.defaultLayout ? "border-red-500" : ""
                                }`}
                            >
                              <SelectValue placeholder="Select default layout" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="radial">Radial</SelectItem>
                              <SelectItem value="flowchart">Flow Chart</SelectItem>
                              <SelectItem value="network">Network</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.defaultLayout && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.defaultLayout.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="colorScheme"
                        className="text-sm font-medium text-gray-700 mb-2 block "
                      >
                        Color Scheme
                      </Label>
                      <Controller
                        name="colorScheme"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={`h-12 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.colorScheme ? "border-red-500" : ""
                                }`}
                            >
                              <SelectValue placeholder="Select color scheme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Default">Default</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.colorScheme && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.colorScheme.message}
                        </p>
                      )}
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
                    onClick={handleClose}
                    className="px-6 text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 text-sm font-medium cursor-pointer"
                  >
                    <Settings className="w-4 h-4 " />
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnalyticsModal;
