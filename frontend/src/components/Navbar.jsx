import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';
import ContactsModal from './ContactsModal';
import { getApiBase } from '../api/apiBase';
import { Link } from 'react-router-dom';

export default function Navbar() {
	const { user } = useContext(AuthContext) || {};
	const [contactsOpen, setContactsOpen] = React.useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const displayName = user?.perfil?.tipoPerfil === 'EMPRESA'
		? (user?.perfil?.nombreEmpresa || user?.perfil?.nombre || user?.username || 'Usuario')
		: (user?.perfil?.nombreCompleto || user?.username || (user?.perfil && user.perfil.nombre) || 'Usuario');

	return (
		<>
			<header style={{ 
				display: 'flex', 
				alignItems: 'center', 
				gap: 12, 
				padding: '12px 18px', 
				background: 'linear-gradient(90deg, rgba(242,156,107,0.06), rgba(255,255,255,0))', 
				borderBottom: '1px solid #f0e6df',
				position: 'relative',
				flexWrap: 'wrap'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
					<Link to="/principal" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}>
						<div style={{ width: 44, height: 44, borderRadius: 8, background: '#F29C6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
							PC
						</div>
						<div className="hide-on-mobile">
							<div style={{ fontWeight: 800, color: '#a0522d' }}>PetCloud</div>
							<div style={{ fontSize: 12, color: '#666' }}>Panel</div>
						</div>
					</Link>
				</div>

				{/* Hamburger menu button - solo móvil */}
				<button 
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="show-on-mobile"
					style={{ 
						marginLeft: 'auto',
						background: 'transparent',
						border: 'none',
						fontSize: 24,
						cursor: 'pointer',
						padding: 8,
						display: 'none'
					}}
					aria-label="Menu"
				>
					☰
				</button>

				{/* Desktop menu */}
				<div className="hide-on-mobile" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
					<button onClick={() => setContactsOpen(true)} style={{ background: '#fff', border: '1px solid #f0e6df', padding: '6px 10px', borderRadius: 10, cursor: 'pointer' }}>Contactos</button>

					<div style={{ textAlign: 'right', marginRight: 8 }}>
						<div style={{ fontSize: 13, fontWeight: 700 }}>{displayName}</div>
						<div style={{ fontSize: 12, color: '#888' }}>Bienvenido</div>
					</div>
					<NotificationBadge />
				</div>

				{/* Mobile menu dropdown */}
				{mobileMenuOpen && (
					<div 
						className="show-on-mobile"
						style={{
							display: 'none',
							position: 'absolute',
							top: '100%',
							left: 0,
							right: 0,
							background: '#fff',
							borderBottom: '1px solid #f0e6df',
							boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
							zIndex: 1000,
							padding: '12px 18px',
							flexDirection: 'column',
							gap: 12
						}}
					>
						<div style={{ padding: '8px 0', borderBottom: '1px solid #f0e6df' }}>
							<div style={{ fontSize: 14, fontWeight: 700, color: '#a0522d' }}>{displayName}</div>
							<div style={{ fontSize: 12, color: '#888' }}>Bienvenido</div>
						</div>
						<button 
							onClick={() => { setContactsOpen(true); setMobileMenuOpen(false); }} 
							style={{ 
								background: '#fff', 
								border: '1px solid #f0e6df', 
								padding: '10px', 
								borderRadius: 10, 
								cursor: 'pointer',
								width: '100%',
								textAlign: 'left'
							}}
						>
							Contactos
						</button>
						<div style={{ padding: '8px 0' }}>
							<NotificationBadge />
						</div>
					</div>
				)}
			</header>

			{/* Contacts modal */}
			<ContactsModal open={contactsOpen} onClose={() => setContactsOpen(false)} ownerPerfilId={user?.perfil?.id || user?.id} />

			<style>{`
				@media (max-width: 768px) {
					.show-on-mobile {
						display: flex !important;
					}
					.hide-on-mobile {
						display: none !important;
					}
				}
			`}</style>
		</>
	);
}

