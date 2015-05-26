/*
 * webStorm.js
 */

var apiClient;

/*
 * Load the handlers
 */
$.getScript('js/handlers.js');

/*
 * Function to get the list of available methods - only works for the public bleed API
 */
var getMethods = function() {
	var availableMethods = [];

	_.each(apiClient.simpleCall(['account', 'user', 'permitted']).permissions, function(value, key, list) {
		availableMethods.push(key.replace(/\./g, '/').toLowerCase()); // Convert from periods to slashes
	});

	return availableMethods;
};
