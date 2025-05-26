sap.ui.define([
	"./BaseController",
], function (BaseController) {
	"use strict";

	return BaseController.extend("fagprove.controller.Launchpad", {
      onGenericTilePress: async function () {
         this.getRouter().navTo("teamcalendar");
      },
	});
});
