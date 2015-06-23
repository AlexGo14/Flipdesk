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
			window.location.replace("/tickets");
		} else {
			console.log(data);
			$('#error_message_form').html(
				'Your login credentials are invalid.'
			);
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
