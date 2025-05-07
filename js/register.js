document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById("registerForm");
    const messageDiv = document.getElementById("registerMessage");
  
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmar = document.getElementById("confirmar").value;
  
      // Validaciones
      if (!nombre || nombre.length < 3) {
        showMessage("El nombre debe tener al menos 3 caracteres", "error");
        return;
      }
  
      if (!validateEmail(email)) {
        showMessage("Ingresa un email válido", "error");
        return;
      }
  
      if (password.length < 6) {
        showMessage("La contraseña debe tener al menos 6 caracteres", "error");
        return;
      }
  
      if (password !== confirmar) {
        showMessage("Las contraseñas no coinciden", "error");
        return;
      }
  
      // Verificar si el usuario ya existe
      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.some(user => user.email === email)) {
        showMessage("Este email ya está registrado", "error");
        return;
      }
  
      // Crear nuevo usuario
// En la función de registro, cambia esto:
    const newUser = {
    id: Date.now().toString(),
    nombre, // Asegúrate que esto viene del formulario
    email,
    password,
    tipo: "emprendedor",
    fechaRegistro: new Date().toISOString()
  };
  
      // Guardar usuario
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Mostrar éxito y redirigir
      showMessage("¡Registro exitoso! Redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    });
  
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    function showMessage(message, type) {
      messageDiv.textContent = message;
      messageDiv.className = `alert-message ${type}`;
      messageDiv.style.display = "block";
      
      setTimeout(() => {
        messageDiv.style.display = "none";
      }, 5000);
    }
  });