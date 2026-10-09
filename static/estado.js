// Estado compartido entre módulos. Se modifica en el lugar (no se reasigna el objeto).
export const estado = {
    charlas: [],            // todas las charlas que devolvió la API
    interes: new Map(),     // id de charla -> charla marcada con "Me interesa"
    nuevoId: null,          // última charla agregada (para resaltarla en la lista)
    sedesCargadas: false,   // evita aplicar filtros antes de tener datos
};
