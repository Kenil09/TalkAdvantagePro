export const HOTLINK_WIDGETS = [
  {
    id: "research",
    name: "Research Widget",
    triggerWords: ["research", "study", "analyze"],
    model: "mistralai/mistral-small-3.2-24b-instruct:free",
    prompt:
      "Based on the conversation provided below, your job is to act as an expert research assistant with internet access. Carefully analyze the transcript to identify...",
    enabled: true,
  },
  {
    id: "github",
    name: "GitHub Widget",
    triggerWords: ["github", "code", "repository"],
    model: "mistralai/mistral-small-3.2-24b-instruct:free",
    prompt:
      "Based on the conversation provided below, your job is to carefully analyze the recent discussion to identify any problems, challenges, issues, or gaps mentioned. Then automatically search for relevant GitHub repositories that could help address these problems, prioritizing repositories with high star counts, recent activity, and good documentation...",
    enabled: true,
  },
  {
    id: "ticket",
    name: "Ticket Widget",
    triggerWords: ["ticket", "issue", "bug"],
    model: "mistralai/mistral-small-3.2-24b-instruct:free",
    prompt:
      "Based on the conversation provided below, your job is to analyze all discussed points carefully. Clearly identify issues, actionable tasks, areas for improvement, or we need a ticket for tracking...",
    enabled: true,
  },
];
