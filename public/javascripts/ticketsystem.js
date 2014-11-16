
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

/* Sets ticket back to open and removes assigned agent from ticket. */
function set_ticket_to_open() {
	
	$.post('/tickets/' + $('#ticket-id').html() + '/assign/-1', {}, function(data) {
		if(data.success) {
			$('#ticket_status').html('Open');
			$('#assigned_to_agent').html(', Not Assigned');
		} else {
			
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
				$('#info-label')[0].textContent = 'Your data has been processed.';
			} else {
				$('#info-label')[0].textContent = 'There was a problem with your network connection while submitting your data.';
			}
		}		
	});
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
			'<tr onclick="toggle_edit_user_modal(' + data.id + ')")>' + 
				'<td>' + data.id + '</td>' + 
				'<td>' + data.first_name + '</td>' + 
				'<td>' + data.last_name + '</td>' + 
				'<td>' + data.email + '</td>' + 
				'<td></td>' +
			'</tr>');
			
			$('#add_user_modal').modal('hide');
		} else {
			
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
