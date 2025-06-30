"use server";

import { FormValues } from "@/types/contextPack";
import { knowledgeGraphService } from "./knowledge-graph-service";

export const createContextPack = async (data: FormValues, userId: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const {
      userInfo,
      participants,
      strategicObjectives,
      documents,
      preInteractionNotes,
      timelineContext,
    } = data;

    const { name: userName, role: userRole, nonUser, prospect } = userInfo;

    const { mainGoal, subGoals } = strategicObjectives;

    const participantUsers = (participants || []).map((participant) => {
      return {
        name: participant.name,
        role: participant.role,
        relationship_to_user: participant.relationship,
      };
    });

    const keyTopics = (preInteractionNotes.keyTopics || []).map(
      (item) => item.topic
    );

    const timelineItems = (timelineContext.timelineItems || []).map(
      (item) => item.item
    );

    const documentsArray = (documents || []).map((document) => {
      return {
        name: document.name,
        file: document.file,
        tags: document.tags?.split(",").map((tag) => tag.trim()),
      };
    });

    const contextPack = await knowledgeGraphService.createContextPack({
      userId: userId,
      name: userName,
      userRole: userRole,
      goal: mainGoal,
      subGoals: subGoals,
      person: nonUser,
      personRelationship: prospect,
      participants: participantUsers,
      documents: documentsArray,
      contextDescription: preInteractionNotes.description,
      keyTopics: keyTopics,
      notes: preInteractionNotes.additionalNotes,
      timeline: timelineItems,
      conflictMap: timelineContext.alliancesRivalries,
      environmentalFactors: timelineContext.contextFactors,
    });

    return contextPack;
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};
