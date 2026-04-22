import { notFound } from "next/navigation";
import GameShell from "@/components/room/GameShell";
import { gameById } from "@/lib/state";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  if (!gameById(game)) notFound();
  return <GameShell gameId={game} />;
}
