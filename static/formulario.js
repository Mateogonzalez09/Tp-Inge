// Modal de inscripción: abrir y cerrar, leer y enviar los datos, y avisar el resultado.
import { estado } from './estado.js';
import { enviarPostulacion } from './api.js';
import { comportamientoScroll } from './utilidades.js';

const form = document.getElementById('form-postulante');
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

export const distritoDelFormulario = () => selDistrito.value;

// Los efectos sobre el resto de la pantalla llegan como callbacks desde main.js:
//   alElegirDistrito: cambió el distrito elegido en el formulario
//   alCerrarModal:    se cerró el modal
//   alRegistrar:      la inscripción se guardó bien
export function iniciarFormulario({ alElegirDistrito, alCerrarModal, alRegistrar }) {
    form.addEventListener('submit', (event) => event.preventDefault(), { capture: true });

    botonAbrirRegistro.addEventListener('click', mostrarModal);
    botonCerrarRegistro.addEventListener('click', cerrarModal);
    modalRegistro.addEventListener('close', alCerrarModal);
    modalRegistro.addEventListener('click', (e) => {
        if (e.target === modalRegistro) cerrarModal();
    });
    botonCerrarNotificacion.addEventListener('click', ocultarNotificacionExito);

    checkAfiliado.addEventListener('change', (e) => {
        campoPartido.classList.toggle('oculto', !e.target.checked);
        inputPartido.required = e.target.checked;
        if (!e.target.checked) inputPartido.value = '';
    });
    selDistrito.addEventListener('change', alElegirDistrito);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        ocultarError();

        const datos = leerDatosDelFormulario();
        if (isNaN(datos.telefono)) {
            mostrarError('El teléfono debe ser un valor numérico válido.');
            return;
        }

        try {
            await enviarPostulacion(datos);
            form.reset();
            campoPartido.classList.add('oculto');
            alRegistrar();
            cerrarModal();
            mostrarNotificacionExito();
        } catch (error) {
            mostrarError(error.message);
        }
    });
}

function leerDatosDelFormulario() {
    return {
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
        charlasSeleccionadas: [...estado.interes.keys()]
    };
}

function mostrarModal() {
    if (!modalRegistro.open) modalRegistro.showModal();
}

function cerrarModal() {
    if (modalRegistro.open) modalRegistro.close();
}

function mostrarError(mensaje) {
    msgError.textContent = mensaje;
    msgError.classList.remove('oculto');
    msgError.scrollIntoView({ block: 'nearest', behavior: comportamientoScroll() });
}

function ocultarError() {
    msgError.classList.add('oculto');
}

function mostrarNotificacionExito() {
    clearTimeout(temporizadorExito);
    textoMsgExito.textContent = 'Inscripción registrada correctamente.';
    msgExito.classList.remove('oculto');
    temporizadorExito = setTimeout(ocultarNotificacionExito, 5000);
}

function ocultarNotificacionExito() {
    clearTimeout(temporizadorExito);
    msgExito.classList.add('oculto');
}
