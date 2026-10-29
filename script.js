// ===== Configuración =====
const API_URL = "https://rickandmortyapi.com/api/character";
const CLAVE_FAVORITOS = "rm-favoritos"; // clave usada en localStorage
const CLAVE_TEMA = "rm-tema";

// Traducciones para mostrar los datos de la API en español
const TRADUCCIONES = {
  Alive: "Vivo",
  Dead: "Muerto",
  unknown: "Desconocido",
  Female: "Femenino",
  Male: "Masculino",
  Genderless: "Sin género",
};

// ===== Estado de la aplicación =====
const estado = {
  pagina: 1,
  totalPaginas: 1,
  totalResultados: 0,
  personajes: [], // personajes de la página actual
  vista: "todos", // "todos" o "favoritos"
  favoritos: leerFavoritos(),
};

// ===== Referencias a elementos del HTML =====
const formBusqueda = document.getElementById("formBusqueda");
const inputBuscar = document.getElementById("inputBuscar");
const filtroEstado = document.getElementById("filtroEstado");
const filtroGenero = document.getElementById("filtroGenero");
const filtroEspecie = document.getElementById("filtroEspecie");
const selectOrden = document.getElementById("ordenar");
const btnLimpiar = document.getElementById("btnLimpiar");
const mensaje = document.getElementById("mensaje");
const resumen = document.getElementById("resumen");
const lista = document.getElementById("listaPersonajes");
const plantilla = document.getElementById("plantillaTarjeta");
const paginacion = document.getElementById("paginacion");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const infoPagina = document.getElementById("infoPagina");
const contadorFav = document.getElementById("contadorFav");
const pestanas = document.querySelectorAll(".pestana");
const btnTema = document.getElementById("btnTema");

// ===== Consulta a la API con fetch() =====
async function cargarPersonajes() {
  // Construimos la URL con la página, el nombre buscado y los filtros
  const parametros = new URLSearchParams({ page: estado.pagina });
  const nombre = inputBuscar.value.trim();
  if (nombre) parametros.set("name", nombre);
  if (filtroEstado.value) parametros.set("status", filtroEstado.value);
  if (filtroGenero.value) parametros.set("gender", filtroGenero.value);
  if (filtroEspecie.value) parametros.set("species", filtroEspecie.value);

  mostrarMensaje("Cargando personajes...");
  lista.innerHTML = "";

  try {
    const respuesta = await fetch(`${API_URL}?${parametros}`);

    if (!respuesta.ok) {
      throw new Error(`La API respondió con el código ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    estado.personajes = datos.results;
    estado.totalPaginas = datos.info.pages;
    estado.totalResultados = datos.info.count;
    ocultarMensaje();
    mostrarPersonajes();
  } catch (error) {
    console.error(error);
    estado.personajes = [];
    resumen.textContent = "";
    mostrarMensaje("No se pudo conectar con la API de Rick and Morty. Revisa tu conexión a internet e inténtalo de nuevo.", true);
    actualizarPaginacion();
  }
}

// ===== Mostrar tarjetas =====
function mostrarPersonajes() {
  let personajes;

  if (estado.vista === "favoritos") {
    // En favoritos filtramos localmente, sin llamar a la API
    const texto = inputBuscar.value.trim().toLowerCase();
    personajes = estado.favoritos.filter((p) => p.name.toLowerCase().includes(texto));
    if (estado.favoritos.length === 0) {
      mostrarMensaje("Todavía no tienes favoritos. Pulsa la estrella ☆ de un personaje para guardarlo.");
    } else if (personajes.length === 0) {
      mostrarMensaje("Ningún favorito coincide con tu búsqueda.");
    } else {
      ocultarMensaje();
    }
    resumen.textContent = personajes.length ? `${personajes.length} favorito(s) guardado(s)` : "";
  } else {
    personajes = estado.personajes;
    resumen.textContent = `${estado.totalResultados} personaje(s) encontrados — mostrando ${personajes.length} en esta página`;
  }

  personajes = ordenar(personajes);

  lista.innerHTML = "";
  personajes.forEach((personaje) => lista.appendChild(crearTarjeta(personaje)));
  actualizarPaginacion();
}

// Crea una tarjeta clonando la <template> del HTML.
// Usamos textContent (no innerHTML) para insertar los datos de la API de forma segura.
function crearTarjeta(personaje) {
  const tarjeta = plantilla.content.cloneNode(true);

  const img = tarjeta.querySelector(".tarjeta__img");
  img.src = personaje.image;
  img.alt = `Imagen de ${personaje.name}`;

  tarjeta.querySelector(".tarjeta__nombre").textContent = personaje.name;
  tarjeta.querySelector(".punto").classList.add(`punto--${personaje.status.toLowerCase()}`);
  tarjeta.querySelector(".texto-estado").textContent = `${traducir(personaje.status)} — ${personaje.species}`;
  tarjeta.querySelector(".dato-genero").textContent = traducir(personaje.gender);
  tarjeta.querySelector(".dato-origen").textContent = traducir(personaje.origin.name);
  tarjeta.querySelector(".dato-ubicacion").textContent = traducir(personaje.location.name);
  tarjeta.querySelector(".dato-episodios").textContent = personaje.episode.length;

  const btnFav = tarjeta.querySelector(".btn-fav");
  pintarBotonFavorito(btnFav, esFavorito(personaje.id));
  btnFav.addEventListener("click", () => {
    alternarFavorito(personaje);
    pintarBotonFavorito(btnFav, esFavorito(personaje.id));
    // Si estamos en la vista de favoritos, la tarjeta quitada debe desaparecer
    if (estado.vista === "favoritos") mostrarPersonajes();
  });

  return tarjeta;
}

function traducir(texto) {
  return TRADUCCIONES[texto] || texto;
}

function ordenar(personajes) {
  const copia = [...personajes]; // no modificamos el arreglo original
  if (selectOrden.value === "az") copia.sort((a, b) => a.name.localeCompare(b.name));
  if (selectOrden.value === "za") copia.sort((a, b) => b.name.localeCompare(a.name));
  return copia;
}

// ===== Favoritos con localStorage =====
function leerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS)) || [];
  } catch {
    return [];
  }
}

function guardarFavoritos() {
  try {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(estado.favoritos));
  } catch (error) {
    console.warn("No se pudieron guardar los favoritos", error);
  }
  contadorFav.textContent = estado.favoritos.length;
}

function esFavorito(id) {
  return estado.favoritos.some((p) => p.id === id);
}

function alternarFavorito(personaje) {
  if (esFavorito(personaje.id)) {
    estado.favoritos = estado.favoritos.filter((p) => p.id !== personaje.id);
  } else {
    estado.favoritos.push(personaje);
  }
  guardarFavoritos();
}

function pintarBotonFavorito(boton, activo) {
  boton.textContent = activo ? "★" : "☆";
  boton.classList.toggle("activo", activo);
  boton.setAttribute("aria-label", activo ? "Quitar de favoritos" : "Agregar a favoritos");
}

// ===== Mensajes =====
function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.remove("oculto");
  mensaje.classList.toggle("mensaje--error", esError);
}

function ocultarMensaje() {
  mensaje.classList.add("oculto");
}

// ===== Paginación =====
function actualizarPaginacion() {
  const enFavoritos = estado.vista === "favoritos";
  paginacion.classList.toggle("oculto", enFavoritos || estado.personajes.length === 0);
  infoPagina.textContent = `Página ${estado.pagina} de ${estado.totalPaginas}`;
  btnAnterior.disabled = estado.pagina <= 1;
  btnSiguiente.disabled = estado.pagina >= estado.totalPaginas;
}

btnAnterior.addEventListener("click", () => {
  if (estado.pagina > 1) {
    estado.pagina--;
    cargarPersonajes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

btnSiguiente.addEventListener("click", () => {
  if (estado.pagina < estado.totalPaginas) {
    estado.pagina++;
    cargarPersonajes();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// ===== Buscador y filtros =====
// Cada búsqueda nueva vuelve a la página 1
function nuevaBusqueda() {
  if (estado.vista === "favoritos") {
    mostrarPersonajes();
  } else {
    estado.pagina = 1;
    cargarPersonajes();
  }
}

formBusqueda.addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita que la página se recargue
  nuevaBusqueda();
});

// Búsqueda mientras se escribe, esperando 400 ms para no saturar la API
let temporizador;
inputBuscar.addEventListener("input", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(nuevaBusqueda, 400);
});

[filtroEstado, filtroGenero, filtroEspecie].forEach((filtro) => {
  filtro.addEventListener("change", nuevaBusqueda);
});

// Ordenar no necesita consultar la API: solo reacomoda lo que ya tenemos
selectOrden.addEventListener("change", mostrarPersonajes);

btnLimpiar.addEventListener("click", () => {
  formBusqueda.reset();
  nuevaBusqueda();
});

// ===== Pestañas: Personajes / Favoritos =====
pestanas.forEach((pestana) => {
  pestana.addEventListener("click", () => {
    pestanas.forEach((p) => p.classList.remove("activa"));
    pestana.classList.add("activa");
    estado.vista = pestana.dataset.vista;

    // Los filtros de la API solo aplican a la vista de personajes
    [filtroEstado, filtroGenero, filtroEspecie].forEach((f) => (f.disabled = estado.vista === "favoritos"));

    if (estado.vista === "todos") {
      ocultarMensaje();
      cargarPersonajes();
    } else {
      mostrarPersonajes();
    }
  });
});

// ===== Inicio =====
contadorFav.textContent = estado.favoritos.length;
cargarPersonajes();
