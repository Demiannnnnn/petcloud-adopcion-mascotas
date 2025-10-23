import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
// HomePage removed (not used directly in routes)
import RegistroPage from './pages/RegistroPage';
import PaginaPrincipal from './pages/PaginaPrincipal';
import AdopcionesPage from './pages/AdopcionesPage';
import PerfilPage from './pages/PerfilPage';
import MisSolicitudes from './pages/MisSolicitudes';
import SolicitudesRecibidas from './pages/SolicitudesRecibidas';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<ProtectedRoute></ProtectedRoute>} />
        <Route path="/principal" element={
          <ProtectedRoute>
            <PaginaPrincipal />
          </ProtectedRoute>
        } />
        <Route path="/adopciones" element={
          <ProtectedRoute>
            <AdopcionesPage />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        } />
        <Route path="/mis-solicitudes" element={
          <ProtectedRoute>
            <MisSolicitudes />
          </ProtectedRoute>
        } />
        <Route path="/solicitudes-recibidas" element={
          <ProtectedRoute>
            <SolicitudesRecibidas />
          </ProtectedRoute>
        } />
        {/* Puedes agregar más rutas protegidas aquí */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </BrowserRouter>
  );
}

export default App;
