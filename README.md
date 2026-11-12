# Sistema de Adopción de Mascotas

[![CI](https://github.com/Demiannnnnn/petcloud-adopcion-mascotas/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Demiannnnnn/petcloud-adopcion-mascotas/actions/workflows/ci.yml)

Plataforma web para gestionar adopciones, donaciones y mascotas. El proyecto está dividido en un frontend hecho en React y un backend con microservicios en Spring Boot.

## Estructura del Proyecto

```
├── frontend/           # Aplicación React
├── backend/
│   ├── users-service/      # Servicio de usuarios (puerto 8081)
│   ├── pets-service/       # Servicio de mascotas (puerto 8082)
│   ├── adoptions-service/  # Servicio de adopciones (puerto 8083)
│   └── donations-service/  # Servicio de donaciones (puerto 8084)
├── nginx/              # Configuración y certificados SSL para proxy inverso
└── docker-compose.yml  # Orquestación de contenedores
```

## Tecnologías

**Frontend:**
- React 18
- Material UI
- React Router
- React Toastify

**Backend:**
- Java 17 (`users-service`, `pets-service`, `adoptions-service`) y Java 21 (`donations-service`)
- Spring Boot 3.5.5
- H2 Database (base de datos embebida)
- Maven Wrapper (`./mvnw`)

**Infraestructura:**
- Nginx (proxy inverso HTTPS)
- Docker y Docker Compose

## Cómo ejecutar el proyecto

### Con Docker Compose

Para construir y levantar todos los servicios (frontend, microservicios y proxy inverso Nginx):

```bash
docker compose up --build
```

Los servicios quedan disponibles en:
- Frontend / Nginx: `https://localhost` o `http://localhost`
- Frontend directo: `http://localhost:3000`
- `users-service`: `http://localhost:8081`
- `pets-service`: `http://localhost:8082`
- `adoptions-service`: `http://localhost:8083`
- `donations-service`: `http://localhost:8084`

### Ejecución Local

#### Backend

Cada servicio se ejecuta de forma independiente con Maven Wrapper. Requiere Java 17 (o Java 21 para `donations-service`).

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

#### Frontend

Requiere Node.js 18+ o 20.

1. Ir a la carpeta del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar la aplicación en modo desarrollo:
```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`.

## Cómo correr los tests

### Tests de Backend

Para ejecutar los tests unitarios y de integración de cada microservicio:

```bash
# users-service
cd backend/users-service && ./mvnw test

# pets-service
cd backend/pets-service && ./mvnw test

# adoptions-service
cd backend/adoptions-service && ./mvnw test

# donations-service (requiere Java 21)
cd backend/donations-service && ./mvnw test
```

Para ejecutar el ciclo de verificación completo (compilación + tests + empaquetado JAR):
```bash
./mvnw -B verify
```

### Tests de Frontend

Para correr la suite de tests de React:

```bash
cd frontend
npm test -- --watchAll=false
```

Para verificar la compilación de producción:
```bash
npm run build
```

## Notas

- Asegúrate de tener todos los servicios corriendo para que la aplicación funcione correctamente
- Los datos se guardan en archivos de base de datos H2 en las carpetas `data/` de cada servicio
