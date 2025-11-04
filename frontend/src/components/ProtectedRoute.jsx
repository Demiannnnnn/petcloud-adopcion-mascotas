import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function ProtectedRoute({ children }) {
	const { user } = useContext(AuthContext);
	if (!user) {
		return <Navigate to="/login" />;
	}
	// Render a simple protected layout: show Navbar for authenticated users
	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
