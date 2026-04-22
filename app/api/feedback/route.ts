import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/feedback
 *
 * Forwards playtest feedback to an external webhook (Discord-compatible).
 * Configure FEEDBACK_WEBHOOK_URL in Vercel env. If unset, the endpoint
 * returns ok without forwarding (feedback is logged to server console
 * in dev only).
 *
 * Body:
 *   { text: string, screen?: string, zone?: string, game?: string,
 *     meta?: { sessionId, ua, viewport, platform } }
 */

interface FeedbackBody {
  text?: string;
  screen?: string;
  zone?: string;
  game?: string;
  meta?: {
    sessionId?: string;
    ua?: string;
    viewport?: string;
    platform?: string;
  };
}

export async function POST(req: NextRequest) {
  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const text = (body.text ?? "").trim().slice(0, 4000);
  if (!text) {
    return NextResponse.json({ ok: false, error: "text required" }, { status: 400 });
  }

  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[feedback] no webhook configured", body);
    }
    return NextResponse.json({ ok: true, forwarded: false });
  }

  const meta = body.meta ?? {};
  const summary = [
    `**Bryom Room — playtest feedback**`,
    `> ${text.split("\n").join("\n> ")}`,
    "",
    `Screen: \`${body.screen ?? "?"}\`  ·  Zone: \`${body.zone ?? "?"}\`  ·  Game: \`${body.game ?? "?"}\``,
    `Platform: \`${meta.platform ?? "?"}\`  ·  Viewport: \`${meta.viewport ?? "?"}\``,
    `Session: \`${meta.sessionId ?? "?"}\``,
  ].join("\n");

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: summary,
        // non-Discord webhooks see raw fields
        text,
        context: {
          screen: body.screen,
          zone: body.zone,
          game: body.game,
        },
        meta,
      }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, forwarded: false, status: res.status },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[feedback] forward failed", err);
    return NextResponse.json({ ok: false, forwarded: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true, forwarded: true });
}
