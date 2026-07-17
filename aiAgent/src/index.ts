import { mainAgent } from "./agents/mainAgent";
import express from "express";

const app = express();

process.on("uncaughtException", (e) => {
  console.error("uncaughtException ", e);
  process.exit(1);
});
process.on("unhandledRejection", (e) => {
  console.error("unhandledRejection ", e);
  process.exit(1);
});

app.post("/", async (req, res) => {
  const { query } = req.body;
  await mainAgent(query);
});

app.listen(3000);
