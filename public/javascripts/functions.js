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
