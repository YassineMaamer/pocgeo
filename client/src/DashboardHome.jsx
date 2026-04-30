function DashboardHome({ auth }) {
  const stats = {
    totalRadios: 28,
    onlineRadios: 16,
    groups: 5,
    alerts: 2,
  };

  const monthlyActivity = [
    { label: 'Jan', value: 65 },
    { label: 'Fév', value: 88 },
    { label: 'Mar', value: 72 },
    { label: 'Avr', value: 95 },
    { label: 'Mai', value: 81 },
    { label: 'Juin', value: 110 },
  ];

  const statusData = [
    { label: 'En ligne', value: 16, color: '#198754' },
    { label: 'Hors ligne', value: 12, color: '#dc3545' },
  ];

  const maxValue = Math.max(...monthlyActivity.map(item => item.value));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        <p style={{ margin: '8px 0 0 0', color: '#6c757d' }}>
          Bonjour {auth.user.name || auth.user.email}, voici un aperçu de l'activité des radios.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Radios totales</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '28px' }}>{stats.totalRadios}</h3>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Radios en ligne</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '28px', color: '#198754' }}>{stats.onlineRadios}</h3>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Groupes</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '28px' }}>{stats.groups}</h3>
        </div>
        <div style={{ background: 'white', padding: '18px', borderRadius: '14px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>Alertes</p>
          <h3 style={{ margin: '10px 0 0', fontSize: '28px', color: '#dc3545' }}>{stats.alerts}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Activité mensuelle</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '220px', padding: '10px 0' }}>
            {monthlyActivity.map((item) => (
              <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', background: '#e9ecef', borderRadius: '12px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${(item.value / maxValue) * 100}%`,
                        background: 'linear-gradient(180deg, #0d6efd 0%, #22b8cf 100%)',
                        borderRadius: '12px 12px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                </div>
                <span style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '18px' }}>Statut des radios</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            {statusData.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: item.color, marginRight: '10px' }}></span>
                  <strong>{item.label}</strong>
                </div>
                <span style={{ color: '#6c757d' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ height: '180px', position: 'relative', marginTop: '20px' }}>
            <svg viewBox="0 0 200 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <circle cx="100" cy="100" r="80" fill="#f8f9fa" />
              <circle cx="100" cy="100" r="80" fill="transparent" stroke="#198754" strokeWidth="16" strokeDasharray="100 150" strokeLinecap="round" transform="rotate(-90 100 100)" />
              <text x="100" y="110" textAnchor="middle" fontSize="24" fill="#212529">{Math.round((stats.onlineRadios / stats.totalRadios) * 100)}%</text>
              <text x="100" y="132" textAnchor="middle" fontSize="12" fill="#6c757d">En ligne</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
