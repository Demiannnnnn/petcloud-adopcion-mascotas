// cypress/e2e/login.cy.js

// 'describe' agrupa tus pruebas
describe('Prueba de la página de Login - PetCloud', () => {

  // 'it' es una prueba individual
  it('Debería cargar la página y mostrar los elementos correctos', () => {
    
    // 1. Visita tu página
    cy.visit('http://localhost:3000/login'); 

    // 2. Verifica que el logo (o texto) 'PetCloud' esté visible
    cy.get('img[alt="PetCloud Logo"]').should('be.visible');    
    // 3. Verifica que el botón de 'Iniciar sesión' exista
    cy.contains('Iniciar sesión').should('be.visible');

    // 4. Verifica que el input de RUT exista (usando su placeholder)
    cy.get('input[placeholder="Ej: 12.345.678-9"]').should('be.visible');
  });


  // --- Esta es la prueba de "presionar botones" ---
  it('Debería rellenar el formulario, hacer clic y loguearse', () => {
    
    // 1. Visita tu página
    cy.visit('http://localhost:3000/login'); 

    // 2. Encuentra el input de RUT y escribe en él
    cy.get('input[placeholder="Ej: 12.345.678-9"]')
      .type('12.345.678-9'); // Escribe un RUT de prueba

    // 3. Encuentra el input de Contraseña y escribe
    cy.get('input[placeholder="Contraseña"]')
      .type('12345678'); // Escribe una clave de prueba

    // 4. ¡Presiona el botón!
    // Busca el botón por su texto "Iniciar sesión" y hazle clic
    cy.contains('Iniciar sesión').click();

    // 5. ¡Verifica el resultado!
    // (Esto es un ejemplo, ajústalo a tu app)
    
    // Opción A: Verificar que te redirigió a otra página
    cy.url().should('include', '/principal');

    // Opción B: Verificar que apareció un texto de bienvenida
    // cy.contains('Bienvenido, Demian'); // O el texto que muestres
  });


  // --- Prueba extra para los toggles ---
  it('Debería cambiar entre "Persona" y "Empresa"', () => {
    
    cy.visit('http://localhost:3000/login');

    // 1. Clic en "Empresa"
    cy.contains('Empresa').click();
    
    // (Aquí podrías verificar que el estilo cambió o que el input de RUT cambió)

    // 2. Clic en "Persona" para volver
    cy.contains('Persona').click();

    // (Y verificar que volvió al estado inicial)
  });

});