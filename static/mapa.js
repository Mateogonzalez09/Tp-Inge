// Todo lo que depende de Leaflet: mapa, marcadores de sedes y popups.
import { estado } from './estado.js';
import { crearTexto, plural, formatearFecha, esMovil, comportamientoScroll } from './utilidades.js';

const panelMapa = document.getElementById('panel-mapa');
const mapaEstado = document.getElementById('mapa-estado');

let mapa;
const capaSedes = L.layerGroup();
let marcadores = [];        // [{ sede, marker }]
let sedesSinUbicar = [];    // sedes que la API de direcciones no pudo ubicar
let alAlternarInteres = () => {};

export function iniciarMapa() {
    mapa = L.map('mapa').setView([-34.6037, -58.3816], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    capaSedes.addTo(mapa);
}

// "alternarInteres" se recibe por parámetro para que el mapa no dependa del cuadro de intereses.
export function cargarSedes(charlas, alternarInteres) {
    alAlternarInteres = alternarInteres;

    const sedes = agruparPorSede(charlas);
    const tieneUbicacion = (sede) => sede.coordenadas && sede.coordenadas.lat && sede.coordenadas.lng;

    sedesSinUbicar = sedes.filter((sede) => !tieneUbicacion(sede));
    marcadores = sedes.filter(tieneUbicacion).map((sede) => {
        const marker = L.marker([sede.coordenadas.lat, sede.coordenadas.lng])
            .bindPopup(() => crearPopup(sede), { minWidth: 230, maxWidth: 300 });
        return { sede, marker };
    });
}

// Una sede puede tener varias charlas: se agrupan en un único marcador.
function agruparPorSede(charlas) {
    const sedes = new Map();
    charlas.forEach((charla) => {
        const clave = `${charla.sede_nombre}|${charla.sede_direccion}`;
        if (!sedes.has(clave)) {
            sedes.set(clave, {
                nombre: charla.sede_nombre,
                direccion: charla.sede_direccion,
                distrito: charla.distrito,
                coordenadas: charla.coordenadas,
                charlas: []
            });
        }
        sedes.get(clave).charlas.push(charla);
    });
    return [...sedes.values()];
}

// Muestra solo las sedes del distrito (todas si no hay distrito) y actualiza el texto de estado.
export function mostrarSedes(distrito, avisoExtra = '') {
    const visibles = marcadores.filter(({ sede }) => !distrito || sede.distrito === distrito);
    capaSedes.clearLayers();
    visibles.forEach(({ marker }) => capaSedes.addLayer(marker));

    if (visibles.length) {
        const limites = L.latLngBounds(visibles.map(({ marker }) => marker.getLatLng()));
        mapa.fitBounds(limites, { padding: [50, 50], maxZoom: 14 });
    }

    const sinUbicar = sedesSinUbicar.filter((sede) => !distrito || sede.distrito === distrito);
    let texto = crearEstadoMapa(distrito, visibles, sinUbicar);
    if (avisoExtra) texto += ` ${avisoExtra}`;
    mostrarEstadoMapa(texto, false);
    refrescarPopups();
}

function crearEstadoMapa(distrito, visibles, sinUbicar) {
    let texto;
    if (!distrito) {
        texto = `Mostrando ${visibles.length} ${plural(visibles.length, 'sede', 'sedes')} de todos los distritos. Elegí tu distrito electoral para filtrarlas.`;
    } else if (visibles.length) {
        texto = `Mostrando ${visibles.length} ${plural(visibles.length, 'sede', 'sedes')} en ${distrito}.`;
    } else {
        texto = `Todavía no hay sedes cargadas en ${distrito}.`;
    }
    if (sinUbicar.length) {
        texto += ` No se pudo ubicar en el mapa: ${sinUbicar.map((sede) => sede.nombre).join(', ')}.`;
    }
    return texto;
}

export function mostrarEstadoMapa(texto, esError) {
    mapaEstado.textContent = texto;
    mapaEstado.classList.toggle('con-error', esError);
}

export function charlaTieneUbicacion(charla) {
    return marcadores.some(({ sede }) => sede.charlas.some(({ id }) => id === charla.id));
}

export function verEnMapa(charla) {
    const entrada = marcadores.find(({ sede }) => sede.charlas.some((c) => c.id === charla.id));
    if (!entrada) return;

    if (esMovil()) {
        panelMapa.scrollIntoView({ behavior: comportamientoScroll(), block: 'start' });
    }
    mapa.setView(entrada.marker.getLatLng(), Math.max(mapa.getZoom(), 15));
    entrada.marker.openPopup();
}

// ---------- Popup de sede ----------
function crearPopup(sede) {
    const cont = document.createElement('div');
    cont.className = 'popup-sede';
    cont.append(crearTexto('h3', sede.nombre), crearTexto('p', sede.direccion));

    sede.charlas.forEach((charla) => {
        const bloque = document.createElement('div');
        bloque.className = 'popup-charla';
        bloque.append(crearTexto('strong', charla.nombre));
        if (charla.tema) bloque.append(crearTexto('p', charla.tema));
        bloque.append(crearTexto('p', `${formatearFecha(charla.fecha)} · ${charla.horario} hs`));

        const marcada = estado.interes.has(charla.id);
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-interes' + (marcada ? ' activo' : '');
        boton.textContent = marcada ? 'Quitar de mis intereses' : 'Me interesa';
        boton.addEventListener('click', (e) => {
            // El popup se regenera al cambiar el estado; sin esto Leaflet interpreta
            // el click como un click sobre el mapa y cierra el popup.
            e.stopPropagation();
            alAlternarInteres(charla);
        });
        bloque.append(boton);

        cont.append(bloque);
    });

    return cont;
}

// Si hay un popup abierto, lo vuelve a generar para reflejar el estado actual
export function refrescarPopups() {
    marcadores.forEach(({ marker }) => {
        if (marker.isPopupOpen()) marker.getPopup().update();
    });
}
