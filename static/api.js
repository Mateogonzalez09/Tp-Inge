const API = 'http://127.0.0.1:5000/api';

export async function obtenerCharlas() {
    const response = await fetch(`${API}/charlas`);
    if (!response.ok) throw new Error('Respuesta inválida del servidor');
    return response.json();
}

export async function enviarPostulacion(datos) {
    const response = await fetch(`${API}/postulantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error al procesar el registro.');
    }
    return result;
}
