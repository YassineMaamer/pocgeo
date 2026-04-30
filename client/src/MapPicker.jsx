import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icône
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour gérer les clics sur la map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
    }
  });
  return null;
}

function MapPicker({ position, onLocationSelect }) {
  const center = [36.8065, 10.1815]; // Tunisie
  const selectedPosition = position || center;

  return (
    <div style={{
      height: '300px',
      width: '100%',
      borderRadius: '4px',
      overflow: 'hidden',
      border: '1px solid #ddd',
      marginBottom: '15px'
    }}>
      <MapContainer center={selectedPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {position && (
          <Marker position={position} title="Position sélectionnée">
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapPicker;
