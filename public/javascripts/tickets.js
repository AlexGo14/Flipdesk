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
