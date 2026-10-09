// Lista de charlas de orientación de la pantalla principal.
import { charlaTieneUbicacion, verEnMapa } from './mapa.js';
import { crearTexto, crearDatosCharla, charlasDelDistrito, porFechaYHorario } from './utilidades.js';

const listaCharlas = document.getElementById('lista-charlas');
const mensajeCharlas = document.getElementById('mensaje-charlas');

export function renderListaCharlas(charlas, distrito) {
    const visibles = charlasDelDistrito(charlas, distrito).sort(porFechaYHorario);

    listaCharlas.replaceChildren(...visibles.map(crearItemCharla));
    mensajeCharlas.classList.toggle('oculto', visibles.length > 0);
    if (!visibles.length) {
        mensajeCharlas.textContent = distrito
            ? `Todavía no hay charlas cargadas en ${distrito}.`
            : 'No hay charlas de orientación cargadas.';
    }
}

export function mostrarErrorCharlas() {
    mensajeCharlas.textContent = 'No se pudieron cargar las charlas de orientación.';
}

function crearItemCharla(charla) {
    const li = document.createElement('li');
    li.className = 'charla-item';

    const acciones = document.createElement('div');
    acciones.className = 'interes-acciones';
    if (charlaTieneUbicacion(charla)) {
        const verMapa = document.createElement('button');
        verMapa.type = 'button';
        verMapa.className = 'btn-texto';
        verMapa.textContent = 'Ver en el mapa';
        verMapa.addEventListener('click', () => verEnMapa(charla));
        acciones.append(verMapa);
    } else {
        acciones.append(crearTexto('span', 'Ubicación no disponible en el mapa'));
    }

    li.append(crearDatosCharla(charla), acciones);
    return li;
}
