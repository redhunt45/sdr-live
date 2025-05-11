import React, { useState } from 'react';
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
  const [liveSrc] = useState('/stream/live');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (date, time) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/recordings`;
      const params = [];
      if (date) params.push(`date=${encodeURIComponent(date)}`);
      if (time) params.push(`time=${encodeURIComponent(time)}`);
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
                <AudioPlayer src={liveSrc} live />
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
