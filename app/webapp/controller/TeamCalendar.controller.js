sap.ui.define([
   "./BaseController",
   "sap/m/library",
   "sap/m/ObjectAttribute",
   'sap/m/MessageToast',
   "sap/m/MessageBox",
   'sap/ui/core/format/DateFormat',
   'sap/ui/core/date/UI5Date',
   "sap/ui/model/json/JSONModel",
   "sap/ui/core/Fragment",
   "sap/ui/unified/DateTypeRange",
   "sap/ui/model/odata/v4/ODataModel",
   'sap/m/Label',
   'sap/m/Popover',
   'sap/ui/core/library',
   'sap/base/Log',
], function (BaseController, mobileLibrary, ObjectAttribute, MessageToast, MessageBox, DateFormat, UI5Date, JSONModel, Fragment, DateTypeRange, ODataModel, Label, Popover, coreLibrary, Log) {
   "use strict";

   // Hent ValueState for input validering
   const ValueState = coreLibrary.ValueState;

   return BaseController.extend("fagprove.controller.TeamCalendar", {
      _createAppointmentDialog: null,
      _appointmentCreateModel: null, // Ny modell for create-dialogen


      onInit: function () {
         const router = this.getRouter();
         router.getRoute("teamcalendar").attachMatched(this.onRouteMatched, this);
         this.legendPopover = null; // Will store legend popover instance

         // Initialize models if they don't exist
         if (!this.getView().getModel("calendarData")) {
            this.getView().setModel(new JSONModel(), "calendarData");
         }

         if (!this.getView().getModel("holidays")) {
            this.getView().setModel(new JSONModel([]), "holidays");
         }

         // State model for handling UI states
         const stateModel = new JSONModel({
            isLoading: false,
            currentYear: new Date().getFullYear(),
            selectedAppointment: null,
            isCreateDialogSaveEnabled: false // For å styre Lagre-knappen

         });

         this.getView().setModel(stateModel, "state");

         // Initialiser modellen for create-dialogen
         this._appointmentCreateModel = new JSONModel({
            personId: null,
            deputyId: null,
            startDate: null,
            endDate: null
         });
      },

      onExit: function () {
         if (this._createAppointmentDialog) {
            this._createAppointmentDialog.destroy();
            this._createAppointmentDialog = null;
         }
         if (this.detailsPopover) {
            this.detailsPopover.destroy();
            this.detailsPopover = null;
         }
         if (this.legendPopover) {
            this.legendPopover.destroy();
            this.legendPopover = null;
         }
      },

      onRouteMatched: async function () {
         const date = new Date();
         const year = date.getFullYear();
         await this.fetchLeaderEmpAppointments(year);
         await this.fetchHolidaysList(year);
         await this.initializeHolidays();
      },

      fetchHolidaysList: async function (year) {
         return new Promise((resolve, reject) => {
            try {
               const model = this._createODataModel("/odata/v4/holidays/");

               // Create a context for the function import
               const context = model.bindContext(`/GetHolidays`);

               context.requestObject()
                  .then((result) => {
                     if (result && result.value) {
                        // Format each holiday date
                        result.value.forEach(date => {
                           date.date = UI5Date.getInstance(date.date);
                        });
                     } else {
                        throw new Error("Ingen feriedatoer returnert");
                     }

                     // Set the model
                     const holidayDataModel = new JSONModel(result.value);
                     this.getView().setModel(holidayDataModel, "holidays");

                     MessageToast.show("Feriedager lastet inn", {
                        duration: 2000,
                        offset: "0 -80",
                     });

                     resolve(result.value);
                  })
                  .catch((error) => {
                     console.error("Feil ved henting av feriedager:", error);
                     MessageToast.show("Feil ved lasting av feriedager");
                     reject(error);
                  });
            } catch (error) {
               reject(error);
            }
         });
      },


      initializeHolidays: async function () {
         const planningCalendar = this.byId("idPlanningCalendar");
         if (!planningCalendar) {
            console.error("Planning calendar not found!");
            return;
         }

         const norwegianHolidays = await this.getView().getModel("holidays").getData() || [];
         // Create special date ranges for holidays
         norwegianHolidays.forEach(holiday => {
            if (!holiday.date) {
               console.warn("Invalid holiday date found:", holiday);
               return;
            }

            const dateTypeRange = new DateTypeRange({
               startDate: holiday.date,
               endDate: holiday.date,
               type: holiday.type,//"NonWorking", // will show as non-working day
               tooltip: holiday.text
            });
            planningCalendar.addSpecialDate(dateTypeRange);
         });
      },


      // Appointments API call
      fetchLeaderEmpAppointments: async function (year) {

         return new Promise((resolve, reject) => {
            try {
               const rootModel = this.getView().getModel();
               const leaderID = rootModel.getProperty("/leaderId");

               if (!leaderID) {
                  reject(new Error("Leder-ID mangler"));
                  return;
               }

               const model = this._createODataModel("/odata/v4/calendar/");

               // Create context for the function call
               const context = model.bindContext(`/GetEmploeyAppointments(leader_ID='${leaderID}',year=${year})`);

               context.requestObject()
                  .then((result) => {
                     // Validate result
                     if (!result || !result.value || !result.value[0]) {
                        throw new Error("Ingen avtaler returnert");
                     }

                     // Format dates in the API response
                     const data = result.value[0];

                     // Format startDate
                     if (data.startDate) {
                        data.startDate = new Date(data.startDate);
                     }

                     // Format each person's appointment dates
                     if (data.people) {
                        data.people.forEach(person => {
                           if (person.appointments) {
                              person.appointments.forEach(appointment => {
                                 appointment.start = new Date(appointment.start);
                                 appointment.end = new Date(appointment.end);
                              });
                           }
                        });
                     }

                     // Set the model
                     const calendarData = this.getView().getModel("calendarData");
                     calendarData.setData(data);

                     MessageToast.show("Avtaler lastet inn", { offset: "0 -5" });
                     resolve(data);
                  })
                  .catch((error) => {
                     console.error("Feil ved henting av avtaler:", error);
                     MessageToast.show("Feil ved lasting av avtaler");
                     reject(error);
                  });
            } catch (error) {
               reject(error);
            }
         });
      },



      // On the click of a appointment get the data of the of the appointment
      onPlanningCalendarAppointmentSelect: function (event) {
         const appointment = event.getParameter("appointment");
         if (appointment) {
            // const stateModel = this.getView().getModel("state");
            // stateModel.setProperty("/selectedAppointment", appointment);

            this.handleSingleAppointment(appointment);
         }
      },


      handleSingleAppointment: async function (appointment) {
         // Close detail popover if appointment is not selected
         if (!appointment.getSelected() && this.detailsPopover) {
            this.detailsPopover.close();
            // this.detailsPopover = null;
            return;
         }

         if (!appointment) {
            return;
         }

         try {
            // If there is no details popover loaded then load it
            if (!this.detailsPopover) {
               this.detailsPopover = await Fragment.load({
                  id: this.getView().getId(),
                  name: "fagprove.view.Details",
                  controller: this
               });

               this.getView().addDependent(this.detailsPopover);
            }

            // Set content and open popover
            this.setDetailsDialogContent(appointment, this.detailsPopover);
         } catch (error) {
            console.error("Feil ved lasting av detaljfragment:", error);
            MessageBox.error("Kunne ikke vise avtaledetaljer");
         }
      },





      // Add content and oppen popover
      setDetailsDialogContent: function (appointment, detailsPopover) {
         // Get the binding context of the appointment from the "calendarData" model
         const bindingContext = appointment.getBindingContext("calendarData");
         if (bindingContext) {
            // Bind the data to the popover and open it  
            detailsPopover.setBindingContext(bindingContext, "calendarData");
            detailsPopover.openBy(appointment);
         } else {
            console.warn("No valid binding context found for appointment  ");
            MessageToast.show("Kunne ikke vise avtaledetaljer");
         }
      },


      // Formater for date in the fragment when click on appointment
      formatDate: function (date) {
         if (!date) {
            return "";
         }
         try {
            const iHours = date.getHours(),
               iMinutes = date.getMinutes(),
               iSeconds = date.getSeconds();

            if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
               return DateFormat.getDateTimeInstance({ style: "medium" }).format(date);
            } else {
               return DateFormat.getDateInstance({ style: "medium" }).format(date);
            }
         } catch (e) {
            console.error("Error formatting date:", e);
            return "";
         }
      },

      // Formatter for showing or not showing text in fragment
      fragmentVisiblelStatusFormatter: function (status) {
         if (status != null || status != undefined) {
            return true;
         } else if (status === null || status === undefined) {
            return false;
         } else {
            console.warn("Not a string or null or undefined what are you?   ", typeof status);
         }
      },

      // Formater uper case first letere in name
      userNameCalendar: async function (userName) {
         const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);
         const calendar = this.getView().getModel("i18n").getResourceBundle().getText("calendarText");
         return ` ${capitalized} ${await calendar}`;
      },

      onShowLegendButtonPress: function (event) {
         // Get the button that triggered the event
         const button = event.getSource();

         // Check if we already have a popover
         if (!this.legendPopover) {
            // Create popover
            Fragment.load({
               id: this.getView().getId(),
               name: "fagprove.view.LegendPopover",
               controller: this
            }).then((popover) => {
               this.getView().addDependent(popover);
               this.legendPopover = popover;
               this.legendPopover.openBy(button);
            }).catch((error) => {
               console.error("Feil ved lasting av legendefragment:", error);
               MessageBox.error("Kunne ikke vise legende");
            });
         } else {
            // If popover already exists toggle its visibility
            if (this.legendPopover.isOpen()) {
               this.legendPopover.close();
            } else {
               this.legendPopover.openBy(button);
            }
         }
      },


      // Helper method to create OData model with auth header
      _createODataModel: function (serviceUrl) {
         const rootModel = this.getView().getModel();
         const logInName = rootModel.getProperty("/userName");
         const pw = rootModel.getProperty("/password");
         const authHeader = "Basic " + btoa(`${logInName}:${pw}`);

         // Create the OData model
         const model = new ODataModel({ serviceUrl: serviceUrl });

         // Set the Authorization header
         model.changeHttpHeaders({ "Authorization": authHeader });

         return model;
      },




      onButtonCreateAppointmentPress: async function () {
         if (!this._createAppointmentDialog) {
            try {
               this._createAppointmentDialog = await Fragment.load({
                  id: this.getView().getId(), // VIKTIG: Bruk viewets ID
                  name: "fagprove.view.Create",
                  controller: this
               });
               this.getView().addDependent(this._createAppointmentDialog);
               this._createAppointmentDialog.setModel(this._appointmentCreateModel, "create");
               this._createAppointmentDialog.setModel(this.getView().getModel("calendarData"), "calendarData");
            } catch (error) {
               Log.error("Kunne ikke laste Create.fragment.xml", error);
               // Forbedret feilmelding for brukeren
               let userMessage = "En feil oppstod ved åpning av dialogen for å opprette avtale.";
               if (error && error.message && error.message.includes("parsererror")) {
                  userMessage = "Det er en feil i XML-strukturen til Create-dialogen. Vennligst sjekk konsollen for detaljer.";
                  console.error("XML Parsing Error details:", error.message); // Logg den fulle parserfeilen
               } else if (error && error.message) {
                  userMessage += ` Detaljer: ${error.message}`;
               }
               MessageBox.error(userMessage);
               return;
            }
         }
         this._prepareCreateDialog(); // Forbereder modellen og UI-tilstand
         this._createAppointmentDialog.open();
      },

      _prepareCreateDialog: function () {
         this._appointmentCreateModel.setData({
            personId: null,
            deputyId: null,
            startDate: null,
            endDate: null
         });
         // this._appointmentCreateModel.refresh(true);

         // Nå som fragmentet er lastet med viewets ID, skal this.byId() fungere
         const personSelect = this.byId("idPeopleEmployeeSelect"); // ID fra fragment
         if (personSelect) personSelect.setValueState(ValueState.None);

         const deputySelect = this.byId("idPeopleDeputySelect"); // ID fra fragment
         if (deputySelect) deputySelect.setValueState(ValueState.None);

         const startDatePicker = this.byId("idStartDateDateTimePicker"); // ID fra fragment
         if (startDatePicker) startDatePicker.setValueState(ValueState.None);

         const endDatePicker = this.byId("idEndDateDateTimePicker"); // ID fra fragment
         if (endDatePicker) endDatePicker.setValueState(ValueState.None);

         this.getView().getModel("state").setProperty("/isCreateDialogSaveEnabled", false);
      },


      onDialogInputChange: function () {
         this._validateCreateDialogInputs();
      },


      handleDialogSaveButton: async function () {
         if (!this._validateCreateDialogInputs()) {
            MessageBox.error("Vennligst korriger feltene med feil.");
            return;
         }

         const createData = this._appointmentCreateModel.getData();
         const startDate = createData.startDate;
         const endDate = createData.endDate;

         if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
            MessageBox.error("Ugyldig datoformat. Velg gyldige datoer.");
            Log.error("startDate or endDate from model is not a valid Date object", { start: startDate, end: endDate });
            return;
         }

         const deputyPayload = {
            person_ID: createData.personId,
            deputy_ID: createData.deputyId,
            start: startDate, // Sendes som JS Date, ODataModel serialiserer
            end: endDate,
         };


         const dataModel = this._createODataModel("/odata/v4/deputy/");
         if (!dataModel) {
            MessageBox.error("Kunne ikke koble til datatjenesten. Sjekk konfigurasjon og nettverk.");
            return;
         }
         const listBinding = dataModel.bindList("/Deputies");
         this.getView().setBusy(true);
         let saveSuccess = false; // Flagg for å styre lukking

         try {

            await listBinding.create(deputyPayload).created()

            MessageToast.show("Ny stedfortrederavtale lagret!");
            saveSuccess = true; // Sett flagg for suksess
            
            const currentYear = this.getView().getModel("state").getProperty("/currentYear");
            await this.fetchLeaderEmpAppointments(currentYear); // Last inn avtaler på nytt

         } catch (error) {
            Log.error("Feil ved lagring av stedfortrederavtale:", error);
            let sErrorMessage = "Kunne ikke lagre stedfortrederavtalen.";
            if (error.error && error.error.message) {
               sErrorMessage = `Feil fra server: ${error.error.message}`;
            } else if (error.message && error.message.includes("rejected")) {
               sErrorMessage = error.message;
            } else if (error.message) {
               sErrorMessage = error.message;
            } else if (typeof error === 'string') {
               sErrorMessage = error;
            } else if (error.responseText) {
               try {
                  const errorResponse = JSON.parse(error.responseText);
                  if (errorResponse.error && errorResponse.error.message) {
                     sErrorMessage = `Feil fra server: ${errorResponse.error.message}`;
                  }
               } catch (e) { /* Ignorer JSON parse feil */ }
            } else if (error.statusText && error.status) {
               sErrorMessage = `Feil fra server (${error.status}): ${error.statusText}`;
            }
            MessageBox.error(sErrorMessage);
            saveSuccess = false; // Lagring feilet
         } finally {
            this.getView().setBusy(false);
            if (saveSuccess && this._createAppointmentDialog) { // Lukk kun ved suksess
               this._createAppointmentDialog.close();
            }
         }
      },

      handleDialogCancelButton: function () {
         if (this._createAppointmentDialog) {
            this._createAppointmentDialog.close();
         }
      },








      _validateCreateDialogInputs: function () {
         const createData = this._appointmentCreateModel.getData();
         let bValid = true;

         // Få tak i kontroller for å sette ValueState
         const personSelect = this.byId("idPeopleEmployeeSelect");
         const deputySelect = this.byId("idPeopleDeputySelect");
         const startDatePicker = this.byId("idStartDateDateTimePicker");
         const endDatePicker = this.byId("idEndDateDateTimePicker");

         // Valider person
         if (!createData.personId) {
            if (personSelect) personSelect.setValueState(ValueState.Error).setValueStateText("Vennligst velg en person.");
            bValid = false;
         } else {
            if (personSelect) personSelect.setValueState(ValueState.None);
         }

         // Valider stedfortreder
         if (!createData.deputyId) {
            if (deputySelect) deputySelect.setValueState(ValueState.Error).setValueStateText("Vennligst velg en stedfortreder.");
            bValid = false;
         } else {
            if (deputySelect) deputySelect.setValueState(ValueState.None);
         }

         // Valider at person og stedfortreder ikke er den samme
         if (createData.personId && createData.deputyId && createData.personId === createData.deputyId) {
            if (deputySelect) deputySelect.setValueState(ValueState.Error).setValueStateText("Person og stedfortreder kan ikke være den samme.");
            bValid = false;
         } else if (createData.deputyId && deputySelect && deputySelect.getValueState() === ValueState.Error &&
            deputySelect.getValueStateText() === "Person og stedfortreder kan ikke være den samme.") {
            deputySelect.setValueState(ValueState.None);
         }

         // Valider startdato
         if (!createData.startDate) {
            if (startDatePicker) startDatePicker.setValueState(ValueState.Error).setValueStateText("Startdato er påkrevd.");
            bValid = false;
         } else {
            if (startDatePicker) startDatePicker.setValueState(ValueState.None);
         }

         // Valider sluttdato
         if (!createData.endDate) {
            if (endDatePicker) endDatePicker.setValueState(ValueState.Error).setValueStateText("Sluttdato er påkrevd.");
            bValid = false;
         } else {
            if (endDatePicker) endDatePicker.setValueState(ValueState.None);
         }

         // Valider at sluttdato er etter startdato
         if (createData.startDate && createData.endDate &&
            UI5Date.getInstance(createData.endDate).getTime() < UI5Date.getInstance(createData.startDate).getTime()) {
            if (endDatePicker) endDatePicker.setValueState(ValueState.Error).setValueStateText("Sluttdato kan ikke være før startdato.");
            bValid = false;
         } else if (createData.endDate && endDatePicker && endDatePicker.getValueState() === ValueState.Error &&
            endDatePicker.getValueStateText() === "Sluttdato kan ikke være før startdato.") {
            endDatePicker.setValueState(ValueState.None);
         }

         this.getView().getModel("state").setProperty("/isCreateDialogSaveEnabled", bValid);
         return bValid;
      }


   });
});