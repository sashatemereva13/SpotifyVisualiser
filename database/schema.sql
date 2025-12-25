-- Spotify Visualiser — L1 Database Schema (PostgreSQL)

-- Table: tracks (represents an uploaded song and audio file)
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    file_path TEXT NOT NULL,
    duration FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Table: analysis (audio analysis result for a track)
CREATE TABLE analysis (
    id SERIAL PRIMARY KEY,
    track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,

    -- scalar values
    tempo FLOAT,
    low FLOAT,
    mid FLOAT,
    high FLOAT,

    -- time-series / arrays
    fft JSONB,
    rms JSONB,
    centroid JSONB,
    rolloff JSONB,
    zcr JSONB,
    onsets JSONB,
    envelope JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
