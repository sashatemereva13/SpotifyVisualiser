"""
=================================================
  ████████╗██╗  ██╗ ██████╗ ███╗   ██╗██████╗ 
  ╚══██╔══╝██║  ██║██╔═══██╗████╗  ██║██╔══██╗
     ██║   ███████║██║   ██║██╔██╗ ██║██║  ██║
     ██║   ██╔══██║██║   ██║██║╚██╗██║██║  ██║
     ██║   ██║  ██║╚██████╔╝██║ ╚████║██████╔╝
     ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝ 

                 SOUND ANALYZER
             SPOTIFY ANALYZER PROJECT
=================================================
By Student Group of EPITA (KB)
requirements:
    pip install -r requirements.txt
=================================================
"""


import numpy as np
import librosa
import json
import os

# -------------------------------------------------------
# UTILITAIRE : compression des signaux
# -------------------------------------------------------


def reduce_array(data, n=300):
    """Réduit un tableau très long à n valeurs maximum."""
    if data is None or len(data) == 0:
        return []
    if len(data) <= n:
        return data
    step = max(1, len(data) // n)
    return data[::step][:n]
class Analysis:
    def __init__(self, file_path):
        self.file_path = file_path
        # Core audio
        self.audio_signal = None
        self.audio_rate = None
        # Tempo / beats
        self.tempo = None
        self.beat_times = None
        # FFT + fréquences
        self.freqs = None
        self.fft = None
        self.fft_reduced = None

        # Bands
        self.low = None
        self.mid = None
        self.high = None

        # RMS
        self.rms = None

        # Spectral features (LEVEL 3)
        self.centroid = None
        self.rolloff = None
        self.zcr = None
        self.onsets = None
        self.envelope = None

    # -------------------------------------------------------
    # 1) Charger l'audio
    # -------------------------------------------------------
    def load_audio(self):
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Audio file not found: {self.file_path}")

        self.audio_signal, self.audio_rate = librosa.load(
            self.file_path, sr=None, mono=True
        )

    # -------------------------------------------------------
    # 2) Tempo + Beats
    # -------------------------------------------------------
    def compute_tempo_beats(self):
        tempo, beat_frames = librosa.beat.beat_track(
            y=self.audio_signal,
            sr=self.audio_rate
        )

        self.tempo = float(tempo.item())
        self.beat_times = librosa.frames_to_time(
            beat_frames, sr=self.audio_rate
        ).tolist()

    # -------------------------------------------------------
    # 3) FFT + Magnitude
    # -------------------------------------------------------
    def compute_fft(self):
        fft_result = np.fft.rfft(self.audio_signal)
        magnitude = np.abs(fft_result) 
        self.fft = magnitude
        self.freqs = np.fft.rfftfreq(len(self.audio_signal), d=1/self.audio_rate)

        # réduire pour JSON
        self.fft_reduced = reduce_array(magnitude.tolist(), 300)

    # -------------------------------------------------------
    # 4) LOW / MID / HIGH bands
    # -------------------------------------------------------
    def compute_bands(self):
        low_band = (self.freqs >= 20) & (self.freqs < 250)
        mid_band = (self.freqs >= 250) & (self.freqs < 4000)
        high_band = (self.freqs >= 4000) & (self.freqs <= 20000)

        self.low = float(np.sum(self.fft[low_band]))
        self.mid = float(np.sum(self.fft[mid_band]))
        self.high = float(np.sum(self.fft[high_band]))
    # -------------------------------------------------------
    # 5) RMS (Level 2)
    # -------------------------------------------------------
    def compute_rms(self):
        rms = librosa.feature.rms(y=self.audio_signal)[0]
        rms_norm = (rms - rms.min()) / (rms.max() - rms.min())
        self.rms = reduce_array(rms_norm.tolist(), 300)

    # -------------------------------------------------------
    # 6) SPECTRAL FEATURES (LEVEL 3)
    # -------------------------------------------------------
    def compute_spectral_features(self):
        # Spectral centroid
        centroid = librosa.feature.spectral_centroid(
            y=self.audio_signal, sr=self.audio_rate
        )[0]
        self.centroid = reduce_array(centroid.tolist(), 300)

        # Rolloff (spectral decay zone)
        rolloff = librosa.feature.spectral_rolloff(
            y=self.audio_signal, sr=self.audio_rate
        )[0]
        self.rolloff = reduce_array(rolloff.tolist(), 300)

        # Zero Crossing Rate (percussive / noisy texture)
        zcr = librosa.feature.zero_crossing_rate(
            self.audio_signal
        )[0]
        self.zcr = reduce_array(zcr.tolist(), 300)

        # Onsets = transients (notes frappées)
        onset_frames = librosa.onset.onset_detect(
            y=self.audio_signal,
            sr=self.audio_rate
        )
        self.onsets = librosa.frames_to_time(
            onset_frames,
            sr=self.audio_rate
        ).tolist()

        # Amplitude envelope (signal smoothed)
        frames = range(len(self.audio_signal))
        hop = 512
        envelope = [
            max(self.audio_signal[i:i+hop], default=0)
            for i in range(0, len(self.audio_signal), hop)
        ]
        self.envelope = reduce_array(envelope, 300)

    # -------------------------------------------------------
    # 7) JSON final
    # -------------------------------------------------------
    def to_json(self):
        return {
            "tempo": float(self.tempo),
            "beats": [float(b) for b in self.beat_times],

            # energy bands
            "low": float(self.low),
            "mid": float(self.mid),
            "high": float(self.high),

            # reduced signals
            "fft": [float(x) for x in self.fft_reduced],
            "rms": [float(x) for x in self.rms],

            # spectral features
            "centroid": [float(x) for x in self.centroid],
            "rolloff": [float(x) for x in self.rolloff],
            "zcr": [float(x) for x in self.zcr],
            "onsets": [float(x) for x in self.onsets],
            "envelope": [float(x) for x in self.envelope],
        }


    # -------------------------------------------------------
    # 8) Pipeline complet
    # -------------------------------------------------------
    def run(self):
        self.load_audio()
        self.compute_tempo_beats()
        self.compute_fft()
        self.compute_bands()
        self.compute_rms()
        self.compute_spectral_features()
        return self.to_json()


# -------------------------------------------------------
# FONCTION UNIQUE POUR LE BACKEND
# -------------------------------------------------------
def get_json(file_path: str):
    analyzer = Analysis(file_path)
    return analyzer.run()


# Test manuel
if __name__ == "__main__":
    analise = Analysis('audio_test.mp3')
    print(get_json("audio_test.mp3"))
