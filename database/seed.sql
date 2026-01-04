Seed.sql
INSERT INTO tracks (title, artist, file_path, duration)
VALUES (
    'Test Track',
    'EPITA Demo',
    'audio/test_track.mp3',
    120.0
);

INSERT INTO analysis (
    track_id,
    tempo,
    low,
    mid,
    high,
    fft,
    rms,
    centroid,
    rolloff,
    zcr,
    onsets,
    envelope
) VALUES ( 
    1,
    120,
    1000,
    500,
    200,
    '[0.1, 0.2, 0.3]',
    '[0.4, 0.5, 0.6]',
    '[2000, 2100]',
    '[3000, 3200]',
    '[0.02, 0.03]',
    '[0.5, 1.2, 2.0]',
    '[0.1, 0.2, 0.15]'
);


CREATE INDEX idx_analysis_track_id ON analysis(track_id);

