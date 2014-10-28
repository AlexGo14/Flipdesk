function ticket_click(id) {
	$.get('/tickets/' + id, '', function(data, textStatus) {
		$('#ticket_space').html(data);
	}, 'html');
}

function ticket_create_comment(id) {
	
}

function show_createTicketModal() {
	$('#createTicketModal').modal('show');
}

function ticket_send(ticket) {
	var test = $("#send_ticket_form");
}
