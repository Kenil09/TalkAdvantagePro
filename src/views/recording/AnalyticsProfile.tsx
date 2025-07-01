// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { AnalyticsProfileFormData } from "@/types/contextPack";
// import { existingProfile } from "@/utils/contextData";

// import { Edit, Plus, Settings } from "lucide-react";

// const AnalyticsProfile = ({
//   setAddAnalyticsModal,
//   setEditProfile,
// }: {
//   setAddAnalyticsModal: (modal: boolean) => void;
//   setEditProfile: (profile: AnalyticsProfileFormData | null) => void;
// }) => {
//   return (
//     <div className="bg-white rounded-3xl p-4  no-drag">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold text-gray-900">Analytics Profile</h3>
//         <div className="flex items-center gap-3">
//           <Button
//             variant="ghost"
//             size="icon"
//             type="button"
//             className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer"
//             onClick={() => {
//               setAddAnalyticsModal(true);
//               setEditProfile(null);
//             }}
//           >
//             <Plus />
//           </Button>

//           <Button
//             variant="ghost"
//             size="icon"
//             type="button"
//             className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer "
//             onClick={() => {
//               setAddAnalyticsModal(true); // load from your data
//               setEditProfile(existingProfile);
//             }}
//           >
//             <Edit />
//           </Button>
//           <Button
//             variant="ghost"
//             size="icon"
//             type="button"
//             className="size-4 text-gray-500 hover:text-gray-400 cursor-pointer "
//           >
//             <Settings />
//           </Button>
//         </div>
//       </div>
//       <div className="space-y-2">
//         <Select defaultValue="full">
//           <SelectTrigger className="w-full border cursor-pointer border-gray-900 rounded-full text-gray-900 bg-gray-100 text-sm">
//             <SelectValue placeholder="Select Theme" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="full">Full Analysis</SelectItem>
//             <SelectItem value="meeting">Meeting Summary</SelectItem>
//             <SelectItem value="interview">Interview Analysis</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button className="w-full px-3 py-2 font-normal bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-colors text-sm cursor-pointer ">
//           Process
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsProfile;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsProfileFormData } from "@/types/contextPack";
import { existingProfile } from "@/utils/contextData";
import { Edit, Plus, Settings } from "lucide-react";

type AnalysisType = "full" | "meeting" | "interview";

const AnalyticsProfile = ({
  setAddAnalyticsModal,
  setEditProfile,
}: {
  setAddAnalyticsModal: (modal: boolean) => void;
  setEditProfile: (profile: AnalyticsProfileFormData | null) => void;
}) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>("full");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      // Add your processing logic here
      console.log(`Processing ${analysisType} analysis...`);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error processing analysis:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 no-drag h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Analytics Profile</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => {
              setAddAnalyticsModal(true);
              setEditProfile(null);
            }}
            aria-label="Add new profile"
          >
            <Plus className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => {
              setAddAnalyticsModal(true);
              setEditProfile(existingProfile);
            }}
            aria-label="Edit profile"
          >
            <Edit className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-8 text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={() => console.log("Settings clicked")}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-3">
          <Select
            value={analysisType}
            onValueChange={(value: AnalysisType) => setAnalysisType(value)}
          >
            <SelectTrigger className="w-full border border-gray-200 rounded-full text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors">
              <SelectValue placeholder="Select Analysis Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Analysis</SelectItem>
              <SelectItem value="meeting">Meeting Summary</SelectItem>
              <SelectItem value="interview">Interview Analysis</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Process Analysis"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsProfile;
