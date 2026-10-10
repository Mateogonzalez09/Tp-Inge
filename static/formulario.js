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

    // --- NUEVO: Función para bloquear caracteres inválidos en tiempo real mientras escriben ---
    function configurarRestriccionesInputs() {
        const inputNombre = document.getElementById('nombre');
        const inputApellido = document.getElementById('apellido');
        const inputDni = document.getElementById('dni');
        const inputTelefono = document.getElementById('telefono');

        // Nombre y Apellido: solo letras del abecedario y espacios
        const filtrarLetras = (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
        };
        inputNombre.addEventListener('input', filtrarLetras);
        inputApellido.addEventListener('input', filtrarLetras);

        // DNI y Teléfono: únicamente números enteros (sin letras ni símbolos)
        const filtrarNumeros = (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        };
        inputDni.addEventListener('input', filtrarNumeros);
        inputTelefono.addEventListener('input', filtrarNumeros);
    }

    // LLAMAMOS A LA FUNCIÓN AL INICIO DE TODO EN EL FORMULARIO
    configurarRestriccionesInputs();

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

        // Leemos los valores limpios de DNI y Teléfono
        const dniVal = document.getElementById('dni').value.trim();
        const telefonoVal = document.getElementById('telefono').value.trim();

        // Validación estricta final por seguridad antes de armar el payload
        if (!/^\d+$/.test(dniVal)) {
            mostrarAlerta(msgError, 'El DNI debe contener únicamente números enteros.');
            return;
        }

        if (!/^\d+$/.test(telefonoVal)) {
            mostrarAlerta(msgError, 'El teléfono debe contener únicamente números enteros.');
            return;
        }

        const payload = {
            dni: dniVal,
            apellido: document.getElementById('apellido').value.trim(),
            nombre: document.getElementById('nombre').value.trim(),
            fechaNacimiento: document.getElementById('fecha_nacimiento').value,
            email: document.getElementById('correo').value.trim(),
            telefono: parseInt(telefonoVal, 10), // Acá ya sabemos seguro que son solo números
            direccion: document.getElementById('direccion').value.trim(),
            distritoElectoral: selDistrito.value,
            autoridadDeMesa: document.getElementById('fue_autoridad').checked ? 1 : 0,
            capacitacion: document.getElementById('hizo_capacitacion').checked ? 1 : 0,
            nombrePartido: inputPartido.value.trim(),
            charlasSeleccionadas: obtenerCharlasSeleccionadas()
        };

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
