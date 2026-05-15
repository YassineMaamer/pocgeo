import { useState } from 'react';
import { LayoutDashboard, Radio, Settings, Users, LogOut, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import MapComponent from './MapComponent';
import AdminPanel from './AdminPanel';
import RadiosList from './Radios';
import Groups from './Groups';
import DashboardHome from './DashboardHome';
import Clients from './Clients';

function Dashboard({ auth, onLogout }) {
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isMapVisible = activeSection === 'radios';

  const sectionButtonStyle = (active) => ({
    width: '100%',
    marginBottom: '10px',
    padding: sidebarCollapsed ? '12px 8px' : '14px 16px',
    border: 'none',
    borderRadius: '12px',
    textAlign: 'left',
    cursor: 'pointer',
    background: active ? '#2563eb' : 'transparent',
    color: active ? 'white' : '#cbd5e1',
    fontWeight: active ? '700' : '600',
    transition: 'background 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
    gap: '12px',
  });

  const groupTitleStyle = {
    margin: '0 0 12px 0',
    fontSize: '12px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#94a3b8',
  };

  const sectionTitles = {
    dashboard: 'Tableau de bord',
    radios: 'Radios',
    admin: 'Administration',
    groups: 'Groupes',
    clients: 'Clients',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <div
        style={{
          width: sidebarCollapsed ? '80px' : '250px',
          padding: sidebarCollapsed ? '16px 10px' : '26px',
          background: '#1e293b',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '8px 0 24px rgba(15, 23, 42, 0.12)',
          transition: 'width 0.3s ease, padding 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ marginBottom: sidebarCollapsed ? '16px' : '32px', minHeight: sidebarCollapsed ? 'auto' : '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!sidebarCollapsed && (
            <div>
              <h2 style={{ margin: 0, fontSize: '24px' }}>POC Geo</h2>
              <p style={{ margin: '10px 0 0', color: '#94a3b8', fontSize: '14px' }}>Gérez vos radios et positions</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div style={{ marginBottom: '26px' }}>
          <p style={!sidebarCollapsed ? groupTitleStyle : { ...groupTitleStyle, fontSize: '0px', margin: '0 0 6px 0' }}>Navigation</p>
          <button
            style={sectionButtonStyle(activeSection === 'dashboard')}
            onClick={() => setActiveSection('dashboard')}
            title={sidebarCollapsed ? 'Dashboard' : ''}
          >
            <LayoutDashboard size={18} /> {!sidebarCollapsed && 'Dashboard'}
          </button>
          <button
            style={sectionButtonStyle(activeSection === 'radios')}
            onClick={() => setActiveSection('radios')}
            title={sidebarCollapsed ? 'Radios' : ''}
          >
            <Radio size={18} /> {!sidebarCollapsed && 'Radios'}
          </button>
        </div>

        {auth.user?.role === 'admin' && (
          <div style={{ marginBottom: '26px' }}>
            <p style={!sidebarCollapsed ? groupTitleStyle : { ...groupTitleStyle, fontSize: '0px', margin: '0 0 6px 0' }}>Administration</p>
            <button
              style={sectionButtonStyle(activeSection === 'admin')}
              onClick={() => setActiveSection('admin')}
              title={sidebarCollapsed ? 'Gestion admin' : ''}
            >
              <Settings size={18} /> {!sidebarCollapsed && 'Gestion admin'}
            </button>
            <button
              style={sectionButtonStyle(activeSection === 'groups')}
              onClick={() => setActiveSection('groups')}
              title={sidebarCollapsed ? 'Groupes' : ''}
            >
              <Users size={18} /> {!sidebarCollapsed && 'Groupes'}
            </button>
            <button
              style={sectionButtonStyle(activeSection === 'clients')}
              onClick={() => setActiveSection('clients')}
              title={sidebarCollapsed ? 'Clients' : ''}
            >
              <UserPlus size={18} /> {!sidebarCollapsed && 'Clients'}
            </button>
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: sidebarCollapsed ? '0px' : '14px', color: '#cbd5e1', opacity: sidebarCollapsed ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <strong>{auth.user?.name || auth.user?.email}</strong>
          <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>{auth.user?.role || 'Utilisateur'}</p>
        </div>
      </div>

      <div
        style={{
          width: isMapVisible ? '38%' : '100%',
          padding: '26px',
          overflowY: 'auto',
          transition: 'width 0.3s ease',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#0f172a' }}>{sectionTitles[activeSection]}</h1>
            <p style={{ margin: '10px 0 0', color: '#64748b' }}>Vue détaillée pour {sectionTitles[activeSection].toLowerCase()}.</p>
          </div>

          <button
            onClick={onLogout}
            style={{
              padding: '10px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>

        {activeSection === 'dashboard' && <DashboardHome auth={auth} />}
        {activeSection === 'admin' && auth.user.role === 'admin' && (
          <AdminPanel token={auth.token} />
        )}
        {activeSection === 'groups' && auth.user.role === 'admin' && (
          <Groups />
        )}
        {activeSection === 'clients' && auth.user.role === 'admin' && (
          <Clients />
        )}
        {activeSection === 'radios' && (
          <RadiosList auth={auth} onSelectRadio={setSelectedRadio} />
        )}
      </div>

      {/* Map */}
      {isMapVisible && (
        <div
          style={{
            width: '50%',
            transition: 'width 0.3s ease',
          }}
        >
          <MapComponent auth={auth} selectedRadio={selectedRadio} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;