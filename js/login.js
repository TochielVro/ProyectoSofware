document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.querySelector(".login-form");  // Obtenemos el formulario de login
  const messageDiv = document.createElement("div");  // Creamos un div para los mensajes de alerta
  messageDiv.className = "alert-message";  // Asignamos una clase al div de mensaje
  loginForm.parentNode.insertBefore(messageDiv, loginForm.nextSibling);  // Insertamos el div de mensaje después del formulario de login
  
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();  // Prevenimos el comportamiento predeterminado del formulario (enviar datos)
    
    const email = document.getElementById("email").value.trim();  // Obtenemos el valor del email ingresado
    const password = document.getElementById("password").value;  // Obtenemos el valor de la contraseña ingresada
    
    // Validaciones básicas para asegurarse de que ambos campos estén llenos
    if (!email || !password) {
      showMessage("Todos los campos son obligatorios", "error");  // Muestra mensaje de error si falta algún campo
      return;
    }
    
    // Obtener la lista de usuarios registrados desde localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];  // Si no hay usuarios guardados, usamos un array vacío
    // Buscar al usuario que coincida con el email y la contraseña proporcionados
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Si el usuario es encontrado, se crea la sesión sin guardar la contraseña
      const sessionUser = {
        id: user.id,  // Guardamos el ID del usuario
        nombre: user.nombre,  // Guardamos el nombre del usuario
        email: user.email,  // Guardamos el email del usuario
        tipo: user.tipo  // Guardamos el tipo de usuario (puede ser admin, regular, etc.)
      };
      
      // Guardamos la sesión en localStorage para mantener la sesión activa en futuras visitas
      localStorage.setItem("currentUser", JSON.stringify(sessionUser));
      
      showMessage("Inicio de sesión exitoso", "success");  // Mostramos un mensaje de éxito
      setTimeout(() => {
        window.location.href = "dashboard.html";  // Redirigimos al dashboard después de 1 segundo
      }, 1000);
    } else {
      // Si las credenciales son incorrectas, mostramos un mensaje de error
      showMessage("Credenciales incorrectas", "error");
    }
  });
  
  // Función para mostrar mensajes de alerta
  function showMessage(message, type) {
    messageDiv.textContent = message;  // Establecemos el texto del mensaje
    messageDiv.className = `alert-message ${type}`;  // Cambiamos la clase CSS para el tipo de mensaje (success o error)
    messageDiv.style.display = "block";  // Hacemos visible el mensaje
    
    // Ocultamos el mensaje después de 5 segundos
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
  }
});
