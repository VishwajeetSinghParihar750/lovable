import express from "express";

const app = express();

app.use(express.json());

app.post("/chat", async (req, res) => {
  //
  const { message } = req.body;
});

app.listen(3001);
