# PetCloud - Guía para Agentes

PetCloud es una plataforma web para la gestión integral de adopciones de mascotas, campañas de donación y seguimiento post-adopción, compuesta por microservicios en Spring Boot y un cliente web en React tras un proxy inverso Nginx.

## Stack Tecnológico

- **Frontend:** React 18, React Router v7, React Toastify, Webpack Dev Server.
- **Backend:** Java 17, Spring Boot 3.5.5, Spring Data JPA / Hibernate, H2 Database (desarrollo) / MySQL (producción), Mercado Pago SDK.
- **Infraestructura:** Docker & Docker Compose, Nginx (Reverse Proxy HTTPS con TLS v1.2/1.3).

## Estructura del Repositorio

- `frontend/`: Código fuente de la interfaz web React (SPA).
- `backend/users-service/`: Microservicio de usuarios, perfiles (personas/empresas) y autenticación (puerto 8081).
- `backend/pets-service/`: Microservicio de catálogo de mascotas, vacunas, fotos e historial clínico (puerto 8082).
- `backend/adoptions-service/`: Microservicio de solicitudes de adopción, chats y notificaciones (puerto 8083).
- `backend/donations-service/`: Microservicio de donaciones monetarias e insumos, integración Mercado Pago (puerto 8084).
- `nginx/`: Configuración del proxy inverso y terminación SSL.
- `generate-nginx-ssl.sh`: Script para generar certificados SSL autofirmados locales.

## Comandos de Verificación y Ejecución

### Frontend
- **Instalación:** `cd frontend && npm install`
- **Tests unitarios:** `cd frontend && CI=true npm test -- --watchAll=false`
- **Build / Lint:** `cd frontend && npm run build`
- **Desarrollo:** `cd frontend && npm start`

### Backend (por microservicio)
- **Ejecución local:** `cd backend/<servicio> && ./mvnw spring-boot:run`
- **Tests:** `cd backend/<servicio> && ./mvnw test`
- **Empaquetado:** `cd backend/<servicio> && ./mvnw clean package -DskipTests`

### Despliegue con Docker Compose
1. Generar certificados SSL: `./generate-nginx-ssl.sh`
2. Configurar entorno: `cp .env.example .env`
3. Iniciar servicios: `docker compose up --build`
4. Acceso web seguro: `https://localhost` (puerto 80 redirige a 443)

## Convenciones de Código

- **Frontend:** Componentes funcionales en `frontend/src/components` y vistas en `frontend/src/pages`. Estilos globales en `globals.css` y específicos por componente. Evitar mezclar operadores `&&` y `||` sin paréntesis explícitos (`no-mixed-operators`).
- **Backend:** Arquitectura por capas (`controller`, `service`, `repository`, `model`). Inyección de dependencias con Spring. Evitar `System.out.println`; utilizar SLF4J (`log.info`, `log.error`).
- **Commits:** Seguir Conventional Commits en inglés (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## Reglas de Seguridad

- **Cero secretos en código:** Nunca versionar contraseñas, tokens de API ni credenciales privadas.
- **Variables de entorno:** Inyectar parámetros sensibles mediante variables de entorno idiomáticas (`${VAR:default}`). Documentar variables en `.env.example` con el placeholder `CHANGE_ME`.
- **Exclusiones de Git:** Archivos `.env`, llaves privadas (`*.key`, `*.pem`) y certificados SSL locales NUNCA se suben al repositorio.

## Flujo Git

- Trabajar únicamente en ramas temáticas `dev/*` (ej. `dev/nueva-funcionalidad`, `dev/cleanup-2026-11`).
- Los cambios se integran exclusivamente hacia la rama `develop-AGENTS`.
- **PROHIBIDO** hacer merge o push directo hacia `main` o `develop`.
