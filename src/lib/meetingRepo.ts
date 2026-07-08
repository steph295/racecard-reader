import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { RawRace } from "./types";
import type {
  MeetingDetailDTO,
  MeetingSummaryDTO,
  RaceDTO,
  RunnerDTO,
} from "./types";

interface MeetingMeta {
  sourceFileName: string;
  courseName?: string | null;
  meetingDate?: string | null;
}

/**
 * Persists a fully-structured meeting (from the parsing pipeline, or the
 * demo fixture) as a `ready` meeting owned by `ownerId`. Runs as a single
 * transaction so a partial/failed insert never leaves an orphaned meeting.
 */
export async function saveStructuredMeeting(
  ownerId: string,
  meta: MeetingMeta,
  races: RawRace[],
  existingMeetingId?: string
): Promise<string> {
  return db.transaction(async (tx) => {
    let meeting: { id: string };
    if (existingMeetingId) {
      [meeting] = await tx
        .update(schema.meetings)
        .set({
          courseName: meta.courseName ?? null,
          meetingDate: meta.meetingDate ?? null,
          status: "ready",
          updatedAt: new Date(),
        })
        .where(eq(schema.meetings.id, existingMeetingId))
        .returning({ id: schema.meetings.id });
    } else {
      [meeting] = await tx
        .insert(schema.meetings)
        .values({
          ownerId,
          sourceFileName: meta.sourceFileName,
          courseName: meta.courseName ?? null,
          meetingDate: meta.meetingDate ?? null,
          status: "ready",
        })
        .returning({ id: schema.meetings.id });
    }

    for (let raceIdx = 0; raceIdx < races.length; raceIdx++) {
      const race = races[raceIdx];
      const [raceRow] = await tx
        .insert(schema.races)
        .values({
          meetingId: meeting.id,
          number: raceIdx + 1,
          time: race.time,
          name: race.name,
          going: race.going ?? null,
          distance: race.distance ?? null,
        })
        .returning({ id: schema.races.id });

      for (const runner of race.runners) {
        const silkMatch = runner.silkSrc?.match(/silk-?(\d+)/i);
        const [runnerRow] = await tx
          .insert(schema.runners)
          .values({
            raceId: raceRow.id,
            no: runner.no,
            draw: runner.draw ?? null,
            form: runner.form ?? null,
            officialRating: runner.or ?? null,
            name: runner.name,
            sire: runner.sire ?? null,
            dam: runner.dam ?? null,
            ageSex: runner.ageSex ?? null,
            weight: runner.weight ?? null,
            jockey: runner.jockey ?? null,
            trainer: runner.trainer ?? null,
            owner: runner.owner ?? null,
            nonRunner: !!runner.nr,
            subnote: runner.subnote ?? null,
            silkAssetKey: silkMatch ? `silk-${silkMatch[1]}` : null,
          })
          .returning({ id: schema.runners.id });

        for (let reportIdx = 0; reportIdx < runner.reports.length; reportIdx++) {
          const report = runner.reports[reportIdx];
          const [reportRow] = await tx
            .insert(schema.reports)
            .values({
              runnerId: runnerRow.id,
              date: report.date,
              time: report.time ?? null,
              track: report.track ?? null,
              order: reportIdx,
            })
            .returning({ id: schema.reports.id });

          if (report.items.length > 0) {
            await tx.insert(schema.reportItems).values(
              report.items.map((item, itemIdx) => ({
                reportId: reportRow.id,
                category: item.cat,
                tag: item.tag ?? null,
                detail: item.detail,
                order: itemIdx,
              }))
            );
          }
        }
      }
    }

    return meeting.id;
  });
}

export async function createPendingMeeting(ownerId: string, sourceFileName: string) {
  const [row] = await db
    .insert(schema.meetings)
    .values({ ownerId, sourceFileName, status: "processing" })
    .returning({ id: schema.meetings.id });
  return row.id;
}

export async function markMeetingFailed(meetingId: string, errorMessage: string) {
  await db
    .update(schema.meetings)
    .set({ status: "failed", errorMessage, updatedAt: new Date() })
    .where(eq(schema.meetings.id, meetingId));
}

export async function listMeetingsForUser(ownerId: string): Promise<MeetingSummaryDTO[]> {
  const rows = await db
    .select({
      id: schema.meetings.id,
      sourceFileName: schema.meetings.sourceFileName,
      courseName: schema.meetings.courseName,
      meetingDate: schema.meetings.meetingDate,
      status: schema.meetings.status,
      errorMessage: schema.meetings.errorMessage,
      createdAt: schema.meetings.createdAt,
      raceCount: sql<number>`count(distinct ${schema.races.id})`.mapWith(Number),
      runnerCount: sql<number>`count(distinct ${schema.runners.id})`.mapWith(Number),
      reportCount: sql<number>`count(distinct ${schema.reports.id})`.mapWith(Number),
    })
    .from(schema.meetings)
    .leftJoin(schema.races, eq(schema.races.meetingId, schema.meetings.id))
    .leftJoin(schema.runners, eq(schema.runners.raceId, schema.races.id))
    .leftJoin(schema.reports, eq(schema.reports.runnerId, schema.runners.id))
    .where(eq(schema.meetings.ownerId, ownerId))
    .groupBy(schema.meetings.id)
    .orderBy(sql`${schema.meetings.createdAt} desc`);

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getMeetingDetail(
  ownerId: string,
  meetingId: string
): Promise<MeetingDetailDTO | null> {
  const meeting = await db.query.meetings.findFirst({
    where: and(eq(schema.meetings.id, meetingId), eq(schema.meetings.ownerId, ownerId)),
  });
  if (!meeting) return null;

  const raceRows = await db.query.races.findMany({
    where: eq(schema.races.meetingId, meetingId),
    orderBy: (r, { asc }) => asc(r.number),
    with: {
      runners: {
        orderBy: (r, { asc }) => asc(r.no),
        with: {
          reports: {
            orderBy: (r, { asc }) => asc(r.order),
            with: { items: { orderBy: (i, { asc }) => asc(i.order) } },
          },
          notes: { where: eq(schema.notes.userId, ownerId) },
        },
      },
    },
  });

  let raceCount = 0;
  let runnerCount = 0;
  let reportCount = 0;

  const races: RaceDTO[] = raceRows.map((race) => {
    raceCount++;
    const runners: RunnerDTO[] = race.runners.map((runner) => {
      runnerCount++;
      if (runner.reports.length > 0) reportCount++;
      return {
        id: runner.id,
        no: runner.no,
        draw: runner.draw,
        form: runner.form,
        officialRating: runner.officialRating,
        name: runner.name,
        sire: runner.sire,
        dam: runner.dam,
        ageSex: runner.ageSex,
        weight: runner.weight,
        jockey: runner.jockey,
        trainer: runner.trainer,
        owner: runner.owner,
        nonRunner: runner.nonRunner,
        subnote: runner.subnote,
        silkAssetKey: runner.silkAssetKey,
        noteBody: runner.notes[0]?.body ?? "",
        reports: runner.reports.map((report) => ({
          id: report.id,
          date: report.date,
          time: report.time,
          track: report.track,
          items: report.items.map((item) => ({
            id: item.id,
            category: item.category,
            tag: item.tag,
            detail: item.detail,
          })),
        })),
      };
    });
    return {
      id: race.id,
      number: race.number,
      time: race.time,
      name: race.name,
      going: race.going,
      distance: race.distance,
      runners,
    };
  });

  return {
    id: meeting.id,
    sourceFileName: meeting.sourceFileName,
    courseName: meeting.courseName,
    meetingDate: meeting.meetingDate,
    status: meeting.status,
    errorMessage: meeting.errorMessage,
    createdAt: meeting.createdAt.toISOString(),
    raceCount,
    runnerCount,
    reportCount,
    races,
  };
}

export async function upsertNote(userId: string, runnerId: string, body: string) {
  await db
    .insert(schema.notes)
    .values({ userId, runnerId, body })
    .onConflictDoUpdate({
      target: [schema.notes.userId, schema.notes.runnerId],
      set: { body, updatedAt: new Date() },
    });
}
