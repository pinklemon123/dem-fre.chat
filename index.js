import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Temporary in-memory store to mimic notes CRUD
const notes = [];
let nextId = 1;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/notes", (_req, res) => {
  // Return newest first to match guide's expectation
  res.json([...notes].reverse());
});

app.post("/notes", (req, res) => {
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  const note = { id: nextId++, content, createdAt: new Date().toISOString() };
  notes.push(note);
  res.status(201).json(note);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API running on port ${port}`));

