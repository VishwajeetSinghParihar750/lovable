import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
});
app.post("/signin", (req, res) => {
  //
});

app.post("/project", (req, res) => {
  //
});
app.post("/project/:id", (req, res) => {
  //
});

app.listen(3000);
