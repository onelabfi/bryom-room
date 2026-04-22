import { notFound } from "next/navigation";
import ZoneView from "@/components/room/ZoneView";
import type { Zone } from "@/lib/analytics";

const VALID: Zone[] = ["focus", "calm", "fidget", "release"];

export default async function ZonePage({
  params,
}: {
  params: Promise<{ zone: string }>;
}) {
  const { zone } = await params;
  if (!VALID.includes(zone as Zone)) notFound();
  return <ZoneView zone={zone as Zone} />;
}
