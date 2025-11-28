import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listDonacionesByDonante, listDonacionesRecibidas } from '../api/donationsApi';
import { getUserById } from '../api/usersApi';
import { getRefugioById } from '../api/refugiosApi';
import DonacionFormModal from '../components/DonacionFormModal';

function formatDate(iso) {
	try {
		const d = new Date(iso);
		return d.toLocaleString();
	} catch (e) {
		return iso;
	}
}

function formatAmount(d) {
	if (d === null || d === undefined) return '';
	const n = Number(d);
	if (Number.isNaN(n)) return String(d);
	return n.toLocaleString(undefined, { style: 'currency', currency: 'CLP' });
}

export default function DonacionesPage() {
	const { user } = useContext(AuthContext) || {};
	const perfil = user && user.perfil ? user.perfil : null;
	const ownerId = user?.id || perfil?.id;

	const [hechas, setHechas] = useState([]);
	const [recibidas, setRecibidas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState(null);

	// Manejar retorno de Mercado Pago
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const status = params.get('status');

		if (status) {
			setPaymentStatus(status);
			// Limpiar URL después de 5 segundos
			setTimeout(() => {
				window.history.replaceState({}, document.title, window.location.pathname);
				setPaymentStatus(null);
			}, 5000);
		}
	}, []);

	useEffect(() => {
		async function load() {
			setLoading(true);
			if (!ownerId) {
				setHechas([]);
				setRecibidas([]);
				setLoading(false);
				return;
			}

			try {
				const made = Array.isArray(await listDonacionesByDonante(ownerId)) ? await listDonacionesByDonante(ownerId) : [];
				// enrich counterpart names where possible
				await Promise.all(made.map(async (d) => {
					if (d.receptorId && !d.receptorName) {
						try {
							const r = await getRefugioById(d.receptorId);
							if (r) d.receptorName = r.nombre;
						} catch (e) { }
					}
				}));
				setHechas(made);

				if (perfil && perfil.tipoPerfil === 'EMPRESA') {
					const rec = Array.isArray(await listDonacionesRecibidas(ownerId)) ? await listDonacionesRecibidas(ownerId) : [];
					await Promise.all(rec.map(async (d) => {
						if (d.donanteId && !d.donanteName) {
							try { const u = await getUserById(d.donanteId); if (u) d.donanteName = u.perfil?.nombreCompleto || u.nombre || u.nombreCompleto || u.username || (u.email ? u.email.split('@')[0] : undefined); } catch (e) { }
						}
					}));
					setRecibidas(rec);
				} else {
					setRecibidas([]);
				}
			} catch (e) {
				setHechas([]);
				setRecibidas([]);
			}

			setLoading(false);
		}
		load();
	}, [ownerId, perfil]);

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
				<h2 style={{ color: '#a0522d', margin: 0 }}>Donaciones</h2>
				<button
					onClick={() => setShowModal(true)}
					style={{
						padding: '10px 20px',
						backgroundColor: '#4CAF50',
						color: 'white',
						border: 'none',
						borderRadius: '8px',
						fontSize: '16px',
						fontWeight: 'bold',
						cursor: 'pointer',
						boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
					}}
				>
					+ Nueva Donación
				</button>
			</div>

			{/* Mensajes de estado de pago */}
			{paymentStatus === 'success' && (
				<div style={{
					backgroundColor: '#d4edda',
					color: '#155724',
					padding: '12px',
					borderRadius: '8px',
					marginBottom: '16px',
					border: '1px solid #c3e6cb'
				}}>
					¡Pago exitoso! Tu donación ha sido confirmada. Gracias por tu aporte.
				</div>
			)}
			{paymentStatus === 'failure' && (
				<div style={{
					backgroundColor: '#f8d7da',
					color: '#721c24',
					padding: '12px',
					borderRadius: '8px',
					marginBottom: '16px',
					border: '1px solid #f5c6cb'
				}}>
					El pago no pudo ser procesado. Por favor, intenta nuevamente.
				</div>
			)}
			{paymentStatus === 'pending' && (
				<div style={{
					backgroundColor: '#fff3cd',
					color: '#856404',
					padding: '12px',
					borderRadius: '8px',
					marginBottom: '16px',
					border: '1px solid #ffeaa7'
				}}>
					Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.
				</div>
			)}

			{loading ? <div>Cargando donaciones...</div> : (
				<>
					<section style={{ marginBottom: 18 }}>
						<h3>Donaciones hechas</h3>
						{hechas.length === 0 ? <div>No has realizado donaciones.</div> : (
							hechas.map(d => (
								<div key={d.id || `${d.donanteId}-${d.receptorId}-${d.fechaDonacion || d.fecha_donacion || d.fecha}`} style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 18px rgba(64,11,25,0.06)', marginBottom: 12 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
										<div>
											<div style={{ fontWeight: 'bold', color: '#400B19', fontSize: '16px' }}>
												{d.tipoDonacion || d.tipo_donacion || d.tipo || 'Donación'}
											</div>
											<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
												Estado: <span style={{
													color: d.estado === 'CONFIRMADA' ? '#4CAF50' : d.estado === 'CANCELADA' ? '#f44336' : '#ff9800',
													fontWeight: 'bold'
												}}>
													{d.estado || 'PENDIENTE'}
												</span>
											</div>
										</div>
										<div style={{ color: '#666', fontSize: '12px' }}>{formatDate(d.fechaDonacion || d.fecha_donacion || d.fecha)}</div>
									</div>
									{d.monto && <div style={{ marginTop: 8 }}><b>Monto:</b> {formatAmount(d.monto)}</div>}
									{d.cantidad && <div><b>Cantidad:</b> {d.cantidad} {d.unidad || ''}</div>}
									{(d.receptorName || d.receptorId) && <div><b>Receptor:</b> {d.receptorName || `#${d.receptorId}`}</div>}
									{d.descripcion && <div style={{ marginTop: 6, fontSize: '14px', color: '#555' }}>{d.descripcion}</div>}
								</div>
							))
						)}
					</section>

					{perfil && perfil.tipoPerfil === 'EMPRESA' && (
						<section>
							<h3>Donaciones recibidas</h3>
							{recibidas.length === 0 ? <div>No has recibido donaciones.</div> : (
								recibidas.map(d => (
									<div key={d.id || `${d.donanteId}-${d.receptorId}-${d.fechaDonacion || d.fecha_donacion || d.fecha}`} style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 18px rgba(64,11,25,0.06)', marginBottom: 12 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
											<div>
												<div style={{ fontWeight: 'bold', color: '#400B19', fontSize: '16px' }}>
													{d.tipoDonacion || d.tipo_donacion || d.tipo || 'Donación'}
												</div>
												<div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
													Estado: <span style={{
														color: d.estado === 'CONFIRMADA' ? '#4CAF50' : d.estado === 'CANCELADA' ? '#f44336' : '#ff9800',
														fontWeight: 'bold'
													}}>
														{d.estado || 'PENDIENTE'}
													</span>
												</div>
											</div>
											<div style={{ color: '#666', fontSize: '12px' }}>{formatDate(d.fechaDonacion || d.fecha_donacion || d.fecha)}</div>
										</div>
										{d.monto && <div style={{ marginTop: 8 }}><b>Monto:</b> {formatAmount(d.monto)}</div>}
										{d.cantidad && <div><b>Cantidad:</b> {d.cantidad} {d.unidad || ''}</div>}
										{(d.donanteName || d.donanteId) && <div><b>Donante:</b> {d.donanteName || `#${d.donanteId}`}</div>}
										{d.direccionEntrega && <div><b>Dirección de entrega:</b> {d.direccionEntrega}</div>}
										{d.descripcion && <div style={{ marginTop: 6, fontSize: '14px', color: '#555' }}>{d.descripcion}</div>}
									</div>
								))
							)}
						</section>
					)}
				</>
			)}

			{/* Modal de nueva donación */}
			<DonacionFormModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				donanteId={ownerId}
			/>
		</div>
	);
}

