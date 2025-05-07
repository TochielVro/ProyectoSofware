document.addEventListener("DOMContentLoaded", function () {
  try {
    // Intentamos obtener el usuario actual del localStorage
    const user = JSON.parse(localStorage.getItem("currentUser"));

    // Si no hay usuario, redirigimos al login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Mostramos el nombre del usuario si existe
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = user.nombre || "Emprendedor";
    }

    // Obtenemos referencias a los elementos del DOM necesarios
    const fileInput = document.getElementById("imagen");
    const fileName = document.getElementById("fileName");
    const imagePreview = document.getElementById("imagePreview");
    const form = document.getElementById("productoForm");
    const productosContainer = document.getElementById("productosContainer");

    // Si alguno no existe, lanzamos un error
    if (!fileInput || !fileName || !imagePreview || !form || !productosContainer) {
      throw new Error("Elementos del DOM no encontrados");
    }

    // Evento para cuando se selecciona una imagen
    fileInput.addEventListener("change", handleFileUpload);

    function handleFileUpload(e) {
      const file = e.target.files[0];

      if (file) {
        // Verificamos que el archivo sea una imagen
        if (!file.type.match("image.*")) {
          showAlert("Solo se permiten archivos de imagen (JPEG, PNG, etc.)", "error");
          resetFileInput();
          return;
        }

        // Verificamos que no pese más de 2MB
        if (file.size > 2 * 1024 * 1024) {
          showAlert("La imagen no debe superar los 2MB", "error");
          resetFileInput();
          return;
        }

        // Mostramos el nombre del archivo (truncado si es muy largo)
        fileName.textContent = truncateFileName(file.name, 20);

        // Previsualización de la imagen
        const reader = new FileReader();
        reader.onload = function (event) {
          imagePreview.innerHTML = `<img src="${event.target.result}" alt="Previsualización">`;
          imagePreview.style.display = "block";
        };
        reader.onerror = function () {
          showAlert("Error al leer la imagen", "error");
          resetFileInput();
        };
        reader.readAsDataURL(file);
      } else {
        resetFileInput();
      }
    }

    // Reseteamos el input de archivo
    function resetFileInput() {
      fileInput.value = "";
      fileName.textContent = "No se ha seleccionado archivo";
      imagePreview.style.display = "none";
    }

    // Evento de envío del formulario
    form.addEventListener("submit", handleFormSubmit);

    function handleFormSubmit(e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const descripcion = document.getElementById("descripcion").value.trim();
      const imagen = fileInput.files[0];

      // Validaciones básicas
      if (!nombre || nombre.length < 3) {
        showAlert("El nombre debe tener al menos 3 caracteres", "error");
        return;
      }

      if (!descripcion || descripcion.length < 10) {
        showAlert("La descripción debe tener al menos 10 caracteres", "error");
        return;
      }

      if (!imagen) {
        showAlert("Debes seleccionar una imagen", "error");
        return;
      }

      // Creamos el objeto del producto
      const producto = {
        id: "prod_" + Date.now().toString(),
        nombre,
        descripcion,
        imagen: URL.createObjectURL(imagen), // esto se sobreescribirá luego por el base64
        fecha: new Date().toLocaleString(),
        usuario: user.email,
        estado: "activo",
      };

      // Guardamos el producto y emprendimiento
      saveProduct(producto);

      // Limpiamos el formulario y la vista
      form.reset();
      resetFileInput();
      showAlert("Producto agregado correctamente", "success");
    }

    // Botón de logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      });
    }

    // Cargamos los productos del usuario
    loadProducts();

    // Guardar producto y emprendimiento en localStorage
    function saveProduct(producto) {
      try {
        const reader = new FileReader();
        reader.onload = function (event) {
          let productos = JSON.parse(localStorage.getItem("userProducts")) || [];
          const newProduct = {
            ...producto,
            imagen: event.target.result, // guardamos como base64
            eliminado: false,
          };
          productos.push(newProduct);
          localStorage.setItem("userProducts", JSON.stringify(productos));

          // También guardamos el emprendimiento
          let emprendimientos = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
          emprendimientos.push({
            id: `emp_${producto.id}`,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            imagen: event.target.result,
            fecha: new Date().toLocaleString(),
            usuario: user.email,
            nombreUsuario: user.nombre,
            aprobado: true,
            eliminado: false,
          });
          localStorage.setItem("userEmprendimientos", JSON.stringify(emprendimientos));

          // Recargamos productos en pantalla
          loadProducts();
          showAlert("Emprendimiento registrado exitosamente", "success");
        };
        reader.readAsDataURL(fileInput.files[0]);
      } catch (error) {
        console.error("Error al guardar:", error);
        showAlert("Error al guardar el emprendimiento", "error");
      }
    }

    // Función extra no usada actualmente, por si se requiere guardar solo emprendimiento
    function saveEmprendimiento(producto) {
      try {
        const emprendimiento = {
          id: "emp_" + Date.now().toString(),
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          imagen: producto.imagen,
          fecha: producto.fecha,
          usuario: producto.usuario,
          aprobado: true,
        };

        let emprendimientos = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
        emprendimientos.push(emprendimiento);
        localStorage.setItem("userEmprendimientos", JSON.stringify(emprendimientos));
      } catch (error) {
        console.error("Error al guardar emprendimiento:", error);
      }
    }

    // Mostrar todos los productos del usuario en la interfaz
    function loadProducts() {
      try {
        const productos = JSON.parse(localStorage.getItem("userProducts")) || [];
        const userProducts = productos.filter(p => p.usuario === user.email && p.estado === "activo");

        // Si no hay productos, mostramos mensaje de estado vacío
        if (userProducts.length === 0) {
          productosContainer.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-box-open"></i>
              <p>Aún no has agregado productos</p>
            </div>
          `;
          return;
        }

        // Generamos las tarjetas de productos
        productosContainer.innerHTML = userProducts.map(producto => `
          <div class="product-card" data-id="${producto.id}">
            <div class="product-image">
              <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
            </div>
            <div class="product-info">
              <h4>${producto.nombre}</h4>
              <p>${producto.descripcion}</p>
              <small>Agregado: ${producto.fecha}</small>
              <div class="product-actions">
                <button class="btn-danger" onclick="deleteProduct('${producto.id}')">
                  <i class="fas fa-trash"></i> Eliminar
                </button>
                <button class="btn-edit" onclick="editProduct('${producto.id}')">
                  <i class="fas fa-edit"></i> Editar
                </button>
              </div>
            </div>
          </div>
        `).join("");
      } catch (error) {
        console.error("Error al cargar productos:", error);
        productosContainer.innerHTML = `
          <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error al cargar los productos</p>
          </div>
        `;
      }
    }

    // Muestra una alerta en la parte superior del formulario
    function showAlert(message, type) {
      try {
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
          <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
          ${message}
        `;

        form.prepend(alertDiv);

        // Desaparece automáticamente luego de unos segundos
        setTimeout(() => {
          alertDiv.classList.add("fade-out");
          setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
      } catch (error) {
        console.error("Error al mostrar alerta:", error);
        alert(message);
      }
    }

    // Truncar nombre de archivo para evitar que sea muy largo
    function truncateFileName(name, maxLength) {
      if (name.length <= maxLength) return name;
      return name.substring(0, maxLength) + '...' + name.split('.').pop();
    }

  } catch (error) {
    // Error global por si falla algo al cargar la app
    console.error("Error inicial:", error);
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-container">
          <h2>Error en la aplicación</h2>
          <p>Por favor recarga la página o intenta más tarde</p>
          <button onclick="window.location.reload()">Recargar</button>
        </div>
      `;
    }
  }
});

// Eliminar producto y emprendimiento asociado
window.deleteProduct = function (id) {
  if (confirm("¿Estás seguro de eliminar este emprendimiento permanentemente?")) {
    try {
      let productos = JSON.parse(localStorage.getItem("userProducts")) || [];
      productos = productos.filter(p => p.id !== id);
      localStorage.setItem("userProducts", JSON.stringify(productos));

      let emprendimientos = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
      emprendimientos = emprendimientos.filter(e => e.id !== `emp_${id}`);
      localStorage.setItem("userEmprendimientos", JSON.stringify(emprendimientos));

      // Quitamos visualmente la tarjeta con una pequeña animación
      const cardsToRemove = document.querySelectorAll(`[data-id="${id}"], [data-id="emp_${id}"]`);
      cardsToRemove.forEach(card => {
        card.classList.add('deleting');
        setTimeout(() => card.remove(), 300);
      });

      // Si ya no quedan tarjetas, mostramos estado vacío
      setTimeout(() => {
        const remainingCards = document.querySelectorAll('.card, .product-card');
        if (remainingCards.length === 0) {
          const container = document.getElementById("productosContainer") ||
            document.getElementById("cardsContainer");
          if (container) {
            container.innerHTML = `
              <div class="empty-state">
                <i class="fas fa-store-slash"></i>
                <p>No hay emprendimientos para mostrar</p>
              </div>
            `;
          }
        }
      }, 350);

    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Ocurrió un error al eliminar el emprendimiento");
    }
  }
};

// Función vacía por ahora, se puede implementar para editar
window.editProduct = function (id) {
  console.log("Editar producto:", id);
};
