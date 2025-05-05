document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cardsContainer");
    const searchInput = document.getElementById("searchInput");
  
    fetch("data/emprendimientos.json")
      .then(response => response.json())
      .then(data => {
        renderCards(data);
  
        // Filtrado en vivo
        searchInput.addEventListener("input", () => {
          const filtro = searchInput.value.toLowerCase();
          const resultados = data.filter(item =>
            item.nombre.toLowerCase().includes(filtro)
          );
          renderCards(resultados);
        });
      })
      .catch(error => {
        console.error("Error cargando los emprendimientos:", error);
        container.innerHTML = "<p>Error al cargar los datos.</p>";
      });
  
    function renderCards(emprendimientos) {
      container.innerHTML = "";
      emprendimientos.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${item.imagen}" alt="${item.nombre}" />
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <a href="detalle.html?id=${item.id}" class="btn">Ver más</a>
        `;
        container.appendChild(card);
      });
    }
  });
  