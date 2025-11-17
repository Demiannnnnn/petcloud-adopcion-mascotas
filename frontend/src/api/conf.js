const API_CONFIG = {
    // Asumiendo que el users-service corre en 8081 (como en el ejemplo de arriba)
    USERS_API_BASE: 'http://localhost:8081/api',
    // Asumiendo que adoptions-service corre en 8082
    ADOPTIONS_API_BASE: 'http://localhost:8082/api',
    // Y así para los demás servicios...
    PETS_API_BASE: 'http://localhost:8083/api',
    DONATIONS_API_BASE: 'http://localhost:8084/api',
};

export default API_CONFIG;