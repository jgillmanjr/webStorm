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

/*
 * Function to display or update the token expiration timer
 */
var updateTokenTimer = function(expires) {
	$('#tokenTimer').removeClass('hidden').addClass('tightWrap').css('background-color', '#EEEEEE;');

	$('#countdown').show();
	$('#tokenStatus').text('Token expires in: ');

	$('#countdown').countdown(new Date(expires * 1000), function(event) {
		$(this).html(event.strftime('%Hh %Mm %Ss'));
	}).on('finish.countdown', function(event) {
		expiredTokenTimer();
	});
};

/*
 * Function to update the token expiration timer when expired
 */
var expiredTokenTimer = function() {
	$('#tokenTimer').css('background-color', '#BB0000;');

	$('#countdown').hide();
	$('#tokenStatus').text('Token Expired');

	$('#setup > legend').text('Connection Setup: Token Expired');

	$('#sendIt').hide();
};
