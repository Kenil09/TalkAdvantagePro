import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormValues } from "@/types/contextPack";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const TimelineContextPack = () => {
  const [timelineInput, setTimeLineInput] = useState("");

  const { register, watch, setValue } = useFormContext<FormValues>();

  const formData = watch();

  const addTimelineItem = () => {
    if (!timelineInput.trim()) return;
    const newTimelineItems = [...formData.timelineContext.timelineItems];
    newTimelineItems.push({
      id: Date.now().toString(),
      item: timelineInput.trim(),
    });
    setValue("timelineContext.timelineItems", newTimelineItems);
    setTimeLineInput("");
  };

  const removeTimelineItem = (id: string) => {
    const newTimelineItems = formData.timelineContext.timelineItems.filter(
      (item) => item.id !== id
    );
    setValue("timelineContext.timelineItems", newTimelineItems);
    setTimeLineInput("");
  };

  return (
    <div className="py-4 flex flex-col ">
      <div className="overflow-y-auto pr-2  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Timeline & Context
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Add timeline items and contextual information for this interaction
          </p>
        </div>

        <div className="p-6 shadow-sm bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl hover:shadow-md transition-shadow mb-4">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Timeline Items
              </Label>
              <div className="flex items-center space-x-2 mb-4">
                <Input
                  value={timelineInput}
                  onChange={(e) => setTimeLineInput(e.target.value)}
                  placeholder="Add timeline item"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTimelineItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addTimelineItem}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.timelineContext.timelineItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    <span className="text-gray-900">{item.item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => removeTimelineItem(item.id)}
                      className="h-4 w-4 p-0 ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label
                htmlFor="alliancesRivalries"
                className="text-sm font-medium text-black mb-2 block"
              >
                Describe Alliances/Rivalries
              </Label>
              <Textarea
                id="alliancesRivalries"
                {...register("timelineContext.alliancesRivalries")}
                placeholder="Any notes or preparation points before the interaction..."
                rows={3}
                className="text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <Label
                htmlFor="contextFactors"
                className="text-sm font-medium text-black mb-2 block"
              >
                Context Factors
              </Label>
              <Textarea
                id="contextFactors"
                {...register("timelineContext.contextFactors")}
                placeholder="Any notes or preparation points before the interaction..."
                rows={3}
                className="text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineContextPack;
