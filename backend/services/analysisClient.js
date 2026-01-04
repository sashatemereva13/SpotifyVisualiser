import fs from "fs";
import FormData from "form-data";

// backend/services/analysisClient.js
export async function callAnalysisService(filePath) {
  const baseUrl = process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5000";

  const url = `${baseUrl}/run-analysis?filePath=${encodeURIComponent(filePath)}`;

  const resp = await fetch(url, { method: "POST" });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Analysis service failed: ${resp.status} ${text}`);
  }

  return await resp.json();
}