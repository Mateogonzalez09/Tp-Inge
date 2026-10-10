import { iniciarFormulario } from './formulario.js';
import { crearModuloCharlasYMapa } from './charlas-mapa.js';

const charlasYMapa = crearModuloCharlasYMapa();

iniciarFormulario({
    obtenerCharlasSeleccionadas: charlasYMapa.obtenerCharlasSeleccionadas,
    limpiarCharlasSeleccionadas: charlasYMapa.limpiarCharlasSeleccionadas,
    aplicarFiltroDistrito: charlasYMapa.aplicarFiltroDistrito,
    aplicarFiltroVistaPrincipal: charlasYMapa.aplicarFiltroVistaPrincipal
});

charlasYMapa.iniciar();
