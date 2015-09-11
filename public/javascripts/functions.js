/*
Flipdesk. A flexible helpdesk system.
Copyright (C) 2015  Johannes Giere, jogiere AT gmail com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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
	$('#email_login')[0].value = $('#email_login')[0].value.toLowerCase();

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
