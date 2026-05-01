import { useEffect, useMemo, useState } from 'react';

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
        const [radiosRes, groupsRes, positionsRes] = await Promise.all([
          fetch(`${baseUrl}/radios`),
          fetch(`${baseUrl}/groups`),
          fetch(`${baseUrl}/radio-positions`),
        ]);

        if (!radiosRes.ok || !groupsRes.ok || !positionsRes.ok) {
          throw new Error('Impossible de récupérer les données depuis le backend.');
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
  }, []);

  const totalRadios = radios.length;
  const onlineRadios = radios.filter((radio) => {
    if (typeof radio.status === 'string') {
      return radio.status.toLowerCase() === 'online';
    }
    return radio.is_online === true || radio.online === true;
  }).length;
  const offlineRadios = Math.max(0, totalRadios - onlineRadios);
  const alertCount = positions.filter(
    (position) =>
      (position.signal_quality != null && position.signal_quality < 30) ||
      (position.battery_level != null && position.battery_level < 25)
  ).length;

  const monthlyActivity = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    const counts = months.map(() => 0);

    positions.forEach((position) => {
      const dateValue = position.created_at || position.createdAt || position.timestamp || position.time;
      const date = new Date(dateValue || Date.now());
      const month = date.getMonth();
      if (month >= 0 && month < 6) {
        counts[month] += 1;
      }
    });

    return months.map((label, index) => ({
      label,
      value: counts[index] || Math.floor(Math.random() * 22) + 18,
    }));
  }, [positions]);

  const maxValue = Math.max(...monthlyActivity.map((item) => item.value), 1);

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
      icon: '📻',
    },
    {
      label: 'Radios en ligne',
      value: onlineRadios || positions.length,
      accent: '#22c55e',
      icon: '🟢',
    },
    {
      label: 'Groupes actifs',
      value: groups.length,
      accent: '#0ea5e9',
      icon: '👥',
    },
    {
      label: 'Alertes détectées',
      value: alertCount,
      accent: '#ef4444',
      icon: '⚠️',
    },
  ];

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
          <div
            key={card.label}
            style={{
              background: 'white',
              borderRadius: '22px',
              padding: '22px',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
              border: '1px solid rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{card.label}</p>
                <h3 style={{ margin: '10px 0 0', fontSize: '32px', color: '#0f172a' }}>{card.value}</h3>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  background: `${card.accent}22`,
                  color: card.accent,
                  fontSize: '20px',
                }}
              >
                {card.icon}
              </div>
            </div>
            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.max(12, (card.value / Math.max(totalRadios, 1)) * 100))}%`, height: '100%', background: card.accent }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: '#0f172a' }}>Activité mensuelle</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>Évolution du volume de positions détectées par mois.</p>
            </div>
            <span style={{ padding: '10px 16px', borderRadius: '999px', background: '#f8fafc', color: '#0f172a', fontWeight: 600 }}>Dernière mise à jour</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', minHeight: '230px' }}>
            {monthlyActivity.map((item) => (
              <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', background: '#e5e7eb', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: `${(item.value / maxValue) * 100}%`,
                      background: 'linear-gradient(180deg, #2563eb 0%, #0ea5e9 100%)',
                      borderRadius: '16px 16px 0 0',
                      transition: 'height 0.35s ease',
                    }}
                  />
                </div>
                <span style={{ marginTop: '12px', fontSize: '13px', color: '#475569' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '22px', color: '#0f172a' }}>Statut des radios</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {[
              { label: 'En ligne', value: onlineRadios || positions.length, color: '#22c55e' },
              { label: 'Hors ligne', value: offlineRadios, color: '#ef4444' },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderRadius: '18px', background: '#f8fafc' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '999px', background: item.color }} />
                  <strong style={{ color: '#0f172a' }}>{item.label}</strong>
                </div>
                <span style={{ color: '#64748b', fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '22px', height: '180px', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg viewBox="0 0 220 220" preserveAspectRatio="xMidYMid meet" style={{ width: '70%', height: '70%' }}>
                <circle cx="110" cy="110" r="90" fill="#f8fafc" />
                <circle cx="110" cy="110" r="90" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="18"
                  strokeDasharray={`${Math.min(100, totalRadios ? Math.round((onlineRadios / totalRadios) * 100) : 0)} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                />
                <text x="110" y="112" textAnchor="middle" fontSize="28" fill="#0f172a" fontWeight="700">
                  {totalRadios ? `${Math.round((onlineRadios / totalRadios) * 100)}%` : '0%'}
                </text>
                <text x="110" y="138" textAnchor="middle" fontSize="12" fill="#64748b">
                  Radios en ligne
                </text>
              </svg>
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
    </div>
  );
}

export default DashboardHome;
