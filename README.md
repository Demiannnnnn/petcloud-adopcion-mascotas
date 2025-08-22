# Sistema de Adopción de Mascotas

Este proyecto es una aplicación completa para la gestión profesional de adopciones de mascotas, compuesta por un backend (Spring Boot) y un frontend (React).

## Requisitos previos
- Java 17 o superior
- Maven
- Node.js (v18 o superior recomendado) y npm

---

## Instalación y ejecución

### 1. Backend (Spring Boot)

1. Abre una terminal y navega a la carpeta `backend`:
   ```
   cd backend
   ```
2. Instala dependencias y compila:
   ```
   mvn clean install
   ```
3. Inicia el servidor:
   ```
   mvn spring-boot:run
   ```
   El backend quedará disponible en: http://localhost:8080

#### Errores comunes backend
- **Error de versión de Java:** Asegúrate de tener Java 17+ y que esté en el PATH.
- **Puerto 8080 ocupado:** Cambia el puerto en `src/main/resources/application.properties` agregando:
  ```
  server.port=8081
  ```

---

### 2. Frontend (React)

1. Abre otra terminal y navega a la carpeta `frontend`:
   ```
   cd frontend
   ```
2. Instala dependencias:
   ```
   npm install
   ```
3. Inicia la aplicación:
   ```
   npm start
   ```
   El frontend quedará disponible en: http://localhost:3000

#### Errores comunes frontend
- **Errores de dependencias:** Ejecuta de nuevo `npm install`.
- **Puerto 3000 ocupado:** npm te preguntará si quieres usar otro puerto.
- **No carga datos:** Asegúrate de que el backend esté corriendo y ambos usen `localhost`.

---

### 3. Acceso y pruebas
- Abre http://localhost:3000 en tu navegador.
- Puedes acceder a la consola H2 en http://localhost:8080/h2-console  
  JDBC URL: `jdbc:h2:mem:testdb`  
  Usuario: `sa`  
  Contraseña: (dejar en blanco)

---

### 4. Solución de problemas
- Revisa la terminal donde ejecutaste el backend o frontend para ver mensajes de error.
- Si tienes dudas, copia el error y consúltalo para obtener ayuda.

---

## Estructura del proyecto

- `/backend`: API REST Spring Boot
- `/frontend`: SPA React

---

## Créditos
Desarrollado por Diego y colaboradores.
