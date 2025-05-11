import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Search = ({ onSearch }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (onSearch) onSearch(date, time);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="align-items-end">
        <Col md={4}>
          <Form.Group controlId="searchDate">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" name="date" value={date} onChange={e => setDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="searchTime">
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" name="time" value={time} onChange={e => setTime(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Button variant="primary" type="submit">Search</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Search; 