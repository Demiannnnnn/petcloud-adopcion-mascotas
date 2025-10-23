// cypress/e2e/dashboard.cy.js

describe('Pruebas de la Página Principal (Dashboard) - PetCloud', () => {

  // --- ¡ESTO ES MUY IMPORTANTE! ---
  // El bloque 'beforeEach' se ejecuta ANTES de cada 'it' en este archivo.
  // Usamos esto para loguearnos y tener una sesión activa.
    beforeEach(() => {
        // 1. Visita la página de login
        cy.visit('http://localhost:3000/login');

        // 2. Rellena el login (con un usuario que SÍ exista)
        cy.get('input[placeholder="Ej: 12.345.678-9"]')
        .type('12.345.678-9'); // Usa un RUT real de tu BD
        cy.get('input[placeholder="Contraseña"]')
        .type('12345678'); // Usa una clave real

        // 3. Clic en "Iniciar sesión"
        cy.contains('Iniciar sesión').click();

        // --- ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE! ---
        // 4. VERIFICA QUE LLEGAMOS (La forma robusta)
        // Borra la línea de cy.url() y reemplázala por esta:
        // Espera a que un elemento ÚNICO de la página principal sea visible.
        cy.contains('Mis Mascotas').should('be.visible');
    });


  // --- Ahora sí, las pruebas del dashboard ---

  it('Debería mostrar la bienvenida y las mascotas', () => {
    
    // Verifica el mensaje de bienvenida
    // (Usamos 'include' para no depender del nombre exacto)
    cy.contains('bienvenido a petcloud', { matchCase: false }).should('be.visible');

    // Verifica el botón de registrar mascota
    cy.contains('+ Registrar Mascota').should('be.visible');

    // Verifica que las tarjetas de mascotas cargaron
    cy.contains('lil pepe').should('be.visible');
    cy.contains('Mati').should('be.visible');
  });


  it('Debería filtrar mascotas al usar la barra de búsqueda', () => {
    
    // 1. Escribe "lil pepe" en la barra de búsqueda
    cy.get('input[placeholder="Buscar mascotas..."]').type('lil pepe');

    // 2. Verifica que "lil pepe" es visible
    cy.contains('lil pepe').should('be.visible');
    
    // 3. Verifica que "Mati" desapareció
    cy.contains('Mati').should('not.exist');
  });


  it('Debería filtrar mascotas al hacer clic en los botones de categoría', () => {
    
    // 1. Haz clic en "Otros"
    // (Asumiendo que "Mati" es de categoría "Otro")
    cy.contains('Otros').click({ force: true });

    // 2. Verifica que "Mati" es visible
    cy.contains('Mati').should('be.visible');

    // 3. Verifica que "lil pepe" (que es "Perro") desapareció
    cy.contains('lil pepe').should('not.exist');
  });

});