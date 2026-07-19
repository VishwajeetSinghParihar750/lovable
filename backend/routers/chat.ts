import { Router } from "express";
import express from "express";

const router = Router();

router.use(express.json());

router.get("/", (req, res) => {});

export default router;
