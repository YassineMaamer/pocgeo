// RadioPositions.jsx
import React, { useEffect, useState } from 'react';

const RadioPositions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/radio-positions');
      const data = await res.json();
      setPositions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  if (loading) return <p>Loading positions...</p>;

  return (
    <div>
      <h2>Radio Positions</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Radio ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Signal</th>
            <th>Battery</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id}>
              <td>{pos.radio_id}</td>
              <td>{pos.latitude}</td>
              <td>{pos.longitude}</td>
              <td>{pos.signal_quality}</td>
              <td>{pos.battery_level}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RadioPositions;