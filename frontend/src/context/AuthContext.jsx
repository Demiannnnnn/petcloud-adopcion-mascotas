import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	const login = (userData) => {
		setUser(userData);
		// Puedes guardar en localStorage si quieres persistencia
	};

	const logout = () => {
		setUser(null);
		// Elimina de localStorage si usas persistencia
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
