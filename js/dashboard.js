document.getElementById("form-emprendimiento").addEventListener("submit", function(e) {
    e.preventDefault();
  
    const nuevo = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      categoria: document.getElementById("categoria").value,
      imagen: document.getElementById("imagen").value
    };
  
    console.log("Emprendimiento agregado:", nuevo);
  
    alert("¡Emprendimiento agregado exitosamente (simulado)!");
    this.reset();
  });
  