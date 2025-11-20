// ========== PÁGINA DEL CARRITO ==========

let carrito = [];

document.addEventListener('DOMContentLoaded', function () {
    cargarCarritoDesdeStorage();
    renderizarCarrito();
    actualizarContadorCarrito();
    inicializarEventos();
});

function inicializarEventos() {
    document.getElementById('btn-continuar').addEventListener('click', continuarCompra);
    document.getElementById('btn-vaciar-carrito').addEventListener('click', vaciarCarrito);
}

function renderizarCarrito() {
    const listaProductos = document.getElementById('lista-productos');
    const cantidadProductos = document.getElementById('cantidad-productos');

    if (carrito.length === 0) {
        listaProductos.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icono">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Agrega deliciosas hamburguesas para comenzar!</p>
                <a href="index.html#promociones" class="btn-volver-compras">Ver productos</a>
            </div>
        `;
        cantidadProductos.textContent = '(0 productos)';
        actualizarResumen();
        return;
    }

    const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    cantidadProductos.textContent = `(${totalItems} producto${totalItems !== 1 ? 's' : ''})`;

    listaProductos.innerHTML = '';

    carrito.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-item';
        // fallback: si no hay imagen, usar un SVG inline como placeholder
        const imgSrc = (producto.imagen && producto.imagen.trim()) ? producto.imagen :
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">' +
            '<rect width="100%" height="100%" fill="%23f0f0f0"/>' +
            '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="20">Sin%20imagen</text>' +
            '</svg>';

        productoDiv.innerHTML = `
            <div class="producto-imagen">
                <img src="${imgSrc}" alt="${producto.nombre}">
            </div>
            <div class="producto-info-carrito">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p style="color: #999; font-size: 0.85rem;">S/. ${producto.precio.toFixed(2)} c/u</p>
            </div>
            <div class="producto-controles">
                <div class="controles-cantidad">
                    <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)">−</button>
                    <span class="cantidad-numero">${producto.cantidad}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <div class="producto-precio">S/. ${(producto.precio * producto.cantidad).toFixed(2)}</div>
            </div>
        `;
        listaProductos.appendChild(productoDiv);
    });

    actualizarResumen();
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
        mostrarNotificacion('Producto eliminado del carrito');
    }

    guardarCarritoEnStorage();
    renderizarCarrito();
    actualizarContadorCarrito();
}

function actualizarResumen() {
    const subtotal = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const totalItems = carrito.reduce((sum, p) => sum + p.cantidad, 0);
    const delivery = subtotal >= 30 ? 0 : 3;
    const total = subtotal + delivery;

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('costo-delivery').textContent = delivery === 0 ? 'GRATIS' : `S/ ${delivery.toFixed(2)}`;
    document.getElementById('costo-delivery').className = delivery === 0 ? 'texto-verde' : '';
    document.getElementById('total-final').textContent = `S/ ${total.toFixed(2)}`;
}

function continuarCompra() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    let textoPedido = '🍔 *MI PEDIDO PIKISS:*\n\n';
    carrito.forEach(producto => {
        textoPedido += `✓ ${producto.cantidad}x ${producto.nombre}\n`;
        textoPedido += `   S/. ${(producto.precio * producto.cantidad).toFixed(2)}\n\n`;
    });

    const subtotal = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const delivery = subtotal >= 30 ? 0 : 3;
    const total = subtotal + delivery;

    textoPedido += `📦 Delivery: ${delivery === 0 ? 'GRATIS' : 'S/. ' + delivery.toFixed(2)}\n`;
    textoPedido += `💰 *TOTAL: S/. ${total.toFixed(2)}*`;

    const telefono = '51968871644';
    const mensaje = encodeURIComponent(textoPedido);
    const urlWhatsApp = `https://wa.me/${telefono}?text=${mensaje}`;

    window.open(urlWhatsApp, '_blank');
}

function vaciarCarrito() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        guardarCarritoEnStorage();
        renderizarCarrito();
        actualizarContadorCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
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
    const notificacion = document.getElementById('notificacion');
    notificacion.textContent = mensaje;
    notificacion.classList.add('show');
    setTimeout(() => notificacion.classList.remove('show'), 2000);
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