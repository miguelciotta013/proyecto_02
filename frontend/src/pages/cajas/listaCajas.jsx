/*
Lista de las cajas con los montos, fechas y hora para cada movimiento(apertura y cierre)

- boton para abrir caja (en caso de que no haya una caja abierta)
- boton para cerrar caja (en caso de que haya una caja abierta)
- ambos botones no deben estar dispomibles al mismo tiempo
*/
import React, { useEffect, useState } from 'react';
import { listCajas, aperturaCaja } from '../../api/cajasApi';
import CajaTable from '../../components/cajas/cajaTable';
import AperturaForm from '../../components/cajas/AperturaForm';
import { useNavigate } from 'react-router-dom';

export default function ListaCajas() {
	const [cajas, setCajas] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function fetchCajas() {
		setLoading(true);
		try {
			const resp = await listCajas();
			if (resp && resp.success) {
				setCajas(resp.data || []);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchCajas();
	}, []);

	async function handleApertura(payload) {
		try {
			const resp = await aperturaCaja(payload);
				if (resp && resp.success) {
					// navegar al detalle de la nueva caja
					navigate(`/cajas/${resp.data.id_caja}`);
				} else {
					const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error al abrir caja';
					alert(msg);
				}
		} catch (e) {
			console.error(e);
				alert(e.message || 'Error al abrir caja');
		}
	}

	return (
		<div>
			<h2>Cajas</h2>
			<div style={{ marginBottom: 12 }}>
				<AperturaForm onSubmit={handleApertura} />
			</div>

			{loading ? <div>Cargando...</div> : <CajaTable items={cajas} onView={(id) => navigate(`/cajas/${id}`)} />}
		</div>
	);
}
