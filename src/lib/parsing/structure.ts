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
                  subnote: { type: "string", description: "A very brief status flag only — e.g. 'Non-runner', 'Self Cert (Not Eaten Up)'. Do NOT put dated history (sampling records, vet checks, etc.) here; those go in reports." },
                  sire: { type: "string" },
                  dam: { type: "string" },
                  ageSex: { type: "string", description: "e.g. '5yo B G'." },
                  weight: { type: "string", description: "e.g. '10-0'." },
                  jockey: { type: "string" },
                  trainer: { type: "string" },
                  owner: { type: "string" },
                  reports: {
                    type: "array",
                    description: "ALL dated history for this horse: stewards enquiries, vet reports, rider reports, trainer notes, sampling records (e.g. 'Sampled 21/05/25'), post-race checks, or any other dated note. Oldest or newest first as printed.",
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

Reconstruct every race in order, and every runner within each race in racing/saddlecloth-number order.

For every horse, capture ALL dated history as report entries — including stewards enquiries, vet reports, rider reports, trainer notes, sampling records (e.g. "Sampled 21/05/25"), post-race checks, or any other dated annotation. Each distinct date/track block becomes one report entry with one or more items. Use "Vet Note" as the cat for sampling/vet-check entries, "Stewards Enquiry" for stewards, "Rider Report" for jockey/rider reports, "Trainer Note" for trainer/owner annotations, and "Note" as a fallback.

Only use subnote for a very brief current-status flag (e.g. "Non-runner", "Self Cert") — never for dated history.

If a field genuinely isn't present in the source, omit it rather than guessing. Call the record_meeting tool exactly once with the complete result.`;

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

  // Streaming is mandatory for large max_tokens values (the SDK rejects
  // non-streaming requests that could exceed its 10-minute ceiling); we
  // still just collect the final message and use the completed tool input.
  const response = await client.messages
    .stream({
      model: "claude-sonnet-4-5",
      // Racecards with many runners + full report history produce large tool
      // outputs; too small a limit truncates the JSON mid-`races` array, which
      // then fails validation with "races: expected array, received undefined".
      max_tokens: 32000,
      system: SYSTEM_PROMPT,
      tools: [recordMeetingTool],
      tool_choice: { type: "tool", name: RECORD_TOOL_NAME },
      messages: [{ role: "user", content: userContent }],
    })
    .finalMessage();

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "The racecard is too large to structure in a single pass (model output was truncated). " +
        "Try uploading a single race or a smaller meeting."
    );
  }

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

  console.warn(
    "Racecard extraction failed validation on first pass:",
    JSON.stringify(firstResult.error.issues),
    "— top-level keys returned:",
    first && typeof first === "object" ? Object.keys(first) : typeof first
  );

  const repaired = await callModel(
    truncated,
    `Your previous record_meeting call failed validation with these errors:\n${firstResult.error.message}\n\nPlease call record_meeting again, fixing these issues. Make sure "races" is a non-empty array and every race has a non-empty "runners" array.`
  );
  const secondResult = meetingExtractionSchema.safeParse(repaired);
  if (secondResult.success) return secondResult.data;

  console.error(
    "Racecard extraction failed validation on repair pass:",
    JSON.stringify(secondResult.error.issues),
    "— top-level keys returned:",
    repaired && typeof repaired === "object" ? Object.keys(repaired) : typeof repaired
  );

  throw new Error(`Could not extract structured racecard data: ${secondResult.error.message}`);
}
