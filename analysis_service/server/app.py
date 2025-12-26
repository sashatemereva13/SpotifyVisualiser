from flask import Flask, request, jsonify
import subprocess, os, json
import logging

app = Flask(__name__)


#Absolute path to analysis.py
ANALYSIS_SCRIPT = "/app/analysis_service/analysis.py"

logging.basicConfig(level=logging.INFO)

@app.route("/run-analysis", methods=["POST"])
def run_analysis():
    data = request.get_json()

    file_path = data["filePath"]
    if not data or "filePath" not in data:
        return jsonify({"error": "Missing filePath in JSON body"}), 400
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found", "filePath": file_path}), 404
    
    logging.info(f"Running analysis on file: {file_path}")

    try:
        result = subprocess.run( ["python3", ANALYSIS_SCRIPT, file_path], capture_output=True, text=True, check=True )

        output = result.stdout.strip()
        return jsonify(json.loads(output)), 200
    
    except subprocess.CalledProcessError as e:
        logging.error(f"Analysis script failed: {e.stderr}")
        return jsonify({"error": "Analysis failed", "details": e.stderr}), 500
    
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON from analysis.py script: {result.stdout}")
        return jsonify({"error": "Invalid JSON from analysis.py"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
