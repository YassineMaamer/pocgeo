import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ token, refresh }) {
  const [groups, setGroups] = useState([]);
  const [newRadio, setNewRadio] = useState({ imei: '', name: '', group_id: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/groups', { headers: { Authorization: token } })
      .then(res => setGroups(res.data));
  }, []);

  const addRadio = async () => {
    await axios.post('http://localhost:5000/api/radios', newRadio, { headers: { Authorization: token } });
    refresh();
    alert('Radio ajoutée');
  };

  return (
    <div style={{ background: 'white', padding: '15px', marginBottom: '20px', border: '1px solid #ddd' }}>
      <h3>Ajouter une radio</h3>
      <input placeholder="IMEI" onChange={e => setNewRadio({...newRadio, imei: e.target.value})} style={{ margin: '5px' }} />
      <input placeholder="Nom" onChange={e => setNewRadio({...newRadio, name: e.target.value})} style={{ margin: '5px' }} />
      <select onChange={e => setNewRadio({...newRadio, group_id: e.target.value})} style={{ margin: '5px' }}>
        <option value="">Choisir Groupe</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <button onClick={addRadio} style={{ padding: '5px 10px', background: 'green', color: 'white', border: 'none' }}>Ajouter</button>
    </div>
  );
}
export default AdminPanel;