/* ==========================================
    1. VARIABLES GLOBALES Y ESTADO
   ========================================== */
let ligaEquipos = [];
let plantillaOriginal = [];
let listaPartidos = []; 

/* ==========================================
    2. CARGA DE DATOS (FETCH JSON + LOCALSTORAGE)
   ========================================== */
async function cargarDatosLiga() {
    try {
        // 1. Cargamos equipos primero (necesarios para los partidos)
        const resEquipos = await fetch('./js/equipos.json');
        if (!resEquipos.ok) throw new Error("Error en equipos.json");
        ligaEquipos = await resEquipos.json();

        // 2. Cargamos el archivo partidos.json o LocalStorage
        const resPartidos = await fetch('./js/partidos.json');
        if (!resPartidos.ok) throw new Error("Error en partidos.json");

        let datosPartidos;
        const guardados = localStorage.getItem("datosPartidos");

        if (guardados) {
            datosPartidos = JSON.parse(guardados);
        } else {
            datosPartidos = await resPartidos.json();
        }

        // 3. Transformamos los IDs del JSON en referencias a los objetos equipo
        listaPartidos = datosPartidos.map(p => {
            return {
                id: p.id,
                local: ligaEquipos.find(e => e.id === p.idLocal),
                visitante: ligaEquipos.find(e => e.id === p.idVisitante),
                golesL: p.golesL,
                golesV: p.golesV,
                jugado: p.jugado
            };
        });

        // 4. Una vez todo cargado, inicializamos la interfaz
        inicializarPagina();
    } catch (error) {
        console.error("Error crítico:", error);
    }
}

/* ==========================================
    3. LÓGICA DE JUGADORES Y ESTRELLAS
   ========================================== */

function generarEstrellas(valor) {
    const estrellasLlenas = Math.round(valor / 20);
    let htmlEstrellas = "";
    for (let i = 1; i <= 5; i++) {
        htmlEstrellas += i <= estrellasLlenas 
            ? '<i class="bi bi-star-fill text-warning me-1"></i>' 
            : '<i class="bi bi-star text-muted me-1"></i>';
    }
    return htmlEstrellas;
}

function abrirFicha(jsonJugador) {
    const j = JSON.parse(jsonJugador);
    const cuerpo = document.getElementById('cuerpoModal');
    document.getElementById('tituloModal').innerText = `Ficha Técnica: ${j.nombre} ${j.apellido}`;

    cuerpo.innerHTML = `
        <div class="row text-start mb-4">
            <div class="col-6"><label class="small text-muted d-block">Edad</label><span class="fw-bold">${j.edad} años</span></div>
            <div class="col-6"><label class="small text-muted d-block">Pie Hábil</label><span class="fw-bold">${j.pie}</span></div>
        </div>
        <div class="list-group list-group-flush bg-dark">
            <div class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center border-secondary px-0">
                <span>Estado Físico</span><div>${generarEstrellas(j.estado)}</div>
            </div>
            <div class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center border-secondary px-0">
                <span>Precisión</span><div>${generarEstrellas(j.precision)}</div>
            </div>
            <div class="list-group-item bg-dark text-white d-flex justify-content-between align-items-center border-secondary px-0">
                <span>Velocidad</span><div>${generarEstrellas(j.velocidad)}</div>
            </div>
        </div>`;
    const modal = new bootstrap.Modal(document.getElementById('modalFicha'));
    modal.show();
}

/* ==========================================
    4. RENDERIZADO DE EQUIPOS Y PLANTILLA
   ========================================== */

function mostrarEquipos() {
    const contenedor = document.getElementById('contenedor-equipos');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    ligaEquipos.forEach(equipo => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0">
                <div class="card-body text-center">
                    <div class="mb-3" style="height: 100px;">
                        <img src="${equipo.logo}" alt="Logo" class="img-fluid h-100" onerror="this.src='https://via.placeholder.com/100?text=Logo'">
                    </div>
                    <h5 class="card-title fw-bold">${equipo.nombre}</h5>
                    <p class="card-text text-muted">${equipo.estadio}</p>
                    <button class="btn btn-primary w-100" onclick="verDetalle(${equipo.id})">Ver Plantel</button>
                </div>
            </div>`;
        contenedor.appendChild(col);
    });
}

function verDetalle(id) {
    window.location.href = `equipo_detalle.html?id=${id}`;
}

function renderizarTablaJugadores(jugadores) {
    const tabla = document.getElementById('tabla-plantilla');
    if (!tabla) return;
    tabla.innerHTML = "";
    jugadores.forEach(jugador => {
        // Convertimos el objeto a string para la modal [cite: 5, 7]
        const datosCifrados = JSON.stringify(jugador).replace(/"/g, '&quot;');
        tabla.innerHTML += `
            <tr>
                <td class="fw-bold text-center">#${jugador.dorsal}</td>
                <td class="text-dark">${jugador.nombre} ${jugador.apellido}</td>
                <td class="text-center"><span class="badge bg-secondary">${jugador.posicion}</span></td>
                <td class="text-center">
                    <button class="btn btn-info btn-sm text-white shadow-sm" onclick="abrirFicha('${datosCifrados}')">
                        <i class="bi bi-eye"></i> <span class="d-none d-md-inline">Ver</span>
                    </button>
                </td>
            </tr>`;
    });
}

function buscarJugador() {
    const textoBusqueda = document.getElementById('buscador-jugador').value.toLowerCase();
    const posicionSeleccionada = document.getElementById('filtro-posicion').value;
    const mensajeError = document.getElementById('mensaje-error');

    const filtrados = plantillaOriginal.filter(j => {
        const nombreCompleto = `${j.nombre} ${j.apellido}`.toLowerCase();
        const coincideNombre = nombreCompleto.includes(textoBusqueda);
        const coincidePosicion = (posicionSeleccionada === "TODOS" || j.posicion === posicionSeleccionada);
        return coincideNombre && coincidePosicion;
    });

    if (mensajeError) {
        filtrados.length === 0 ? mensajeError.classList.remove('d-none') : mensajeError.classList.add('d-none');
    }
    renderizarTablaJugadores(filtrados);
}

function cargarDatosDeSubpagina() {
    const params = new URLSearchParams(window.location.search);
    const idCapturado = parseInt(params.get('id'));
    const equipo = ligaEquipos.find(e => e.id === idCapturado);

    if (equipo) {
        document.getElementById('nombre-equipo').textContent = equipo.nombre;
        document.getElementById('estadio-equipo').innerHTML = `<i class="bi bi-geo-alt"></i> Estadio: ${equipo.estadio}`;
        document.getElementById('historia-texto').textContent = equipo.historia;

        const banner = document.getElementById('info-club');
        const escudoContenedor = document.getElementById('escudo-detalle');

        if (banner) banner.style.backgroundColor = equipo.color;
        if (escudoContenedor) {
            escudoContenedor.innerHTML = `<img src="${equipo.logo}" class="img-fluid" style="max-height: 120px;" onerror="this.remove()">`;
        }

        plantillaOriginal = [...equipo.plantilla].sort((a, b) => a.dorsal - b.dorsal);
        renderizarTablaJugadores(plantillaOriginal);
    }
}

/* ==========================================
    5. POSICIONES, FIXTURE Y ADMIN
   ========================================== */

function actualizarEstadisticas() {
    ligaEquipos.forEach(e => {
        // Inicializamos los valores para el cálculo
        e.pj = 0; e.pg = 0; e.pe = 0; e.pp = 0; e.gf = 0; e.gc = 0; e.pts = 0;
    });

    listaPartidos.filter(p => p.jugado).forEach(p => {
        p.local.pj++; p.visitante.pj++;
        p.local.gf += p.golesL; p.local.gc += p.golesV;
        p.visitante.gf += p.golesV; p.visitante.gc += p.golesL;

        if (p.golesL > p.golesV) { p.local.pg++; p.local.pts += 3; p.visitante.pp++; }
        else if (p.golesL < p.golesV) { p.visitante.pg++; p.visitante.pts += 3; p.local.pp++; }
        else { p.local.pe++; p.visitante.pe++; p.local.pts += 1; p.visitante.pts += 1; }
    });
}


function mostrarTablaPosiciones() {
    const tbody = document.getElementById('tabla-body');
    if (!tbody) return;
    actualizarEstadisticas();
    
    const equiposOrdenados = [...ligaEquipos].sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));
    tbody.innerHTML = "";
    
    equiposOrdenados.forEach((e, index) => {
        const dif = e.gf - e.gc;
        tbody.innerHTML += `
            <tr>
                <th scope="row">${index + 1}</th>
                <td class="fw-bold">${e.nombre}</td>
                <td>${e.pj}</td>
                <td>${e.pg}</td>
                <td>${e.pe}</td>
                <td>${e.pp}</td>
                <td class="d-none d-md-table-cell">${e.gf}</td>
                <td class="d-none d-md-table-cell">${e.gc}</td>
                <td>${dif > 0 ? '+' + dif : dif}</td>
                <td class="text-warning fw-bold">${e.pts}</td>
            </tr>`;
    });
}

function mostrarFixture() {
    const contenedor = document.getElementById('lista-resultados');
    if (!contenedor) return;
    contenedor.innerHTML = "";
    const jugados = listaPartidos.filter(p => p.jugado);
    if (jugados.length === 0) {
        contenedor.innerHTML = "<tr><td colspan='3' class='text-center'>No hay resultados cargados</td></tr>";
        return;
    }
    jugados.forEach(p => {
        contenedor.innerHTML += `
            <tr>
                <td class="text-end">${p.local.nombre}</td>
                <td class="px-2 text-center"><span class="badge bg-white text-dark border">${p.golesL}-${p.golesV}</span></td>
                <td class="text-start">${p.visitante.nombre}</td>
            </tr>`;
    });
}

function mostrarPendientesAdmin() {
    const panel = document.getElementById('admin-panel');
    const lista = document.getElementById('lista-pendientes');
    const isAdmin = true; // Simulación de sesión
    if (isAdmin && panel) {
        panel.classList.remove('d-none');
        const pendientes = listaPartidos.filter(p => !p.jugado);
        lista.innerHTML = pendientes.length === 0 ? "<p class='p-3'>No hay partidos pendientes</p>" : 
            pendientes.map(p => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${p.local.nombre} vs ${p.visitante.nombre}</span>
                <button class="btn btn-sm btn-primary" onclick="cargarResultado(${p.id})">Cargar</button>
            </div>
        `).join('');
    }
}

function cargarResultado(idPartido) {
    const gL = parseInt(prompt("Goles Local:"));
    const gV = parseInt(prompt("Goles Visitante:"));
    const partido = listaPartidos.find(p => p.id === idPartido);

    if (partido && !isNaN(gL) && !isNaN(gV)) {
        partido.golesL = gL;
        partido.golesV = gV;
        partido.jugado = true;

        // Persistencia en LocalStorage
        const partidosParaGuardar = listaPartidos.map(p => ({
            id: p.id,
            idLocal: p.local.id,
            idVisitante: p.visitante.id,
            golesL: p.golesL,
            golesV: p.golesV,
            jugado: p.jugado
        }));
        localStorage.setItem("datosPartidos", JSON.stringify(partidosParaGuardar));

        // Actualizamos las vistas
        mostrarTablaPosiciones();
        mostrarFixture();
        mostrarPendientesAdmin();
    }
}

/* ==========================================
    6. INICIALIZADOR SEGÚN PÁGINA
   ========================================== */
function inicializarPagina() {
    if (document.getElementById('contenedor-equipos')) mostrarEquipos();
    if (document.getElementById('nombre-equipo')) cargarDatosDeSubpagina();
    if (document.getElementById('formLogin')) inicializarLogin();
    
    // Para la página de la Liga
    if (document.getElementById('tabla-body')) {
        mostrarTablaPosiciones();
        mostrarFixture();
        mostrarPendientesAdmin();
    }
}

document.addEventListener('DOMContentLoaded', cargarDatosLiga);