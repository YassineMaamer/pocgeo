import { useEffect, useMemo, useState } from 'react';
import { Radio, Wifi, Users, AlertTriangle } from 'lucide-react';
import io from 'socket.io-client';

function DashboardHome({ auth }) {
  const [radios, setRadios] = useState([]);
  const [groups, setGroups] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;
    const loadData = async () => {
      try {
        const baseUrl = 'http://localhost:5000/api';
        const params = new URLSearchParams();
        if (auth?.user?.id) params.append('userId', auth.user.id);

        const [radiosRes, groupsRes, positionsRes] = await Promise.all([
          fetch(`${baseUrl}/radios?${params.toString()}`),
          fetch(`${baseUrl}/groups?${params.toString()}`),
          fetch(`${baseUrl}/radio-positions?${params.toString()}`),
        ]);

        // check responses
        const errResp = [radiosRes, groupsRes, positionsRes].find(r => !r.ok);
        if (errResp) {
          const text = await errResp.text();
          let msg = 'Impossible de récupérer les données depuis le backend.';
          let parsed = null;
          try { parsed = JSON.parse(text); } catch (parseErr) { console.debug('parse error', parseErr && parseErr.message); }
          if (parsed) msg = parsed.error || parsed.message || msg;
          throw new Error(msg);
        }

        const [radiosData, groupsData, positionsData] = await Promise.all([
          radiosRes.json(),
          groupsRes.json(),
          positionsRes.json(),
        ]);

        if (!canceled) {
          setRadios(radiosData || []);
          setGroups(groupsData || []);
          setPositions(positionsData || []);
          setError(null);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (err) {
        if (!canceled) {
          setError(err.message || 'Erreur de chargement');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      canceled = true;
    };
  }, [auth?.user?.id]);

  // Auto-refresh every 30s
  // Socket.io connection for real-time updates
  useEffect(() => {
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Dashboard connected to server');
      newSocket.emit('subscribeToRadios');
    });

    // Listen for radio status updates
    newSocket.on('radioStatusUpdate', (updatedRadio) => {
      console.log('Radio status updated:', updatedRadio);
      setRadios(prevRadios =>
        prevRadios.map(radio =>
          radio.id === updatedRadio.id
            ? {
                ...radio,
                status: updatedRadio.status,
                battery_level: updatedRadio.battery_level,
                last_seen: updatedRadio.last_seen
              }
            : radio
        )
      );
      setLastUpdated(new Date());
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auth?.user?.id]);

  useEffect(() => {
    const iv = setInterval(() => {
      // reuse effect's loader by calling a small wrapper fetch
      (async () => {
        try {
          const baseUrl = 'http://localhost:5000/api';
          const params = new URLSearchParams();
          if (auth?.user?.id) params.append('userId', auth.user.id);
          const [radiosRes, groupsRes, positionsRes] = await Promise.all([
            fetch(`${baseUrl}/radios?${params.toString()}`),
            fetch(`${baseUrl}/groups?${params.toString()}`),
            fetch(`${baseUrl}/radio-positions?${params.toString()}`),
          ]);
          if (!radiosRes.ok || !groupsRes.ok || !positionsRes.ok) return;
          const [radiosData, groupsData, positionsData] = await Promise.all([
            radiosRes.json(), groupsRes.json(), positionsRes.json()
          ]);
          setRadios(radiosData || []);
          setGroups(groupsData || []);
          setPositions(positionsData || []);
          setLastUpdated(new Date());
        } catch (_err) {
          console.debug('refresh error', _err && _err.message);
        }
      })();
    }, 30000);

    return () => clearInterval(iv);
  }, [auth]);

  const [lastUpdated, setLastUpdated] = useState(null);

  const totalRadios = radios.length;
  const onlineRadios = radios.filter((radio) => {
    if (typeof radio.status === 'string') {
      return radio.status.toLowerCase() === 'active';
    }
    return radio.is_online === true || radio.online === true;
  }).length;
  const offlineRadios = Math.max(0, totalRadios - onlineRadios);
  const alertCount = positions.filter(
    (position) =>
      (position.signal_quality != null && position.signal_quality < 30) ||
      (position.battery_level != null && position.battery_level < 25)
  ).length;

  // monthlyActivity removed — simplified dashboard focuses on radio status

  const groupSummary = useMemo(() => {
    return groups
      .map((group) => ({
        ...group,
        count: radios.filter((radio) => radio.group_id === group.id).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [groups, radios]);

  const latestRadios = radios.slice(0, 4);

  const statCards = [
    {
      label: 'Radios totales',
      value: totalRadios,
      accent: '#8b5cf6',
      icon: <Radio size={24} />,
    },
    {
      label: 'Radios en ligne',
      value: onlineRadios || positions.length,
      accent: '#22c55e',
      icon: <Wifi size={24} />,
    },
    {
      label: 'Groupes actifs',
      value: groups.length,
      accent: '#0ea5e9',
      icon: <Users size={24} />,
    },
    {
      label: 'Alertes détectées',
      value: alertCount,
      accent: '#ef4444',
      icon: <AlertTriangle size={24} />,
    },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = 'http://localhost:5000/api';
      const params = new URLSearchParams();
      if (auth?.user?.id) params.append('userId', auth.user.id);
      const [radiosRes, groupsRes, positionsRes] = await Promise.all([
        fetch(`${baseUrl}/radios?${params.toString()}`),
        fetch(`${baseUrl}/groups?${params.toString()}`),
        fetch(`${baseUrl}/radio-positions?${params.toString()}`),
      ]);
      if (!radiosRes.ok || !groupsRes.ok || !positionsRes.ok) throw new Error('Erreur lors du rafraîchissement');
      const [radiosData, groupsData, positionsData] = await Promise.all([radiosRes.json(), groupsRes.json(), positionsRes.json()]);
      setRadios(radiosData || []);
      setGroups(groupsData || []);
      setPositions(positionsData || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: '#0f172a', fontSize: '18px', marginBottom: '16px' }}>Chargement des données...</div>
        <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: '70%', height: '100%', background: '#3b82f6', animation: 'loadingBar 1.5s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes loadingBar { 0% { transform: translateX(-100%);} 50% { transform: translateX(0);} 100% { transform: translateX(100%);} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', color: '#0f172a' }}>
      <div
        style={{
          marginBottom: '26px',
          padding: '28px 30px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #0d6efd 0%, #3b82f6 100%)',
          color: 'white',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.16)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '34px' }}>Bienvenue sur POC Geo</h2>
        <p style={{ margin: '12px 0 0', fontSize: '16px', maxWidth: '720px', lineHeight: '1.6', opacity: 0.92 }}>
          Bonjour {auth.user?.name || auth.user?.email}, les indicateurs et positions sont maintenant récupérés depuis le backend en temps réel.
        </p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleRefresh} style={{ padding: '8px 12px', borderRadius: '10px', background: 'white', color: '#0f172a', fontWeight: 700 }}>Rafraîchir</button>
          <div style={{ opacity: 0.9 }}>
            Dernière MAJ: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#f8d7da',
            color: '#842029',
            padding: '18px 20px',
            borderRadius: '18px',
            marginBottom: '20px',
            border: '1px solid #f5c2c7',
          }}
        >
          Impossible d'afficher les données : {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '18px', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div key={card.label} className="premium-card stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</p>
                <h3 style={{ margin: '10px 0 0', fontSize: '32px', color: '#0f172a' }}>{card.value}</h3>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'grid', placeItems: 'center', background: `${card.accent}22`, color: card.accent, fontSize: '20px' }}>{card.icon}</div>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden', marginTop: '12px' }}>
              <div style={{ width: `${Math.min(100, Math.max(8, (card.value / Math.max(totalRadios, 1)) * 100))}%`, height: '100%', background: card.accent }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '22px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '22px', color: '#0f172a' }}>Statut des radios</h3>
          
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Donut Chart */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative', minHeight: '240px' }} className="donut-container">
              <svg viewBox="0 0 280 280" className="donut-svg">
                {/* Background circle */}
                <circle cx="140" cy="140" r="110" fill="none" stroke="#e2e8f0" strokeWidth="22" />
                
                {/* Online segment */}
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="22"
                  strokeDasharray={`${totalRadios ? (onlineRadios / totalRadios) * 2 * Math.PI * 110 : 0} ${2 * Math.PI * 110}`}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                  style={{ transition: 'all 0.6s ease', filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.2))' }}
                />
                
                {/* Offline segment */}
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="22"
                  strokeDasharray={`${totalRadios ? (offlineRadios / totalRadios) * 2 * Math.PI * 110 : 0} ${2 * Math.PI * 110}`}
                  strokeDashoffset={`${totalRadios ? -(onlineRadios / totalRadios) * 2 * Math.PI * 110 : 0}`}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                  style={{ transition: 'all 0.6s ease', filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.2))' }}
                />
                
                {/* Center circle */}
                <circle cx="140" cy="140" r="75" fill="white" />
                
                {/* Percentage text */}
                <text x="140" y="130" textAnchor="middle" fontSize="42" fontWeight="bold" fill="#0f172a" style={{ transition: 'all 0.6s ease' }}>
                  {totalRadios ? Math.round((onlineRadios / totalRadios) * 100) : 0}%
                </text>
                <text x="140" y="160" textAnchor="middle" fontSize="14" fill="#64748b">
                  En ligne
                </text>
              </svg>
            </div>
            
            {/* Stats Cards */}
            <div style={{ flex: 1, display: 'grid', gap: '16px' }} className="status-cards">
              {/* Online Card */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                border: '2px solid #22c55e',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>En ligne</span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#15803d' }}>
                  {onlineRadios}
                </div>
                <div style={{ fontSize: '12px', color: '#4d7c0f', marginTop: '4px' }}>
                  {totalRadios ? Math.round((onlineRadios / totalRadios) * 100) : 0}% des radios
                </div>
              </div>
              
              {/* Offline Card */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '2px solid #ef4444',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#7f1d1d' }}>Hors ligne</span>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
                  {offlineRadios}
                </div>
                <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
                  {totalRadios ? Math.round((offlineRadios / totalRadios) * 100) : 0}% des radios
                </div>
              </div>
              
              {/* Total Card */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '2px solid #3b82f6',
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Total des radios</span>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>
                  {totalRadios}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '22px', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '22px', color: '#0f172a' }}>Groupes les plus actifs</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {groupSummary.length ? (
              groupSummary.map((group) => (
                <div key={group.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '18px', background: '#f8fafc' }}>
                  <span style={{ color: '#0f172a' }}>{group.name || `Groupe ${group.id}`}</span>
                  <strong style={{ color: '#2563eb' }}>{group.count} radios</strong>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, color: '#64748b' }}>Aucun groupe disponible pour le moment.</p>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '22px', color: '#0f172a' }}>Dernières radios</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {latestRadios.length ? (
              latestRadios.map((radio) => (
                <div
                  key={radio.id || radio.imei || radio.name}
                  style={{ display: 'grid', gap: '6px', padding: '16px 18px', borderRadius: '18px', background: '#f8fafc' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#0f172a' }}>{radio.name || radio.imei || 'Radio inconnue'}</strong>
                    <span style={{ color: '#475569', fontSize: '13px' }}>{radio.status ? radio.status : 'Statut inconnu'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px' }}>
                    <span>IMEI: {radio.imei || '—'}</span>
                    <span>Groupe: {radio.group_id || '—'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, color: '#64748b' }}>Aucune radio trouvée.</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Radio Status Section */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)', marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '22px', color: '#0f172a' }}>Statut détaillé des radios</h3>
        
        {radios.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="radio-table">
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>Nom</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>IMEI</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>Statut</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>Batterie</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', fontSize: '13px', textTransform: 'uppercase' }}>Groupe</th>
                </tr>
              </thead>
              <tbody>
                {radios.map((radio, index) => {
                  const isOnline = radio.status?.toLowerCase() === 'active';
                  return (
                    <tr 
                      key={radio.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '500' }}>
                        {radio.name || 'Sans nom'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                        {radio.imei || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: isOnline ? '#22c55e' : '#ef4444',
                              animation: isOnline ? 'pulse 2s infinite' : 'none'
                            }}
                          />
                          <span style={{ color: isOnline ? '#22c55e' : '#ef4444', fontWeight: '600', fontSize: '13px' }}>
                            {isOnline ? 'En ligne' : 'Hors ligne'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${radio.battery_level || 0}%`,
                                backgroundColor:
                                  (radio.battery_level || 0) > 50
                                    ? '#22c55e'
                                    : (radio.battery_level || 0) > 20
                                    ? '#ffc107'
                                    : '#ef4444'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', color: '#64748b', minWidth: '35px' }}>
                            {radio.battery_level || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                        {groups.find(g => g.id === radio.group_id)?.name || 'Aucun'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0, color: '#64748b', textAlign: 'center', padding: '24px' }}>Aucune radio disponible</p>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default DashboardHome;
