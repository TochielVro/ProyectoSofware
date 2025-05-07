document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("cardsContainer");  // Contenedor donde se mostrarán las tarjetas de los emprendimientos
  const searchInput = document.getElementById("searchInput");  // Campo de entrada para la búsqueda
  
  async function loadAllEmprendimientos() {
    try {
      // 1. Cargar emprendimientos estáticos desde un archivo JSON
      const staticResponse = await fetch("data/emprendimientos.json");
      if (!staticResponse.ok) throw new Error("Error al cargar JSON");  // Manejo de error si la carga del JSON falla
      const staticData = await staticResponse.json();  // Parseamos los datos de los emprendimientos estáticos
      
      // 2. Cargar emprendimientos de usuarios desde localStorage, excluyendo los eliminados
      const userData = JSON.parse(localStorage.getItem("userEmprendimientos")) || [];  // Obtenemos los emprendimientos del usuario
      const activeUserData = userData.filter(e => 
        e.aprobado !== false &&  // Filtramos los emprendimientos aprobados
        !JSON.parse(localStorage.getItem("userProducts"))?.some(p => `emp_${p.id}` === e.id && p.eliminado)  // Excluimos los eliminados
      );
      
      // 3. Combinar los emprendimientos estáticos con los de los usuarios
      return [
        ...staticData.map(item => ({
          ...item,
          type: "static",  // Indicamos que es un emprendimiento estático
          searchText: `${item.nombre} ${item.descripcion}`.toLowerCase()  // Preparamos el texto para la búsqueda
        })),
        ...activeUserData.map(item => ({
          ...item,
          type: "user",  // Indicamos que es un emprendimiento de usuario
          searchText: `${item.nombre} ${item.descripcion} ${item.nombreUsuario}`.toLowerCase()  // Añadimos el nombre de usuario al texto de búsqueda
        }))
      ];
    } catch (error) {
      console.error("Error loading data:", error);  // Manejo de errores si algo falla al cargar los datos
      return [];  // Retorna un array vacío en caso de error
    }
  }

  // Función para renderizar las tarjetas de emprendimiento
  function renderCards(emprendimientos) {
    if (!emprendimientos || emprendimientos.length === 0) {  // Si no hay emprendimientos, mostramos un mensaje
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-store-slash"></i>
          <p>No se encontraron emprendimientos</p>
          <button class="btn" onclick="location.reload()">Recargar</button>
        </div>
      `;
      return;
    }
    
    // Generamos las tarjetas de emprendimientos
    container.innerHTML = emprendimientos.map(item => `
      <div class="card" data-id="${item.id}" data-type="${item.type}">
        <div class="card-image">
          <img src="${item.imagen}" alt="${item.nombre}" loading="lazy">  <!-- Imagen del emprendimiento -->
          ${item.type === "user" ? '<span class="user-badge">Nuevo</span>' : ''}  <!-- Badge para los emprendimientos de usuarios -->
        </div>
        <div class="card-content">
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <div class="card-footer">
            <a href="detalle.html?id=${item.id}&type=${item.type}" class="btn">Ver más</a>
            ${item.type === "user" ? `<small>Publicado por: ${item.usuario || 'Usuario'}</small>` : ''}  <!-- Nombre del usuario si es un emprendimiento de usuario -->
          </div>
        </div>
      </div>
    `).join("");  // Unimos todas las tarjetas generadas
  }

  // Configuración de la búsqueda
  function setupSearch() {
    let allEmprendimientos = [];  // Array que almacenará todos los emprendimientos cargados
    let searchTimeout;  // Variable para controlar el tiempo de espera de la búsqueda (debounce)
    
    // Cargar datos y configurar búsqueda
    loadAllEmprendimientos().then(data => {
      allEmprendimientos = data;  // Almacenamos los emprendimientos cargados
      renderCards(allEmprendimientos);  // Renderizamos todas las tarjetas inicialmente
      
      // Búsqueda en tiempo real con debounce
      searchInput.addEventListener("input", function() {
        clearTimeout(searchTimeout);  // Limpiamos el tiempo de espera anterior
        searchTimeout = setTimeout(() => {  // Establecemos un nuevo tiempo de espera
          const term = this.value.trim().toLowerCase();  // Obtenemos el término de búsqueda en minúsculas
          if (term === "") {  // Si el campo está vacío, mostramos todos los emprendimientos
            renderCards(allEmprendimientos);
            return;
          }
          
          // Filtramos los emprendimientos que coincidan con el término de búsqueda
          const results = allEmprendimientos.filter(item => 
            item.searchText.includes(term)  // Comprobamos si el término está incluido en el texto de búsqueda
          );
          
          renderCards(results);  // Renderizamos los resultados de la búsqueda
          
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
        }, 300);  // Esperamos 300ms después de la última pulsación para hacer la búsqueda (debounce)
      });
    });
  }

  // Inicializar la búsqueda
  setupSearch();
});
