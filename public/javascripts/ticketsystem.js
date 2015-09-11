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

$(document).ready(function() {
  var paramOpenTicketResponse = parseInt(getUrlParameter('open_ticket'));

	if(paramOpenTicketResponse > 0) {
		ticket_click(paramOpenTicketResponse);
	}
});

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
}

/* Calls specific ticket data and loads it into ticket view */
function ticket_click(id) {
	$.get('/tickets/' + id, '', function(data, textStatus) {
		$('#ticket_space').html(data);
	}, 'html');
}

/* Opens Modal to create new comment */
function ticket_create_comment(id) {
	$('#createCommentModal').modal('show');
}

/* Opens Modal to create new ticket */
function show_createTicketModal() {
	$('#createTicketModal').modal('show');
}

/* Opens modal to edit ticket */
function show_editTicketModal(ticket_id) {
  $('#edit_ticket_form_caption')[0].value = $('#ticket_caption')[0].textContent;
  $('#edit_ticket_form_description')[0].value = $('#ticket_description')[0].textContent;

  for(var i = 0; i < $('#edit_ticket_form_user')[0].options.length; i++) {
    if($('#edit_ticket_form_user')[0].options[i].value == $('#created_by_user')[0].textContent) {
      $('#edit_ticket_form_user')[0].selectedIndex = i;
    }
  }

  $('#editTicketModal').modal('show');
}

function ticket_save(ticket_id) {
  var new_ticket = {
    'id': ticket_id,
		'caption': $('#edit_ticket_form_caption')[0].value,
		'description': $('#edit_ticket_form_description')[0].value,
		'user_id': $('#edit_ticket_form_user')[0].selectedOptions[0].id,
		properties: []
	};

	var customProperties = $('.custom_properties_edit');

	//Do the mandatory property check
	var findNullMandatory = false;
	for(var i = 0; i < customProperties.length; i++) {
		if(customProperties[i].classList.contains('mandatory') && customProperties[i].value == '') {
			customProperties[i].classList.add('add-property');
			findNullMandatory = true;
		} else {
			customProperties[i].classList.remove('add-property');
		}
	}

	if(findNullMandatory) {
		return;
	}

	for(var i = 0; i < customProperties.length; i++) {
		new_ticket.properties[i] = {
			datamodel_id: parseInt(customProperties[i].id),
			value: customProperties[i].value
		};
	}

	$.ajax({
		url: '/tickets/' + ticket_id,
		type: 'PUT',
		data: JSON.stringify(new_ticket),
		contentType: 'application/json',
		success: function(data) {
			if(data.success) {
        $('#'+data.ticket.id)[0].textContent = data.ticket.caption;
        $('#ticket_caption')[0].textContent = data.ticket.caption;

        $('#ticket_description')[0].textContent = data.ticket.description;

        $('#created_by_user_id')[0].textContent = data.ticket.user.id;
        $('#created_by_user')[0].textContent = data.ticket.user.first_name + ' ' + data.ticket.user.last_name;

        for(var i = 0; i < data.ticket.datamodel.length; i++) {
          $('#list_' + data.ticket.datamodel[i].name)[0].textContent = data.ticket.datamodel[i].value;
        }

				$('#editTicketModal').modal('hide');

				$('#edit_ticket_form_caption')[0].value = '';
				$('#edit_ticket_form_description')[0].value = '';


			}
		}
	});
}

/* Creates a new ticket object from form data and performs HTTP-POST to create new ticket.
 * After that, it hides the modal and empties the form input fields. */
function ticket_send() {
	var new_ticket = {
		'caption': $('#create_ticket_form_caption')[0].value,
		'description': $('#create_ticket_form_description')[0].value,
		'user_id': $('#create_ticket_form_user')[0].selectedOptions[0].id,
		'agent_id': $('#create_ticket_form_agent')[0].selectedOptions[0].id,
		properties: []
	};

	var customProperties = $('.custom_properties');

	//Do the mandatory property check
	var findNullMandatory = false;
	for(var i = 0; i < customProperties.length; i++) {
		if(customProperties[i].classList.contains('mandatory') && customProperties[i].value == '') {
			customProperties[i].classList.add('add-property');
			findNullMandatory = true;
		} else {
			customProperties[i].classList.remove('add-property');
		}
	}

	if(findNullMandatory) {
		return;
	}

	for(var i = 0; i < customProperties.length; i++) {
		new_ticket.properties[i] = {
			datamodel_id: parseInt(customProperties[i].id),
			value: customProperties[i].value
		};
	}

	$.ajax({
		url: '/tickets',
		type: 'POST',
		data: JSON.stringify(new_ticket),
		contentType: 'application/json',
		success: function(data) {
			if(data.success) {
				$('#ticket_overview_list').append('<li><span class="btn" id="' + data.ticket.id + '" onclick="ticket_click(' + data.ticket.id + ')">' + data.ticket.caption + '</span></li>');

				$('#createTicketModal').modal('hide');

				$('#create_ticket_form_caption')[0].value = '';
				$('#create_ticket_form_description')[0].value = '';


			}
		}
	});
}

/* Create a new comment object from form data and performs HTTP-POST to create new comment
 * Hides modal and empties input fields after all */
function comment_send() {
	var new_comment = {
		'description': $('#create_comment_form_description')[0].value,
		'agent_id': 1,
		'user_id': null,
		'ticket_id': $('#ticket-id')[0].innerHTML
	};

	$.post('/tickets/' + new_comment.ticket_id + '/comment', new_comment, function(data) {
			if(data.success) {
				$('#createCommentModal').modal('hide');

				$('#create_comment_form_description')[0].value = '';

				ticket_click(parseInt(new_comment.ticket_id));
			}
	}, 'json');
}

/* Opens/Shows modal to assign agent to ticket */
function showAssignAgentModal() {

  //Select assigned agent in comboxbox.
  var assigned_agent = $('#assigned_to_agent')[0].textContent;

  for(var i = 0; i < $('#agent_assignAgentModal_form')[0].options.length; i++) {
    if($('#agent_assignAgentModal_form')[0].options[i].value == assigned_agent) {
      $('#agent_assignAgentModal_form')[0].selectedIndex = i;
    }
  }

  $('#agent_assignAgentModal_form')[0].selectedIndex

	$('#assignAgentModal').modal('show');
}

/* Gets agent id and performs HTTP-POST to assign agent to ticket.
 * After that the view is updated. */
function assign_agent_to_ticket() {
	var agent_id = $('#agent_assignAgentModal_form')[0].selectedOptions[0].id;

	$.post('/tickets/' + $('#ticket-id').html() + '/assign/' + agent_id, {}, function(data) {
		if(data.success) {
			$('#ticket_status').html('Assigned');
			$('#assigned_to_agent').html('Agent: ' + $('#agent_assignAgentModal_form')[0].selectedOptions[0].value);

			$('#assignAgentModal').modal('hide');
		} else {

		}
	});
}

/* Sets ticket back to open. */
function set_ticket_to_opened() {
  $.post('/tickets/' + $('#ticket-id').html() + '/assign/-1', {}, function(data) {
    if(data.success) {
      $('#ticket_status').html('Opened');
      $('#assigned_to_agent'.html('Not assigned'));
    } else {
      if(data.error.code == 3) {
        alert('You can\'t set an assigned ticket to open.');
      }
    }
  });
}

/* Sets ticket on solved */
function set_ticket_to_solved() {
  $.ajax({
    url: '/tickets/' + $('#ticket-id').html(),
    type: 'PUT',
    data: { 'solved': true },
    success: function(data) {
      if(data.success) {
        $('#ticket_status').html('Solved');
      } else {
        if(data.error.code == 3) {
          alert('You can\'t set this ticket to solved.');
        }
      }
    },
    error: function(data) {

    }
  });
}

function set_ticket_to_archived() {
  $.ajax({
    url: '/tickets/' + $('#ticket-id').html(),
    type: 'DELETE',
    data: { },
    success: function(data) {
      if(data.success) {
        $('#ticket_status').html('Archived');
      } else {
        if(data.error.code == 3) {
          alert('You can\'t move ticket to archive.');
        }
      }
    },
    error: function(data) {

    }
  });
}

/* Shows administration template/view */
function open_administration_settings() {
	$.get('/administration/settings', {}, function(data) {
		$('#settings_id').addClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').removeClass('active');

		$('#administration_content').html(data);
	});
}

/* Shows agent view in administration */
function open_administration_agents() {
	$.get('/administration/agents', {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').addClass('active');
		$('#customers_id').removeClass('active');

		$('#administration_content').html(data);
	});
}

/* Shows specific customer view/template */
function open_administration_customer(id) {
	$.get('/administration/customer/' + id, {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').addClass('active');

		$('#administration_content').html(data);
		switch_customer_navfield('general', 'general_tab');
	});
}

/* Shows "customer add"-view */
function open_administration_customer_add() {
	$.get('/administration/customer', {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').addClass('active');

		$('#administration_content').html(data);
	});
}

/* Shows edit agent modal from "administration agent"-view */
function toggle_edit_agent_modal(agent_id) {

	$.get('/administration/agents/' + agent_id, {}, function(data) {
		var data = data.agent;

		$('#id_edit_agent_form_modal')[0].textContent = agent_id;
		$('#fname_edit_agent_form_modal')[0].value = data.first_name;
		$('#lname_edit_agent_form_modal')[0].value = data.last_name;
		$('#email_edit_agent_form_modal')[0].value = data.email;
		$('#isadmin_edit_agent_form_modal')[0].checked = data.is_admin;
		$('#active_edit_agent_form_modal')[0].checked = data.active;

		$('#edit_agent_modal').modal('toggle');
	});
}

/* Reacts to user input to show all navbar views to configure customer data */
function switch_customer_navfield(option, event_src) {
	switch (option) {
		case 'general':
			$('.nav_content').hide();

			$(event_src.id).addClass('active');

			$('#general_customer_div').show();
			break;
		case 'lists':
			$('.nav_content').hide();

			$(event_src.id).addClass('active');

			$('#lists_customer_div').show();

			break;
		case 'ticket':
			$('.nav_content').hide();

			$(event_src.id).addClass('active');

			$('#ticket_fields_customer_div').show();
			break;
		case 'status':
			$('.nav_content').hide();

			$(event_src.id).addClass('active');

			$('#status_fields_customer_div').show();
			break;
	}
}

/* Updates company name */
function update_software_config() {
	var company_name = $('#administration_settings_form_company_name')[0].value;

	$.ajax({
		url: '/administration/settings/update',
		type: 'POST',
		data: { 'company_name': company_name },
		success: function(data) {
			if(data.success) {
				$('#info-label')[0].textContent = 'Your data has been updated.';
			} else {
				$('#info-label')[0].textContent = 'There was a problem with your network connection while submitting your data.';
			}
		}
	});
}

function reset_agent_password() {
	var confirmDialog = confirm("Are you sure, that you want to reset the user's password?");

	if (confirmDialog == true) {
	    var email = $('#email_edit_agent_form_modal')[0].value;

			$.post('/password-reset', { 'email' : email }, function(data) {
				if(data.success) {
					alert("The user's password has been reset.");

					$('#edit_agent_modal').modal('hide');
				} else {
					alert("An error occurred.");
				}
			});
	} else {

	}
}

/* Updates agents */
function update_agent() {
	var agent_id = $('#id_edit_agent_form_modal')[0].textContent;

	$.post('/administration/agents/' + agent_id, {
		first_name: $('#fname_edit_agent_form_modal')[0].value,
		last_name: $('#lname_edit_agent_form_modal')[0].value,
		email: $('#email_edit_agent_form_modal')[0].value,
		is_admin: $('#isadmin_edit_agent_form_modal')[0].checked,
		active: $('#active_edit_agent_form_modal')[0].checked
	}, function(data) {
		if(data.success) {

			$('#edit_agent_modal').modal('hide');

			$('#row_agent_' + agent_id)[0].children[1].textContent = $('#lname_edit_agent_form_modal')[0].value;
			$('#row_agent_' + agent_id)[0].children[2].textContent = $('#fname_edit_agent_form_modal')[0].value;
			$('#row_agent_' + agent_id)[0].children[3].textContent = $('#email_edit_agent_form_modal')[0].value;
			$('#row_agent_' + agent_id)[0].children[4].children[1].checked = $('#active_edit_agent_form_modal')[0].checked;
			$('#row_agent_' + agent_id)[0].children[4].children[1].disabled = true;
		} else {

		}
	});
}

function open_modal_add_agent() {
	$('#add_agent_modal').modal('show');
}

function add_agent() {
	$.post('/administration/agents', {
		first_name: $('#fname_add_agent_form_modal')[0].value,
		last_name: $('#lname_add_agent_form_modal')[0].value,
		email: $('#email_add_agent_form_modal')[0].value,
		is_admin: $('#isadmin_add_agent_form_modal')[0].checked,
		active: true
	}, function(data) {
		if(data.success) {

			$('#add_agent_modal').modal('hide');
			open_administration_agents();

		} else {

		}
	});
}

//Disable customer
function disable_customer(customerid) {
	if($('#disable_customer_checkbox')[0].checked) {
		$.ajax({
			type: "DELETE",
			url: '/administration/customer/' + customerid
		})
		.done(function(data) {
			if(data.success) {
				open_administration_customer(customerid);
			} else {
				$('#disable_customer_info')[0].textContent = 'Error while disabling customer';
			}
		})
		.fail(function(err) {
			$('#disable_customer_info')[0].textContent = 'Error while disabling customer';
		});

	} else {
		$('#disable_customer_info')[0].textContent = 'Please check the box to disable this customer';
	}
}

//Enable customer
function enable_customer(customerid) {
	$.ajax({
		type: "PUT",
		url: '/administration/customer/' + customerid
	})
	.done(function(data) {
		if(data.success) {
			open_administration_customer(customerid);
		} else {
			$('#enable_customer_info')[0].textContent = 'Error while enabling customer';
		}
	})
	.fail(function(err) {
		$('#enable_customer_info')[0].textContent = 'Error while enabling customer';
	});
}

//Update customer settings
function update_customer_settings(customerid) {
	$.ajax({
		type: "POST",
		url: '/administration/customer/' + customerid,
		data: {'name': $('#customer_name_form')[0].value}
	})
	.done(function(data) {
		if(data.success) {
			$('#save_customer_info')[0].textContent = 'User updates saved';
		} else {
			$('#save_customer_info')[0].textContent = 'Error while saving customer';
		}
	})
	.fail(function(err) {
		$('#save_customer_info')[0].textContent = 'Error while saving customer';
	});
}

//
function show_adduser_modal() {
	$('#add_user_modal').modal('show');
}

//Show edit user modal
function toggle_edit_user_modal(userid) {

	$('#id_edit_user_form_modal')[0].textContent =
		$('#row_user_' + userid)[0].children[0].textContent;
	$('#fname_edit_user_form_modal')[0].value =
		$('#row_user_' + userid)[0].children[2].textContent;
	$('#lname_edit_user_form_modal')[0].value =
		$('#row_user_' + userid)[0].children[1].textContent;
	$('#email_edit_user_form_modal')[0].value =
		$('#row_user_' + userid)[0].children[3].textContent;

	$('#edit_user_modal').modal('show');


}

function add_user(customerid) {
	var firstname = $('#fname_add_user_form_modal')[0].value;
	var lastname = $('#lname_add_user_form_modal')[0].value;
	var email = $('#email_add_user_form_modal')[0].value;

	$.post('/administration/user', {
		'first_name': firstname,
		'last_name': lastname,
		'email': email,
		'active': true,
		'customer_id': customerid
	}, function(data) {
		if(data.success) {
			$('#user_table tr:last').after(
			'<tr onclick="toggle_edit_user_modal(' + data.user.id + ')")>' +
				'<td>' + data.user.id + '</td>' +
				'<td>' + data.user.first_name + '</td>' +
				'<td>' + data.user.last_name + '</td>' +
				'<td>' + data.user.email + '</td>' +
				'<td></td>' +
			'</tr>');

			$('#add_user_modal').modal('hide');
		} else {

		}
	});
}

/* Delete user */
function delete_user() {
	var id = $('#id_edit_user_form_modal')[0].textContent;

	$.ajax({
		url: '/administration/user/' + id,
		data: {},
		type: 'DELETE',
		success: function(data) {
			if(data.success) {

				$('#edit_fieldproperty_modal').modal('toggle');
			} else {
				var test = false;
			}
		}
	});
}

/* Edit user */
function edit_user() {
	$.post('/administration/user/' + $('#id_edit_user_form_modal')[0].textContent, {
		'first_name': $('#fname_edit_user_form_modal')[0].value,
		'last_name': $('#lname_edit_user_form_modal')[0].value,
		'email': $('#email_edit_user_form_modal')[0].value
	}, function(data) {
		if(data.success) {
			var userid = $('#id_edit_user_form_modal')[0].textContent;
			$('#row_user_' + userid)[0].children[1] = $('#lname_edit_user_form_modal')[0].value;
			$('#row_user_' + userid)[0].children[2] = $('#fname_edit_user_form_modal')[0].value;
			$('#row_user_' + userid)[0].children[3] = $('#email_edit_user_form_modal')[0].value;

			$('#edit_user_modal').modal('hide');
		} else {

		}
	});

}

function toggle_edit_fieldproperty_modal(id) {
	var name = $('#row_property_' + id)[0].children[0].textContent;
	var datatype = $('#row_property_' + id)[0].children[1].textContent;
	var mandatory = $('#row_property_' + id + ' input')[0].checked;
	var active = $('#row_property_' + id + ' input')[1].checked;

	$('#id_edit_fieldproperty_form_modal')[0].textContent = id;
	$('#name_edit_fieldproperty_form_modal')[0].value = name;
	$('#datatype_edit_fieldproperty_form_modal')[0].value = datatype;
	$('#mandatory_edit_fieldproperty_modal')[0].checked = mandatory;
	$('#active_edit_fieldproperty_modal')[0].checked = active;

	$('#edit_fieldproperty_modal').modal('toggle');
}

function edit_ticketfield() {
	var id = $('#id_edit_fieldproperty_form_modal')[0].textContent;

	var ticketfield = {
		'name': $('#name_edit_fieldproperty_form_modal')[0].value,
		'datatype_id': $('#datatype_edit_fieldproperty_form_modal')[0].selectedOptions[0].id,
		'customer_id': $('#customer_id')[0].textContent,
		'mandatory': $('#mandatory_edit_fieldproperty_modal')[0].checked,
		'active': $('#active_edit_fieldproperty_modal')[0].checked
	};

	$.ajax({
		url: '/administration/ticketfield/' + id,
		data: ticketfield,
		type: 'PUT',
		success: function(data) {
			if(data.success) {

				$('#row_property_' + id)[0].children[0].textContent = $('#name_edit_fieldproperty_form_modal')[0].value;
				$('#row_property_' + id)[0].children[1].textContent = $('#datatype_edit_fieldproperty_form_modal')[0].value;
				$('#row_property_' + id + ' input')[0].checked = $('#mandatory_edit_fieldproperty_modal')[0].checked;
				$('#row_property_' + id + ' input')[1].checked = $('#active_edit_fieldproperty_modal')[0].checked;

				$('#edit_fieldproperty_modal').modal('toggle');

			} else {
				var test = false;
			}
		}
	});

}



function toggle_add_fieldproperty_modal() {
	$('#add_fieldproperty_modal').modal('toggle');
}

function add_ticketfield() {
	var ticketfield = {
		'name': $('#name_add_fieldproperty_form_modal')[0].value,
		'datatype_id': $('#datatype_add_fieldproperty_form_modal')[0].selectedOptions[0].id,
		'customer_id': $('#customer_id')[0].textContent,
		'mandatory': $('#mandatory_add_fieldproperty_modal')[0].checked,
		'active': $('#active_add_fieldproperty_modal')[0].checked
	};

	$.ajax({
		url: '/administration/ticketfield',
		data: ticketfield,
		type: 'POST',
		success: function(data) {
			if(data.success) {
				$('#ticketfield_table tr:last').after(
				'<tr onclick="toggle_edit_fieldproperty_modal(' + data.property.id + ')")>' +
					'<td><span>' + data.property.name + '</span></td>' +
					'<td><span>' + data.property.datatype + '</span></td>' +
					'<td><label><input type="checkbox" disabled checked="' + data.property.mandatory + '" /></label></td>' +
					'<td><label><input type="checkbox" disabled checked="' + data.property.active + '" /></label></td>' +
				'</tr>');

				toggle_add_fieldproperty_modal();
			} else {

			}
		}
	});
}

function addCustomer() {
	var customer = {
		name: $('#company-name')[0].value,
		email_contact: $('#contact-email')[0].value,
		imap_email: $('#imap-email')[0].value,
		smtp_email: $('#smtp-email')[0].value,
		mailbox_user: $('#user')[0].value,
		mailbox_password: $('#password')[0].value
	};

	$.ajax({
		url: 'administration/customer',
		data: JSON.stringify(customer),
		type: 'POST',
		contentType: 'application/json',
		success: function(data) {
			if(data.success) {
				open_administration_customer(data.id);
			} else {
				$('#error-message')[0].textContent = data.error.code + ': ' + data.error.msg;
			}
		}
	});
}
