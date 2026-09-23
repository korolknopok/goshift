import express from "express";
import path from "path";
import { config } from "./config";
import { documentsRouter } from "./routes/documents";

const app = express();
app.use(express.json());
app.use("/api", documentsRouter);
app.get("/health", (_req, res) => res.json({ok: true}));

const CLIENT_DIST = path.join(__dirname, "..", "..", "client", "dist", "client", "browser");
app.use(express.static(CLIENT_DIST));
app.get("/", (_req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));

app.listen(config.port, () => {
  console.log(`server listening on :${config.port}`);
});