import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const CurrentContext = () => {
  return (
    <div className="mt-4">
      <div className="bg-white rounded-3xl border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Current Context Pack
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
          >
            <Settings />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-base font-normal text-gray-700">
              User Information
            </h4>
            <div className="text-sm text-gray-600">
              <p>Name: John Doe</p>
              <p>Role: Product Manager</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-normal text-gray-700">
              Participants
            </h4>
            <div className="text-sm text-gray-600">
              <p>Sarah Wilson - Designer</p>
              <p>Mike Chen - Developer</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-normal text-gray-700">
              Strategic Objectives
            </h4>
            <div className="text-sm text-gray-600">
              <p>Main Goal: Product Launch</p>
              <p>Sub Goal: User Testing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentContext;
