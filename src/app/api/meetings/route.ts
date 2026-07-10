import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/currentUser";
import {
  createPendingMeeting,
  listMeetingsForUser,
  markMeetingFailed,
  saveRawExtractedText,
  saveStructuredMeeting,
} from "@/lib/meetingRepo";
import { detectUploadKind, extractTextFromCsv, extractTextFromPdf } from "@/lib/parsing/extractText";
import { extractSilksFromPdf } from "@/lib/parsing/extractSilks";
import { structureRaceMeeting } from "@/lib/parsing/structure";

export async function GET() {
  const userId = await requireUserId();
  const meetings = await listMeetingsForUser(userId);
  return NextResponse.json({ meetings });
}

/**
 * Accepts a multipart upload (`file`), kicks off parsing in the background,
 * and returns immediately with a `processing` meeting the client can poll.
 *
 * This relies on the Node process staying alive after the response is sent,
 * which holds on a persistent server (Fly/Render/Railway/a VPS) but NOT on
 * serverless request-scoped runtimes (e.g. Vercel functions) - if you move
 * there, swap this for a real job queue (e.g. a small BullMQ worker).
 */
export async function POST(req: NextRequest) {
  const userId = await requireUserId();

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const kind = detectUploadKind(file.name, file.type);
  if (!kind) {
    return NextResponse.json(
      { error: "Unsupported file type - please upload a PDF or CSV racecard." },
      { status: 400 }
    );
  }

  const meetingId = await createPendingMeeting(userId, file.name);

  const bytes = new Uint8Array(await file.arrayBuffer());
  void processUpload(meetingId, userId, kind, bytes, file.name);

  return NextResponse.json({ meetingId }, { status: 202 });
}

async function processUpload(
  meetingId: string,
  userId: string,
  kind: "pdf" | "csv",
  bytes: Uint8Array,
  fileName: string
) {
  try {
    // pdfjs transfers (detaches) the buffer it's given, so the text and silk
    // passes each need their own copy of the PDF bytes.
    const silkBytes = kind === "pdf" ? bytes.slice() : null;

    const rawText =
      kind === "pdf"
        ? await extractTextFromPdf(bytes)
        : extractTextFromCsv(new TextDecoder().decode(bytes));

    if (!rawText.trim()) {
      throw new Error("Couldn't read any text from that file - is it a scanned image PDF?");
    }

    // Persist raw text before structuring so failed parses can be inspected
    // and re-run without re-uploading the original file.
    await saveRawExtractedText(meetingId, rawText);

    const extraction = await structureRaceMeeting(rawText);

    // Silk artwork is drawn in the PDF beside each runner's saddlecloth
    // number. Silks come back grouped by race with their numbers, so match
    // race-by-race on saddlecloth number; unmatched runners keep the
    // generated placeholder. Extraction failures never fail the upload.
    if (kind === "pdf" && silkBytes) {
      try {
        const silkRaces = await extractSilksFromPdf(silkBytes);
        let attached = 0;
        extraction.races.forEach((race, raceIdx) => {
          const raceSilks = silkRaces[raceIdx];
          if (!raceSilks) return;
          for (const runner of race.runners) {
            const byNo = raceSilks.find((s) => s.no === runner.no);
            // Fall back to positional order within the race when the
            // saddlecloth number couldn't be read next to the silk.
            const byIndex =
              raceSilks.length === race.runners.length
                ? raceSilks[race.runners.indexOf(runner)]
                : undefined;
            const silk = byNo ?? byIndex;
            if (silk) {
              (runner as { silkImage?: string }).silkImage = silk.dataUri;
              attached++;
            }
          }
        });
        const totalRunners = extraction.races.reduce((sum, r) => sum + r.runners.length, 0);
        console.log(
          `Silk extraction: attached ${attached}/${totalRunners} silks across ${silkRaces.length} silk groups / ${extraction.races.length} races.`
        );
      } catch (silkErr) {
        console.warn("Silk extraction failed (continuing without silks):", silkErr);
      }
    }

    await saveStructuredMeeting(
      userId,
      { sourceFileName: fileName, courseName: extraction.courseName, meetingDate: extraction.meetingDate },
      extraction.races,
      meetingId
    );
  } catch (err) {
    console.error(`Failed to process upload for meeting ${meetingId}:`, err);
    await markMeetingFailed(
      meetingId,
      err instanceof Error ? err.message : "Unknown error while parsing racecard."
    );
  }
}
