// Punto de entrada: arranca la pantalla y conecta los módulos entre sí.
import { estado } from './estado.js';
import { obtenerCharlas } from './api.js';
import { plural } from './utilidades.js';
import { iniciarMapa, cargarSedes, mostrarSedes, mostrarEstadoMapa } from './mapa.js';
import { renderListaCharlas, mostrarErrorCharlas } from './listaCharlas.js';
import { alternarInteres, quitarInteresesFueraDe, renderListaInteres } from './intereses.js';
import { iniciarFormulario, distritoDelFormulario } from './formulario.js';

const filtroDistritoCharlas = document.getElementById('filtro-distrito-charlas');

// Filtro de la pantalla principal: lista de charlas y sedes del mapa.
function aplicarFiltroVistaPrincipal() {
    if (!estado.sedesCargadas) return;

    const distrito = filtroDistritoCharlas.value;
    renderListaCharlas(estado.charlas, distrito);
    mostrarSedes(distrito);
}

// Distrito elegido en el formulario: sedes del mapa y charlas del cuadro de intereses.
function aplicarFiltroDistritoDelFormulario() {
    if (!estado.sedesCargadas) return;

    const distrito = distritoDelFormulario();
    const quitadas = quitarInteresesFueraDe(distrito);
    const aviso = quitadas
        ? `Se quitó ${quitadas} ${plural(quitadas, 'charla', 'charlas')} de tu lista por no corresponder a ese distrito.`
        : '';

    mostrarSedes(distrito, aviso);
    renderListaInteres();
}

function alRegistrar() {
    estado.interes.clear();
    renderListaInteres();
    aplicarFiltroDistritoDelFormulario();
}

async function cargarCharlas() {
    try {
        estado.charlas = await obtenerCharlas();
        cargarSedes(estado.charlas, alternarInteres);
        estado.sedesCargadas = true;
        renderListaInteres();
        aplicarFiltroVistaPrincipal();
    } catch (error) {
        mostrarErrorCharlas();
        mostrarEstadoMapa('No se pudieron cargar las sedes. Verificá que el servidor esté en funcionamiento.', true);
    }
}

// ---------- Inicio ----------
filtroDistritoCharlas.addEventListener('change', aplicarFiltroVistaPrincipal);
iniciarFormulario({
    alElegirDistrito: aplicarFiltroDistritoDelFormulario,
    alCerrarModal: aplicarFiltroVistaPrincipal,
    alRegistrar
});

iniciarMapa();
renderListaInteres();
cargarCharlas();
