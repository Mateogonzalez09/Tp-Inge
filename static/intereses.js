// Cuadro "Charlas de interés" del formulario: qué charlas marcó el postulante.
import { estado } from './estado.js';
import { refrescarPopups } from './mapa.js';
import { distritoDelFormulario } from './formulario.js';
import { crearDatosCharla, charlasDelDistrito, plural, porFechaYHorario } from './utilidades.js';

const cajaInteres = document.getElementById('caja-interes');
const listaInteres = document.getElementById('lista-interes');
const interesVacio = document.getElementById('interes-vacio');
const mensajeInteresVacio = document.getElementById('mensaje-interes-vacio');
const contadorInteres = document.getElementById('contador-interes');

export function alternarInteres(charla) {
    if (estado.interes.has(charla.id)) {
        estado.interes.delete(charla.id);
    } else {
        estado.interes.set(charla.id, charla);
        estado.nuevoId = charla.id;
    }
    renderListaInteres();
    refrescarPopups();
}

// Las charlas marcadas de otro distrito ya no corresponden. Devuelve cuántas se quitaron.
export function quitarInteresesFueraDe(distrito) {
    if (!distrito) return 0;

    let quitadas = 0;
    for (const [id, charla] of estado.interes) {
        if (charla.distrito !== distrito) {
            estado.interes.delete(id);
            quitadas++;
        }
    }
    return quitadas;
}

export function renderListaInteres() {
    const distrito = distritoDelFormulario();
    const charlas = charlasDelDistrito(estado.charlas, distrito).sort(porFechaYHorario);

    listaInteres.replaceChildren(...charlas.map(crearItemInteres));

    interesVacio.classList.toggle('oculto', charlas.length > 0);
    cajaInteres.classList.toggle('vacia', charlas.length === 0);
    mensajeInteresVacio.textContent = distrito
        ? `No hay charlas disponibles en ${distrito}.`
        : 'No hay charlas disponibles.';
    contadorInteres.textContent = estado.interes.size
        ? `· ${estado.interes.size} ${plural(estado.interes.size, 'seleccionada', 'seleccionadas')}`
        : '';
    estado.nuevoId = null;
}

function crearItemInteres(charla) {
    const marcada = estado.interes.has(charla.id);

    const li = document.createElement('li');
    li.className = 'interes-item' + (marcada ? ' seleccionada' : '') + (charla.id === estado.nuevoId ? ' nuevo' : '');

    const botonInteres = document.createElement('button');
    botonInteres.type = 'button';
    botonInteres.className = 'btn-seleccion-interes';
    botonInteres.textContent = marcada ? 'Quitar de mis intereses' : 'Me interesa';
    botonInteres.setAttribute('aria-pressed', String(marcada));
    botonInteres.addEventListener('click', () => alternarInteres(charla));

    const acciones = document.createElement('div');
    acciones.className = 'interes-acciones';
    acciones.append(botonInteres);

    li.append(crearDatosCharla(charla), acciones);
    return li;
}
