const form = document.getElementById('form-postulante');
const checkAfiliado = document.getElementById('es_afiliado');
const inputPartido = document.getElementById('partido_afiliado');
const msgError = document.getElementById('mensaje-error');
const msgExito = document.getElementById('mensaje-exito');

checkAfiliado.addEventListener('change', (e) => {
    if (e.target.checked) {
        inputPartido.classList.remove('oculto');
        inputPartido.required = true;
    } else {
        inputPartido.classList.add('oculto');
        inputPartido.required = false;
        inputPartido.value = '';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarAlertas();

    const checkboxesCharlas = document.querySelectorAll('.checkbox-charla:checked');
    const charlasSeleccionadas = Array.from(checkboxesCharlas).map(cb => parseInt(cb.value, 10));

    const payload = {
        dni: document.getElementById('dni').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        fechaNacimiento: document.getElementById('fecha_nacimiento').value,
        email: document.getElementById('correo').value.trim(), 
        telefono: parseInt(document.getElementById('telefono').value.trim(), 10),
        direccion: document.getElementById('direccion').value.trim(),
        distritoElectoral: document.getElementById('distrito').value,
        autoridadDeMesa: document.getElementById('fue_autoridad').checked ? 1 : 0, 
        capacitacion: document.getElementById('hizo_capacitacion').checked ? 1 : 0, 
        nombrePartido: inputPartido.value.trim(),
        charlasSeleccionadas: charlasSeleccionadas
    };

    if (isNaN(payload.telefono)) {
        mostrarAlerta(msgError, "El teléfono debe ser un valor numérico válido.");
        return;
    }

    await registrarPostulante(payload);
});

async function registrarPostulante(datos) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/postulantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Ocurrió un error al procesar el registro.');
        }

        mostrarAlerta(msgExito, "Inscripción registrada correctamente.");
        form.reset();
        inputPartido.classList.add('oculto');
    } catch (error) {
        mostrarAlerta(msgError, error.message);
    }
}

async function cargarCharlas() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/charlas');
        if (!response.ok) throw new Error('No se pudo establecer conexión con el servicio de charlas.');
        
        const charlas = await response.json();
        renderizarMapaYCharlas(charlas);
    } catch (error) {
        mostrarAlerta(msgError, "Aviso: No se pudieron cargar las charlas ni el mapa.");
    }
}

// Renderizado de UI
function renderizarMapaYCharlas(charlas) {
    const displaySede = document.getElementById('sede-seleccionada-display');
    const contenedorCharlasForm = document.getElementById('contenedor-charlas-form');
    
    if(contenedorCharlasForm) {
        contenedorCharlasForm.innerHTML = '<legend>Charlas de interés (Opcional)</legend>'; 
    }

    const mapa = L.map('mapa').setView([-34.6037, -58.3816], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

    charlas.forEach(charla => {
        // Armamos el checkbox inyectando data-sede
        if(contenedorCharlasForm) {
            const labelForm = document.createElement('label');
            labelForm.innerHTML = `<input type="checkbox" class="checkbox-charla" value="${charla.id}" data-sede="${charla.sede_nombre}"> ${charla.nombre} (${charla.fecha})`;
            contenedorCharlasForm.appendChild(labelForm);
        }

        // Renderizado del pin en el mapa
        if (charla.coordenadas && charla.coordenadas.lat && charla.coordenadas.lng) {
            L.marker([charla.coordenadas.lat, charla.coordenadas.lng])
                .addTo(mapa)
                .bindPopup(`<b>${charla.sede_nombre}</b><br>${charla.sede_direccion}`);
        }
    });

    // Delegación de eventos: escuchamos cambios en los checkboxes
    if(contenedorCharlasForm) {
        contenedorCharlasForm.addEventListener('change', (e) => {
            if (e.target.classList.contains('checkbox-charla')) {
                const checked = document.querySelectorAll('.checkbox-charla:checked');
                if (checked.length > 0) {
                    // Extraemos los atributos data-sede de todos los checkboxes tildados
                    const sedes = Array.from(checked).map(cb => cb.getAttribute('data-sede'));
                    displaySede.textContent = "Sedes seleccionadas: " + sedes.join(", ");
                } else {
                    displaySede.textContent = ""; // Limpiamos si desmarcan todo
                }
            }
        });
    }
}

// Utilidades UI
function mostrarAlerta(elemento, mensaje) {
    elemento.textContent = mensaje;
    elemento.classList.remove('oculto');
}

function ocultarAlertas() {
    msgError.classList.add('oculto');
    msgExito.classList.add('oculto');
}

// Disparador de carga inicial
document.addEventListener('DOMContentLoaded', cargarCharlas);