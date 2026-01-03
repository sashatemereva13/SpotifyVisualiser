import fs from "fs";
import FormData from "form-data";

export async function callAnalysisService(filePath) {
  const baseUrl = process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5000";

  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found: ${filePath}`);
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const resp = await fetch(`${baseUrl}/api/tracks`, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Analysis service failed: ${resp.status} ${text}`);
  }

  return await resp.json();
}
