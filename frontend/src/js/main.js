

/* CLASES BASE (POO) */
class Persona {
    constructor(nombre, apellido) {
        this.nombre = nombre;
        this.apellido = apellido;
    }
}

/*Clase Jugador (Hereda de Persona)*/
class Jugador extends Persona {
    constructor(nombre, apellido, posicion, dorsal) {
        super(nombre, apellido);
        this.posicion = posicion;
        this.dorsal = dorsal;
    }
}

/* Clase Equipo */
class Equipo {
    constructor(id, nombre, historia, estadio, color, logo) {
        this.id = id;
        this.nombre = nombre;
        this.historia = historia;
        this.estadio = estadio;
        this.color = color;
        this.logo = logo;
        this.plantilla = []; // Arreglo interno de objetos Jugador 
    }

    agregarJugador(jugador) {
        this.plantilla.push(jugador);
    }
}

/* 1. INSTANCIACIÓN DE DATOS (Objetos de la Liga)  */
const equipo1 = new Equipo(1, "Titanes FC", "Fundado en 2020 para dominar el juego online.", "Arena Virtual", "#ff0000", "img/logo1.png");
const equipo2 = new Equipo(2, "Spartans United", "Un equipo basado en la defensa táctica.", "Coliseo Digital", "#0000ff", "img/logo2.png");
const equipo3 = new Equipo(3, "Gamer Pro XI", "Club internacional con los mejores asistidores.", "Estadio E-Sports", "#28a745", "img/logo3.png");
const equipo4 = new Equipo(4, "Cyber Warriors", "Fundado en 2020 para dominar el juego online.", "Arena Virtual", "#9500cf", "img/logo1.png");

// Jugadores de ejemplo a los equipos
equipo1.agregarJugador(new Jugador("Francisco", "Sayago", "DL", 9));
equipo1.agregarJugador(new Jugador("Martin", "Pérez", "PO", 1));
equipo1.agregarJugador(new Jugador("Luis", "García", "MC", 10));

equipo2.agregarJugador(new Jugador("Juan", "Spartan", "DF", 4));
equipo2.agregarJugador(new Jugador("Marcos", "Duro", "DF", 2));

equipo3.agregarJugador(new Jugador("Lucas", "Skill", "MC", 8));
equipo3.agregarJugador(new Jugador("Enzo", "Gamer", "DL", 11));

equipo4.agregarJugador(new Jugador("Carlos", "Cyber", "DF", 5));
equipo4.agregarJugador(new Jugador("Diego", "Warrior", "MC", 7));

// Arreglo Global que contiene los objetos Equipo 
const ligaEquipos = [equipo1, equipo2, equipo3, equipo4];

/*  2. LÓGICA DE NAVEGACIÓN Y CARGA DE INTERFAZ */

// Redirige pasando el ID por parámetro en la URL 
function verDetalle(id) {
    window.location.href = `equipo_detalle.html?id=${id}`;
}

/* Renderiza la grilla de equipos (Uso en equipos.html) */
function mostrarEquipos() {
    const contenedor = document.getElementById('contenedor-equipos');
    if (!contenedor) return;

    contenedor.innerHTML = ""; // Limpiamos contenido previo 
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
                    <button class="btn btn-primary w-100" onclick="verDetalle(${equipo.id})">
                        Ver Plantilla
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

/*Carga los datos dinámicos en la sub-página (Uso en equipo_detalle.html) */
function cargarDatosDeSubpagina() {
    const params = new URLSearchParams(window.location.search);
    const idCapturado = parseInt(params.get('id')); // Captura ID de URL 

    const equipo = ligaEquipos.find(e => e.id === idCapturado);

    if (equipo) {
        // Manipulación del DOM 
        document.getElementById('nombre-equipo').textContent = equipo.nombre;
        document.getElementById('estadio-equipo').innerHTML = `<i class="bi bi-geo-alt"></i> Estadio: ${equipo.estadio}`;
        document.getElementById('historia-texto').textContent = equipo.historia;
        
        const banner = document.getElementById('info-club');
        if(banner) banner.style.backgroundColor = equipo.color; // Aplicamos color corporativo 

        // Renderizado de tabla de jugadores 
        const tabla = document.getElementById('tabla-plantilla');
        if (tabla) {
            tabla.innerHTML = ""; 
            equipo.plantilla.forEach(jugador => {
                const fila = `
                    <tr>
                        <td class="fw-bold">#${jugador.dorsal}</td>
                        <td>${jugador.nombre} ${jugador.apellido}</td>
                        <td><span class="badge bg-secondary">${jugador.posicion}</span></td>
                        <td><button class="btn btn-sm btn-info text-white">Estadísticas</button></td>
                    </tr>`;
                tabla.innerHTML += fila;
            });
        }
    }
}

/* 3. LÓGICA DE VALIDACIÓN (Uso en login.html)  */
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

        // Validación Email y Contraseña
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

/* 4. INICIALIZADOR GLOBAL (DOM Ready) */
document.addEventListener('DOMContentLoaded', () => {
    // Detecta la página basándose en los elementos ID del HTML 
    
    if (document.getElementById('contenedor-equipos')) {
        mostrarEquipos();
    }
    
    if (document.getElementById('nombre-equipo')) {
        cargarDatosDeSubpagina();
    }
    
    if (document.getElementById('formLogin')) {
        inicializarLogin();
    }
});


/* Modificamos tu inicializador global  */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el menú siempre
    cargarNavegacion();

    // 2. Ejecutamos lógica específica de cada página como antes 
    if (document.getElementById('contenedor-equipos')) mostrarEquipos();
    if (document.getElementById('nombre-equipo')) cargarDatosDeSubpagina();
    if (document.getElementById('formLogin')) inicializarLogin();
});