import fs from "fs";
import axios from "axios";

export async function runAnalysis(filePath) {
  const baseUrl = process.env.ANALYSIS_SERVICE_URL || "http://127.0.0.1:5000";

  // Ensure file exists
  try {
    await fs.promises.access(filePath);
  } catch {
    throw new Error(`Audio file not found: ${filePath}`);
  }

  try {
    const resp = await axios.post(`${baseUrl}/run-analysis`, null, {
      params: { filePath },
      timeout: 60_000, // 60 seconds
    });

    return resp.data;
  } catch (err) {
    if (err.response) {
      throw new Error(
        `Analysis service failed (${err.response.status}): ${
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data)
        }`
      );
    }

    if (err.code === "ECONNABORTED") {
      throw new Error("Analysis service timed out");
    }

    throw new Error(`Analysis service unreachable: ${err.message}`);
  }
}
