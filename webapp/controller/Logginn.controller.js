sap.ui.define([
	"./BaseController",
], function (BaseController) {
	"use strict";

	return BaseController.extend("fagprove.controller.Logginn", {

		onLoggInnButtonPress: function () {

			const rootModel = this.getView().getModel();
			const logInName = rootModel.getProperty("/userName");
			const pw = rootModel.getProperty("/password");
			if (logInName == "test" && pw == "test") {
				this.getRouter().navTo("lanuchpad");
			}


		},

	});
});
