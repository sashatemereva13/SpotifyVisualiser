from flask import Flask, request, jsonify
import subprocess, os, json

app = Flask(__name__)

@app.route("/run-analysis", methods=["POST"])
def run_analysis():
    file_path = request.args.get("filePath")
    if not file_path:
        return jsonify({"error": "Missing filePath"}), 400
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    try:
        result = subprocess.run(
            ["python3", "../analysis.py", file_path],
            capture_output=True, text=True, check=True
        )
        output = result.stdout.strip()
        return jsonify(json.loads(output)), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"error": "Analysis failed", "details": e.stderr}), 500
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON from analysis.py"}), 500

if __name__ == "__main__":
    app.run(port=5000)
