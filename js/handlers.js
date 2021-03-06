/*
 * handlers.js
 *
 * Put event handlers here
 */

/*
 * Environment and Internal/Public selector are hidden by default.
 * If username gets double clicked, show em
 *
 * Pro tip: If you don't work at Liquid Web, these will mean absolutely nothing to you
 */
$('#userName').one('dblclick', function() {
	$('#environment').parent().show();
	$('#inPub').parent().show();
});


/*
 * Watch the environment selector. If development is selected, show the input to enter the user
 */
$('#environment').on('change', function(event) {
	if($(event.target).val() == 'development') {
		$("#devUser").parent().show();
	} else {
		$("#devUser").parent().hide();
	}
});

/*
 * Create the API object when the login button is clicked and do the neeful
 */
$('#loginButton').on('click', function() {
	var setupParams = {
		userName: $('#userName').val(),
		password: $('#password').val(),
		apiVersion: $('#apiVersion').val(),
		environment: $('#environment').val(),
		inPub: $('#inPub').val(),
		devUser: $('#devUser').val()
	};

	/*
	 * If there's an existing autocomplete widget setup for the method field, nuke it in case the new setup doesn't support it
	 */
	if($('#method').autocomplete('instance')) {
		$('#method').autocomplete('destroy');
	}

	/*
	 * Build the proper baseURI
	 */
	var baseURI;
	var env = setupParams.environment;
	if (env == 'production') {
		baseURI = (setupParams.inPub == 'public') ? 'https://api.stormondemand.com' : 'https://api.int.liquidweb.com';
	} else if (env == 'staging') {
		baseURI = (setupParams.inPub == 'public') ? 'https://api-public.staging.liquidweb.com' : 'https://api-internal.staging.liquidweb.com';
	} else {
		baseURI = (setupParams.inPub == 'public') ? 'https://api-public.' + setupParams.devUser + '.dev.liquidweb.com:20900' : 'https://api-internal.' + setupParams.devUser + '.dev.liquidweb.com:20800';
	}

	/*
	 * Create the client object
	 */
	apiClient = new stormAPI(setupParams.userName, setupParams.password, setupParams.apiVersion, baseURI);

	/*
	 * Informational Header
	 */
	var authStatus = apiClient.checkAuth();
	if (!authStatus.status) {
		$('#setup > legend').text('Connection Setup: ' + authStatus.message);
		alert(authStatus.message);
	} else {
		$('#setup > legend').text('Connection Setup: ' + 'User: ' + setupParams.userName + ' || API Version: ' + setupParams.apiVersion.toUpperCase() + ' || Environment: ' + setupParams.environment.toUpperCase() + ' ' + setupParams.inPub.toUpperCase());

		/*
		 * Token countdown timer
		 */
		updateTokenTimer(apiClient.tokenExpiration);

		/*
		 * Also show the call button
		 */
		$('#sendIt').show();
	}

	/*
	 * Get the available API methods and setup the method autocomplete - only runs if the API called is public and the version is bleed
	 */
	if (setupParams.inPub == 'public' && setupParams.apiVersion == 'bleed'){
		$('#method').autocomplete({
			source: getMethods()
		});
	}
});

/*
 * Add a param field
 */
$('#addParam').on('click', function() {
	$.get('htmlIncludes/paramField.inc.html', function(data) {
		$('#addParam').before(data);
	});
});

/*
 * Remove the param field when it's delete button is clicked
 */
$('#paramFieldset').on('click', '.paramField > .removeParam', function() {
	$(this).parent().remove();
});

/*
 * Change the param value field name attribute to whatever is entered in the parameter name field
 */
$('#paramFieldset').on('change', '.paramField > label >.paramName', function() {
	$(this).parent().siblings('label').children('.paramValue').attr('name', $(this).val());
});

/*
 * Serialize the params (if any) and make the call
 */
$('#sendIt').on('click', function() {

	/*
	 * Get params
	 */
	var paramsObj = {};
	_.each($('.paramField > label > .paramValue').serializeArray(), function(element, index, list){
		if(element.name != 'updateToParamName' && element.value !== '') {
			paramsObj[element.name] = element.value;
		}
	});

	/*
	 * The setup and call
	 */
	var method = $('#method').val().toLowerCase().split('/'); // Break up the API method

	var apiResponse;
	if(paramsObj) {
		apiResponse = apiClient.simpleCall(method, paramsObj);
	} else {
		apiResponse = apiClient.simpleCall(method);
	}

	/*
	 * Update the token expiration information if account.auth.token or account.auth.expiretoken is called
	 */
	if(_.isEqual(method, ['account', 'auth', 'token'])) {
		updateTokenTimer(parseInt(apiResponse.expires)); // Because sometimes it will come back as a string
		console.log('updated token');
	} else if(_.isEqual(method,['account', 'auth', 'expiretoken'])) {
		expiredTokenTimer();
	}

	$('#resultDiv').show();
	$('#callResult').val(JSON.stringify(apiResponse, null, 4));
});
