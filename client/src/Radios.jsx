import React, { useEffect, useState } from 'react';

const RadiosList = ({ onSelectRadio }) => {
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch radios
  const fetchRadios = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/radios');
      if (!response.ok) throw new Error('Erreur lors de la récupération');
      const data = await response.json();
      setRadios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadios();
  }, []);

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
    fetchGroups();
  }, []);

  // Click handler
  const handleClick = (radio) => {
    setSelectedId(radio.id);
    if (onSelectRadio) {
      onSelectRadio(radio.id); // 🔥 نبعث id للـ map
    }
  };

  if (loading) return <p>Chargement des radios...</p>;

  // Filter radios based on search query
  const filteredRadios = radios.filter((radio) =>
    radio.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Liste des Radios</h2>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Rechercher une radio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 15px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>IMEI</th>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Groupe</th>
            <th style={thStyle}>Batterie</th>
          </tr>
        </thead>

        <tbody>
          {filteredRadios.length > 0 ? (
            filteredRadios.map((radio, index) => (
            <tr
              key={radio.id}
              onClick={() => handleClick(radio)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedId === radio.id
                    ? '#d0ebff' // 🔥 radio sélectionnée
                    : index % 2 === 0
                    ? '#ffffff'
                    : '#f8f9fa',
                transition: '0.2s'
              }}
            >
              {/* Nom */}
              <td style={tdStyle}>{radio.name}</td>

              {/* IMEI */}
              <td style={tdStyle}>{radio.imei || '—'}</td>

              {/* Statut */}
              <td style={tdStyle}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    backgroundColor:
                      radio.status === 'active' ? '#d4edda' : '#f8d7da',
                    color:
                      radio.status === 'active' ? '#155724' : '#721c24'
                  }}
                >
                  {radio.status}
                </span>
              </td>
              {/* Groupe */}
              <td style={tdStyle}>
                {groups.find((group) => group.id === radio.group_id)?.name || 'Inconnu'}
              </td>


              {/* Batterie */}
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      marginRight: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${radio.battery_level}%`,
                        height: '100%',
                        backgroundColor:
                          radio.battery_level > 50
                            ? '#28a745'
                            : radio.battery_level > 20
                            ? '#ffc107'
                            : '#dc3545'
                      }}
                    ></div>
                  </div>
                  <span>{radio.battery_level}%</span>
                </div>
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Aucune radio trouvée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const thStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#333',
  borderBottom: '2px solid #dee2e6'
};

const tdStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #dee2e6'
};

export default RadiosList;