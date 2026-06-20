import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import Navbar from './components/Navbar';
import Registrations from './pages/Registrations';
import Users from './pages/Users';

// Simple styled wrapper for placeholders to preserve app styling and navbar links
const PlaceholderPage = ({ title }) => (
  <div style={{ backgroundColor: '#080a10', minHeight: '100vh', color: '#ffffff' }}>
    <Navbar />
    <div className="app-container" style={{ padding: '3rem 1.5rem', textAlign: 'left' }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem', color: '#ffffff' }}>{title}</h1>
      <p style={{ color: '#64748b', margin: 0 }}>This page is currently under construction. Check back later!</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderPage title="Home" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/users" element={<Users />} />
        <Route
  path="/registrations"
  element={<Registrations />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
