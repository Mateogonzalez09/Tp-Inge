// Funciones chicas y sin estado que usan varios módulos.

export const esMovil = () => window.matchMedia('(max-width: 900px)').matches;

export const comportamientoScroll = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export function crearTexto(etiqueta, texto) {
    const el = document.createElement(etiqueta);
    el.textContent = texto;
    return el;
}

export function plural(n, singular, pluralTexto) {
    return n === 1 ? singular : pluralTexto;
}

export function formatearFecha(iso) {
    const fecha = new Date(`${iso}T00:00:00`);
    return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Sin distrito elegido se muestran todas.
export function charlasDelDistrito(charlas, distrito) {
    return charlas.filter((charla) => !distrito || charla.distrito === distrito);
}

export function porFechaYHorario(a, b) {
    return (a.fecha + a.horario).localeCompare(b.fecha + b.horario);
}

// Nombre, fecha y sede de una charla: lo comparten la lista principal y el cuadro de intereses.
export function crearDatosCharla(charla) {
    const datos = document.createElement('div');
    datos.className = 'interes-datos';
    datos.append(
        crearTexto('strong', charla.nombre),
        crearTexto('span', `${formatearFecha(charla.fecha)} · ${charla.horario} hs`),
        crearTexto('span', `${charla.sede_nombre} — ${charla.sede_direccion}`)
    );
    return datos;
}
