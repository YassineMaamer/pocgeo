import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix icône
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// 🔥 Move map to selected radio
function FlyToRadio({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position]);

  return null;
}

// Icon config
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// 🔥 IMPORTANT: recevoir selectedRadio
function MapComponent({ auth, selectedRadio }) {

  const [positions, setPositions] = useState([]);

  const center = [36.8065, 10.1815];

  // Fetch
  useEffect(() => {
    const userIdParam = auth?.user?.id ? `?userId=${auth.user.id}` : '';
    fetch(`http://localhost:5000/api/radio-positions${userIdParam}`)
      .then(res => res.json())
      .then(data => setPositions(data))
      .catch(err => console.error(err));
  }, [auth]);

  // ✅ نحسب position مباشرة (بدون state)
  const selectedPosition = (() => {
    if (!selectedRadio) return null;

    const pos = positions.find(p => p.radio_id === selectedRadio);
    return pos ? [pos.latitude, pos.longitude] : null;
  })();

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔥 Move map */}
        <FlyToRadio position={selectedPosition} />

        {/* Markers */}
        {positions.map((pos) => (
          <Marker key={pos.id} position={[pos.latitude, pos.longitude]}>
             <Popup>
              📡 Radio ID: {pos.radio_id} <br />
              📍 Lat: {pos.latitude} <br />
              📍 Lng: {pos.longitude} <br />
               Status : { pos.signal_quality > 75 ? 'Excellent' : pos.signal_quality > 50 ? 'Bon' : pos.signal_quality > 25 ? 'Moyen' : 'Faible' } <br /> 
              📶 Signal: {pos.signal_quality}% <br />
              🔋 Battery: {pos.battery_level}%
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}

export default MapComponent;