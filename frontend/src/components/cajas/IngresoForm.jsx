import React, { useState } from 'react';

export default function IngresoForm({ onSubmit, initial = {} }) {
	const [descripcion, setDescripcion] = useState(initial.descripcion || '');
	const [monto, setMonto] = useState(initial.monto || '');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await onSubmit({ descripcion_ingreso: descripcion, monto_ingreso: parseFloat(monto) });
			setDescripcion('');
			setMonto('');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<input placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
			<input placeholder="Monto" type="number" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} />
			<button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Agregar ingreso'}</button>
		</form>
	);
}
