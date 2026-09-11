const API_URL = "api.php";
const LOGIN_URL = "login.php";

const opcionesSexo = ["Masculino", "Femenino"];
const opcionesCarrera = [
  "Ingeniería en Sistemas",
  "Ingeniería Industrial",
  "Licenciatura en Computación",
  "Licenciatura en Administración",
  "Diseño Gráfico",
];

let estudiantes = [];
let textoBusqueda = "";
let carreraSeleccionada = "Todas las carreras";
let ordenAscendente = true;
let idDetalleActual = null;
let modoFormulario = "nuevo";
let idFormularioActual = null;
let fotoFormulario = null;
let accionModalConfirmada = null;

// ---------- Acceso a la API (PHP + MySQL) ----------
async function apiListar() {
  const respuesta = await fetch(API_URL + "?accion=listar");
  if (!respuesta.ok) throw new Error("No se pudo obtener la lista de estudiantes");
  return respuesta.json();
}

async function apiCrear(datos) {
  const respuesta = await fetch(API_URL + "?accion=crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "No se pudo crear el estudiante");
  return cuerpo;
}

async function apiActualizar(id, datos) {
  const respuesta = await fetch(API_URL + "?accion=actualizar&id=" + encodeURIComponent(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "No se pudo actualizar el estudiante");
  return cuerpo;
}

async function apiEliminar(id) {
  const respuesta = await fetch(API_URL + "?accion=eliminar&id=" + encodeURIComponent(id), { method: "POST" });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "No se pudo eliminar el estudiante");
  return cuerpo;
}

async function apiEliminarTodos() {
  const respuesta = await fetch(API_URL + "?accion=eliminar_todos", { method: "POST" });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "No se pudieron eliminar los estudiantes");
  return cuerpo;
}

async function apiEstadoLogin() {
  const respuesta = await fetch(LOGIN_URL + "?accion=estado");
  if (!respuesta.ok) throw new Error("No se pudo consultar la sesión");
  const cuerpo = await respuesta.json();
  return Boolean(cuerpo.autenticado);
}

async function apiLogin(password) {
  const respuesta = await fetch(LOGIN_URL + "?accion=entrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: password }),
  });
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error || "Contraseña incorrecta");
  return cuerpo;
}

async function apiLogout() {
  const respuesta = await fetch(LOGIN_URL + "?accion=salir", { method: "POST" });
  return respuesta.json();
}

async function cargarDesdeServidor() {
  try {
    estudiantes = await apiListar();
    renderizarLista();
    return true;
  } catch (e) {
    estudiantes = [];
    renderizarLista();
    mostrarBanner("No se pudo conectar con la base de datos", "error");
    return false;
  }
}

// ---------- Elementos ----------
const pantallas = {
  login: document.getElementById("pantallaLogin"),
  lista: document.getElementById("pantallaLista"),
  detalle: document.getElementById("pantallaDetalle"),
  formulario: document.getElementById("pantallaFormulario"),
};

const formularioLogin = document.getElementById("formularioLogin");
const campoPasswordLogin = document.getElementById("campoPasswordLogin");
const errorLogin = document.getElementById("errorLogin");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const tituloLista = document.getElementById("tituloLista");
const btnBorrarTodos = document.getElementById("btnBorrarTodos");
const campoBuscar = document.getElementById("buscarNombre");
const btnLimpiarBusqueda = document.getElementById("btnLimpiarBusqueda");
const filtroCarrera = document.getElementById("filtroCarrera");
const btnOrden = document.getElementById("btnOrden");
const textoOrden = document.getElementById("textoOrden");
const listaVacia = document.getElementById("listaVacia");
const listaEstudiantesEl = document.getElementById("listaEstudiantes");
const btnAgregar = document.getElementById("btnAgregar");

const avatarDetalle = document.getElementById("avatarDetalle");
const detalleNombre = document.getElementById("detalleNombre");
const detalleCarrera = document.getElementById("detalleCarrera");
const detalleEdad = document.getElementById("detalleEdad");
const detalleSexo = document.getElementById("detalleSexo");
const detalleTelefono = document.getElementById("detalleTelefono");
const detalleCorreo = document.getElementById("detalleCorreo");
const btnVolverDetalle = document.getElementById("btnVolverDetalle");
const btnEditar = document.getElementById("btnEditar");
const btnEliminar = document.getElementById("btnEliminar");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnVolverFormulario = document.getElementById("btnVolverFormulario");
const formularioEstudiante = document.getElementById("formularioEstudiante");
const avatarFormulario = document.getElementById("avatarFormulario");
const btnGaleria = document.getElementById("btnGaleria");
const btnCamara = document.getElementById("btnCamara");
const inputGaleria = document.getElementById("inputGaleria");
const inputCamara = document.getElementById("inputCamara");
const campoNombre = document.getElementById("campoNombre");
const campoEdad = document.getElementById("campoEdad");
const campoCarrera = document.getElementById("campoCarrera");
const campoTelefono = document.getElementById("campoTelefono");
const campoCorreo = document.getElementById("campoCorreo");
const errorNombre = document.getElementById("errorNombre");
const errorEdad = document.getElementById("errorEdad");
const errorTelefono = document.getElementById("errorTelefono");
const errorCorreo = document.getElementById("errorCorreo");

const overlayModal = document.getElementById("overlayModal");
const modalTitulo = document.getElementById("modalTitulo");
const modalMensaje = document.getElementById("modalMensaje");
const modalCancelar = document.getElementById("modalCancelar");
const modalConfirmar = document.getElementById("modalConfirmar");

const textoEstado = document.getElementById("estadoPWA");
const bannerEstado = document.getElementById("bannerEstado");
const pieDerechos = document.getElementById("pieDerechos");
const pieEstado = document.getElementById("pieEstado");

// ---------- Navegación ----------
function mostrarPantalla(nombre) {
  Object.keys(pantallas).forEach(function (clave) {
    pantallas[clave].classList.toggle("activa", clave === nombre);
  });
  window.scrollTo(0, 0);
}

function irALista() {
  mostrarPantalla("lista");
  renderizarLista();
}

function irADetalle(id) {
  const estudiante = estudiantes.find(function (e) {
    return e.id === id;
  });
  if (!estudiante) return;
  idDetalleActual = id;
  renderizarDetalle(estudiante);
  mostrarPantalla("detalle");
}

function irAFormulario(modo, id) {
  modoFormulario = modo;
  idFormularioActual = id || null;
  const existente = id
    ? estudiantes.find(function (e) {
        return e.id === id;
      })
    : null;
  prepararFormulario(existente);
  mostrarPantalla("formulario");
}

// ---------- Render: lista ----------
function iniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(function (parte) {
      return parte[0].toUpperCase();
    })
    .join("");
}

function pintarAvatar(el, foto, nombre) {
  el.textContent = "";
  el.style.backgroundImage = "";
  if (foto) {
    const img = new Image();
    img.onload = function () {
      el.style.backgroundImage = "url('" + foto + "')";
      el.textContent = "";
    };
    img.onerror = function () {
      el.style.backgroundImage = "";
      el.textContent = iniciales(nombre);
    };
    img.src = foto;
    el.textContent = iniciales(nombre);
  } else {
    el.textContent = iniciales(nombre);
  }
}

function poblarFiltroCarrera() {
  const opciones = ["Todas las carreras"].concat(opcionesCarrera);
  filtroCarrera.innerHTML = opciones
    .map(function (opcion) {
      return '<option value="' + opcion + '">' + opcion + "</option>";
    })
    .join("");
  filtroCarrera.value = carreraSeleccionada;
}

function poblarSelectCarrera() {
  campoCarrera.innerHTML = opcionesCarrera
    .map(function (opcion) {
      return '<option value="' + opcion + '">' + opcion + "</option>";
    })
    .join("");
}

function renderizarLista() {
  const filtrada = estudiantes.filter(function (e) {
    const coincideNombre = e.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    const coincideCarrera = carreraSeleccionada === "Todas las carreras" || e.carrera === carreraSeleccionada;
    return coincideNombre && coincideCarrera;
  });

  const procesada = filtrada.slice().sort(function (a, b) {
    const cmp = a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    return ordenAscendente ? cmp : -cmp;
  });

  tituloLista.textContent = "Estudiantes (" + procesada.length + "/" + estudiantes.length + ")";
  btnBorrarTodos.hidden = estudiantes.length === 0;

  listaEstudiantesEl.innerHTML = "";

  if (procesada.length === 0) {
    listaVacia.hidden = false;
    listaVacia.textContent =
      estudiantes.length === 0
        ? "No hay estudiantes registrados."
        : "No se encontraron estudiantes con los filtros aplicados.";
    return;
  }

  listaVacia.hidden = true;

  procesada.forEach(function (estudiante) {
    const li = document.createElement("li");
    li.className = "tarjeta-estudiante";
    li.tabIndex = 0;

    const avatar = document.createElement("div");
    avatar.className = "avatar avatar-lista";
    pintarAvatar(avatar, estudiante.foto, estudiante.nombre);

    const info = document.createElement("div");
    info.className = "info-estudiante";

    const nombre = document.createElement("h3");
    nombre.textContent = estudiante.nombre;

    const carrera = document.createElement("p");
    carrera.textContent = estudiante.carrera;

    info.appendChild(nombre);
    info.appendChild(carrera);
    li.appendChild(avatar);
    li.appendChild(info);

    li.addEventListener("click", function () {
      irADetalle(estudiante.id);
    });
    li.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        irADetalle(estudiante.id);
      }
    });

    listaEstudiantesEl.appendChild(li);
  });
}

// ---------- Render: detalle ----------
function renderizarDetalle(estudiante) {
  pintarAvatar(avatarDetalle, estudiante.foto, estudiante.nombre);
  detalleNombre.textContent = estudiante.nombre;
  detalleCarrera.textContent = "🎓 Carrera: " + estudiante.carrera;
  detalleEdad.textContent = "🎂 Edad: " + estudiante.edad + " años";
  detalleSexo.textContent = "⚧ Sexo: " + estudiante.sexo;
  detalleTelefono.textContent = "📞 Teléfono: " + estudiante.telefono;
  detalleCorreo.textContent = "✉️ Correo: " + estudiante.correo;
}

// ---------- Formulario ----------
function limpiarErroresFormulario() {
  [errorNombre, errorEdad, errorTelefono, errorCorreo].forEach(function (el) {
    el.hidden = true;
  });
  [campoNombre, campoEdad, campoTelefono, campoCorreo].forEach(function (el) {
    el.classList.remove("campo-error");
  });
}

function prepararFormulario(existente) {
  limpiarErroresFormulario();
  tituloFormulario.textContent = existente ? "Editar Estudiante" : "Nuevo Estudiante";

  campoNombre.value = existente ? existente.nombre : "";
  campoEdad.value = existente ? existente.edad : "";
  campoTelefono.value = existente ? existente.telefono : "";
  campoCorreo.value = existente ? existente.correo : "";
  campoCarrera.value = existente ? existente.carrera : opcionesCarrera[0];
  fotoFormulario = existente ? existente.foto || null : null;

  const sexoValor = existente ? existente.sexo : opcionesSexo[0];
  document.querySelectorAll('input[name="sexo"]').forEach(function (radio) {
    radio.checked = radio.value === sexoValor;
  });

  pintarAvatarFormulario();
}

function pintarAvatarFormulario() {
  if (fotoFormulario) {
    avatarFormulario.textContent = "";
    avatarFormulario.style.backgroundImage = "url('" + fotoFormulario + "')";
  } else {
    avatarFormulario.style.backgroundImage = "";
    avatarFormulario.textContent = "👤";
  }
}

function leerArchivoComoDataURL(archivo, callback) {
  const lector = new FileReader();
  lector.onload = function () {
    callback(lector.result);
  };
  lector.readAsDataURL(archivo);
}

btnGaleria.addEventListener("click", function () {
  inputGaleria.click();
});

btnCamara.addEventListener("click", function () {
  inputCamara.click();
});

inputGaleria.addEventListener("change", function () {
  const archivo = inputGaleria.files[0];
  if (!archivo) return;
  leerArchivoComoDataURL(archivo, function (resultado) {
    fotoFormulario = resultado;
    pintarAvatarFormulario();
  });
});

inputCamara.addEventListener("change", function () {
  const archivo = inputCamara.files[0];
  if (!archivo) return;
  leerArchivoComoDataURL(archivo, function (resultado) {
    fotoFormulario = resultado;
    pintarAvatarFormulario();
  });
});

function sexoSeleccionado() {
  const radio = document.querySelector('input[name="sexo"]:checked');
  return radio ? radio.value : opcionesSexo[0];
}

formularioEstudiante.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  const edadTexto = campoEdad.value.trim();
  const edadNum = parseInt(edadTexto, 10);
  const telefono = campoTelefono.value.trim();
  const correo = campoCorreo.value.trim();

  const esNombreValido = nombre.length > 0;
  const esEdadValida = Number.isFinite(edadNum) && edadNum >= 1 && edadNum <= 120;
  const esTelefonoValido = telefono.length >= 8;
  const esCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  errorNombre.hidden = esNombreValido;
  campoNombre.classList.toggle("campo-error", !esNombreValido);
  errorEdad.hidden = esEdadValida;
  campoEdad.classList.toggle("campo-error", !esEdadValida);
  errorTelefono.hidden = esTelefonoValido;
  campoTelefono.classList.toggle("campo-error", !esTelefonoValido);
  errorCorreo.hidden = esCorreoValido;
  campoCorreo.classList.toggle("campo-error", !esCorreoValido);

  if (!(esNombreValido && esEdadValida && esTelefonoValido && esCorreoValido)) return;

  const datos = {
    nombre: nombre,
    edad: edadTexto,
    sexo: sexoSeleccionado(),
    carrera: campoCarrera.value,
    telefono: telefono,
    correo: correo,
    foto: fotoFormulario,
  };

  const botonGuardar = formularioEstudiante.querySelector('button[type="submit"]');
  botonGuardar.disabled = true;

  try {
    if (modoFormulario === "editar" && idFormularioActual) {
      await apiActualizar(idFormularioActual, datos);
    } else {
      await apiCrear(datos);
    }
    await cargarDesdeServidor();
    irALista();
  } catch (e) {
    mostrarBanner(e.message, "error");
  } finally {
    botonGuardar.disabled = false;
  }
});

// ---------- Modal de confirmación ----------
function abrirModal(titulo, mensaje, accionConfirmar) {
  modalTitulo.textContent = titulo;
  modalMensaje.textContent = mensaje;
  accionModalConfirmada = accionConfirmar;
  overlayModal.hidden = false;
}

function cerrarModal() {
  overlayModal.hidden = true;
  accionModalConfirmada = null;
}

modalCancelar.addEventListener("click", cerrarModal);
modalConfirmar.addEventListener("click", function () {
  const accion = accionModalConfirmada;
  cerrarModal();
  if (accion) accion();
});
overlayModal.addEventListener("click", function (evento) {
  if (evento.target === overlayModal) cerrarModal();
});

// ---------- Eventos: pantalla lista ----------
campoBuscar.addEventListener("input", function () {
  textoBusqueda = campoBuscar.value;
  btnLimpiarBusqueda.hidden = textoBusqueda.length === 0;
  renderizarLista();
});

btnLimpiarBusqueda.addEventListener("click", function () {
  textoBusqueda = "";
  campoBuscar.value = "";
  btnLimpiarBusqueda.hidden = true;
  renderizarLista();
});

filtroCarrera.addEventListener("change", function () {
  carreraSeleccionada = filtroCarrera.value;
  renderizarLista();
});

btnOrden.addEventListener("click", function () {
  ordenAscendente = !ordenAscendente;
  textoOrden.textContent = ordenAscendente ? "A-Z" : "Z-A";
  renderizarLista();
});

btnBorrarTodos.addEventListener("click", function () {
  abrirModal(
    "Eliminar todos los estudiantes",
    "¿Está seguro de que desea borrar absolutamente todos los registros? Esta acción no se puede deshacer.",
    async function () {
      try {
        await apiEliminarTodos();
        await cargarDesdeServidor();
      } catch (e) {
        mostrarBanner(e.message, "error");
      }
    }
  );
});

btnAgregar.addEventListener("click", function () {
  irAFormulario("nuevo", null);
});

// ---------- Eventos: pantalla detalle ----------
btnVolverDetalle.addEventListener("click", irALista);

btnEditar.addEventListener("click", function () {
  irAFormulario("editar", idDetalleActual);
});

btnEliminar.addEventListener("click", function () {
  const estudiante = estudiantes.find(function (e) {
    return e.id === idDetalleActual;
  });
  if (!estudiante) return;
  abrirModal("Confirmar Eliminación", "¿Está seguro de que desea eliminar a " + estudiante.nombre + "?", async function () {
    try {
      await apiEliminar(idDetalleActual);
      await cargarDesdeServidor();
      irALista();
    } catch (e) {
      mostrarBanner(e.message, "error");
    }
  });
});

// ---------- Eventos: pantalla formulario ----------
btnVolverFormulario.addEventListener("click", irALista);

// ---------- Eventos: login ----------
formularioLogin.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  errorLogin.hidden = true;
  campoPasswordLogin.classList.remove("campo-error");

  const boton = formularioLogin.querySelector('button[type="submit"]');
  boton.disabled = true;

  try {
    await apiLogin(campoPasswordLogin.value);
    campoPasswordLogin.value = "";
    mostrarPantalla("lista");
    await cargarAppTrasLogin();
  } catch (e) {
    errorLogin.textContent = e.message;
    errorLogin.hidden = false;
    campoPasswordLogin.classList.add("campo-error");
  } finally {
    boton.disabled = false;
  }
});

btnCerrarSesion.addEventListener("click", async function () {
  await apiLogout();
  estudiantes = [];
  mostrarPantalla("login");
});

// ---------- Estado PWA ----------
function estadoPWA() {
  const enLinea = navigator.onLine;
  const instalada =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    Boolean(navigator.standalone);

  if (!enLinea) return "Sin conexión · datos locales";
  if (instalada) return "Instalada y lista";
  return "Lista en el navegador";
}

let temporizadorBanner = null;
function mostrarBanner(mensaje, tipo, autoOcultarMs) {
  clearTimeout(temporizadorBanner);
  bannerEstado.textContent = mensaje;
  bannerEstado.className = "banner-estado visible " + tipo;
  if (autoOcultarMs) {
    temporizadorBanner = setTimeout(function () {
      bannerEstado.classList.remove("visible");
    }, autoOcultarMs);
  }

  pieEstado.textContent = mensaje;
  pieEstado.className = "pie-estado " + tipo;
}

window.addEventListener("online", function () {
  textoEstado.textContent = estadoPWA();
});
window.addEventListener("offline", function () {
  textoEstado.textContent = estadoPWA();
});

// ---------- Inicio ----------
async function cargarAppTrasLogin() {
  mostrarBanner("Conectando con la base de datos…", "cargando");
  const datosOk = await cargarDesdeServidor();

  if (!("serviceWorker" in navigator)) {
    if (datosOk) mostrarBanner("Tu navegador no es compatible con el modo offline", "no-soportado");
    return;
  }

  try {
    await navigator.serviceWorker.register("service-worker.js");
    if (datosOk) mostrarBanner("Aplicación y datos cargados correctamente", "exito", 3000);
  } catch (e) {
    textoEstado.textContent = "Sin soporte para modo offline";
    if (datosOk) mostrarBanner("Datos cargados, pero sin soporte para modo offline", "error");
  }
}

async function iniciarApp() {
  poblarFiltroCarrera();
  poblarSelectCarrera();
  textoEstado.textContent = estadoPWA();
  pieDerechos.textContent = "© " + new Date().getFullYear() + " Todos los derechos reservados";

  let autenticado = false;
  try {
    autenticado = await apiEstadoLogin();
  } catch (e) {
    autenticado = false;
  }

  if (autenticado) {
    mostrarPantalla("lista");
    await cargarAppTrasLogin();
  } else {
    mostrarPantalla("login");
    campoPasswordLogin.focus();
  }
}

iniciarApp();
