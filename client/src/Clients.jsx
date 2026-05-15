import React, { useEffect, useState } from 'react';

function Clients() {
  const [clients, setClients] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newLogin, setNewLogin] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/clients');
      if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error(error);
      setMessage('Impossible de charger les clients.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/groups');
      if (!response.ok) throw new Error('Erreur lors de la récupération des groupes');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchGroups();
  }, []);

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleAddClient = async () => {
    if (!newLogin.trim() || !newPassword.trim()) {
      setMessage('Veuillez saisir un login et un mot de passe.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newLogin.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          group_ids: selectedGroups
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du client');
      }

      setNewLogin('');
      setNewEmail('');
      setNewPassword('');
      setSelectedGroups([]);
      setMessage('Compte client créé avec succès !');
      fetchClients();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Erreur lors de la création du client.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#0f172a', margin: 0, fontSize: '24px' }}>Comptes Clients</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>Gérez les comptes clients et leurs accès aux groupes.</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Créer un compte client</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Login</label>
            <input
              type="text"
              placeholder="Login du client"
              value={newLogin}
              onChange={(e) => { setNewLogin(e.target.value); setMessage(''); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Email</label>
            <input
              type="email"
              placeholder="Email du client"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setMessage(''); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Mot de passe</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setMessage(''); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Groupes autorisés</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {groups.length === 0 ? (
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Aucun groupe disponible.</span>
              ) : (
                groups.map(group => (
                  <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    {group.name} {group.description ? <span style={{ color: '#94a3b8', fontSize: '12px' }}>- {group.description}</span> : ''}
                  </label>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleAddClient}
            style={{ marginTop: '8px', padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', transition: 'background-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Créer le compte
          </button>
        </div>
        {message && <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: message.includes('succès') ? '#dcfce7' : '#fee2e2', color: message.includes('succès') ? '#166534' : '#991b1b', fontSize: '14px', fontWeight: '500' }}>{message}</div>}
      </div>

      <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1e293b' }}>Liste des clients</h3>
        {loading ? (
          <p style={{ color: '#64748b' }}>Chargement des clients...</p>
        ) : clients.length === 0 ? (
          <p style={{ color: '#64748b' }}>Aucun client trouvé.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '14px' }}>Login</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '14px' }}>Groupes autorisés</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '14px' }}>Date de création</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const clientGroups = groups.filter(g => client.group_ids.includes(g.id));
                  return (
                    <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>{client.name}</td>
                      <td style={{ padding: '16px', color: '#475569' }}>{client.email || '-'}</td>
                      <td style={{ padding: '16px' }}>
                        {clientGroups.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {clientGroups.map(g => (
                              <span key={g.id} style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                                {g.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Aucun groupe</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clients;
