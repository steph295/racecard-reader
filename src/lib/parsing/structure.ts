import Anthropic from "@anthropic-ai/sdk";
import { meetingExtractionSchema, type MeetingExtraction } from "./schema";

const RECORD_TOOL_NAME = "record_meeting";

// Deliberately hand-written rather than derived from the zod schema -
// Anthropic's tool JSON Schema dialect is a subset of JSON Schema and the
// two aren't 1:1. Keep this in sync with ./schema.ts if you add fields.
const recordMeetingTool: Anthropic.Tool = {
  name: RECORD_TOOL_NAME,
  description:
    "Records the fully structured contents of a horse racing meeting racecard, including every race, runner and any stewards/vet report history found in the source text.",
  input_schema: {
    type: "object",
    properties: {
      courseName: { type: "string", description: "Racecourse name, e.g. 'Lingfield Park'." },
      meetingDate: { type: "string", description: "Meeting date as printed, e.g. '8 July 2026'." },
      races: {
        type: "array",
        items: {
          type: "object",
          properties: {
            time: { type: "string", description: "Off time, e.g. '2:15'." },
            name: { type: "string", description: "Full race name/title." },
            going: { type: "string" },
            distance: { type: "string" },
            runners: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  no: { type: "integer", description: "Saddlecloth number." },
                  draw: { type: "integer" },
                  form: { type: "string", description: "Form figures, e.g. '0502-00'." },
                  or: { type: "integer", description: "Official rating, if shown." },
                  name: { type: "string" },
                  nr: { type: "boolean", description: "True if declared a non-runner." },
                  subnote: { type: "string", description: "Any short flag, e.g. 'Non-runner · Not eaten up', 'Sampled 21/05/25'." },
                  sire: { type: "string" },
                  dam: { type: "string" },
                  ageSex: { type: "string", description: "e.g. '5yo B G'." },
                  weight: { type: "string", description: "e.g. '10-0'." },
                  jockey: { type: "string" },
                  trainer: { type: "string" },
                  owner: { type: "string" },
                  reports: {
                    type: "array",
                    description: "Chronological stewards/vet/rider report history for this horse, oldest or newest first as printed.",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        time: { type: "string" },
                        track: { type: "string" },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              cat: { type: "string", description: "e.g. 'Stewards enquiry', 'Rider report', 'Trainer/vet report', 'Note'." },
                              tag: { type: "string", description: "Short qualifier, e.g. 'Tested'." },
                              detail: { type: "string" },
                            },
                            required: ["cat", "detail"],
                          },
                        },
                      },
                      required: ["date", "items"],
                    },
                  },
                },
                required: ["no", "name"],
              },
            },
          },
          required: ["time", "name", "runners"],
        },
      },
    },
    required: ["races"],
  },
};

const SYSTEM_PROMPT = `You are extracting structured data from the raw text of a horse racing racecard (a PDF or CSV export). The text may be messy - columns can be interleaved, whitespace collapsed, and page breaks visible as "--- page N ---" markers.

Reconstruct every race in order, and every runner within each race in racing/saddlecloth-number order. Include every stewards enquiry, vet report, rider report, or note you can find for each horse, in chronological order. If a field genuinely isn't present in the source, omit it rather than guessing. Call the record_meeting tool exactly once with the complete result.`;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set - required for parsing uploaded racecards. See .env.example."
    );
  }
  return new Anthropic({ apiKey });
}

async function callModel(rawText: string, repairNotes?: string): Promise<unknown> {
  const client = getClient();
  const userContent = repairNotes
    ? `${repairNotes}\n\nHere is the source text again:\n\n${rawText}`
    : rawText;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    tools: [recordMeetingTool],
    tool_choice: { type: "tool", name: RECORD_TOOL_NAME },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error("Model did not return a structured result.");
  }
  return toolUse.input;
}

/**
 * Turns raw extracted racecard text into validated, structured data.
 * Racecard layouts vary a lot by provider, so this is inherently best-effort:
 * one repair pass is attempted if the model's first output fails validation,
 * then it's surfaced as a failed meeting for the user to retry or re-upload.
 */
export async function structureRaceMeeting(rawText: string): Promise<MeetingExtraction> {
  const truncated = rawText.slice(0, 100_000); // guard against pathological inputs

  const first = await callModel(truncated);
  const firstResult = meetingExtractionSchema.safeParse(first);
  if (firstResult.success) return firstResult.data;

  const repaired = await callModel(
    truncated,
    `Your previous record_meeting call failed validation with these errors:\n${firstResult.error.message}\n\nPlease call record_meeting again, fixing these issues.`
  );
  const secondResult = meetingExtractionSchema.safeParse(repaired);
  if (secondResult.success) return secondResult.data;

  throw new Error(`Could not extract structured racecard data: ${secondResult.error.message}`);
}
