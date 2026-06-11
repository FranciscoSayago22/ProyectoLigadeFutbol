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
        // 1. Cargamos equipos
        const resEquipos = await fetch('./js/equipos.json');
        if (!resEquipos.ok) throw new Error("Error en equipos.json");
        ligaEquipos = await resEquipos.json();

        // 2. Cargamos partidos
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

        // 4. Inicializamos la interfaz
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
        // Cada 20 stats te da una estrella
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
    //Cargo Modal
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
    //Cargo Cards Equipos
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
    //Ver plantel
    window.location.href = `equipo_detalle.html?id=${id}`;
}

function renderizarTablaJugadores(jugadores) {
    const tabla = document.getElementById('tabla-plantilla');
    if (!tabla) return;
    tabla.innerHTML = "";
    jugadores.forEach(jugador => {
        // Convertimos el objeto a string para mostrar en formato table
        const datosCifrados = JSON.stringify(jugador).replace(/"/g, '&quot;');
        tabla.innerHTML += `
            <tr>
                <td class="bg-dark text-white fw-bold text-center ">#${jugador.dorsal}</td>
                <td class="bg-dark text-white">${jugador.nombre} ${jugador.apellido}</td>
                <td class="bg-dark text-white text-center"><span class="badge bg-secondary">${jugador.posicion}</span></td>
                <td class="bg-dark text-white text-center">
                    <button class="btn btn-primary btn-sm text-white shadow-sm" onclick="abrirFicha('${datosCifrados}')">
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
    //Pagina que se abre cuando veo el plantel
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
    //Mostramos la tabla que se actualiza cuando cargo partidos
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
    //Resultados tabla
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
                <td class="color-liga fw-bold text-center">${e.pts}</td>
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
                <td class="text-white">${p.local.nombre}</td>
                <td class="px-2 "><span class="badge bg-white text-dark ">${p.golesL}-${p.golesV}</span></td>
                <td class="text-white">${p.visitante.nombre}</td>
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
            <div class="list-group-item d-flex justify-content-between bg-dark align-items-center">
                <span class="text-white">${p.local.nombre} vs ${p.visitante.nombre}</span>
                <button class="btn p-1 text-warning text-decoration-none" onclick="cargarResultado(${p.id})">Cargar</button>
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

    if (formRegistro) {
        const regRol = document.getElementById('regRol');
        const camposManager = document.getElementById('camposManager');
        const inputsManager = document.querySelectorAll('.manager-input');
        const todosLosInputs = formRegistro.querySelectorAll('input, select, textarea');


        regRol.addEventListener('change', (e) => {
            if (e.target.value === 'manager') {
                camposManager.classList.remove('d-none');
                // Hacemos obligatorios los campos de manager
                inputsManager.forEach(input => input.setAttribute('required', 'true'));
            } else {
                camposManager.classList.add('d-none');
                // Quitamos la obligación y limpiamos errores si cambia a jugador
                inputsManager.forEach(input => {
                    input.removeAttribute('required');
                    input.value = '';
                    limpiarError(input);
                });
            }
        });

        function mostrarError(input, mensaje) {
            input.classList.add('border-danger', 'border-2', 'bg-danger', 'bg-opacity-10');
            let errorDiv = input.nextElementSibling;

            // Si no existe el div de error, lo creamos e insertamos en el DOM
            if (!errorDiv || !errorDiv.classList.contains('dynamic-error')) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'text-danger small mt-1 dynamic-error fw-bold';
                input.parentNode.insertBefore(errorDiv, input.nextSibling);
            }
            errorDiv.textContent = mensaje;
        }

        function limpiarError(input) {
            input.classList.remove('border-danger', 'border-2');
            let errorDiv = input.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('dynamic-error')) {
                errorDiv.remove(); // Eliminamos el elemento del DOM
            }
        }

       // 3. Validaciones en tiempo real (Evento INPUT) sin Regex
    todosLosInputs.forEach(input => {
        input.addEventListener('input', () => {
            let valor = input.value.trim();

            // 1. Validación genérica de vacíos
            if (input.hasAttribute('required') && valor === '') {
                mostrarError(input, 'Este campo es obligatorio.');
            } 
            // 2. NUEVO: Validación de Nombre y Apellido (Min 3 letras y sin números)
            else if (input.id === 'regNombre' || input.id === 'regApellido') {
                // Creamos un array con los números del 0 al 9 para no usar Regex
                const numeros = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                let contieneNumeros = false;
                
                // Recorremos el string buscando si incluye algún número del array
                for (let i = 0; i < numeros.length; i++) {
                    if (valor.includes(numeros[i])) {
                        contieneNumeros = true;
                        break; // Detenemos el ciclo si ya encontramos un número
                    }
                }

                // Evaluamos las dos nuevas reglas
                if (valor.length < 3) {
                    mostrarError(input, 'Debe tener al menos 3 caracteres.');
                } else if (contieneNumeros) {
                    mostrarError(input, 'El nombre/apellido no puede contener números.');
                } else {
                    limpiarError(input); // Pasa la prueba
                }
            } 
            // 3. Validacion DNI
            else if (input.id === 'regDni' && (valor.length < 7 || valor.length > 8)) {
                mostrarError(input, 'El DNI debe tener 7 u 8 números.');
            }
            // 4. Validación específica de Email 
            else if (input.id === 'regEmail' && (!valor.includes('@') || !valor.includes('.'))) {
                mostrarError(input, 'Ingresa un correo válido (debe contener "@" y un dominio).');
            } 
            else {
                limpiarError(input);
            }
        });
    });
        // 4. Envío del formulario
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitamos que la página se recargue

            let formularioValido = true;

            // Forzamos el evento input en todos los campos requeridos para mostrar errores si el usuario intentó enviar vacío
            todosLosInputs.forEach(input => {
                if (input.hasAttribute('required')) {
                    input.dispatchEvent(new Event('input'));
                    if (input.classList.contains('border-danger')) {
                        formularioValido = false;
                    }
                }
            });

            // Verificación nativa final con .checkValidity()
            if (formularioValido && formRegistro.checkValidity()) {


                // Alerta de éxito y limpieza
                alert('¡La solicitud fue registrada exitosamente! la organización de la Liga se pondra en contacto por correo electronico.');
                formRegistro.reset();

                // Limpiar errores residuales
                todosLosInputs.forEach(input => limpiarError(input));
            }
        });
    }
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