import JSONL from "jsonl-parse-stringify"
import { inngest } from "@/inngest/client";
import { createAgent, TextMessage } from "@inngest/agent-kit";
import { StreamTranscriptItem } from "@/modules/meetings/types";
import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSummarizationModel, AI_MODEL_CONFIG } from "@/lib/ai-models";

// Log which model we're using for debugging
console.log(`🤖 Summarizer using: ${AI_MODEL_CONFIG.USE_GEMINI_FOR_SUMMARIZATION ? 'Gemini' : 'OpenAI'}`);
console.log(`🔑 Gemini API Key present: ${!!process.env.GEMINI_API_KEY}`);
console.log(`🔑 OpenAI API Key present: ${!!process.env.OPENAL_API_KEY}`);

const summarizer = createAgent({
  name: "summarizer",
  system: `
    You are an expert summarizer. You write readable, concise, simple content. You are given a transcript of a meeting and you need to summarize it.

    Use the following markdown structure for every output:

    ### Overview
    Provide a detailed, engaging summary of the session's content. Focus on major features, user workflows, and any key takeaways. Write in a narrative style, using full sentences. Highlight unique or powerful aspects of the product, platform, or discussion.

    ### Notes
    Break down key content into thematic sections with timestamp ranges. Each section should summarize key points, actions, or demos in bullet format.

    Example:
    #### Section Name
    - Main point or demo shown here
    - Another key insight or interaction
    - Follow-up tool or explanation provided

    #### Next Section
    - Feature X automatically does Y
    - Mention of integration with Z
  `.trim(),
  model: getSummarizationModel(), // This will use Gemini by default, but can be easily switched
})

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {

    const response = await step.fetch(event.data.transcriptUrl);
    // const response = await step.run("fetch-transcript", async () => {
    //   return fetch(event.data.transcriptUrl).then((res) => res.text());
    // });

    const transcript = await step.run("parse-transcript", async () => {
      const text = await response.text();
      return JSONL.parse<StreamTranscriptItem>(text);
    });

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [
        ...new Set(transcript.map((item) => item.speaker_id)),
      ];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          }))
        );

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((users) =>
          users.map((agent) => ({
            ...agent,
          }))
        );

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find(
          (speaker) => speaker.id === item.speaker_id
        );
        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown",
            },
          };
        }

        return {
            ...item,
            user: {
              name: speaker.name,
            },
        };

      });
    });

    // Generate summary (no step.run wrapper to avoid nesting)
    let summaryResult: string;
    try {
      console.log(`🔄 Starting summarization with ${AI_MODEL_CONFIG.USE_GEMINI_FOR_SUMMARIZATION ? 'Gemini' : 'OpenAI'}...`);

      const { output } = await summarizer.run(
        "summarize the following transcript:" +
          JSON.stringify(transcriptWithSpeakers)
      );

      console.log("✅ Summarization completed successfully");
      summaryResult = (output[0] as TextMessage).content as string;
    } catch (error) {
      console.error("❌ Summarization failed:", error);

      // If it's a rate limit error (429), provide a helpful message
      if (error instanceof Error && error.message.includes('429')) {
        console.log("🚨 Rate limit hit - this suggests the API key might be invalid or you've exceeded limits");
        summaryResult = "Summary generation failed due to API rate limits. Please check your API keys and try again later.";
      } else {
        // For other errors, provide a generic message
        summaryResult = "Summary generation failed due to an unexpected error. Please try again later.";
      }
    }

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: summaryResult,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    })

  },
);