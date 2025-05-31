/// <reference types="Cypress" />

describe('logg inn and navigate to the team calendar and check for corect mesagetoast massage', () => {
  it('passes', () => {
    cy.visit('http://localhost:8080/index.html');
    cy.get('#container-databinding---home--idUserNameInput-inner').clear();
    cy.get('#container-databinding---home--idUserNameInput-inner').type('Jon');
    cy.get('#container-databinding---home--idPasswordLoginInput-inner').clear();
    cy.get('#container-databinding---home--idPasswordLoginInput-inner').type('jao');
    cy.get('#container-databinding---home--idLogInButton').click();
    cy.wait(100);
    cy.get('.sapMMessageToast').should('not.have.text', 'Invalid Credentials');
    cy.get('#container-databinding---LanuchPad--idTeeamCalendarGenericTile').click();
    cy.get('.sapMMessageToast').should('have.text', 'Appointments loaded successfullyHolidays loaded successfully');
  });
});

describe('logg inn and navigate to the team calendar and check the legend popover works', () => {
  it('passes', () => {
    cy.visit('http://localhost:8080/index.html');
    cy.get('#container-databinding---home--idUserNameInput-inner').clear();
    cy.get('#container-databinding---home--idUserNameInput-inner').type('Jon');
    cy.get('#container-databinding---home--idPasswordLoginInput-inner').clear();
    cy.get('#container-databinding---home--idPasswordLoginInput-inner').type('jao');
    cy.get('#container-databinding---home--idLogInButton').click();
    cy.wait(100);
    cy.get('.sapMMessageToast').should('not.have.text', 'Invalid Credentials');
    cy.get('#container-databinding---LanuchPad--idTeeamCalendarGenericTile').click();
    cy.get('.sapMMessageToast').should('have.text', 'Appointments loaded successfullyHolidays loaded successfully');

    /* ==== Generated with Cypress Studio ==== */
cy.get('#container-databinding---TeamCalendar--legendButton-BDI-content').click();
// cy.get('#container-databinding---TeamCalendar--legendButton-content').click();
// cy.get('#container-databinding---TeamCalendar--legendPopover-intHeader-BarPH').should('be.visible');
/* ==== End Cypress Studio ==== */
  });
});