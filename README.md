# Sistema de Adopción de Mascotas

Plataforma web para gestionar adopciones, donaciones y mascotas. El proyecto está dividido en un frontend hecho en React y un backend con microservicios en Spring Boot.

## Estructura del Proyecto

```
├── frontend/           # Aplicación React
├── backend/
│   ├── users-service/      # Servicio de usuarios (puerto 8081)
│   ├── pets-service/       # Servicio de mascotas (puerto 8082)
│   ├── adoptions-service/  # Servicio de adopciones (puerto 8083)
│   └── donations-service/  # Servicio de donaciones (puerto 8084)

## Tecnologías

**Frontend:**
- React 18
- Material UI
- React Router
- React Toastify

**Backend:**
- Java 17
- Spring Boot 3.5.5
- H2 Database (base de datos embebida)
- Maven

## Cómo ejecutar el proyecto

### Backend

Cada servicio se ejecuta de forma independiente. Necesitas tener Java 17 instalado.

1. Ir a la carpeta de cada servicio:
```bash
cd backend/users-service
```

2. Ejecutar el servicio con Maven:
```bash
./mvnw spring-boot:run
```

3. Repetir el proceso para los otros servicios:
   - `pets-service` (puerto 8082)
   - `adoptions-service` (puerto 8083)
   - `donations-service` (puerto 8084)

Los servicios levantarán sus propias bases de datos H2 automáticamente.

### Frontend

Necesitas tener Node.js instalado.

1. Ir a la carpeta del frontend:
```bash
cd frontend
```

2. Instalar dependencias (solo la primera vez):
```bash
npm install
```

3. Ejecutar la aplicación:
```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## Notas

- El frontend está configurado para conectarse al servicio de usuarios en el puerto 8081
- Asegúrate de tener todos los servicios corriendo para que la aplicación funcione correctamente
- Los datos se guardan en archivos de base de datos H2 en las carpetas `data/` de cada servicio
