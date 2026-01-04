# Flask is a lightweight Python web framework.
# We use it to expose an HTTP API that other services (Node backend) can call.
from flask import Flask, request, jsonify

# subprocess lets Python run external programs (here: another Python script).
# os is used to work with file paths and check if files exist.
# json is used to parse and return JSON data.
import subprocess
import os
import json

# Create the Flask application.
# This represents our analysis microservice.
app = Flask(__name__)


# Define an HTTP endpoint that runs audio analysis.
# This endpoint is called by the Node.js backend.
#
# Method: POST
# URL: /run-analysis
#
# Example call:
# POST http://localhost:5000/run-analysis?filePath=/absolute/path/to/audio.mp3
@app.route("/run-analysis", methods=["POST"])
def run_analysis():

    # Read the "filePath" query parameter from the request.
    # This is the absolute path to the audio file on disk.
    file_path = request.args.get("filePath")

    # If the backend did not send a file path, return a client error.
    if not file_path:
        return jsonify({"error": "Missing filePath"}), 400

    # Check that the file actually exists on the filesystem.
    # The Python service assumes it shares the same filesystem as the backend.
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    try:
        # Run the audio analysis script (analysis.py) as a subprocess.
        #
        # ["python3", "../analysis.py", file_path]
        # - python3 → Python interpreter
        # - ../analysis.py → analysis script
        # - file_path → argument passed to the script
        #
        # capture_output=True → capture stdout/stderr
        # text=True → treat output as text instead of bytes
        # check=True → raise an error if the script fails
        result = subprocess.run(
            ["python3", "../analysis.py", file_path],
            capture_output=True,
            text=True,
            check=True
        )

        # The analysis script is expected to print JSON to stdout.
        # We strip whitespace and parse it.
        output = result.stdout.strip()

        # Convert the JSON string into a Python object
        # and return it as an HTTP JSON response.
        return jsonify(json.loads(output)), 200

    except subprocess.CalledProcessError as e:
        # This error happens if analysis.py crashes or exits with an error code.
        return jsonify({
            "error": "Analysis failed",
            "details": e.stderr
        }), 500

    except json.JSONDecodeError:
        # This error happens if analysis.py does not output valid JSON.
        return jsonify({
            "error": "Invalid JSON from analysis.py"
        }), 500


# If this file is executed directly (not imported),
# start the Flask development server.
#
# The service will be available at:
# http://localhost:5000
if __name__ == "__main__":
    app.run(port=5000)
