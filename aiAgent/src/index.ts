import { mainAgent } from "./agents/mainAgent";
import express from "express";

const app = express();
app.use(express.json());

process.on("uncaughtException", (e) => {
  console.error("uncaughtException ", e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  console.error("unhandledRejection ", e);
  process.exit(1);
});

// todo
app.get("/stop", async (req, res) => {});

// todo: dont take the next request until current in done
app.post("/prompt", async (req, res) => {
  console.log("/prompt in ai agent", req.body);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const { message } = req.body;
  await mainAgent(
    message,
    (output: string) => res.write(output + "\n\n"),
    () => res.end(),
  );

  req.on("close", () => {
    console.log("user disconnected");
    // stop everything
    // abort controller or something
    res.end();
  });
});

app.listen(3001);
