import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegistroPage from './pages/RegistroPage';
import PaginaPrincipal from './pages/PaginaPrincipal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/registro" element={<RegistroPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
          </ProtectedRoute>
        } />
        <Route path="/principal" element={
          <ProtectedRoute>
            <PaginaPrincipal />
          </ProtectedRoute>
        } />
        {/* Puedes agregar más rutas protegidas aquí */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
