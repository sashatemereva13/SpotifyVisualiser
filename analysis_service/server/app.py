from flask import Flask, request, jsonify
import subprocess
import os
import sys
import json
import traceback

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ANALYSIS_PY = os.path.join(BASE_DIR, "analysis.py")


@app.get("/")
def index():
    return jsonify({
        "ok": True,
        "service": "analysis",
        "hint": "POST /run-analysis?filePath=ABSOLUTE_PATH_TO_FILE"
    }), 200


@app.post("/run-analysis")
def run_analysis():
    try:
        file_path = request.args.get("filePath")
        if not file_path:
            return jsonify({"error": "Missing filePath (query param)"}), 400

        file_path = os.path.abspath(file_path)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found", "filePath": file_path}), 404

        if not os.path.exists(ANALYSIS_PY):
            return jsonify({"error": "analysis.py not found", "analysisPy": ANALYSIS_PY}), 500

        result = subprocess.run(
            [sys.executable, ANALYSIS_PY, file_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return jsonify({
                "error": "Analysis failed",
                "returncode": result.returncode,
                "stderr": result.stderr,
                "stdout": result.stdout
            }), 500

        output = (result.stdout or "").strip()

        try:
            data = json.loads(output) if output else {}
        except json.JSONDecodeError:
            return jsonify({
                "error": "analysis.py did not return valid JSON",
                "raw_stdout": output
            }), 500

        return jsonify(data), 200

    except Exception as e:
        return jsonify({
            "error": "Server exception",
            "message": str(e),
            "trace": traceback.format_exc()
        }), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
