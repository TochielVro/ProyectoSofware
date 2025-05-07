document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("cardsContainer");
  const searchInput = document.getElementById("searchInput");
  
  async function loadAllEmprendimientos() {
    try {
      // 1. Cargar emprendimientos estáticos (JSON)
      const staticResponse = await fetch("data/emprendimientos.json");
      if (!staticResponse.ok) throw new Error("Error al cargar JSON");
      const staticData = await staticResponse.json();
      
      // 2. Cargar emprendimientos de usuarios (excluyendo eliminados)
      const userData = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];
      const activeUserData = userData.filter(e => 
        e.aprobado !== false && 
        !JSON.parse(localStorage.getItem("userProducts"))?.some(p => `emp_${p.id}` === e.id && p.eliminado)
      );
      
      // 3. Combinar resultados
      return [
        ...staticData.map(item => ({
          ...item,
          type: "static",
          searchText: `${item.nombre} ${item.descripcion}`.toLowerCase()
        })),
        ...activeUserData.map(item => ({
          ...item,
          type: "user",
          searchText: `${item.nombre} ${item.descripcion} ${item.nombreUsuario}`.toLowerCase()
        }))
      ];
    } catch (error) {
      console.error("Error loading data:", error);
      return [];
    }
  }

  // Renderizar tarjetas
  function renderCards(emprendimientos) {
    if (!emprendimientos || emprendimientos.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-store-slash"></i>
          <p>No se encontraron emprendimientos</p>
          <button class="btn" onclick="location.reload()">Recargar</button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = emprendimientos.map(item => `
      <div class="card" data-id="${item.id}" data-type="${item.type}">
        <div class="card-image">
          <img src="${item.imagen}" alt="${item.nombre}" loading="lazy">
          ${item.type === "user" ? '<span class="user-badge">Nuevo</span>' : ''}
        </div>
        <div class="card-content">
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <div class="card-footer">
            <a href="detalle.html?id=${item.id}&type=${item.type}" class="btn">Ver más</a>
            ${item.type === "user" ? `<small>Publicado por: ${item.usuario || 'Usuario'}</small>` : ''}
          </div>
        </div>
      </div>
    `).join("");
  }

  // Búsqueda optimizada
  function setupSearch() {
    let allEmprendimientos = [];
    let searchTimeout;
    
    // Cargar datos y configurar búsqueda
    loadAllEmprendimientos().then(data => {
      allEmprendimientos = data;
      renderCards(allEmprendimientos);
      
      // Búsqueda en tiempo real con debounce
      searchInput.addEventListener("input", function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const term = this.value.trim().toLowerCase();
          if (term === "") {
            renderCards(allEmprendimientos);
            return;
          }
          
          const results = allEmprendimientos.filter(item => 
            item.searchText.includes(term)
          );
          
          renderCards(results);
          
          // Mostrar mensaje si no hay resultados
          if (results.length === 0) {
            container.innerHTML += `
              <div class="search-empty">
                <p>No se encontraron resultados para "${term}"</p>
                <button class="btn-text" onclick="document.getElementById('searchInput').value='';location.reload()">
                  Mostrar todos
                </button>
              </div>
            `;
          }
        }, 300);
      });
    });
  }

  // Inicializar
  setupSearch();
});