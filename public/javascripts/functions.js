function login_form() {
	$.get('/authentication', {}, function(data) {
		if(data.success) {
			//redirect
		} else {
			$('#modalDiv').modal('show');
		}
	});
}

function login() {
	$.post('/authentication', $('#login_form').serialize(), function(data) {
		if(data.success) {
			var blu = true;
			//redirect
		} else {
			var blu = true;
			//display error message
		}
	});
}
