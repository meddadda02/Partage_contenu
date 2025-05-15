import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Home" element={<Home />} /> {/* Assure-toi que c'est en minuscule */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
