/// <reference types="Cypress" />

describe('logg inn see the lanchpad sucsessful and click the tile', () => {
  beforeEach(() => {
    // run these tests as if in a desktop
    // browser with a 720p monitor
    cy.viewport(1280, 720)
  })
  it('passes', () => {
    cy.visit('http://localhost:8080/index.html');
    cy.get('#__component0---main--idUserNameInput-inner').clear();
    cy.get('#__component0---main--idUserNameInput-inner').type('Jon');
    cy.get('#__component0---main--idPasswordLoginInput-inner').clear();
    cy.get('#__component0---main--idPasswordLoginInput-inner').type('jao');
    cy.get('#__component0---main--idLogInButton-inner').click();
    cy.wait(100);
    cy.get('.sapMMessageToast').should('not.have.text', 'Invalid Credentials');
    cy.get('#container-databinding---LanuchPad--idTeeamCalendarGenericTile').should('be.visible');
    cy.get('#container-databinding---LanuchPad--idTeeamCalendarGenericTile').click();
  });
});