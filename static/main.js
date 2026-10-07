const API = 'http://127.0.0.1:5000/api';

// ---------- Referencias al DOM ----------
const form = document.getElementById('form-postulante');
const checkAfiliado = document.getElementById('es_afiliado');
const campoPartido = document.getElementById('campo-partido');
const inputPartido = document.getElementById('partido_afiliado');
const selDistrito = document.getElementById('distrito');
const msgError = document.getElementById('mensaje-error');
const msgExito = document.getElementById('mensaje-exito');

const cajaInteres = document.getElementById('caja-interes');
const listaInteres = document.getElementById('lista-interes');
const interesVacio = document.getElementById('interes-vacio');
const contadorInteres = document.getElementById('contador-interes');
const panelMapa = document.getElementById('panel-mapa');
const mapaEstado = document.getElementById('mapa-estado');

// ---------- Estado ----------
let mapa;
const capaSedes = L.layerGroup();
let marcadores = [];          // [{ sede, marker }]
let sedesSinUbicar = [];      // sedes que la API de direcciones no pudo ubicar
let sedesCargadas = false;
const interes = new Map();    // id de charla -> charla
let nuevoId = null;           // última charla agregada (para resaltarla en la lista)

const esMovil = () => window.matchMedia('(max-width: 900px)').matches;
const comportamientoScroll = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

// ---------- Formulario ----------
checkAfiliado.addEventListener('change', (e) => {
    campoPartido.classList.toggle('oculto', !e.target.checked);
    inputPartido.required = e.target.checked;
    if (!e.target.checked) inputPartido.value = '';
});

selDistrito.addEventListener('change', aplicarFiltroDistrito);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
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
        charlasSeleccionadas: [...interes.keys()]
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
        interes.clear();
        renderListaInteres();
        aplicarFiltroDistrito();
        mostrarAlerta(msgExito, 'Inscripción registrada correctamente.');
    } catch (error) {
        mostrarAlerta(msgError, error.message);
    }
}

// ---------- Mapa y sedes ----------
function iniciarMapa() {
    mapa = L.map('mapa').setView([-34.6037, -58.3816], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    capaSedes.addTo(mapa);
}

async function cargarCharlas() {
    try {
        const response = await fetch(`${API}/charlas`);
        if (!response.ok) throw new Error('Respuesta inválida del servidor');

        const charlas = await response.json();
        crearMarcadores(charlas);
        sedesCargadas = true;
        aplicarFiltroDistrito();
    } catch (error) {
        mostrarEstadoMapa('No se pudieron cargar las sedes. Verificá que el servidor esté en funcionamiento.', true);
    }
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

function crearMarcadores(charlas) {
    const sedes = agruparPorSede(charlas);
    const tieneUbicacion = (sede) => sede.coordenadas && sede.coordenadas.lat && sede.coordenadas.lng;

    sedesSinUbicar = sedes.filter((sede) => !tieneUbicacion(sede));
    marcadores = sedes.filter(tieneUbicacion).map((sede) => {
        const marker = L.marker([sede.coordenadas.lat, sede.coordenadas.lng])
            .bindPopup(() => crearPopup(sede), { minWidth: 230, maxWidth: 300 });
        return { sede, marker };
    });
}

function aplicarFiltroDistrito() {
    if (!sedesCargadas) return;

    const distrito = selDistrito.value;
    const visibles = marcadores.filter(({ sede }) => !distrito || sede.distrito === distrito);

    capaSedes.clearLayers();
    visibles.forEach(({ marker }) => capaSedes.addLayer(marker));

    // Las charlas de interés de otro distrito ya no corresponden
    let quitadas = 0;
    if (distrito) {
        for (const [id, charla] of interes) {
            if (charla.distrito !== distrito) {
                interes.delete(id);
                quitadas++;
            }
        }
    }

    if (visibles.length) {
        const limites = L.latLngBounds(visibles.map(({ marker }) => marker.getLatLng()));
        mapa.fitBounds(limites, { padding: [50, 50], maxZoom: 14 });
    }

    let texto;
    if (!distrito) {
        texto = `Mostrando ${visibles.length} ${plural(visibles.length, 'sede', 'sedes')} de todos los distritos. Elegí tu distrito electoral para filtrarlas.`;
    } else if (visibles.length) {
        texto = `Mostrando ${visibles.length} ${plural(visibles.length, 'sede', 'sedes')} en ${distrito}.`;
    } else {
        texto = `Todavía no hay sedes cargadas en ${distrito}.`;
    }
    const sinUbicar = sedesSinUbicar.filter((sede) => !distrito || sede.distrito === distrito);
    if (sinUbicar.length) {
        texto += ` No se pudo ubicar en el mapa: ${sinUbicar.map((sede) => sede.nombre).join(', ')}.`;
    }
    if (quitadas) {
        texto += ` Se quitó ${quitadas} ${plural(quitadas, 'charla', 'charlas')} de tu lista por no corresponder a ese distrito.`;
    }
    mostrarEstadoMapa(texto, false);

    renderListaInteres();
    refrescarPopups();
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

        const marcada = interes.has(charla.id);
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-interes' + (marcada ? ' activo' : '');
        boton.textContent = marcada ? 'Quitar de mis intereses' : 'Me interesa';
        boton.addEventListener('click', (e) => {
            // El popup se regenera al cambiar el estado; sin esto Leaflet interpreta
            // el click como un click sobre el mapa y cierra el popup.
            e.stopPropagation();
            alternarInteres(charla);
        });
        bloque.append(boton);

        cont.append(bloque);
    });

    return cont;
}

// Si hay un popup abierto, lo vuelve a generar para reflejar el estado actual
function refrescarPopups() {
    marcadores.forEach(({ marker }) => {
        if (marker.isPopupOpen()) marker.getPopup().update();
    });
}

// ---------- Charlas de interés ----------
function alternarInteres(charla) {
    if (interes.has(charla.id)) {
        interes.delete(charla.id);
    } else {
        interes.set(charla.id, charla);
        nuevoId = charla.id;
    }
    renderListaInteres();
    refrescarPopups();
}

function renderListaInteres() {
    const charlas = [...interes.values()]
        .sort((a, b) => (a.fecha + a.horario).localeCompare(b.fecha + b.horario));

    listaInteres.replaceChildren(...charlas.map(crearItemInteres));

    const hay = charlas.length > 0;
    interesVacio.classList.toggle('oculto', hay);
    cajaInteres.classList.toggle('vacia', !hay);
    contadorInteres.textContent = hay
        ? `· ${charlas.length} ${plural(charlas.length, 'seleccionada', 'seleccionadas')}`
        : '';
    nuevoId = null;
}

function crearItemInteres(charla) {
    const li = document.createElement('li');
    li.className = 'interes-item' + (charla.id === nuevoId ? ' nuevo' : '');

    const datos = document.createElement('div');
    datos.className = 'interes-datos';
    datos.append(
        crearTexto('strong', charla.nombre),
        crearTexto('span', `${formatearFecha(charla.fecha)} · ${charla.horario} hs`),
        crearTexto('span', `${charla.sede_nombre} — ${charla.sede_direccion}`)
    );

    const verMapa = document.createElement('button');
    verMapa.type = 'button';
    verMapa.className = 'btn-texto';
    verMapa.textContent = 'Ver en el mapa';
    verMapa.addEventListener('click', () => verEnMapa(charla));

    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'btn-texto quitar';
    quitar.textContent = 'Quitar';
    quitar.setAttribute('aria-label', `Quitar ${charla.nombre} de mis charlas de interés`);
    quitar.addEventListener('click', () => alternarInteres(charla));

    const acciones = document.createElement('div');
    acciones.className = 'interes-acciones';
    acciones.append(verMapa, quitar);

    li.append(datos, acciones);
    return li;
}

function verEnMapa(charla) {
    const entrada = marcadores.find(({ sede }) => sede.charlas.some((c) => c.id === charla.id));
    if (!entrada) return;

    if (esMovil()) {
        panelMapa.scrollIntoView({ behavior: comportamientoScroll(), block: 'start' });
    }
    mapa.setView(entrada.marker.getLatLng(), Math.max(mapa.getZoom(), 15));
    entrada.marker.openPopup();
}

// ---------- Utilidades ----------
function crearTexto(etiqueta, texto) {
    const el = document.createElement(etiqueta);
    el.textContent = texto;
    return el;
}

function plural(n, singular, pluralTexto) {
    return n === 1 ? singular : pluralTexto;
}

function formatearFecha(iso) {
    const fecha = new Date(`${iso}T00:00:00`);
    return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function mostrarEstadoMapa(texto, esError) {
    mapaEstado.textContent = texto;
    mapaEstado.classList.toggle('con-error', esError);
}

function mostrarAlerta(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('oculto');
    elemento.scrollIntoView({ block: 'nearest', behavior: comportamientoScroll() });
}

function ocultarAlertas() {
    msgError.classList.add('oculto');
    msgExito.classList.add('oculto');
}

// ---------- Inicio ----------
document.addEventListener('DOMContentLoaded', () => {
    iniciarMapa();
    renderListaInteres();
    cargarCharlas();
});