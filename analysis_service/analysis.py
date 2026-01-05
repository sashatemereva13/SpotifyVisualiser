import librosa, json

def get_json(file_path: str):
    y, sr = librosa.load(file_path, sr=22050, mono=True, duration=30)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = float(librosa.feature.tempo(onset_envelope=onset_env, sr=sr)[0])
    duration = float(librosa.get_duration(y=y, sr=sr))
    return {"tempo": tempo, "duration": duration, "sample_rate": sr}

if __name__ == "__main__":
    import sys
    print(json.dumps(get_json(sys.argv[1])))
