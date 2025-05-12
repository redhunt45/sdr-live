import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import AudioPlayer from './components/AudioPlayer';
import Search from './components/Search';
import RecordingsTable from './components/RecordingsTable';

function App() {
  const [liveSrc, setLiveSrc] = useState('/stream/live');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentRecordings, setRecentRecordings] = useState([]);

  // Fetch recent recordings for Live Stream tab
  useEffect(() => {
    fetch('/recordings?limit=5')
      .then(res => res.json())
      .then(data => setRecentRecordings(data))
      .catch(() => setRecentRecordings([]));
  }, []);

  const handleSearch = async (date, time) => {
    setLoading(true);
    setError(null);
    try {
      // Convert date to YYYY-MM-DD
      const formattedDate = date ? new Date(date).toISOString().slice(0, 10) : '';
      // Convert time to HH:MM (24-hour)
      let formattedTime = '';
      if (time) {
        const d = new Date(`1970-01-01T${time}`);
        formattedTime = d.toTimeString().slice(0, 5);
      }
      let url = `/recordings`;
      const params = [];
      if (formattedDate) params.push(`date=${encodeURIComponent(formattedDate)}`);
      if (formattedTime) params.push(`time=${encodeURIComponent(formattedTime)}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch recordings');
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">SDR Live</Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Tabs defaultActiveKey="live" id="sdr-tabs" className="mb-3">
          <Tab eventKey="live" title="Live Stream">
            <Row>
              <Col md={8} className="mx-auto">
                <h4>Live Stream</h4>
                <AudioPlayer src={selectedAudio || liveSrc} live={!selectedAudio} />
                <div className="mt-4">
                  <h5>Recent Recordings</h5>
                  <ul className="list-group">
                    {recentRecordings.map(rec => (
                      <li key={rec.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          {new Date(rec.timestamp).toLocaleString()} &mdash; {rec.duration}s {rec.source && `— ${rec.source}`}
                        </span>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setSelectedAudio(`/stream/${rec.id}`)}>
                          Play
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="search" title="Search Recordings">
            <Row>
              <Col md={10} className="mx-auto">
                <h4>Search Recordings</h4>
                <Search onSearch={handleSearch} />
                {loading && <div>Loading...</div>}
                {error && <div className="text-danger">{error}</div>}
                <div className="mt-4">
                  <RecordingsTable
                    recordings={searchResults}
                    onPlay={rec => setSelectedAudio(`/stream/${rec.id}`)}
                    onDownload={rec => window.open(`/stream/${rec.id}?download=1`, '_blank')}
                  />
                  {selectedAudio && (
                    <div className="mt-3">
                      <AudioPlayer src={selectedAudio} />
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}

export default App;
