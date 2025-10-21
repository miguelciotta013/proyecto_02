import React from 'react';

export default function CajaCard({ caja, onView = () => {} }) {
	return (
		<div style={{ padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div>
					<div style={{ fontWeight: 600 }}>Caja #{caja.id_caja}</div>
					<div style={{ color: '#666', fontSize: 13 }}>{caja.empleado_nombre}</div>
				</div>
				<div>
					<div style={{ textAlign: 'right' }}>
						<div style={{ fontSize: 14, fontWeight: 700 }}>${caja.monto_apertura}</div>
						<div style={{ color: '#888', fontSize: 12 }}>{caja.fecha_hora_apertura || '—'}</div>
					</div>
				</div>
			</div>
			<div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
				<button onClick={() => onView(caja.id_caja)} style={{ padding: '6px 10px', borderRadius: 6 }}>Ver</button>
			</div>
		</div>
	);
}
