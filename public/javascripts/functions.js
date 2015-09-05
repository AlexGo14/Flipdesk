function login_form() {
	$.get('/authentication', {}, function(data) {
		if(data.success) {
			window.location.replace("/tickets");
		} else {
			$('#modalDiv').modal('show');
		}
	});
}

function login() {
	$.post('/authentication', $('#login_form').serialize(), function(data) {
		if(data.success) {
			if(data.login_pw_change) {
				window.location.replace("/pwchange");
			} else {
				window.location.replace("/tickets");
			}
		} else {
			$('#error_message_form').html(
				'Your login credentials are invalid.'
			);
		}
	});
}

function change_password() {
	$.post('/pwchange', $('#change_password_form').serialize(), function(data) {
		if(data.success) {
			window.location.replace("/tickets");
		} else {
			$('#error_message_form').html(
				'Your new password could not be stored.'
			);
		}
	});
}

function sendNewPassword() {
	$.post('/password-reset', $('#send_new_password_form').serialize(), function(data) {
		if(data.success) {
			window.location.replace("/");
		} else {
			/*$('#error_message_form').html(
				'An error occurred. We are sorry.'
			);*/
		}
	});
}


$('#email_login').keypress(function(e) {
	var code = e.keyCode || e.which;
	if(code == 13) {
		login();
	}
});

$('#password_login').keypress(function(e) {
	var code = e.keyCode || e.which;
	if(code == 13) {
		login();
	}
});
