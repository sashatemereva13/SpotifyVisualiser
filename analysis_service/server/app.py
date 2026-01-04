from flask import Flask, request, jsonify
import subprocess, os, json, sys, traceback

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  
ANALYSIS_PY = os.path.join(BASE_DIR, "analysis.py")

@app.route("/run-analysis", methods=["POST"])
def run_analysis():
    try:
        file_path = request.args.get("filePath")
        if not file_path:
            return jsonify({"error": "Missing filePath"}), 400

        file_path = os.path.abspath(file_path)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found", "filePath": file_path}), 404

        if not os.path.exists(ANALYSIS_PY):
            return jsonify({"error": "analysis.py not found", "analysisPy": ANALYSIS_PY}), 500

    
        print("RUN_ANALYSIS filePath =", file_path)
        print("RUN_ANALYSIS analysisPy =", ANALYSIS_PY)
        print("RUN_ANALYSIS python =", sys.executable)

        result = subprocess.run(
            [sys.executable, ANALYSIS_PY, file_path],
            capture_output=True, text=True
        )

        print("SUBPROCESS rc =", result.returncode)
        print("SUBPROCESS stdout =", result.stdout[:500])
        print("SUBPROCESS stderr =", result.stderr[:500])

        if result.returncode != 0:
            return jsonify({
                "error": "Analysis failed",
                "returncode": result.returncode,
                "stderr": result.stderr,
                "stdout": result.stdout
            }), 500

        output = result.stdout.strip()
        return jsonify(json.loads(output)), 200

    except Exception as e:
        return jsonify({
            "error": "Server exception",
            "message": str(e),
            "trace": traceback.format_exc()
        }), 500
        
@app.get("/")
def index():
    return jsonify({"ok": True, "service": "analysis", "hint": "POST /run-analysis?filePath=..."}), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
