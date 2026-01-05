export async function callAnalysisService(filePath) {
  const baseUrl = process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5000";
  const url = `${baseUrl}/run-analysis?filePath=${encodeURIComponent(filePath)}`;

  let resp;
  try {
    resp = await fetch(url, { method: "POST" });
  } catch (e) {
    throw new Error(`Cannot reach analysis service at ${baseUrl}: ${e.message}`);
  }

  if (!resp.ok) {
    const data = await resp.json().catch(() => null);
    const err = new Error("Analysis service failed");
    err.payload = data;
    err.status = resp.status;
    throw err;
  }

}
