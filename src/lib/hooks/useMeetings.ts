"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MeetingDetailDTO, MeetingSummaryDTO } from "@/lib/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request to ${url} failed (${res.status})`);
  }
  return res.json();
}

const MEETINGS_KEY = ["meetings"] as const;
const meetingKey = (id: string) => ["meetings", id] as const;

export function useMeetingsList() {
  return useQuery({
    queryKey: MEETINGS_KEY,
    queryFn: () => fetchJson<{ meetings: MeetingSummaryDTO[] }>("/api/meetings"),
    select: (data) => data.meetings,
    // Cheap poll so "processing" uploads flip to "ready" without a manual refresh.
    refetchInterval: (query) =>
      query.state.data?.meetings.some((m) => m.status === "processing") ? 2000 : false,
  });
}

export function useMeeting(meetingId: string | undefined) {
  return useQuery({
    queryKey: meetingId ? meetingKey(meetingId) : ["meetings", "none"],
    queryFn: () => fetchJson<{ meeting: MeetingDetailDTO }>(`/api/meetings/${meetingId}`),
    select: (data) => data.meeting,
    enabled: !!meetingId,
    refetchInterval: (query) => (query.state.data?.meeting.status === "processing" ? 2000 : false),
  });
}

export function useUploadMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetchJson<{ meetingId: string }>("/api/meetings", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEETINGS_KEY }),
  });
}

export function useSeedDemoMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchJson<{ meetingId: string }>("/api/meetings/seed-demo", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEETINGS_KEY }),
  });
}

export function useSaveNote(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { runnerId: string; body: string }) =>
      fetchJson("/api/notes", { method: "PUT", body: JSON.stringify(vars), headers: { "Content-Type": "application/json" } }),
    // Optimistic: the textarea already reflects the typed value, so we just
    // need the cache to agree once this settles (no UI flash on success).
    onSuccess: (_data, vars) => {
      queryClient.setQueryData<{ meeting: MeetingDetailDTO } | undefined>(meetingKey(meetingId), (prev) => {
        if (!prev) return prev;
        return {
          meeting: {
            ...prev.meeting,
            races: prev.meeting.races.map((race) => ({
              ...race,
              runners: race.runners.map((r) => (r.id === vars.runnerId ? { ...r, noteBody: vars.body } : r)),
            })),
          },
        };
      });
    },
  });
}
