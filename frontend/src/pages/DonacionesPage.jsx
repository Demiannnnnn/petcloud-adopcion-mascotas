import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listDonacionesByDonante, listDonacionesRecibidas } from '../api/donationsApi';
import { getUserById } from '../api/usersApi';

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
						try { const u = await getUserById(d.receptorId); if (u) d.receptorName = u.perfil?.nombreEmpresa || u.perfil?.nombreCompleto || u.nombre || u.nombreCompleto || u.username || (u.email ? u.email.split('@')[0] : undefined); } catch (e) {}
					}
				}));
				setHechas(made);

				if (perfil && perfil.tipoPerfil === 'EMPRESA') {
					const rec = Array.isArray(await listDonacionesRecibidas(ownerId)) ? await listDonacionesRecibidas(ownerId) : [];
					await Promise.all(rec.map(async (d) => {
						if (d.donanteId && !d.donanteName) {
							try { const u = await getUserById(d.donanteId); if (u) d.donanteName = u.perfil?.nombreCompleto || u.nombre || u.nombreCompleto || u.username || (u.email ? u.email.split('@')[0] : undefined); } catch (e) {}
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
			<h2 style={{ color: '#a0522d' }}>Donaciones</h2>
			{loading ? <div>Cargando donaciones...</div> : (
				<>
					<section style={{ marginBottom: 18 }}>
						<h3>Donaciones hechas</h3>
						{hechas.length === 0 ? <div>No has realizado donaciones.</div> : (
							hechas.map(d => (
								<div key={d.id || `${d.donanteId}-${d.receptorId}-${d.fecha_donacion || d.fecha}` } style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 18px rgba(64,11,25,0.06)', marginBottom: 12 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<div style={{ fontWeight: 'bold', color: '#400B19' }}>{d.tipo_donacion || d.tipo || (d.descripcion ? d.descripcion.substring(0, 40) : 'Donación')}</div>
										<div style={{ color: '#666' }}>{formatDate(d.fecha_donacion || d.fecha)}</div>
									</div>
									<div style={{ marginTop: 6 }}><b>Monto:</b> {formatAmount(d.monto)}</div>
									{d.cantidad ? <div><b>Cantidad:</b> {d.cantidad} {d.unidad || ''}</div> : null}
									{d.receptorName || d.receptorId ? <div><b>Receptor:</b> {d.receptorName || `#${d.receptorId}`}</div> : null}
									{d.descripcion ? <div style={{ marginTop: 6 }}>{d.descripcion}</div> : null}
								</div>
							))
						)}
					</section>

					{perfil && perfil.tipoPerfil === 'EMPRESA' && (
						<section>
							<h3>Donaciones recibidas</h3>
							{recibidas.length === 0 ? <div>No has recibido donaciones.</div> : (
								recibidas.map(d => (
									<div key={d.id || `${d.donanteId}-${d.receptorId}-${d.fecha_donacion || d.fecha}` } style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 18px rgba(64,11,25,0.06)', marginBottom: 12 }}>
										<div style={{ display: 'flex', justifyContent: 'space-between' }}>
											<div style={{ fontWeight: 'bold', color: '#400B19' }}>{d.tipo_donacion || d.tipo || (d.descripcion ? d.descripcion.substring(0, 40) : 'Donación')}</div>
											<div style={{ color: '#666' }}>{formatDate(d.fecha_donacion || d.fecha)}</div>
										</div>
										<div style={{ marginTop: 6 }}><b>Monto:</b> {formatAmount(d.monto)}</div>
										{d.cantidad ? <div><b>Cantidad:</b> {d.cantidad} {d.unidad || ''}</div> : null}
										{d.donanteName || d.donanteId ? <div><b>Donante:</b> {d.donanteName || `#${d.donanteId}`}</div> : null}
										{d.descripcion ? <div style={{ marginTop: 6 }}>{d.descripcion}</div> : null}
									</div>
								))
							)}
						</section>
					)}
				</>
			)}
		</div>
	);
}

