import React, { useState, useEffect } from 'react';
import { crearDonacion } from '../api/donationsApi';
import { getUserById, getEmpresas } from '../api/usersApi';

export default function DonacionFormModal({ isOpen, onClose, donanteId }) {
  const [tipoDonacion, setTipoDonacion] = useState('MONETARIA');
  const [monto, setMonto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [receptorId, setReceptorId] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [refugios, setRefugios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista de empresas (refugios) cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      getEmpresas().then(empresas => {
        setRefugios(empresas);
        console.log('Empresas cargadas:', empresas);
      }).catch(err => {
        console.error('Error cargando empresas:', err);
        setRefugios([]);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validaciones
    if (!receptorId) {
      setError('Debes seleccionar un refugio');
      setLoading(false);
      return;
    }

    if (tipoDonacion === 'MONETARIA' && (!monto || parseFloat(monto) <= 0)) {
      setError('El monto debe ser mayor a 0');
      setLoading(false);
      return;
    }

    if (tipoDonacion !== 'MONETARIA' && (!cantidad || parseFloat(cantidad) <= 0)) {
      setError('La cantidad debe ser mayor a 0');
      setLoading(false);
      return;
    }

    try {
      const donacionData = {
        donanteId: parseInt(donanteId),
        receptorId: parseInt(receptorId),
        tipoDonacion,
        descripcion: descripcion || null,
        monto: tipoDonacion === 'MONETARIA' ? parseFloat(monto) : null,
        cantidad: tipoDonacion !== 'MONETARIA' ? parseFloat(cantidad) : null,
        unidad: tipoDonacion !== 'MONETARIA' ? unidad : null,
        direccionEntrega: direccionEntrega || null,
        comentarios: comentarios || null
      };

      const response = await crearDonacion(donacionData);

      // Si es donación monetaria y Mercado Pago devuelve un link, redirigir
      if (tipoDonacion === 'MONETARIA' && response.mercadoPagoSandboxInitPoint) {
        // Usar el link de sandbox para testing
        window.location.href = response.mercadoPagoSandboxInitPoint;
      } else if (tipoDonacion === 'MONETARIA' && response.mercadoPagoInitPoint) {
        // Link de producción como fallback
        window.location.href = response.mercadoPagoInitPoint;
      } else {
        // Para donaciones en especie, cerrar modal y recargar
        alert('¡Donación registrada exitosamente!');
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'Error al crear la donación');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Nueva Donación</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error}>{error}</div>
          )}

          {/* Tipo de donación */}
          <div style={styles.field}>
            <label style={styles.label}>Tipo de Donación *</label>
            <select
              value={tipoDonacion}
              onChange={(e) => setTipoDonacion(e.target.value)}
              style={styles.select}
              required
            >
              <option value="MONETARIA">Monetaria (Dinero)</option>
              <option value="ALIMENTO">Alimento</option>
              <option value="JUGUETES">Juguetes</option>
              <option value="MEDICAMENTOS">Medicamentos</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          {/* Refugio receptor */}
          <div style={styles.field}>
            <label style={styles.label}>Refugio Receptor *</label>
            <select
              value={receptorId}
              onChange={(e) => setReceptorId(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Seleccionar refugio...</option>
              {refugios.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombreEmpresa || `Empresa #${empresa.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Monto (solo para monetaria) */}
          {tipoDonacion === 'MONETARIA' && (
            <div style={styles.field}>
              <label style={styles.label}>Monto (CLP) *</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                style={styles.input}
                placeholder="Ej: 5000"
                min="1"
                step="1"
                required
              />
            </div>
          )}

          {/* Cantidad y Unidad (para donaciones en especie) */}
          {tipoDonacion !== 'MONETARIA' && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>Cantidad *</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  style={styles.input}
                  placeholder="Ej: 10"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Unidad *</label>
                <input
                  type="text"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  style={styles.input}
                  placeholder="Ej: kg, unidades, litros"
                  required
                />
              </div>
            </>
          )}

          {/* Descripción */}
          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={styles.textarea}
              placeholder="Detalla tu donación..."
              rows="3"
            />
          </div>

          {/* Dirección de entrega (para especie) */}
          {tipoDonacion !== 'MONETARIA' && (
            <div style={styles.field}>
              <label style={styles.label}>Dirección de Entrega</label>
              <input
                type="text"
                value={direccionEntrega}
                onChange={(e) => setDireccionEntrega(e.target.value)}
                style={styles.input}
                placeholder="Dirección donde entregar la donación"
              />
            </div>
          )}

          {/* Comentarios */}
          <div style={styles.field}>
            <label style={styles.label}>Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              style={styles.textarea}
              placeholder="Comentarios adicionales..."
              rows="2"
            />
          </div>

          {/* Botones */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 
               tipoDonacion === 'MONETARIA' ? 'Ir a Pagar' : 'Registrar Donación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#666',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: '20px',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#666',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
