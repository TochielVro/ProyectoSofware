document.addEventListener("DOMContentLoaded", () => {
    // Simulación de datos
    const usuario = {
      nombre: "Juan Pérez",
      email: "juanperez@email.com"
    };
  
    document.getElementById("nombre-usuario").textContent = usuario.nombre;
    document.getElementById("email-usuario").textContent = usuario.email;
  });