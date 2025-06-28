import { ContextPack } from "@/types/contextPack";

export const documentTypes = [
  { value: "pdf", label: "PDF Document" },
  { value: "docx", label: "Word Document" },
  { value: "xlsx", label: "Excel Spreadsheet" },
  { value: "pptx", label: "PowerPoint Presentation" },
  { value: "txt", label: "Text File" },
  { value: "other", label: "Other" },
] as const;

export const mockContextPacks: ContextPack[] = [
  {
    id: "1",
    name: "Q4 Strategy Meeting",
    participants: [
      { name: "Sarah Johnson", role: "Engineering Lead" },
      { name: "Mike Chen", role: "Designer" },
    ],
    documents: [],
    mainGoal: "Define Q4 product roadmap",
    timeline: "60 minutes",
    lastUsed: "2024-01-15",
  },
  {
    id: "2",
    name: "Client Onboarding Call",
    participants: [
      { name: "Alex Thompson", role: "Account Manager" },
      { name: "Lisa Wang", role: "Implementation Lead" },
    ],
    documents: ["Onboarding_Checklist.pdf", "Service_Agreement.docx"],
    mainGoal: "Complete client setup and expectations",
    timeline: "45 minutes",
    lastUsed: "2024-01-12",
  },
  {
    id: "3",
    name: "Weekly Team Standup",
    participants: [
      { name: "David Kim", role: "Developer" },
      { name: "Emma Rodriguez", role: "QA Lead" },
      { name: "Tom Wilson", role: "DevOps" },
    ],
    documents: ["Sprint_Goals.md", "Bug_Report.xlsx"],
    mainGoal: "Weekly progress sync and blockers",
    timeline: "30 minutes",
    lastUsed: "2024-01-10",
  },
];
