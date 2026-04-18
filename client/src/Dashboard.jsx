import {  useState } from 'react';
import MapComponent from './MapComponent';
import AdminPanel from './AdminPanel';
import RadiosList from './Radios';
import RadioPositions from './RadioPositions';
import Groups from './Groups';

function Dashboard({ auth, onLogout }) {
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [activeSection, setActiveSection] = useState('radios');

  const sectionButtonStyle = (active) => ({
    width: '100%',
    marginBottom: '10px',
    padding: '12px 14px',
    border: 'none',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    background: active ? '#0d6efd' : 'transparent',
    color: active ? 'white' : '#f8f9fa',
    fontWeight: active ? '700' : '500',
  });

  const groupTitleStyle = {
    margin: '0 0 12px 0',
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#6c757d',
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Barre latérale gauche */}
      <div style={{ width: '220px', padding: '20px', background: '#343a40', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Navigation</h2>
          <p style={{ margin: '8px 0 0 0', color: '#ced4da' }}>Tableau de bord</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={groupTitleStyle}>Données</p>
          <button style={sectionButtonStyle(activeSection === 'radios')} onClick={() => setActiveSection('radios')}>
            Radios
          </button>
          <button style={sectionButtonStyle(activeSection === 'positions')} onClick={() => setActiveSection('positions')}>
            Positions
          </button>
        </div>

        {auth.user.role === 'admin' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={groupTitleStyle}>Administration</p>
            <button style={sectionButtonStyle(activeSection === 'admin')} onClick={() => setActiveSection('admin')}>
              Gestion Admin
            </button>
            <button style={sectionButtonStyle(activeSection === 'groups')} onClick={() => setActiveSection('groups')}>
              Groupes
            </button>
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: '14px', color: '#adb5bd' }}>
          <strong>{auth.user.name || auth.user.email}</strong>
          <p style={{ margin: '8px 0 0 0' }}>{auth.user.role}</p>
        </div>
      </div>

      {/* Contenu principal gauche : Données */}
      <div style={{ width: '36%', padding: '20px', overflowY: 'auto', background: '#f8f9fa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Tableau de bord</h1>
            <p style={{ margin: '8px 0 0 0' }}>Section {activeSection}</p>
          </div>

          <button onClick={onLogout} style={{ padding: '8px 14px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px' }}>
            Déconnexion
          </button>
        </div>

        {activeSection === 'admin' && auth.user.role === 'admin' && <AdminPanel token={auth.token} />}
        {activeSection === 'groups' && auth.user.role === 'admin' && <Groups />}
        {activeSection === 'radios' && <RadiosList onSelectRadio={setSelectedRadio} />}
        {activeSection === 'positions' && <RadioPositions />}
      </div>

      {/* Panneau Droit : Carte */}
      <div style={{ width: '60%' }}>
        <MapComponent selectedRadio={selectedRadio} />
      </div>
    </div>
  );
}
export default Dashboard;