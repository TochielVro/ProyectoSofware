document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const container = document.getElementById("detalleContainer");
    const comentariosContainer = document.getElementById("comentariosContainer");
  
    // Cargar detalle del emprendimiento
    fetch("data/emprendimientos.json")
      .then(response => response.json())
      .then(data => {
        const emprendimiento = data.find(item => item.id == id);
        if (emprendimiento) {
          container.innerHTML = `
            <h2>${emprendimiento.nombre}</h2>
            <img src="${emprendimiento.imagen}" alt="${emprendimiento.nombre}" />
            <p>${emprendimiento.descripcion}</p>
          `;
        } else {
          container.innerHTML = "<p>Emprendimiento no encontrado.</p>";
        }
      });
  
    // Cargar comentarios
    fetch("data/comentarios.json")
      .then(response => response.json())
      .then(data => {
        const comentarios = data[id] || [];
        if (comentarios.length > 0) {
          comentarios.forEach(c => {
            const div = document.createElement("div");
            div.className = "comentario";
            div.innerHTML = `<strong>${c.autor}:</strong> ${c.comentario}`;
            comentariosContainer.appendChild(div);
          });
        } else {
          comentariosContainer.innerHTML = "<p>Este emprendimiento aún no tiene comentarios.</p>";
        }
      });
  });
  