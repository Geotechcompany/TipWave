import React from 'react';

const SongQueue = ({ queue = [] }) => {
  return (
    <div className="song-queue">
      <h2>Song Queue</h2>
      {queue.length === 0 ? (
        <p>The queue is currently empty.</p>
      ) : (
        <ul>
          {queue.map((song, index) => (
            <li key={index}>
              {song.title} - {song.artist}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongQueue;
