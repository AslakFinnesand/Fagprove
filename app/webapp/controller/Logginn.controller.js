sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/json/JSONModel",
], function (BaseController, MessageBox, MessageToast, ODataModel, JSONModel) {
	"use strict";

	return BaseController.extend("fagprove.controller.Logginn", {


		/**
 		* @override
 		* @returns {void|undefined}
 		*/
		onInit: function () {
			// Get the default (root) model
			const defaultModel = this.getView().getModel();

		},

		onNavToLanuchPad: function () {
			this.getRouter().navTo("lanuchpad");
		},

		onLoggInnButtonPress: function () {
			const rootModel = this.getView().getModel();
			const logInName = rootModel.getProperty("/userName");
			const pw = rootModel.getProperty("/password");

			// Input validation
			if (!logInName || !pw) {
				MessageBox.error("Brukernavn og passord må fylles ut");
				return;
			}

			const authHeader = "Basic " + btoa(`${logInName}:${pw}`);

			// Create the OData model with the Authorization header
			const model = new ODataModel({
				serviceUrl: "/odata/v4/logIn/",
				httpHeaders: {
					"Authorization": authHeader
				}
			});


			// Create a context for the function import
			const context = model.bindContext(`/GetAuthenticated(username='${logInName}')`);

			context.requestObject()
				.then(function (result) {

					// Bind the result to the view
					const appointmentsModel = new JSONModel(result);
					this.getView().setModel(appointmentsModel, "LogIn");

					// LogIn model
					const logInModel = this.getView().getModel("LogIn");

					// Get the value leader boolean and leader ID
					const isLeader = logInModel.getData().value[0].IsLeader;
					const idLeader = logInModel.getData().value[0].ID;

					// Sets the value to the default model
					rootModel.setProperty("/IsLeader", isLeader);
					rootModel.setProperty("/leaderId", idLeader);

					const leaderid = rootModel.getProperty("/leaderId");
					if (leaderid !== '') {
						this.onNavToLanuchPad();
						MessageToast.show("LogIn successfully");

					} else {
						MessageBox.information("Bruker uten leder-tilgang");
					}

				}.bind(this))
				.catch(function (error) {
					console.error("Feil ved behandling av påloggingsdata:", error);
					MessageToast.show("Kunne ikke behandle påloggingsdata");
				});
		},

	});
});
