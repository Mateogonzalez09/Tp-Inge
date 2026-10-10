import { API, comportamientoScroll, mostrarAlerta } from './utilidades.js';

export function iniciarFormulario({
    obtenerCharlasSeleccionadas,
    limpiarCharlasSeleccionadas,
    aplicarFiltroDistrito,
    aplicarFiltroVistaPrincipal
}) {
    const form = document.getElementById('form-postulante');
    form.addEventListener('submit', (event) => event.preventDefault(), { capture: true });

    const modalRegistro = document.getElementById('modal-registro');
    const botonAbrirRegistro = document.getElementById('btn-abrir-registro');
    const botonCerrarRegistro = document.getElementById('btn-cerrar-registro');
    const checkAfiliado = document.getElementById('es_afiliado');
    const campoPartido = document.getElementById('campo-partido');
    const inputPartido = document.getElementById('partido_afiliado');
    const selDistrito = document.getElementById('distrito');
    const msgError = document.getElementById('mensaje-error');
    const msgExito = document.getElementById('mensaje-exito');
    const textoMsgExito = document.getElementById('texto-mensaje-exito');
    const botonCerrarNotificacion = document.getElementById('btn-cerrar-notificacion');
    let temporizadorExito;

    function mostrarModal() {
        if (!modalRegistro.open) modalRegistro.showModal();
    }

    function cerrarModal() {
        if (modalRegistro.open) modalRegistro.close();
    }

    function ocultarNotificacionExito() {
        clearTimeout(temporizadorExito);
        msgExito.classList.add('oculto');
    }

    function mostrarNotificacionExito() {
        clearTimeout(temporizadorExito);
        textoMsgExito.textContent = 'Inscripción registrada correctamente.';
        msgExito.classList.remove('oculto');
        temporizadorExito = setTimeout(ocultarNotificacionExito, 5000);
    }

    function ocultarAlertas() {
        msgError.classList.add('oculto');
    }

    botonAbrirRegistro.addEventListener('click', mostrarModal);
    botonCerrarRegistro.addEventListener('click', cerrarModal);
    modalRegistro.addEventListener('close', aplicarFiltroVistaPrincipal);
    modalRegistro.addEventListener('click', (event) => {
        if (event.target === modalRegistro) cerrarModal();
    });
    botonCerrarNotificacion.addEventListener('click', ocultarNotificacionExito);

    checkAfiliado.addEventListener('change', (event) => {
        campoPartido.classList.toggle('oculto', !event.target.checked);
        inputPartido.required = event.target.checked;
        if (!event.target.checked) inputPartido.value = '';
    });

    selDistrito.addEventListener('change', aplicarFiltroDistrito);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        ocultarAlertas();

        const payload = {
            dni: document.getElementById('dni').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            nombre: document.getElementById('nombre').value.trim(),
            fechaNacimiento: document.getElementById('fecha_nacimiento').value,
            email: document.getElementById('correo').value.trim(),
            telefono: parseInt(document.getElementById('telefono').value.replace(/\D/g, ''), 10),
            direccion: document.getElementById('direccion').value.trim(),
            distritoElectoral: selDistrito.value,
            autoridadDeMesa: document.getElementById('fue_autoridad').checked ? 1 : 0,
            capacitacion: document.getElementById('hizo_capacitacion').checked ? 1 : 0,
            nombrePartido: inputPartido.value.trim(),
            charlasSeleccionadas: obtenerCharlasSeleccionadas()
        };

        if (isNaN(payload.telefono)) {
            mostrarAlerta(msgError, 'El teléfono debe ser un valor numérico válido.');
            return;
        }

        await registrarPostulante(payload);
    });

    async function registrarPostulante(datos) {
        try {
            const response = await fetch(`${API}/postulantes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Ocurrió un error al procesar el registro.');
            }

            form.reset();
            campoPartido.classList.add('oculto');
            limpiarCharlasSeleccionadas();
            aplicarFiltroDistrito();
            cerrarModal();
            mostrarNotificacionExito();
        } catch (error) {
            mostrarAlerta(msgError, error.message);
        }
    }
}
