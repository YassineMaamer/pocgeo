import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import RadioHistory from './RadioHistory';

function App() {
  

 const [auth, setAuth] = useState(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  return token && user
    ? { token, user: JSON.parse(user) }
    : null;
});

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={auth ? <Navigate to="/dashboard" /> : <Login setAuth={setAuth} />} />
        <Route path="/dashboard" element={auth ? <Dashboard auth={auth} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/radios/:id/history" element={auth ? <RadioHistory auth={auth} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;