import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Settings } from "lucide-react";

const AnalyticsProfile = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-4 hover:shadow-md transition-shadow ">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Analytics Profile</h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer "
        >
          <Settings />
        </Button>
      </div>
      <div className="space-y-2">
        <Select defaultValue="github">
          <SelectTrigger className="w-full border border-gray-900 rounded-full text-gray-900 bg-gray-100 text-sm">
            <SelectValue placeholder="Select Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="github">GitHub Research</SelectItem>
            <SelectItem value="ticket">Ticket Analysis</SelectItem>
            <SelectItem value="meeting">Meeting Summary</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full px-3 py-2 font-normal bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors text-sm cursor-pointer ">
          Process
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsProfile;
