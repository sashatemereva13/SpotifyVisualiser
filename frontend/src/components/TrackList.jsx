export default function TrackList({ tracks, onSelect }) {
  return (
    <ul className="trackList">
      {tracks.map((t) => (
        <li key={t.id} onClick={() => onSelect(t)}>
          {t.originalName}
        </li>
      ))}
    </ul>
  );
}
