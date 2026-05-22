import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RadiosList = ({ auth, onSelectRadio }) => {
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRadio, setEditingRadio] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    imei: '',
    group_id: '',
    status: '',
    battery_level: ''
  });

  const navigate = useNavigate();

  // Fetch radios
  const fetchRadios = async () => {
    try {
      const userIdParam = auth?.user?.id ? `?userId=${auth.user.id}` : '';
      const response = await fetch(`http://localhost:5000/api/radios${userIdParam}`);
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
      const userIdParam = auth?.user?.id ? `?userId=${auth.user.id}` : '';
      const response = await fetch(`http://localhost:5000/api/groups${userIdParam}`);
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

  // Edit handler
  const handleEdit = (radio) => {
    setEditingRadio(radio);
    setEditForm({
      name: radio.name,
      imei: radio.imei,
      group_id: radio.group_id,
      status: radio.status,
      battery_level: radio.battery_level
    });
    setShowEditModal(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/radios/${editingRadio.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          imei: editForm.imei.trim(),
          group_id: parseInt(editForm.group_id),
          status: editForm.status,
          battery_level: parseInt(editForm.battery_level)
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      const updatedRadio = await response.json();
      setRadios(radios.map(r => r.id === editingRadio.id ? updatedRadio : r));
      setShowEditModal(false);
      setEditingRadio(null);
      alert('Radio mise à jour avec succès');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour de la radio');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingRadio(null);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette radio ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/radios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setRadios(radios.filter(r => r.id !== id));
      alert('Radio supprimée avec succès');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression de la radio');
    }
  };

  if (loading) return <p>Chargement des radios...</p>;

  // Filter radios based on search query and filters
  const filteredRadios = radios.filter((radio) => {
    const query = searchQuery.toLowerCase();
    const matchName = radio.name?.toLowerCase().includes(query);
    const matchImei = radio.imei?.toLowerCase().includes(query);
    const matchSearch = matchName || matchImei;

    const matchStatus = statusFilter ? radio.status === statusFilter : true;
    const matchGroup = groupFilter ? radio.group_id?.toString() === groupFilter : true;

    return matchSearch && matchStatus && matchGroup;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Liste des Radios</h2>

      {/* Search and Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher par nom ou IMEI..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: '1 1 250px',
            padding: '10px 15px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          style={{
            padding: '10px 15px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '180px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Tous les groupes</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 15px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minWidth: '180px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px', // Ensure horizontal scrolling for narrow views
          }}
        >
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={thStyle}>Nom</th>
            <th style={thStyle}>IMEI</th>
            <th style={thStyle}>Statut</th>
            <th style={thStyle}>Groupe</th>
            <th style={thStyle}>Batterie</th>
            <th style={thStyle}>Historique</th>
            {auth?.user?.role === 'admin' && <th style={thStyle}>Actions</th>}
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
              {/* Historique button */}
              <td style={tdStyle}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/radios/${radio.id}/history`); }}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Historique
                </button>
              </td>
              {auth?.user?.role === 'admin' && (
                <td style={tdStyle}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(radio); }}
                    style={{
                      padding: '6px 12px',
                      marginRight: '5px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(radio.id); }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              )}
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan={auth?.user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Aucune radio trouvée
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Modifier la Radio</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nom:</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>IMEI:</label>
              <input
                type="text"
                value={editForm.imei}
                onChange={(e) => setEditForm({...editForm, imei: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Groupe:</label>
              <select
                value={editForm.group_id}
                onChange={(e) => setEditForm({...editForm, group_id: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Statut:</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Niveau de Batterie:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editForm.battery_level}
                onChange={(e) => setEditForm({...editForm, battery_level: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#333',
  borderBottom: '2px solid #dee2e6',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #dee2e6',
  whiteSpace: 'nowrap'
};

export default RadiosList;