import { useState, useEffect } from 'react';
import axios from 'axios';
import MapPicker from './MapPicker';

function AdminPanel({ token, refresh }) {
  const [groups, setGroups] = useState([]);
  const [newRadio, setNewRadio] = useState({ imei: '', name: '', group_id: '', latitude: null, longitude: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/groups', { headers: { Authorization: token } })
      .then(res => setGroups(res.data))
      .catch(err => console.error('Erreur lors du chargement des groupes:', err));
  }, [token]);

  const validateForm = () => {
    const newErrors = {};
    if (!newRadio.imei.trim()) newErrors.imei = 'L\'IMEI est requis';
    if (!newRadio.name.trim()) newErrors.name = 'Le nom est requis';
    if (!newRadio.group_id) newErrors.group_id = 'Veuillez choisir un groupe';
    return newErrors;
  };

  const addRadio = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await axios.post('http://localhost:5000/api/radios', newRadio, { 
        headers: { Authorization: token } 
      });
      setSuccessMessage('✓ Radio ajoutée avec succès');
      setNewRadio({ imei: '', name: '', group_id: '', latitude: null, longitude: null });
      refresh();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout de la radio';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewRadio({ ...newRadio, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'inherit'
    }}>
      <h3 style={{ color: '#333', marginTop: 0 }}>Ajouter une radio</h3>
      
      {successMessage && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div style={{
          padding: '10px',
          marginBottom: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          ✗ {errors.submit}
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>IMEI:</label>
        <input
          type="text"
          placeholder="Entrez l'IMEI de la radio"
          value={newRadio.imei}
          onChange={e => handleInputChange('imei', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.imei ? '2px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontSize: '14px'
          }}
        />
        {errors.imei && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.imei}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Nom:</label>
        <input
          type="text"
          placeholder="Entrez le nom de la radio"
          value={newRadio.name}
          onChange={e => handleInputChange('name', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.name ? '2px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontSize: '14px'
          }}
        />
        {errors.name && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.name}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Groupe:</label>
        <select
          value={newRadio.group_id}
          onChange={e => handleInputChange('group_id', e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: errors.group_id ? '2px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="">Choisir un groupe</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {errors.group_id && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.group_id}</span>}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>Position (optionnel):</label>
        <MapPicker 
          position={newRadio.latitude && newRadio.longitude ? [newRadio.latitude, newRadio.longitude] : null}
          onLocationSelect={(pos) => {
            setNewRadio({ ...newRadio, latitude: pos[0], longitude: pos[1] });
          }}
        />
        {newRadio.latitude && newRadio.longitude && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            📍 Position sélectionnée: {newRadio.latitude.toFixed(4)}, {newRadio.longitude.toFixed(4)}
          </div>
        )}
      </div>

      <button
        onClick={addRadio}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: loading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {loading ? 'Ajout en cours...' : 'Ajouter la radio'}
      </button>
    </div>
  );
}
export default AdminPanel;