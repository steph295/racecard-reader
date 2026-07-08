import { redirect } from "next/navigation";

export default async function MeetingRedirectPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = await params;
  redirect(`/meetings/${meetingId}/races/1`);
}
