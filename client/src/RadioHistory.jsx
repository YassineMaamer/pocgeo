import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { ArrowLeft, MapPin, BatteryCharging, Signal, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function FlyToPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14);
  }, [position, map]);
  return null;
}

const RadioHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPolyline, setShowPolyline] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/radios/${id}/history`);
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'historique');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  const formattedDate = (value) => new Date(value || Date.now()).toLocaleString();
  const latestEntry = history.length ? history[history.length - 1] : null;
  const firstEntry = history.length ? history[0] : null;

  return (
    <div className="page-shell">
      <div className="history-header">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Retour
        </button>

        <div>
          <h2 className="page-title">Historique de la radio #{id}</h2>
          <p className="page-subtitle">Trajectoire GPS, batterie et qualité du signal enregistrés en temps réel.</p>
        </div>
      </div>

      {loading && <div className="empty-state-card"><p>Chargement de l'historique...</p></div>}
      {error && <div className="empty-state-card error-card"><p>{error}</p></div>}

      {!loading && !error && (
        history.length > 0 ? (
          <>
            <div className="history-grid">
              <section className="map-panel premium-card">
                <div className="panel-title">
                  <MapPin size={18} /> Carte de trajectoire
                </div>
                <div className="map-wrapper">
                  <MapContainer center={[36.8065, 10.1815]} zoom={13} className="history-map">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <FlyToPosition position={firstEntry ? [firstEntry.latitude, firstEntry.longitude] : null} />
                    {showPolyline && (
                      <Polyline positions={history.map((h) => [h.latitude, h.longitude]).reverse()} color="#2563eb" />
                    )}
                    {showMarkers && history.slice().reverse().map((h, idx) => (
                      <Marker key={idx} position={[h.latitude, h.longitude]}>
                        <Popup>
                          {formattedDate(h.timestamp || h.recorded_at)}<br />
                          Lat: {h.latitude} Lng: {h.longitude}<br />
                          Signal: {h.signal_quality ?? '—'}%<br />
                          Batterie: {h.battery_level ?? '—'}%
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>

                <div className="history-toggle-row">
                  <label className="toggle-label">
                    <input type="checkbox" checked={showPolyline} onChange={(e) => setShowPolyline(e.target.checked)} />
                    Afficher la trajectoire
                  </label>
                  <label className="toggle-label">
                    <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} />
                    Afficher les points
                  </label>
                </div>
              </section>

              <aside className="history-info">
                <div className="stat-card">
                  <div className="stat-title">Dernier point</div>
                  <div className="stat-value">{formattedDate(latestEntry?.timestamp || latestEntry?.recorded_at)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Dernière batterie</div>
                  <div className="stat-value">
                    <BatteryCharging size={18} /> {latestEntry?.battery_level ?? '—'}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Qualité du signal</div>
                  <div className="stat-value">
                    <Signal size={18} /> {latestEntry?.signal_quality ?? '—'}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Points enregistrés</div>
                  <div className="stat-value">
                    <Layers size={18} /> {history.length}
                  </div>
                </div>
              </aside>
            </div>

            <section className="history-table-panel premium-card">
              <div className="panel-title">Historique détaillé</div>
              <div className="table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                      <th>Signal</th>
                      <th>Batterie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice().reverse().map((item, idx) => (
                      <tr key={idx}>
                        <td data-label="Date">{formattedDate(item.timestamp || item.recorded_at)}</td>
                        <td data-label="Latitude">{item.latitude}</td>
                        <td data-label="Longitude">{item.longitude}</td>
                        <td data-label="Signal">{item.signal_quality ?? '—'}%</td>
                        <td data-label="Batterie">{item.battery_level ?? '—'}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="empty-state-card">
            <p>Aucun historique disponible pour cette radio.</p>
          </div>
        )
      )}
    </div>
  );
};

export default RadioHistory;
