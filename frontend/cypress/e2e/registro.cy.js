// cypress/e2e/registro.cy.js

function generarRutValido() {
  const rutBase = Math.floor(Math.random() * (20000000 - 5000000) + 5000000);
  let M = 0, S = 1;
  for (let T = rutBase; T; T = Math.floor(T / 10)) {
    S = (S + T % 10 * (9 - M++ % 6)) % 11;
  }
  const dv = S ? S - 1 : 'K';
  return `${rutBase}-${dv}`;
}

describe('Pruebas del Formulario de Registro - PetCloud', () => {

  it('Debería permitir a un usuario nuevo registrarse', () => {
    
    // --- ¡AÑADE ESTA LÓGICA! ---
    // 1. Genera un ID único basado en la fecha y hora
    const randomId = Date.now(); // Ej: 1678886400000

    // 2. Crea un RUT y Email únicos usando ese ID
    const rutUnico = generarRutValido();
    const emailUnico = `prueba-${randomId}@correo.com`;
    const telefonoUnico = Math.random().toString().slice(2, 10);

    // 3. Visita la página
    cy.visit('http://localhost:3000/registro');

    // 4. Rellena los campos con los datos ÚNICOS
    cy.get('input[placeholder="Ej: 12.345.678-9"]').type(rutUnico); // <- USA EL RUT ÚNICO
    cy.get('input[placeholder="Nombre completo"]').type('Usuario de Prueba');
    cy.get('input[placeholder="Correo electrónico"]').type(emailUnico); // <- USA EL EMAIL ÚNICO
    cy.get('input[placeholder="Contraseña"]').type('clave-muy-segura-123');
    cy.get('input[placeholder="Ciudad, Región"]').type('Curicó, Maule');
    cy.get('input[placeholder="12345678"]').type(telefonoUnico);
    cy.get('input[type="date"]').type('1990-10-10');
    
    cy.get('textarea[placeholder*="Describe tu hogar"]')
      .type('Tengo una casa grande con patio.');

    // 5. ¡Presiona el botón!
    cy.contains('Registrarse').click();
    cy.contains('Registro exitoso. Redirigiendo a inicio de sesión...');

    // 6. Verifica el resultado
    cy.url().should('include', '/login'); 
  });

  // Esta prueba simula un "camino triste" (sad path)
  it('Debería mostrar errores de validación si los campos están vacíos', () => {
    
    cy.visit('http://localhost:3000/registro');

    // 1. Intenta enviar el formulario vacío
    cy.contains('Registrarse').click();

    // 2. Verifica que aparezca un mensaje de error
    // (¡Debes cambiar 'El RUT es obligatorio' por el mensaje real de tu app!)
    cy.contains('Completa todos los campos.'); 
  });

});