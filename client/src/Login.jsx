import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth({ token: res.data.token, user: res.data.user });
      navigate('/dashboard');
    } catch (err) {
     alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <form onSubmit={handleLogin} style={{ padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>Connexion POC Geo</h2>
        <input type="text" placeholder="Utilisateur" value={username} onChange={e => setUsername(e.target.value)} style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', margin: '10px 0', padding: '8px' }} />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Se connecter</button>
        <p style={{fontSize: '0.8rem', color: '#666', marginTop: '10px'}}>Test: admin / password123</p>
      </form>
    </div>
  );
}
export default Login;