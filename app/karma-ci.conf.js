module.exports = function (config) {
	"use strict";

	require("../app/karma.conf")(config);
	config.set({
		browsers: ["ChromeHeadless"],
		singleRun: true
	});
};
