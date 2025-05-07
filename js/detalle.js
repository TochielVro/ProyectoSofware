document.addEventListener("DOMContentLoaded", async function() {
  // Obtener parámetros de la URL (id y type) para determinar qué emprendimiento cargar
  const params = new URLSearchParams(window.location.search);
  const emprendimientoId = params.get("id");
  const type = params.get("type");
  const container = document.getElementById("detalleContainer");

  // Variables globales
  let selectedRating = 0;  // Valoración seleccionada por el usuario
  let emprendimiento;      // Emprendimiento a mostrar

  try {
    // Cargar el emprendimiento según el tipo
    if (type === "static") {
      const response = await fetch("data/emprendimientos.json");  // Cargar datos estáticos
      if (!response.ok) throw new Error("Error al cargar JSON");
      const data = await response.json();
      emprendimiento = data.find(item => item.id == emprendimientoId);  // Buscar el emprendimiento por ID
    } else {
      const userData = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
      emprendimiento = userData.find(item => item.id === emprendimientoId);  // Buscar en los emprendimientos del usuario
    }
    
    if (!emprendimiento) throw new Error("Emprendimiento no encontrado");

    // Renderizar el emprendimiento en el contenedor
    container.innerHTML = `
      <div class="emprendimiento-detalle">
        <div class="emprendimiento-header">
          <h1>${emprendimiento.nombre}</h1>
          ${type === "user" ? `<p class="emprendedor">Publicado por: ${emprendimiento.nombreUsuario || 'Usuario'}</p>` : ''}
        </div>
        <div class="emprendimiento-image">
          <img src="${emprendimiento.imagen}" alt="${emprendimiento.nombre}" loading="lazy">
        </div>
        <div class="emprendimiento-body">
          <p>${emprendimiento.descripcion}</p>
          ${type === "user" ? `<p><small>Fecha de publicación: ${emprendimiento.fecha || 'No especificada'}</small></p>` : ''}
        </div>
        <a href="emprendimientos.html" class="btn-back">← Volver a emprendimientos</a>
        
        <!-- Sección de comentarios -->
        <section class="comentarios">
          <div class="container">
            <h2>Comentarios y valoraciones</h2>
            
            <div class="rating-promedio">
              <div class="stars" id="ratingPromedio"></div>
              <span id="ratingText">0/5 (0 reseñas)</span>
            </div>
            
            <div class="add-comentario">
              <h3>Deja tu reseña</h3>
              <form id="formComentario">
                <div class="rating-input">
                  <span>Valoración:</span>
                  <div class="stars">
                    <i class="far fa-star" data-rating="1"></i>
                    <i class="far fa-star" data-rating="2"></i>
                    <i class="far fa-star" data-rating="3"></i>
                    <i class="far fa-star" data-rating="4"></i>
                    <i class="far fa-star" data-rating="5"></i>
                  </div>
                </div>
                <textarea id="textoComentario" placeholder="Escribe tu comentario..." required></textarea>
                <button type="submit" class="btn">Enviar reseña</button>
              </form>
            </div>
            
            <div id="listaComentarios" class="lista-comentarios">
              <!-- Comentarios se cargarán aquí -->
            </div>
          </div>
        </section>
      </div>
    `;

    // Configurar las estrellas interactivas para seleccionar la valoración
    document.querySelectorAll('.rating-input .stars i').forEach(star => {
      star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));  // Obtener la valoración seleccionada
        updateStars(selectedRating, this.parentElement);  // Actualizar las estrellas visualmente
      });
    });

    // Cargar y mostrar los comentarios existentes
    await loadComentarios();
    await updateRatingPromedio();  // Actualizar la valoración promedio de los comentarios

    // Manejar el envío de un nuevo comentario
    document.getElementById("formComentario").addEventListener('submit', async function(e) {
      e.preventDefault();  // Prevenir comportamiento por defecto del formulario

      // Verificar si el usuario está autenticado
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (!user) {
        alert("Debes iniciar sesión para comentar");
        window.location.href = "login.html?redirect=detalle.html?id=" + emprendimientoId + "&type=" + type;
        return;
      }

      // Obtener el texto del comentario
      const comentarioTexto = document.getElementById("textoComentario").value.trim();
      
      // Validación
      if (!selectedRating) {
        alert("Por favor selecciona una valoración");
        return;
      }

      if (!comentarioTexto) {
        alert("El comentario no puede estar vacío");
        return;
      }

      // Crear un nuevo objeto de comentario
      const nuevoComentario = {
        id: Date.now().toString(),  // Usamos la hora actual como ID único
        emprendimientoId,
        type,
        usuarioId: user.id,
        nombreUsuario: user.nombre,
        rating: selectedRating,
        texto: comentarioTexto,
        fecha: new Date().toISOString()
      };

      // Guardar el comentario y actualizar la lista
      await saveComentario(nuevoComentario);
      await updateRatingPromedio();
      await loadComentarios();
      
      // Resetear el formulario
      this.reset();
      selectedRating = 0;
      updateStars(0, document.querySelector('.rating-input .stars'));
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${error.message}</p>
        <a href="emprendimientos.html" class="btn">Volver a emprendimientos</a>
      </div>
    `;
  }

  // Función para cargar los comentarios desde el almacenamiento
  async function loadComentarios() {
    try {
      const response = await fetch("data/comentarios.json");
      const allComentarios = await response.json();
      
      // Filtrar los comentarios relacionados con el emprendimiento actual
      const comentarios = allComentarios.filter(c => 
        c.emprendimientoId === emprendimientoId && c.type === type
      ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));  // Ordenar por fecha descendente
      
      // Renderizar los comentarios en la página
      const listaComentarios = document.getElementById("listaComentarios");
      listaComentarios.innerHTML = comentarios.map(comentario => `
        <div class="comentario">
          <div class="comentario-header">
            <strong>${comentario.nombreUsuario}</strong>
            <div class="stars">${renderStars(comentario.rating)}</div>
            <small>${new Date(comentario.fecha).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</small>
          </div>
          <p>${comentario.texto}</p>
        </div>
      `).join('');
      
      if (comentarios.length === 0) {
        listaComentarios.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en opinar!</p>';
      }
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    }
  }

  // Función para guardar un nuevo comentario en localStorage
  async function saveComentario(comentario) {
    try {
      let comentarios = JSON.parse(localStorage.getItem("comentariosTemporales") || "[]");
      comentarios.push(comentario);
      localStorage.setItem("comentariosTemporales", JSON.stringify(comentarios));  // Guardar en localStorage

      // Actualizar las estadísticas del emprendimiento
      if (type === "user") {
        let emprendimientos = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
        const index = emprendimientos.findIndex(e => e.id === emprendimientoId);
        
        if (index !== -1) {
          const comentariosEmp = comentarios.filter(c => 
            c.emprendimientoId === emprendimientoId && c.type === type
          );
          
          emprendimientos[index].totalComentarios = comentariosEmp.length;
          emprendimientos[index].rating = comentariosEmp.reduce((acc, c) => acc + c.rating, 0) / comentariosEmp.length;
          
          localStorage.setItem("userEmprendimientos", JSON.stringify(emprendimientos));
        }
      }
    } catch (error) {
      console.error("Error guardando comentario:", error);
    }
  }

  // Función para actualizar la valoración promedio
  async function updateRatingPromedio() {
    try {
      const listaComentarios = document.getElementById("listaComentarios");
      const ratingPromedio = document.getElementById("ratingPromedio");
      const ratingText = document.getElementById("ratingText");
      
      // Obtener los comentarios del emprendimiento
      const comentarios = JSON.parse(localStorage.getItem("comentariosTemporales") || "[]")
        .filter(c => c.emprendimientoId === emprendimientoId && c.type === type);
      
      const total = comentarios.length;
      const rating = total > 0 ? 
        comentarios.reduce((acc, c) => acc + c.rating, 0) / total : 0;  // Calcular la media
      
      // Actualizar el promedio de estrellas y el texto
      ratingPromedio.innerHTML = renderStars(rating);
      ratingText.textContent = `${rating.toFixed(1)}/5 (${total} ${total === 1 ? 'reseña' : 'reseñas'})`;
    } catch (error) {
      console.error("Error actualizando rating:", error);
    }
  }

  // Función para renderizar las estrellas según la valoración
  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Generar estrellas completas, medias y vacías
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('<i class="fas fa-star"></i>');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('<i class="fas fa-star-half-alt"></i>');
      } else {
        stars.push('<i class="far fa-star"></i>');
      }
    }
    return stars.join('');
  }

  // Función para actualizar las estrellas en el formulario de valoración
  function updateStars(rating, starsContainer) {
    starsContainer.querySelectorAll('i').forEach((star, index) => {
      star.className = index < rating ? 'fas fa-star' : 'far fa-star';  // Cambiar clase según la valoración
    });
  }
});
