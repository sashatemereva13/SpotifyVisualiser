# Flask is a lightweight Python web framework.
# We use it to expose an HTTP API that other services (Node backend) can call.
from flask import Flask, request, jsonify

# subprocess lets Python run external programs (here: another Python script).
# os is used to work with file paths and check if files exist.
# json is used to parse and return JSON data.

import os


from analysis import get_json

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
        return jsonify(get_json(file_path)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# If this file is executed directly (not imported),
# start the Flask development server.
#
# The service will be available at:
# http://localhost:5000
if __name__ == "__main__":
    app.run(port=5000)
