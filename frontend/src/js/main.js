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

        // 2. Cargamos el archivo partidos.json
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
    6. CONTROL DE LOGIN
   ========================================== */

function Login() {
    const formLogin = document.getElementById('formLogin');
    if (!formLogin) return;

    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const errorEmail = document.getElementById('errorEmail');
    const errorPass = document.getElementById('errorPass');

    // Lista de extensiones permitidas en América del Sur
    const extensionesLatam = [".com", ".ar", ".cl", ".co", ".pe", ".uy", ".br", ".ve", ".ec", ".bo", ".py"];

    email.addEventListener('input', () => {
        let textoEmail = email.value.trim();
        let esExtensionValida = false;

        for (let i = 0; i < extensionesLatam.length; i++) {
            if (textoEmail.toLowerCase().endsWith(extensionesLatam[i])) {
                esExtensionValida = true;
            }
        }

        if (textoEmail === "") {
            email.classList.add('border-danger');
            email.classList.remove('border-success');
            errorEmail.textContent = "El correo electrónico es obligatorio.";
            errorEmail.classList.remove('d-none');
        } else if (!textoEmail.includes("@")) {
            email.classList.add('border-danger');
            email.classList.remove('border-success');
            errorEmail.textContent = "El correo debe contener un símbolo '@'.";
            errorEmail.classList.remove('d-none');
        } else if (esExtensionValida === false) {
            email.classList.add('border-danger');
            email.classList.remove('border-success');
            errorEmail.textContent = "Extensión no válida (Permitidos: .com o países de América del Sur).";
            errorEmail.classList.remove('d-none');
        } else {
            email.classList.remove('border-danger');
            email.classList.add('border-success');
            errorEmail.classList.add('d-none');
        }
    });

    pass.addEventListener('input', () => {
        if (pass.value === "") {
            pass.classList.add('border-danger');
            pass.classList.remove('border-success');
            errorPass.classList.remove('d-none');
        } else {
            pass.classList.remove('border-danger');
            pass.classList.add('border-success');
            errorPass.classList.add('d-none');
        }
    });

    // Al enviar el formulario
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Forzamos a que se ejecuten las comprobaciones visuales
        email.dispatchEvent(new Event('input'));
        pass.dispatchEvent(new Event('input'));

        if (formLogin.checkValidity() && email.classList.contains('border-success') && pass.classList.contains('border-success')) {
            alert(`¡Bienvenido! Iniciando sesión para: ${email.value}`);
            window.location.href = 'posiciones.html';
        }
    });
}

/* ==========================================
    6B. REGISTRO DE NUEVO USUARIO Y EQUIPO
   ========================================== */
function Registro() {
    const formRegistro = document.getElementById('formRegistro');
    if (!formRegistro) return;

    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regNombreEquipo = document.getElementById('regNombreEquipo');
    const regEstadio = document.getElementById('regEstadio');

    const errorRegEmail = document.getElementById('errorRegEmail');
    const errorRegPass = document.getElementById('errorRegPass');
    const errorRegNombreEquipo = document.getElementById('errorRegNombreEquipo');
    const errorRegEstadio = document.getElementById('errorRegEstadio');

    const extensionesLatam = [".com", ".ar", ".cl", ".co", ".pe", ".uy", ".br", ".ve", ".ec", ".bo", ".py"];

    regEmail.addEventListener('input', () => {
        let textoEmail = regEmail.value;
        let esExtensionValida = false;

        for (let i = 0; i < extensionesLatam.length; i++) {
            if (textoEmail.toLowerCase().endsWith(extensionesLatam[i])) {
                esExtensionValida = true;
            }
        }

        if (textoEmail === "") {
            regEmail.classList.add('border-danger');
            regEmail.classList.remove('border-success');
            errorRegEmail.textContent = "El correo electrónico es obligatorio.";
            errorRegEmail.classList.remove('d-none');
        } else if (!textoEmail.includes("@")) {
            regEmail.classList.add('border-danger');
            regEmail.classList.remove('border-success');
            errorRegEmail.textContent = "El correo debe contener un símbolo '@'.";
            errorRegEmail.classList.remove('d-none');
        } else if (esExtensionValida === false) {
            regEmail.classList.add('border-danger');
            regEmail.classList.remove('border-success');
            errorRegEmail.textContent = "Usa una extensión válida (.com o países de América del Sur).";
            errorRegEmail.classList.remove('d-none');
        } else {
            regEmail.classList.remove('border-danger');
            regEmail.classList.add('border-success');
            errorRegEmail.classList.add('d-none');
        }
    });

    regPassword.addEventListener('input', () => {
        if (regPassword.value === "") {
            regPassword.classList.add('border-danger');
            regPassword.classList.remove('border-success');
            errorRegPass.textContent = "La contraseña es obligatoria.";
            errorRegPass.classList.remove('d-none');
        } else if (regPassword.value.length < 6) {
            regPassword.classList.add('border-danger');
            regPassword.classList.remove('border-success');
            errorRegPass.textContent = "La contraseña debe tener al menos 6 caracteres.";
            errorRegPass.classList.remove('d-none');
        } else {
            regPassword.classList.remove('border-danger');
            regPassword.classList.add('border-success');
            errorRegPass.classList.add('d-none');
        }
    });

    regNombreEquipo.addEventListener('input', () => {
        if (regNombreEquipo.value === "") {
            regNombreEquipo.classList.add('border-danger');
            regNombreEquipo.classList.remove('border-success');
            errorRegNombreEquipo.textContent = "El nombre del equipo es obligatorio.";
            errorRegNombreEquipo.classList.remove('d-none');
        } else {
            regNombreEquipo.classList.remove('border-danger');
            regNombreEquipo.classList.add('border-success');
            errorRegNombreEquipo.classList.add('d-none');
        }
    });

    regEstadio.addEventListener('input', () => {
        if (regEstadio.value === "") {
            regEstadio.classList.add('border-danger');
            regEstadio.classList.remove('border-success');
            errorRegEstadio.textContent = "El nombre del estadio es obligatorio.";
            errorRegEstadio.classList.remove('d-none');
        } else {
            regEstadio.classList.remove('border-danger');
            regEstadio.classList.add('border-success');
            errorRegEstadio.classList.add('d-none');
        }
    });

    // Al enviar el formulario de registro
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();

        // Forzamos a evaluar visualmente todos los campos
        regEmail.dispatchEvent(new Event('input'));
        regPassword.dispatchEvent(new Event('input'));
        regNombreEquipo.dispatchEvent(new Event('input'));
        regEstadio.dispatchEvent(new Event('input'));

        // Buscamos si quedó algún campo marcado con error
        const erroresActivos = formRegistro.querySelectorAll('.border-danger');

        if (formRegistro.checkValidity() && erroresActivos.length === 0) {
            alert(`¡Registro exitoso! El club "${regNombreEquipo.value}" ha sido dado de alta.`);
            window.location.href = 'equipos.html';
        }
    });
}

/* ==========================================
    7. INICIALIZADOR SEGÚN PÁGINA
   ========================================== */
function inicializarPagina() {
    if (document.getElementById('contenedor-equipos')) mostrarEquipos();
    if (document.getElementById('nombre-equipo')) cargarDatosDeSubpagina();
    if (document.getElementById('formLogin')) Login();
    if (document.getElementById('formRegistro')) Registro();

    // Para la página de la Liga
    if (document.getElementById('tabla-body')) {
        mostrarTablaPosiciones();
        mostrarFixture();
        mostrarPendientesAdmin();
    }
}

document.addEventListener('DOMContentLoaded', cargarDatosLiga);