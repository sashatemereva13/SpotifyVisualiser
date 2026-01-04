# Analysis Service

This folder contains the **Python audio analysis microservice** used by the Spotify Visualiser project.

The analysis service is responsible for **extracting musical features** (tempo, frequency bands, spectral features, etc.) from audio files and exposing the results via an HTTP API.

It is intentionally separated from the Node.js backend to keep concerns clean and modular.

---

## 📌 Responsibilities

The analysis service:

- Performs **audio signal processing** using Python libraries
- Extracts features such as:
  - Tempo & beat timestamps
  - Low / mid / high frequency energy
  - FFT, RMS
  - Spectral centroid, rolloff, zero-crossing rate
  - Onsets and amplitude envelope
- Exposes a **single HTTP endpoint** that can be called by the Node.js backend
- Returns analysis results as structured JSON

The service **does not**:
- Handle file uploads from users
- Store data in a database
- Communicate directly with the frontend

---

## 📂 Folder Structure

```
analysis_service/
├── analysis.py # Core audio analysis logic (signal processing)
├── server.py # Flask microservice exposing the analysis API
├── requirements.txt # Python dependencies
└── README.md

```


---

## 🧠 Architecture Context

The global architecture is:

```
Frontend (React)
↓
Backend (Node.js / Express)
↓
Analysis Service (Python / Flask)
```



- The **backend** uploads and stores audio files.
- The **analysis service** receives a file path and computes analysis.
- Communication happens via **HTTP**, not direct imports.

---

## 🚀 Running the Analysis Service

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the service

```
python server.py
```

### the service will start on
```
http://localhost:5000
```




## 🔌 API Endpoint
### POST /run-analysis
Runs audio analysis on an existing audio file.
Query parameters:
filePath (string, required)
Absolute path to the audio file on disk.
Example:

```
POST http://localhost:5000/run-analysis?filePath=/absolute/path/to/song.mp3
```
Response

```
{
  "tempo": 120.4,
  "low": 12345.6,
  "mid": 56789.1,
  "high": 23456.7,
  "fft": [...],
  "rms": [...],
  "centroid": [...],
  "rolloff": [...],
  "zcr": [...],
  "onsets": [...],
  "envelope": [...]
}
```



## 👥 Ownership
Audio analysis logic (analysis.py)
🟠 Paolo — Audio Analysis Developer
Microservice wrapper (server.py)
🟡 Willy — Microservice Developer


## ℹ️ Notes
The analysis service assumes it shares the same filesystem as the backend.
Audio files must already exist on disk before analysis.
This service can be replaced or scaled independently from the backend.