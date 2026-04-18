import React, { useEffect, useState } from 'react';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/groups');
      if (!response.ok) throw new Error('Erreur lors de la récupération des groupes');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error(error);
      setMessage('Impossible de charger les groupes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      setMessage('Veuillez saisir un nom de groupe.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newGroupName.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du groupe');
      }

      setNewGroupName('');
      setMessage('Groupe créé avec succès !');
      fetchGroups();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Erreur lors de la création du groupe.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: '#333', margin: 0 }}>Groupes</h2>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>Affiche les groupes existants et ajoute-en de nouveaux.</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', padding: '18px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Ajouter un groupe</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nom du groupe"
            value={newGroupName}
            onChange={(e) => { setNewGroupName(e.target.value); setMessage(''); }}
            style={{ flex: '1', minWidth: '220px', padding: '10px', borderRadius: '8px', border: '1px solid #ced4da' }}
          />
          <button
            onClick={handleAddGroup}
            style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#0d6efd', color: 'white', cursor: 'pointer' }}
          >
            Ajouter
          </button>
        </div>
        {message && <p style={{ marginTop: '12px', color: message.includes('succès') ? '#198754' : '#dc3545' }}>{message}</p>}
      </div>

      <div style={{ padding: '18px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>Liste des groupes</h3>
        {loading ? (
          <p>Chargement des groupes...</p>
        ) : groups.length === 0 ? (
          <p>Aucun groupe trouvé.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {groups.map((group) => (
              <li key={group.id} style={{ padding: '12px 0', borderBottom: '1px solid #e9ecef' }}>
                <strong>{group.name}</strong>
                {group.description && <p style={{ margin: '6px 0 0 0', color: '#6c757d' }}>{group.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Groups;
