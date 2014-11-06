function ticket_click(id) {
	$.get('/tickets/' + id, '', function(data, textStatus) {
		$('#ticket_space').html(data);
	}, 'html');
}

function ticket_create_comment(id) {
	$('#createCommentModal').modal('show');
}

function show_createTicketModal() {
	$('#createTicketModal').modal('show');
}

function ticket_send() {
	var new_ticket = {
		'caption': $('#create_ticket_form_caption')[0].value,
		'description': $('#create_ticket_form_description')[0].value,
		'user_id': $('#create_ticket_form_user')[0].selectedOptions[0].id,
		'agent_id': $('#create_ticket_form_agent')[0].selectedOptions[0].id
	};
	
	$.post('/tickets', new_ticket, function(data) { 
			if(data.success) {
				$('#createTicketModal').modal('hide');
				
				$('#create_ticket_form_caption')[0].value = '';
				$('#create_ticket_form_description')[0].value = '';
				
			}
	}, 'json');
}

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

function showAssignAgentModal() {
	$('#assignAgentModal').modal('show');
}

function assign_agent_to_ticket() {
	var agent_id = $('#agent_assignAgentModal_form')[0].selectedOptions[0].id;
	
	$.post('/tickets/' + $('#ticket-id').html() + '/assign/' + agent_id, {}, function(data) {
		if(data.success) {
			$('#ticket_status').html('Assigned');
			$('#assigned_to_agent').html(', Assigned to ' + $('#agent_assignAgentModal_form')[0].selectedOptions[0].value);
			
			$('#assignAgentModal').modal('hide');
		} else {
			
		}
	});
}

function set_ticket_to_open() {
	
	$.post('/tickets/' + $('#ticket-id').html() + '/assign/-1', {}, function(data) {
		if(data.success) {
			$('#ticket_status').html('Open');
			$('#assigned_to_agent').html(', Not Assigned');
		} else {
			
		}
	});
}

function open_administration_settings() {
	$.get('/administration/settings', {}, function(data) {
		$('#settings_id').addClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').removeClass('active');
		
		$('#administration_content').html(data);
	});
}

function open_administration_agents() {
	$.get('/administration/agents', {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').addClass('active');
		$('#customers_id').removeClass('active');
		
		$('#administration_content').html(data);
	});
}

function open_administration_customer(id) {
	$.get('/administration/customer/' + id, {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').addClass('active');
		
		$('#administration_content').html(data);
		switch_customer_navfield('general', 'general_tab');
	});
}

function open_administration_customer_add() {
	$.get('/administration/customer', {}, function(data) {
		$('#settings_id').removeClass('active');
		$('#agents_id').removeClass('active');
		$('#customers_id').addClass('active');
		
		$('#administration_content').html(data);
	});
}

function toggle_edit_agent_modal(agent_id) {
	$.get('/administration/agents/' + agent_id, {}, function(data) {
		var data = data.agent;
		
		$('#fname_edit_agent_form_modal')[0].value = data.first_name;
		$('#lname_edit_agent_form_modal')[0].value = data.last_name;
		$('#email_edit_agent_form_modal')[0].value = data.email;
		$('#isadmin_edit_agent_form_modal')[0].checked = data.is_admin;
		$('#active_edit_agent_form_modal')[0].checked = data.active;
		
		$('#edit_agent_modal').modal('toggle');
	});
	
	
}

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
