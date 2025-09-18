let notes = [];
let nextId = 1;

async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json([...notes].reverse());
    return;
  }

  if (req.method === "POST") {
    const body = await parseJsonBody(req);
    const content = typeof body?.content === "string" ? body.content : "";
    const note = { id: nextId++, content, createdAt: new Date().toISOString() };
    notes.push(note);
    res.status(201).json(note);
    return;
  }

  res.setHeader("Allow", "GET,POST,OPTIONS");
  res.status(405).json({ error: "Method Not Allowed" });
}

