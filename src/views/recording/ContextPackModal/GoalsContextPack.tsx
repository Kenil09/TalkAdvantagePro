import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormValues } from "@/types/contextPack";
import { Label } from "@radix-ui/react-label";
import { Plus, Trash2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

const GoalsContextPack = ({
  addSubGoal,
  removeSubGoal,
}: {
  addSubGoal: () => void;
  removeSubGoal: (index: number) => void;
}) => {
  const { register, control, setValue } = useFormContext<FormValues>();

  // Watch the subGoals array
  const subGoals = useWatch({
    control,
    name: "strategicObjectives.subGoals",
    defaultValue: [],
  }) as string[];

  return (
    <div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Strategic Objectives
        </h3>
        <p className="text-gray-600 text-sm mt-1">
          Define the main goals and sub-objectives for this interaction
        </p>
      </div>

      <div className="p-6 border  border-gray-200 shadow-sm rounded-3xl bg-white/70 backdrop-blur-sm my-4">
        <div className="space-y-6">
          <div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Primary Objective
              </Label>
              <Input
                {...register("strategicObjectives.mainGoal")}
                placeholder="Define Q4 product roadmap"
                className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Sub-objectives
              </Label>
              <Button
                onClick={addSubGoal}
                variant="outline"
                size="sm"
                type="button"
                className="px-4 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Sub-goal
              </Button>
            </div>
            <div className="overflow-y-auto ">
              <div className="space-y-3">
                {subGoals.map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 ">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <Input
                      {...register(
                        `strategicObjectives.subGoals.${index}` as const,
                        {
                          onChange: (e) => {
                            const newSubGoals = [...subGoals];
                            newSubGoals[index] = e.target.value;
                            setValue(
                              "strategicObjectives.subGoals",
                              newSubGoals
                            );
                          },
                        }
                      )}
                      placeholder={`Sub-objective ${index + 1}`}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubGoal();
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubGoal(index)}
                      type="button"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsContextPack;
