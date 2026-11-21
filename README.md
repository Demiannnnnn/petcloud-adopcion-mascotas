# PetCloud — Sistema de Adopción de Mascotas

Plataforma web integral para la gestión de adopciones de mascotas, campañas de donaciones, seguimiento post-adopción y comunicación entre usuarios y refugios.

El proyecto está compuesto por una aplicación cliente web en React y un ecosistema de microservicios en Spring Boot, orquestados mediante Docker Compose y expuestos a través de un proxy inverso Nginx con HTTPS.

## Estructura del Proyecto

```
├── frontend/                 # Aplicación cliente React
├── backend/
│   ├── users-service/        # Servicio de usuarios y perfiles (puerto 8081)
│   ├── pets-service/         # Servicio de mascotas y fichas médicas (puerto 8082)
│   ├── adoptions-service/    # Servicio de solicitudes de adopción y chats (puerto 8083)
│   └── donations-service/    # Servicio de donaciones y pagos Mercado Pago (puerto 8084)
├── nginx/                    # Configuración de Nginx reverse proxy y SSL
├── docker-compose.yml        # Orquestación de contenedores
├── generate-nginx-ssl.sh     # Generación de certificados SSL de desarrollo
└── .env.example              # Plantilla de variables de entorno
```

## Tecnologías

**Frontend:**
- React 18
- React Router v7
- React Toastify
- Webpack Dev Server

**Backend:**
- Java 17
- Spring Boot 3.5.5
- Spring Data JPA / Hibernate
- H2 Database (embebida para desarrollo local) / MySQL (producción)
- Mercado Pago Java SDK
- Maven Wrapper (`./mvnw`)

**Infraestructura:**
- Docker & Docker Compose
- Nginx Alpine (Reverse Proxy con TLS v1.2/1.3)

---

## Cómo ejecutar el proyecto

### Opción 1: Con Docker Compose (Recomendada)

Requiere tener instalados **Docker** y **Docker Compose**.

1. **Generar los certificados SSL locales para Nginx:**
   ```bash
   ./generate-nginx-ssl.sh
   ```

2. **Configurar las variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   *(Opcional: edita `.env` si deseas configurar tu `MERCADOPAGO_ACCESS_TOKEN` u otros parámetros).*

3. **Construir y levantar todos los servicios:**
   ```bash
   docker compose up --build
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador en `https://localhost`.
   *(Al ser un certificado autofirmado para desarrollo, acepta la advertencia del navegador para continuar).*

---

### Opción 2: Ejecución local por componentes

#### Backend
Requiere Java 17 instalado. Cada microservicio puede ejecutarse de manera independiente:

1. Ingresar a la carpeta del servicio:
   ```bash
   cd backend/users-service
   ```
2. Ejecutar con Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Repetir para los demás microservicios en terminales separadas:
   - `backend/pets-service` (puerto 8082)
   - `backend/adoptions-service` (puerto 8083)
   - `backend/donations-service` (puerto 8084)

Cada servicio utiliza su propia base de datos H2 persistida en la carpeta `data/` correspondiente.

#### Frontend
Requiere Node.js (>= 18) y npm instalados:

1. Ingresar a la carpeta:
   ```bash
   cd frontend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo:
   ```bash
   npm start
   ```
4. Abrir `http://localhost:3000`.

---

## Verificación y Tests

- **Tests unitarios del frontend:**
  ```bash
  cd frontend && CI=true npm test -- --watchAll=false
  ```
- **Compilación de producción del frontend:**
  ```bash
  cd frontend && npm run build
  ```
- **Tests del backend:**
  ```bash
  cd backend/<servicio> && ./mvnw test
  ```

---

## Variables de Entorno

Consulta `.env.example` para la lista completa de variables configurables:
- `DB_USERNAME`: Usuario de la base de datos (por defecto `sa` en desarrollo).
- `DB_PASSWORD`: Contraseña de la base de datos.
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acceso de la API de Mercado Pago para procesar donaciones.
- `PETS_API_BASE`: Endpoint interno del servicio de mascotas.
- `USERS_API_BASE`: Endpoint interno del servicio de usuarios.
- `APP_FRONTEND_URL`: URL del frontend para callbacks y redirecciones.
