import type { Request, Response } from "express";
import { CalculateScoreBody, CalculateScoreResponse } from "@workspace/api-zod";

const FASTAPI_URL = (process.env["FASTAPI_URL"] ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function scoreRoute(req: Request, res: Response) {
  const parsed = CalculateScoreBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Bad request", message: parsed.error.message });
    return;
  }

  try {
    const upstream = await fetch(`${FASTAPI_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      const errorBody = await upstream.text();
      req.log?.error(
        { status: upstream.status, body: errorBody },
        "FastAPI model service error",
      );
      res.status(502).json({
        error: "Model service unavailable",
        message: "Prediction service failed to respond successfully",
      });
      return;
    }

    const json = await upstream.json();
    const validated = CalculateScoreResponse.safeParse(json);

    if (!validated.success) {
      req.log?.error({ zodError: validated.error.message }, "Invalid prediction payload from model service");
      res.status(502).json({
        error: "Model service response invalid",
        message: "Prediction payload did not match expected schema",
      });
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log?.error({ err }, "Error calling model service");
    res.status(502).json({
      error: "Model service unavailable",
      message: "Unable to reach prediction service",
    });
  }
}
