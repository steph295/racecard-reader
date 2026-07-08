import { RacecardShell } from "@/components/racecard/RacecardShell";

export default async function RacePage({
  params,
}: {
  params: Promise<{ meetingId: string; raceNumber: string }>;
}) {
  const { meetingId, raceNumber } = await params;
  return <RacecardShell meetingId={meetingId} raceNumber={Number(raceNumber) || 1} />;
}
