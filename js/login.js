document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector(".login-form");
    const messageDiv = document.createElement("div");
    messageDiv.className = "alert-message";
    loginForm.parentNode.insertBefore(messageDiv, loginForm.nextSibling);
  
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
  
      // Validaciones básicas
      if (!email || !password) {
        showMessage("Todos los campos son obligatorios", "error");
        return;
      }
  
      // Obtener usuarios registrados
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(u => u.email === email && u.password === password);
  
      if (user) {
        // Crear sesión (sin guardar la contraseña)
// Modifica la creación de la sesión:
        const sessionUser = {
            id: user.id,
            nombre: user.nombre, // Asegúrate de guardar el nombre
            email: user.email,
            tipo: user.tipo
        };
        
        localStorage.setItem("currentUser", JSON.stringify(sessionUser));
        
        showMessage("Inicio de sesión exitoso", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        showMessage("Credenciales incorrectas", "error");
      }
    });
  
    function showMessage(message, type) {
      messageDiv.textContent = message;
      messageDiv.className = `alert-message ${type}`;
      messageDiv.style.display = "block";
      
      setTimeout(() => {
        messageDiv.style.display = "none";
      }, 5000);
    }
  });