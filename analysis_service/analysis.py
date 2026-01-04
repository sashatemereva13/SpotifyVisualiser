# analysis_service/analysis.py
import librosa
import json

def get_json(file_path: str):
    y, sr = librosa.load(file_path, sr=None, mono=True)

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    duration = librosa.get_duration(y=y, sr=sr)

    return {
        "tempo": float(tempo),
        "duration": float(duration),
        "sample_rate": sr
    }
if __name__ == "__main__":
    import sys, json
    print(json.dumps(get_json(sys.argv[1])))
