import React, { createContext, useState } from 'react';
import { cleanRut } from '../utils/rut';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(() => {
		const storedUser = localStorage.getItem('user');
		return storedUser ? JSON.parse(storedUser) : null;
	});

	const login = (userData) => {
		// Normalizar RUT en el perfil antes de guardar
		const copy = { ...userData };
		if (copy.perfil && copy.perfil.rut) {
			copy.perfil = { ...copy.perfil, rut: cleanRut(copy.perfil.rut).toUpperCase() };
		}
		setUser(copy);
		localStorage.setItem('user', JSON.stringify(copy));
	};

	const logout = () => {
	setUser(null);
	localStorage.removeItem('user');
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
