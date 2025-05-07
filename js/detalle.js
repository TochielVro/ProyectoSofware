document.addEventListener("DOMContentLoaded", async function() {
  const params = new URLSearchParams(window.location.search);
  const emprendimientoId = params.get("id");
  const type = params.get("type");
  const container = document.getElementById("detalleContainer");
  
  // Variables globales
  let selectedRating = 0;
  let emprendimiento;

  try {
    // Cargar emprendimiento
    if (type === "static") {
      const response = await fetch("data/emprendimientos.json");
      if (!response.ok) throw new Error("Error al cargar JSON");
      const data = await response.json();
      emprendimiento = data.find(item => item.id == emprendimientoId);
    } else {
      const userData = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
      emprendimiento = userData.find(item => item.id === emprendimientoId);
    }
    
    if (!emprendimiento) throw new Error("Emprendimiento no encontrado");

    // Renderizar el emprendimiento
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

    // Configurar estrellas interactivas
    document.querySelectorAll('.rating-input .stars i').forEach(star => {
      star.addEventListener('click', function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        updateStars(selectedRating, this.parentElement);
      });
    });

    // Cargar y mostrar comentarios
    await loadComentarios();
    await updateRatingPromedio();

    // Manejar envío de comentarios
    document.getElementById("formComentario").addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const user = JSON.parse(localStorage.getItem("currentUser"));
      if (!user) {
        alert("Debes iniciar sesión para comentar");
        window.location.href = "login.html?redirect=detalle.html?id=" + emprendimientoId + "&type=" + type;
        return;
      }

      const comentarioTexto = document.getElementById("textoComentario").value.trim();
      
      if (!selectedRating) {
        alert("Por favor selecciona una valoración");
        return;
      }

      if (!comentarioTexto) {
        alert("El comentario no puede estar vacío");
        return;
      }

      const nuevoComentario = {
        id: Date.now().toString(),
        emprendimientoId,
        type,
        usuarioId: user.id,
        nombreUsuario: user.nombre,
        rating: selectedRating,
        texto: comentarioTexto,
        fecha: new Date().toISOString()
      };

      await saveComentario(nuevoComentario);
      await updateRatingPromedio();
      await loadComentarios();
      
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

  // Funciones auxiliares
  async function loadComentarios() {
    try {
      const response = await fetch("data/comentarios.json");
      const allComentarios = await response.json();
      
      const comentarios = allComentarios.filter(c => 
        c.emprendimientoId === emprendimientoId && c.type === type
      ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
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

  async function saveComentario(comentario) {
    try {
      // En un entorno real, aquí harías una petición POST al servidor
      // Simulamos guardado local
      let comentarios = JSON.parse(localStorage.getItem("comentariosTemporales") || "[]");
      comentarios.push(comentario);
      localStorage.setItem("comentariosTemporales", JSON.stringify(comentarios));
      
      // Actualizar stats del emprendimiento
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

  async function updateRatingPromedio() {
    try {
      const listaComentarios = document.getElementById("listaComentarios");
      const ratingPromedio = document.getElementById("ratingPromedio");
      const ratingText = document.getElementById("ratingText");
      
      // Simulamos carga de comentarios (en realidad sería una petición al backend)
      const comentarios = JSON.parse(localStorage.getItem("comentariosTemporales") || "[]")
        .filter(c => c.emprendimientoId === emprendimientoId && c.type === type);
      
      const total = comentarios.length;
      const rating = total > 0 ? 
        comentarios.reduce((acc, c) => acc + c.rating, 0) / total : 0;
      
      ratingPromedio.innerHTML = renderStars(rating);
      ratingText.textContent = `${rating.toFixed(1)}/5 (${total} ${total === 1 ? 'reseña' : 'reseñas'})`;
    } catch (error) {
      console.error("Error actualizando rating:", error);
    }
  }

  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
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

  function updateStars(rating, starsContainer) {
    starsContainer.querySelectorAll('i').forEach((star, index) => {
      star.className = index < rating ? 'fas fa-star' : 'far fa-star';
    });
  }
});