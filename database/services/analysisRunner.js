import { exec } from 'child_process';
import path from 'path';
import { addAnalysis } from '../db/db.js';
import { getTracks } from '../db/db.js';

export async function runAnalysis(trackId) {
  const tracks = await getTracks();
  const track = tracks.find(t => t.id == trackId);

  if (!track) throw new Error('Track not found');

  return new Promise((resolve, reject) => {
    exec(
      `python3 backend/analysis_service/analysis.py ${track.file_path}`,
      async (err, stdout) => {
        if (err) return reject(err);

        const analysisJson = JSON.parse(stdout);
        const saved = await addAnalysis(trackId, analysisJson);
        resolve(saved);
      }
    );
  });
}
