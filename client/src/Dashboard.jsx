import {  useState } from 'react';
import MapComponent from './MapComponent';
import AdminPanel from './AdminPanel';
import RadiosList from './Radios';
import RadioPositions from './RadioPositions';

function Dashboard({ auth, onLogout }) {


  const [showAdmin, setShowAdmin] = useState(false);
   const [selectedRadio, setSelectedRadio] = useState(null);



  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Panneau Gauche : Données */}
      <div style={{ width: '40%', padding: '20px', overflowY: 'auto', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div>
            {auth.user.role === 'admin' && (
              <button onClick={() => setShowAdmin(!showAdmin)} style={{ marginRight: '10px', padding: '5px 10px' }}>
                {showAdmin ? 'Fermer Dashboard' : 'Gestion Admin'}
              </button>
            )}
            <button onClick={onLogout} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none' }}>Déconnexion</button>
          </div>
        </div>

        {showAdmin && auth.user.role === 'admin' && <AdminPanel token={auth.token} />}
       
<RadiosList onSelectRadio={setSelectedRadio} />

  
      </div>

      {/* Panneau Droit : Carte */}
      <div style={{ width: '60%' }}>
        <MapComponent selectedRadio={selectedRadio} />
      </div>
    </div>
  );
}
export default Dashboard;