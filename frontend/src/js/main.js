/* ==========================================
   1. CLASES BASE (POO)
   ========================================== */
class Persona {
    constructor(nombre, apellido) {
        this.nombre = nombre;
        this.apellido = apellido;
    }
}


class Jugador extends Persona {
    constructor(nombre, apellido, posicion, dorsal, edad, estado, precision, velocidad, pie) {
        super(nombre, apellido);
        this.posicion = posicion;
        this.dorsal = dorsal;
        // Nuevas propiedades para la Ficha Técnica
        this.edad = edad;
        this.estado = estado;      // Valor de 0 a 100
        this.precision = precision; // Valor de 0 a 100
        this.velocidad = velocidad; // Valor de 0 a 100
        this.pie = pie;             // "Derecho" o "Izquierdo"
    }
}



class Equipo {
    constructor(id, nombre, historia, estadio, color, logo) {
        this.id = id;
        this.nombre = nombre;
        this.historia = historia;
        this.estadio = estadio;
        this.color = color;
        this.logo = logo;
        this.plantilla = []; 
        this.pj = 0; this.pg = 0; this.pe = 0; this.pp = 0;
        this.gf = 0; this.gc = 0; this.pts = 0;
    }
    agregarJugador(jugador) {
        this.plantilla.push(jugador);
    }
    get dif() { return this.gf - this.gc; }
}

class Partido {
    constructor(id, local, visitante, golesL = null, golesV = null) {
        this.id = id;
        this.local = local; 
        this.visitante = visitante; 
        this.golesL = golesL;
        this.golesV = golesV;
        this.jugado = (golesL !== null);
    }
}

/* ==========================================
    2. INSTANCIACIÓN DE DATOS
   ========================================== */
const equipo1 = new Equipo(1, "Titanes FC", "Dominadores del juego online desde 2020.", "Arena Virtual", "#ff0000");
const equipo2 = new Equipo(2, "Spartans United", "Especialistas en defensa táctica y contraataque.", "Coliseo Digital", "#0000ff");
const equipo3 = new Equipo(3, "Gamer Pro XI", "Club con los mejores asistidores de la región.", "Estadio E-Sports", "#28a745");


// Actualizamos la carga de jugadores con datos de ejemplo

equipo1.agregarJugador(new Jugador("Francisco", "Sayago", "DL", 9, 24, 90, 85, 95, "Derecho"));
equipo1.agregarJugador(new Jugador("Martin", "Pérez", "PO", 1, 28, 95, 70, 60, "Izquierdo"));
equipo1.agregarJugador(new Jugador("Alberto", "Zarza", "DF", 4, 26, 85, 80, 75, "Izquierdo")); 
equipo2.agregarJugador(new Jugador("Juan", "Spartan", "DF", 4, 29, 90, 75, 85, "Derecho"));
equipo3.agregarJugador(new Jugador("Enzo", "Gamer", "DL", 11, 23, 95, 90, 80, "Derecho"));

const ligaEquipos = [equipo1, equipo2, equipo3];

const listaPartidos = [
    new Partido(101, equipo1, equipo2, 2, 1), 
    new Partido(102, equipo3, equipo1, 0, 0), 
    new Partido(103, equipo2, equipo3, null, null)
];

// Variable global para manejar la plantilla del equipo que se está viendo
let plantillaOriginal = [];

/* ==========================================
   3. FUNCIONES DE LÓGICA Y RENDERIZADO
   ========================================== */

// --- POSICIONES Y FIXTURE ---
function actualizarEstadisticas() {
    ligaEquipos.forEach(e => {
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
    const equiposOrdenados = [...ligaEquipos].sort((a, b) => b.pts - a.pts || b.dif - a.dif);
    tbody.innerHTML = "";
    equiposOrdenados.forEach((e, index) => {
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
                <td>${e.dif > 0 ? '+' + e.dif : e.dif}</td>
                <td class="text-warning fw-bold">${e.pts}</td>
            </tr>`;
    });
}

function mostrarFixture() {
    const contenedorResultados = document.getElementById('lista-resultados');
    if (!contenedorResultados) return;
    contenedorResultados.innerHTML = "";
    const jugados = listaPartidos.filter(p => p.jugado);
    if (jugados.length === 0) {
        contenedorResultados.innerHTML = "<tr><td colspan='3'>No hay resultados cargados</td></tr>";
        return;
    }
    jugados.forEach(p => {
        contenedorResultados.innerHTML += `
            <tr>
                <td class="text-end">${p.local.nombre}</td>
                <td class="px-2"><span class="badge bg-white text-dark border">${p.golesL}-${p.golesV}</span></td>
                <td class="text-start">${p.visitante.nombre}</td>
            </tr>`;
    });
}

function mostrarPendientesAdmin() {
    const panel = document.getElementById('admin-panel');
    const lista = document.getElementById('lista-pendientes');
    const isAdmin = true; 
    if (isAdmin && panel) {
        panel.classList.remove('d-none');
        const pendientes = listaPartidos.filter(p => !p.jugado);
        lista.innerHTML = pendientes.map(p => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                ${p.local.nombre} vs ${p.visitante.nombre}
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
        mostrarTablaPosiciones();
        mostrarFixture();
        mostrarPendientesAdmin();
    }
}

// --- EQUIPOS CARD ---
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
                    <div class="mb-3">
                        <i class="bi bi-shield-shaded display-1" style="color: ${equipo.color}"></i>
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

// --- DETALLE DEL EQUIPO (FILTROS Y ORDEN) ---
function renderizarTablaJugadores(jugadores) {
    const tabla = document.getElementById('tabla-plantilla');
    if (!tabla) return;
    tabla.innerHTML = ""; 

    jugadores.forEach(j => {
        // Convertimos el objeto a string para pasarlo por el onclick (técnica sencilla)
        const datosCifrados = JSON.stringify(j).replace(/"/g, '&quot;');
        
        tabla.innerHTML += `
            <tr>
                <td class="fw-bold text-center">#${j.dorsal}</td>
                <td>${j.nombre} ${j.apellido}</td>
                <td class="text-center"><span class="badge bg-secondary">${j.posicion}</span></td>
                <td class="text-center">
                    <button class="btn btn-info btn-sm text-white shadow-sm" 
                            onclick="abrirFicha('${datosCifrados}')">
                        <i class="bi bi-eye"></i> Ver
                    </button>
                </td>
            </tr>`;
    });
}

function abrirFicha(jsonJugador) {
    const j = JSON.parse(jsonJugador);
    const cuerpo = document.getElementById('cuerpoModal');
    
    document.getElementById('tituloModal').innerText = `Ficha Técnica: ${j.nombre} ${j.apellido}`;

    cuerpo.innerHTML = `
        <div class="row text-start">
            <div class="col-6 mb-3">
                <label class="small text-muted d-block">Edad</label>
                <span class="fw-bold">${j.edad} años</span>
            </div>
            <div class="col-6 mb-3">
                <label class="small text-muted d-block">Pie Hábil</label>
                <span class="fw-bold">${j.pie}</span>
            </div>
        </div>

        <div class="mb-3 text-start">
            <label class="small d-flex justify-content-between">
                Estado Físico <span>${j.estado}%</span>
            </label>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: ${j.estado}%"></div>
            </div>
        </div>

        <div class="mb-3 text-start">
            <label class="small d-flex justify-content-between">
                Precisión <span>${j.precision}%</span>
            </label>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-primary" style="width: ${j.precision}%"></div>
            </div>
        </div>

        <div class="mb-3 text-start">
            <label class="small d-flex justify-content-between">
                Velocidad <span>${j.velocidad}%</span>
            </label>
            <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-warning" style="width: ${j.velocidad}%"></div>
            </div>
        </div>
    `;

    // Mostrar la modal
    const modal = new bootstrap.Modal(document.getElementById('modalFicha'));
    modal.show();
}


function buscarJugador() {
    const textoBusqueda = document.getElementById('buscador-jugador').value.toLowerCase();
    const posicionSeleccionada = document.getElementById('filtro-posicion').value;
    const mensajeError = document.getElementById('mensaje-error');
    
    // 1. Aplicamos ambos filtros al mismo tiempo
    const filtrados = plantillaOriginal.filter(jugador => {
        const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`.toLowerCase();
        
        // Coincidencia de texto
        const coincideNombre = nombreCompleto.includes(textoBusqueda);
        
        // Coincidencia de posición
        const coincidePosicion = (posicionSeleccionada === "TODOS" || jugador.posicion === posicionSeleccionada);
        
        return coincideNombre && coincidePosicion;
    });

    // 2. Lógica para mostrar/ocultar mensaje de error
    if (filtrados.length === 0) {
        mensajeError.classList.remove('d-none'); // Muestra el error
    } else {
        mensajeError.classList.add('d-none');    // Oculta el error
    }

    // 3. Renderizamos el resultado
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
        const escudo = document.getElementById('escudo-detalle');
        
        if(banner) banner.style.backgroundColor = equipo.color; 
        if(escudo) escudo.style.color = "white";

        // Ordenar por numero camiseta por defecto ---
        // Usamos sort comparando números (a - b para orden ascendente)
        plantillaOriginal = [...equipo.plantilla].sort((a, b) => a.dorsal - b.dorsal);
        
        renderizarTablaJugadores(plantillaOriginal);
    }
}

// --- LOGIN ---
function inicializarLogin() {
    const formLogin = document.getElementById('formLogin');
    if (!formLogin) return;

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email');
        const pass = document.getElementById('password');
        const errorEmail = document.getElementById('errorEmail');
        const errorPass = document.getElementById('errorPass');
        
        let esValido = true;

        if (!email.value.includes('@')) {
            email.classList.add('border-danger');
            if(errorEmail) errorEmail.classList.remove('d-none');
            esValido = false;
        } else {
            email.classList.remove('border-danger');
            if(errorEmail) errorEmail.classList.add('d-none');
        }

        if (pass.value.trim() === "") {
            pass.classList.add('border-danger');
            if(errorPass) errorPass.classList.remove('d-none');
            esValido = false;
        } else {
            pass.classList.remove('border-danger');
            if(errorPass) errorPass.classList.add('d-none');
        }

        if (esValido) {
            alert(`¡Bienvenido! Iniciando sesión para: ${email.value}`);
            window.location.href = 'index.html';
        }
    });
}


/* ==========================================
    4. INICIALIZADOR GLOBAL
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {

    //Logica para equipos.html
    if (document.getElementById('contenedor-equipos')){
        mostrarEquipos();
    } 

    //Logica para posiciones.html 
    if (document.getElementById('tabla-body')) {
        mostrarTablaPosiciones();
        mostrarFixture();
        mostrarPendientesAdmin();
    }

    // Lógica para equipo_detalle.html
    if (document.getElementById('nombre-equipo')) {
        cargarDatosDeSubpagina();
    }
    
    // Lógica para login.html
    if (document.getElementById('formLogin')) {
        inicializarLogin();
    }
});