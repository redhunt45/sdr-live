import React from 'react';
import Badge from 'react-bootstrap/Badge';

const AudioPlayer = ({ src, live }) => (
  <div>
    {live && <Badge bg="danger" className="mb-2">Live</Badge>}
    <audio controls src={src} style={{ width: '100%' }}>
      Your browser does not support the audio element.
    </audio>
  </div>
);

export default AudioPlayer; 