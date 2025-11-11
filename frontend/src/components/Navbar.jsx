import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';
import { getApiBase } from '../api/apiBase';
import { Link } from 'react-router-dom';

export default function Navbar() {
	const { user } = useContext(AuthContext) || {};
	const displayName = user?.perfil?.tipoPerfil === 'EMPRESA'
		? (user?.perfil?.nombreEmpresa || user?.perfil?.nombre || user?.username || 'Usuario')
		: (user?.perfil?.nombreCompleto || user?.username || (user?.perfil && user.perfil.nombre) || 'Usuario');

	return (
		<header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'linear-gradient(90deg, rgba(242,156,107,0.06), rgba(255,255,255,0))', borderBottom: '1px solid #f0e6df' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				<Link to="/principal" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}>
					<div style={{ width: 44, height: 44, borderRadius: 8, background: '#F29C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
						PC
					</div>
					<div>
						<div style={{ fontWeight: 800, color: '#a0522d' }}>PetCloud</div>
						<div style={{ fontSize: 12, color: '#666' }}>Panel</div>
					</div>
				</Link>
			</div>

			<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
				<div style={{ textAlign: 'right', marginRight: 8 }}>
					<div style={{ fontSize: 13, fontWeight: 700 }}>{displayName}</div>
					<div style={{ fontSize: 12, color: '#888' }}>Bienvenido</div>
				</div>
				<NotificationBadge />
			</div>
		</header>
	);
}

