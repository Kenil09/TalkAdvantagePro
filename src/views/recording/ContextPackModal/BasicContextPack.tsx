import FormInput from "@/components/formInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormValues } from "@/types/contextPack";
import { Clock, MessageSquare, User } from "lucide-react";
import { useFormContext } from "react-hook-form";

const BasicContextPack = () => {
  const { register } = useFormContext<FormValues>();

  return (
    <div className="py-4 flex flex-col ">
      <div className="overflow-y-auto pr-2  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-black">
                Context Details
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <FormInput
                  label="Context Pack Name"
                  {...register("name")}
                  placeholder="Q4 Strategy Meeting"
                  type="text"
                />
              </div>

              <div>
                <div className="relative">
                  <Clock className="absolute left-3 top-[70%] transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <FormInput
                    label="Expected Duration"
                    {...register("timeline")}
                    placeholder="60 minutes"
                    type="text"
                    className="pl-10 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-black mb-1 block"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of the context pack purpose..."
                  rows={6}
                  className="text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-black">
                Your Information
              </h3>
            </div>
            <div className="space-y-4">
              <FormInput
                label="Your Name"
                {...register("userInfo.name")}
                type="text"
                placeholder="John Doe"
              />

              <FormInput
                label="Your Role"
                {...register("userInfo.role")}
                type="text"
                placeholder="Your Manager"
              />

              <FormInput
                label="Non User"
                {...register("userInfo.nonUser")}
                type="text"
                placeholder="John Doe"
              />

              <FormInput
                label="Prospect"
                {...register("userInfo.prospect")}
                type="text"
                placeholder="John Doe"
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl hover:shadow-md transition-shadow mt-6 border border-gray-200">
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="context"
                className="text-sm font-medium text-black mb-2 block"
              >
                Context & Background
              </Label>
              <Textarea
                id="context"
                {...register("context")}
                placeholder="Provide background context for this interaction..."
                rows={4}
                className="text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <Label
                htmlFor="preNotes"
                className="text-sm font-medium text-black mb-2 block"
              >
                Pre-Interaction Notes
              </Label>
              <Textarea
                id="preNotes"
                {...register("preInteractionNotes")}
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

export default BasicContextPack;
