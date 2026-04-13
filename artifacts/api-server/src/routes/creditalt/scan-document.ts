import type { Request, Response } from "express";

export async function scanDocumentRoute(req: Request, res: Response) {
  try {
    const { anthropic } = await import("@workspace/integrations-anthropic-ai");

    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      res.status(400).json({ error: "Bad request", message: "Expected multipart/form-data" });
      return;
    }

    const multer = (await import("multer")).default;
    const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

    await new Promise<void>((resolve, reject) => {
      upload.single("file")(req as any, res as any, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (req as any).file as Express.Multer.File | undefined;
    const documentType = req.body?.documentType as string | undefined;

    if (!file || !documentType) {
      res.status(400).json({ error: "Bad request", message: "file and documentType are required" });
      return;
    }

    const base64 = file.buffer.toString("base64");
    const mediaType = file.mimetype;

    const contentBlock =
      mediaType === "application/pdf"
        ? ({
            type: "document" as const,
            source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
          })
        : ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", data: base64 },
          });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: `You are a financial document scanner for a credit risk platform in India. Return ONLY valid JSON with no markdown or preamble.`,
      messages: [
        {
          role: "user",
          content: [
            contentBlock as any,
            {
              type: "text",
              text: `Extract from this ${documentType} and return JSON: { documentType, detectedType, confidence (0-1), extractedData: { monthlyIncome, avgBalance, totalDebits, totalCredits, upiTransactionCount, billAmount, billPaidOnTime, subscriptionActive, subscriptionPlatform, subscriptionAmount, rentAmount, rentPaidOnTime, employerName, employmentType, insurancePremium, insurancePaidOnTime, missedPayments, anomalyFlags[] }, derivedScores: { txnScore(1-5), utilityScore(1-5), rentScore(1-5), insuranceScore(1-5), employmentStability(1-5) }, warnings[] }`,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}";
    const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    res.json(parsed);
  } catch (err) {
    req.log?.error({ err }, "Error scanning document");
    res.status(500).json({ error: "Server error", message: "Failed to scan document" });
  }
}
