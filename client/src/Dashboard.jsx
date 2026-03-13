import { useEffect, useState } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import AdminPanel from './AdminPanel';

function Dashboard({ auth, onLogout }) {
  const [radios, setRadios] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    fetchRadios();
    const interval = setInterval(fetchRadios, 5000); // Refresh toutes les 5s
    return () => clearInterval(interval);
  }, []);

  const fetchRadios = async () => {
    const res = await axios.get('http://localhost:5000/api/radios', { headers: { Authorization: auth.token } });
    setRadios(res.data);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Panneau Gauche : Données */}
      <div style={{ width: '40%', padding: '20px', overflowY: 'auto', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Flotte ({radios.length})</h2>
          <div>
            {auth.user.role === 'admin' && (
              <button onClick={() => setShowAdmin(!showAdmin)} style={{ marginRight: '10px', padding: '5px 10px' }}>
                {showAdmin ? 'Fermer Dashboard' : 'Gestion Admin'}
              </button>
            )}
            <button onClick={onLogout} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none' }}>Déconnexion</button>
          </div>
        </div>

        {showAdmin && auth.user.role === 'admin' && <AdminPanel token={auth.token} refresh={fetchRadios} />}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Nom</th>
              <th>Groupe</th>
              <th>Statut</th>
              <th>MAJ</th>
            </tr>
          </thead>
          <tbody>
            {radios.map(radio => (
              <tr key={radio.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{radio.name}</td>
                <td>Groupe {radio.group_id}</td>
                <td style={{ color: radio.status === 'active' ? 'green' : 'red' }}>{radio.status}</td>
                <td>{new Date(radio.last_seen).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panneau Droit : Carte */}
      <div style={{ width: '60%' }}>
        <MapComponent radios={radios} />
      </div>
    </div>
  );
}
export default Dashboard;