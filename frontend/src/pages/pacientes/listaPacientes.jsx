import React, { useEffect, useState } from 'react';
import { listPacientes, getPaciente } from '../../api/pacientesApi';
import PacienteTable from '../../components/pacientes/pacienteTable';
import PacienteCard from '../../components/pacientes/pacienteCard';
import PacientesForm from '../../components/pacientes/pacientesForm';
import ObraSocialForm from '../../components/pacientes/obraSocialForm';
import PatologiaForm from '../../components/pacientes/patologiaForm';

export default function ListaPacientes() {
	const [pacientes, setPacientes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selected, setSelected] = useState(null);
	 const [showObraFor, setShowObraFor] = useState(null);
	 const [showPatologiaFor, setShowPatologiaFor] = useState(null);
	 const [editing, setEditing] = useState(null);

	useEffect(() => {
		fetchPacientes();
	}, []);

	async function fetchPacientes() {
		setLoading(true);
		setError(null);
		try {
			const resp = await listPacientes();
			if (resp && resp.success) {
				setPacientes(resp.data || []);
			} else {
				setError(resp?.error || 'Error al obtener pacientes');
			}
		} catch (e) {
			setError(e.message || String(e));
		} finally {
			setLoading(false);
		}
	}

	async function handleView(id) {
		try {
			const resp = await getPaciente(id);
			if (resp && resp.success) setSelected(resp.data);
			else setError(resp?.error || 'No se pudo obtener paciente');
		} catch (e) {
			setError(e.message || String(e));
		}
	}

	async function handleEliminar(id_paciente) {
		if (!window.confirm('¿Seguro que querés dar de baja a este paciente?')) return;
		try {
			setLoading(true);
			setError(null);
			// llamar a la API de borrado
			const { deletePaciente } = await import('../../api/pacientesApi');
			const resp = await deletePaciente(id_paciente);
			if (resp && resp.success) {
				// refrescar lista
				await fetchPacientes();
				setSelected(null);
			} else {
				setError(resp?.error || 'Error al eliminar');
			}
		} catch (e) {
			setError(e.message || String(e));
		} finally {
			setLoading(false);
		}
	}

	function handleEditar(id_paciente) {
		// Cargar paciente y poner en modo edición
		setError(null);
		getPaciente(id_paciente)
			.then(resp => {
				if (resp && resp.success) {
					setEditing(resp.data);
				} else {
					setError(resp?.error || 'No se pudo obtener paciente');
				}
			})
			.catch(e => setError(e.message || String(e)));
	}


	function handleAsignarObra(id_paciente) {
		setShowObraFor(id_paciente);
	}

	function handleAgregarFicha(id_paciente) {
		setShowPatologiaFor(id_paciente);
	}


	return (
		<div style={{ padding: 16 }}>
			<h2>Pacientes</h2>
				<div style={{ marginBottom: 12 }}>
					<button onClick={() => setSelected('__create__')}>Nuevo paciente</button>
				</div>
			{loading && <p>Cargando pacientes...</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}
			{!loading && !error && (
				<PacienteTable pacientes={pacientes} onView={handleView} />
			)}

				{selected && selected !== '__create__' && (
					<PacienteCard 
						paciente={selected} 
						onClose={() => setSelected(null)} 
						onEliminar={handleEliminar}
						onAsignarObra={handleAsignarObra}
						onAgregarFicha={handleAgregarFicha}
						onEditar={handleEditar}
					/>
				)}

				{selected === '__create__' && (
					<PacientesForm onClose={() => { setSelected(null); }} onCreated={() => fetchPacientes()} />
				)}

				{editing && (
					<PacientesForm 
						initialData={editing} 
						onClose={() => setEditing(null)} 
						onUpdated={() => { setEditing(null); fetchPacientes(); }}
					/>
				)}

				{showObraFor && (
					<ObraSocialForm id_paciente={showObraFor} onClose={() => setShowObraFor(null)} onAssigned={() => { setShowObraFor(null); fetchPacientes(); }} />
				)}

				{showPatologiaFor && (
					<PatologiaForm id_paciente={showPatologiaFor} onClose={() => setShowPatologiaFor(null)} onSaved={() => { setShowPatologiaFor(null); fetchPacientes(); }} />
				)}
		</div>
	);
}