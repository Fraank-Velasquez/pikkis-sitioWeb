// ========== CARRITO DE COMPRAS - INDEX.HTML ==========

let carrito = [];

// Cargar carrito al iniciar
document.addEventListener('DOMContentLoaded', function () {
    cargarCarritoDesdeStorage();
    inicializarEventos();
    inicializarMenuResponsivo();
    actualizarContadorCarrito();
});

// ========== MENÚ RESPONSIVO: CERRAR AL HACER CLIC FUERA Y SECCIÓN ACTIVA ==========
function inicializarMenuResponsivo() {
    const checkboxMenu = document.getElementById('menu-checkbox');
    const navBar = document.querySelector('.navbar');
    const etiquetaMenu = document.querySelector('.menu-select');

    // Cerrar menú al hacer clic fuera (si está abierto)
    document.addEventListener('click', (e) => {
        if (!checkboxMenu) return;
        if (!checkboxMenu.checked) return; // ya cerrado

        const objetivo = e.target;
        // si el clic NO está dentro del nav ni en la etiqueta que abre el menú, cerramos
        if (!navBar.contains(objetivo) && objetivo !== etiquetaMenu && !etiquetaMenu.contains(objetivo)) {
            checkboxMenu.checked = false;
        }
    });

    // Cerrar menú al hacer clic en cualquier enlace del nav (útil en móvil)
    if (navBar) {
        navBar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (checkboxMenu) checkboxMenu.checked = false;
            });
        });
    }

    // Observador para resaltar la sección activa en el menú
    // incluir también el contenedor de inicio (es un div con id 'inicio')
    const secciones = document.querySelectorAll('section[id], #inicio');
    // seleccionar enlaces de navegación de forma robusta (soporta distintas clases)
    const enlacesNav = document.querySelectorAll('.nav-ul a, .item-ul a');

    // Helper: quitar clase activo de todos
    function limpiarActivos() {
        enlacesNav.forEach(a => a.classList.remove('activo'));
    }

    const observerOp = {
        root: null,
        // ajustar rootMargin/threshold para detectar mejor secciones largas
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.20 // cuando ~25% de la sección esté visible
    };

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                // encontrar enlace cuya href contiene '#id' (maneja espacios en href)
                const enlace = Array.from(enlacesNav).find(a => {
                    try {
                        const href = (a.getAttribute('href') || '').trim();
                        const hrefNorm = href.replace(/\s+/g, ''); // limpiar espacios
                        return hrefNorm && hrefNorm.includes('#' + id);
                    } catch (err) {
                        return false;
                    }
                });

                if (enlace) {
                    limpiarActivos();
                    enlace.classList.add('activo');
                }
            }
        });
    }, observerOp);

    secciones.forEach(sec => observer.observe(sec));

    // Asegurar toggle robusto al hacer click en la etiqueta (hamburguesa)
    if (etiquetaMenu && checkboxMenu) {
        etiquetaMenu.addEventListener('click', (ev) => {
            // prevenir el toggle nativo y manejarlo manualmente evita condiciones de carrera
            ev.preventDefault();
            checkboxMenu.checked = !checkboxMenu.checked;
        });
    }
}

function inicializarEventos() {
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
}

function agregarAlCarrito(e) {

    const tarjeta = e.target.closest('.producto-tarjeta');

    const producto = {
        nombre: tarjeta.dataset.nombre,
        precio: parseFloat(tarjeta.dataset.precio),
        descripcion: tarjeta.dataset.descripcion,
        // seleccionar la imagen del producto (evitar el icono del botón "agregar")
        imagen: (function () {
            const imgs = tarjeta.querySelectorAll('.imagen-producto img');
            if (!imgs || imgs.length === 0) return '';
            // normalmente el último img es la imagen del producto (el primero puede ser el icono del botón)
            return imgs[imgs.length - 1].src || '';
        })(),
        cantidad: 1
    };

    const productoExistente = carrito.find(item => item.nombre === producto.nombre);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push(producto);
    }

    guardarCarritoEnStorage();
    // Animación visual: volar imagen al carrito y pulso del contador
    animarVolarAlCarrito(tarjeta);

    actualizarContadorCarrito();
    mostrarNotificacion('✓ Producto agregado al carrito');

    tarjeta.classList.add('agregando');
    setTimeout(() => tarjeta.classList.remove('agregando'), 400);
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    const totalItems = carrito.reduce((sum, producto) => sum + producto.cantidad, 0);

    if (totalItems > 0) {
        contador.style.display = 'flex';
        contador.textContent = totalItems;
    } else {
        contador.style.display = 'none';
    }
}

function mostrarNotificacion(mensaje) {
    // Buscar el contenedor de notificación en la página (id 'notificacion')
    const notificacion = document.getElementById('notificacion');
    if (!notificacion) return;
    notificacion.textContent = mensaje;
    notificacion.classList.add('show');
    setTimeout(() => notificacion.classList.remove('show'), 2000);
}

// ========== ANIMACIÓN: IMAGEN VOLANDO AL CARRITO ==========
function animarVolarAlCarrito(tarjeta) {
    if (!tarjeta) return;
    const imagen = tarjeta.querySelector('.imagen-producto img');
    if (!imagen) return;

    const iconoCarrito = document.querySelector('a[href="carrito.html"] img') || document.getElementById('contador-carrito');
    if (!iconoCarrito) return;

    const rectImg = imagen.getBoundingClientRect();
    const rectCarrito = iconoCarrito.getBoundingClientRect();

    const clon = imagen.cloneNode(true);
    clon.classList.add('imagen-voladora');
    document.body.appendChild(clon);

    // Posición inicial
    clon.style.left = rectImg.left + 'px';
    clon.style.top = rectImg.top + 'px';
    clon.style.width = rectImg.width + 'px';
    clon.style.height = rectImg.height + 'px';
    clon.style.opacity = '1';

    // Forzar reflow antes de animar
    requestAnimationFrame(() => {
        const deltaX = (rectCarrito.left + rectCarrito.width / 2) - (rectImg.left + rectImg.width / 2);
        const deltaY = (rectCarrito.top + rectCarrito.height / 2) - (rectImg.top + rectImg.height / 2);
        clon.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
        clon.style.opacity = '0.6';
    });

    clon.addEventListener('transitionend', () => {
        // eliminar clon
        clon.remove();
        // pulso contador
        const contador = document.getElementById('contador-carrito');
        if (contador) {
            contador.classList.remove('pulso');
            // reflow para reiniciar animación
            void contador.offsetWidth;
            contador.classList.add('pulso');
        }
    }, { once: true });
}

function guardarCarritoEnStorage() {
    localStorage.setItem('carritoPikiss', JSON.stringify(carrito));
}

function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carritoPikiss');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}