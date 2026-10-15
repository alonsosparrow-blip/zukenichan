import { getStore } from "@netlify/blobs";

const H = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const out = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: H });

export default async (req) => {
  const store = getStore("viaje");
  if (req.method === "GET") {
    const data = await store.get("state", { type: "json" });
    return out(data || null);
  }
  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > 300000) return out({ error: "too big" }, 413);
    let s;
    try { s = JSON.parse(body); } catch { return out({ error: "bad json" }, 400); }
    if (!s || !Array.isArray(s.days)) return out({ error: "bad data" }, 400);
    const cur = await store.get("state", { type: "json" });
    s.rev = ((cur && cur.rev) || 0) + 1;
    await store.setJSON("state", s);
    return out({ rev: s.rev });
  }
  return out({ error: "method" }, 405);
};

export const config = { path: "/api/state" };
