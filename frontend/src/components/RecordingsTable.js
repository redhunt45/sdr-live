import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const RecordingsTable = ({ recordings = [], onPlay, onDownload }) => (
  <Table striped bordered hover responsive>
    <thead>
      <tr>
        <th>Time</th>
        <th>Duration (s)</th>
        <th>Source</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {recordings.length === 0 ? (
        <tr><td colSpan="4" className="text-center">No recordings found.</td></tr>
      ) : (
        recordings.map(rec => (
          <tr key={rec.id}>
            <td>{new Date(rec.timestamp).toLocaleString()}</td>
            <td>{rec.duration}</td>
            <td>{rec.source}</td>
            <td>
              <Button size="sm" variant="success" onClick={() => onPlay && onPlay(rec)} className="me-2">Play</Button>
              <Button size="sm" variant="secondary" onClick={() => onDownload && onDownload(rec)}>Download</Button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </Table>
);

export default RecordingsTable; 