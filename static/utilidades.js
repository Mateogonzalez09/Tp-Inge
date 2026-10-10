export const API = 'http://127.0.0.1:5000/api';

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

export function mostrarAlerta(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('oculto');
    elemento.scrollIntoView({ block: 'nearest', behavior: comportamientoScroll() });
}
