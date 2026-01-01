export async function callAnalysisService(filePath) {
  const baseUrl = process.env.ANALYSIS_SERVICE_URL || "http://localhost:5001";

  const resp = await fetch(`${baseUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: filePath }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Analysis service failed: ${resp.status} ${text}`);
  }

  return await resp.json();
}
