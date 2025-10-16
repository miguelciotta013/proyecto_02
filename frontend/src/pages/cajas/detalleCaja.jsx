/*
Detalle de la caja (card) con los datos relevantes de esta

-total de ingresos
-total de egresos
-Estado de caja
- empleado encargado
-boton de cerrar caja
- boton para ver la lista de los tratamientos cobrados

*/

/*
Detalle de la caja (card) con los datos relevantes de esta

-total de ingresos
-total de egresos
-Estado de caja
- empleado encargado
-boton de cerrar caja
- boton para ver la lista de los tratamientos cobrados

*/
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCajaDetail, addIngreso, addEgreso, cierreCaja } from '../../api/cajasApi';
import MovimientoForm from '../../components/cajas/MovimientoForm';
import CierreForm from '../../components/cajas/CierreForm';

export default function DetalleCaja() {
	const { id } = useParams();
	const [caja, setCaja] = useState(null);
	const [loading, setLoading] = useState(false);

	async function fetchDetalle() {
		setLoading(true);
		try {
			const resp = await getCajaDetail(id);
			if (resp && resp.success) setCaja(resp.data);
			else alert(resp.error || 'Error al obtener detalle');
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchDetalle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	async function handleIngreso(payload) {
		try {
			const resp = await addIngreso(id, payload);
			if (resp && resp.success) {
				fetchDetalle();
			} else {
					const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error registrando ingreso';
					alert(msg);
			}
		} catch (e) {
			console.error(e);
				alert(e.message || 'Error registrando ingreso');
		}
	}

	async function handleEgreso(payload) {
		try {
			const resp = await addEgreso(id, payload);
			if (resp && resp.success) {
				fetchDetalle();
			} else {
					const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error registrando egreso';
					alert(msg);
			}
		} catch (e) {
			console.error(e);
				alert(e.message || 'Error registrando egreso');
		}
	}

	async function handleCierre(payload) {
		try {
			const resp = await cierreCaja(id, payload);
			if (resp && resp.success) {
				alert('Caja cerrada');
				fetchDetalle();
			} else {
					const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error cerrando caja';
					alert(msg);
			}
		} catch (e) {
			console.error(e);
				alert(e.message || 'Error cerrando caja');
		}
	}

	if (loading) return <div>Cargando...</div>;
	if (!caja) return <div>No se encontró la caja</div>;

	return (
		<div>
			<h2>Detalle Caja #{caja.id_caja}</h2>
			<div>
				<strong>Empleado:</strong> {caja.empleado}
			</div>
			<div>
				<strong>Apertura:</strong> {caja.fecha_hora_apertura}
			</div>
			<div>
				<strong>Cierre:</strong> {caja.fecha_hora_cierre || '—'}
			</div>
			<div>
				<strong>Estado:</strong> {caja.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
			</div>

			<h3>Movimientos</h3>
			<div>
				<h4>Ingresos</h4>
				<ul>
					{(caja.ingresos || []).map((i) => (
						<li key={i.id_ingreso}>{i.descripcion_ingreso} — {i.monto_ingreso}</li>
					))}
				</ul>

				<h4>Egresos</h4>
				<ul>
					{(caja.egresos || []).map((e) => (
						<li key={e.id_egreso}>{e.descripcion_egreso} — {e.monto_egreso}</li>
					))}
				</ul>
			</div>

			{caja.estado_caja === 1 && (
				<div style={{ marginTop: 12 }}>
					<h4>Registrar ingreso</h4>
					<MovimientoForm type="ingreso" onSubmit={handleIngreso} />

					<h4>Registrar egreso</h4>
					<MovimientoForm type="egreso" onSubmit={handleEgreso} />

					<h4>Cierre de caja</h4>
					<CierreForm onSubmit={handleCierre} />
				</div>
			)}

			<h3>Resumen</h3>
			<div>
				<div>Total ingresos: {caja.total_ingresos || '0'}</div>
				<div>Total egresos: {caja.total_egresos || '0'}</div>
				<div>Total cobros: {caja.total_cobros || '0'}</div>
				<div>Total esperado: {caja.total_esperado || '0'}</div>
			</div>
		</div>
	);
}
