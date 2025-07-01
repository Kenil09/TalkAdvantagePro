"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Settings, Zap, Upload, Edit3 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { HOTLINK_WIDGETS } from "@/constants/hotlink-widget.constants";

interface HotLinkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FlashWidget {
  id: string;
  name: string;
  triggerWords: string[];
  model: string;
  prompt: string;
  enabled: boolean;
}

export function HotLinkSettingsModal({
  isOpen,
  onClose,
}: HotLinkSettingsModalProps) {
  const [widgets, setWidgets] = useState<FlashWidget[]>(HOTLINK_WIDGETS);
  const [models, setModels] = useState([]);
  const [newWidget, setNewWidget] = useState({
    name: "",
    triggerWords: "",
    model: "", // Start with empty model to show placeholder
    prompt: "",
  });

  const [showAddWidget, setShowAddWidget] = useState(false);

  const addTriggerWord = (widgetId: string, word: string) => {
    if (!word.trim()) return;
    setWidgets(
      widgets.map((w) =>
        w.id === widgetId
          ? { ...w, triggerWords: [...w.triggerWords, word.trim()] }
          : w
      )
    );
  };

  const removeTriggerWord = (widgetId: string, word: string) => {
    setWidgets(
      widgets.map((w) =>
        w.id === widgetId
          ? { ...w, triggerWords: w.triggerWords.filter((tw) => tw !== word) }
          : w
      )
    );
  };

  const updateWidget = (widgetId: string, field: string, value: string) => {
    setWidgets(
      widgets.map((w) => (w.id === widgetId ? { ...w, [field]: value } : w))
    );
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const addNewWidget = () => {
    if (!newWidget.name.trim()) return;

    const widget: FlashWidget = {
      id: Date.now().toString(),
      name: newWidget.name,
      triggerWords: newWidget.triggerWords
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean),
      model: newWidget.model,
      prompt: newWidget.prompt,
      enabled: true,
    };

    setWidgets([...widgets, widget]);
    setNewWidget({
      name: "",
      triggerWords: "",
      model: "Mistral 7B Instruct (Free)",
      prompt: "",
    });
    setShowAddWidget(false);
  };

  const handleSave = () => {
    onClose();
  };

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch models");
      }

      const data = await response.json();
      setModels(data.data);

      return data;
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

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
                HotLink Flash Widgets
              </DialogTitle>
              <p className="text-blue-100 text-sm">
                Configure widgets that activate when specific words are spoken
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 bg-white-50">
          <div className="p-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                HotLink Widgets
              </h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import Analytics Profile
                </Button>
                <Button
                  onClick={() => setShowAddWidget(true)}
                  type="button"
                  className="bg-primary-600 hover:bg-primary-500  cursor-pointer"
                >
                  <Plus className="w-4 h-4 " />
                  Add Widget
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Add New Widget Form */}
              {showAddWidget && (
                <Card className="bg-white border-gray-300 border-dashed shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900">
                      Add New Widget
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Widget Name
                      </Label>
                      <Input
                        value={newWidget.name}
                        onChange={(e) =>
                          setNewWidget({ ...newWidget, name: e.target.value })
                        }
                        placeholder="Enter widget name"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Trigger Words (comma separated)
                      </Label>
                      <Input
                        value={newWidget.triggerWords}
                        onChange={(e) =>
                          setNewWidget({
                            ...newWidget,
                            triggerWords: e.target.value,
                          })
                        }
                        placeholder="word1, word2, word3"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Model
                      </Label>
                      <Select
                        value={newWidget.model}
                        onValueChange={(value) =>
                          setNewWidget({ ...newWidget, model: value })
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 cursor-pointer w-full">
                          <SelectValue placeholder="Select a model..." />
                        </SelectTrigger>
                        <SelectContent className="cursor-pointer w-full">
                          {models?.map(
                            (model: {
                              id: string;
                              name: string;
                              slug: string;
                            }) => (
                              <SelectItem
                                key={`${model.id || ""}-${model.slug}-${
                                  model.name
                                }`}
                                value={model.slug}
                              >
                                {model.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Prompt
                      </Label>
                      <Textarea
                        value={newWidget.prompt}
                        onChange={(e) =>
                          setNewWidget({
                            ...newWidget,
                            prompt: e.target.value,
                          })
                        }
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[100px] focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your prompt here..."
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={addNewWidget}
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Add Widget
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowAddWidget(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Existing Widgets */}
              {widgets.map((widget) => (
                <Card
                  key={widget.id}
                  className="bg-white border-gray-200 shadow-sm"
                >
                  <CardHeader className="">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gray-900 flex items-center space-x-2">
                        <span>{widget.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWidget(widget.id)}
                          type="button"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Trigger Words */}
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Trigger Words
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {widget.triggerWords.map((word, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {word}
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => removeTriggerWord(widget.id, word)}
                              className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X className="w-2 h-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add trigger word and press Enter"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addTriggerWord(widget.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>

                    {/* Model Selection */}
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Model
                      </Label>
                      <Select
                        value={widget.model}
                        onValueChange={(value) =>
                          updateWidget(widget.id, "model", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Mistral 7B Instruct (Free)">
                            Mistral 7B Instruct (Free)
                          </SelectItem>
                          <SelectItem value="GPT-4">GPT-4</SelectItem>
                          <SelectItem value="Claude-3">Claude-3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prompt */}
                    <div>
                      <Label className="text-gray-700 text-sm mb-2 block">
                        Prompt
                      </Label>
                      <div className="relative">
                        <Textarea
                          value={widget.prompt}
                          onChange={(e) =>
                            updateWidget(widget.id, "prompt", e.target.value)
                          }
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-none focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter your prompt here..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 ">
          <div className="bg-white  px-6 py-4 flex items-center justify-between w-full">
            <div className="text-sm text-gray-500">
              {widgets.length} widget{widgets.length !== 1 ? "s" : ""}{" "}
              configured
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                className="h-11 text-base px-8 w-24 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base h-11 px-8 w-42 cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
