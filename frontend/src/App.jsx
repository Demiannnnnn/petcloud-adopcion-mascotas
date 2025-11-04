import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#fffaf8' }}>
      <Navbar />
      <main style={{ padding: 20 }}>
        {/* Aquí van tus rutas y páginas principales. Por ahora mostramos un placeholder. */}
        <h2>App funcionando normalmente</h2>
        <p>Usa la campana en la esquina para ver notificaciones (si las hay).</p>
      </main>
    </div>
  );
}

export default App;
