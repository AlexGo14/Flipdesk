
var objects = {
  setCustomerObjectAdminsSettings: function(input) {
    var customer = {
      'id': input.id,
      'name': input.name,
      'email': input.email_contact,
      'create_timestamp': input.create_timestamp,
      'update_timestamp': input.update_timestamp,
      'admin': { 'id': input.fk_created_by_admin },
      'active': input.active,
      'email_mailbox': input.email_mailbox,
      'username_mailbox': input.username_mailbox,
      'password_mailbox': input.password_mailbox,
      'email_mailbox_imap': input.email_mailbox_imap,
      'email_mailbox_smtp': input.email_mailbox_smtp
    };

    return customer;
  },
  setAgentObject: function(input) {
		return {
			'id': input.id,
			'first_name': input.first_name,
			'last_name': input.last_name,
			'create_timestamp': {
				'short': moment(input.create_timestamp).tz('Europe/Berlin').startOf('minute').fromNow(),
				'detailed': moment(input.create_timestamp).tz('Europe/Berlin').format('Do MMMM YYYY, h:mm a')
			},
			'update_timestamp': {
				'short': moment(input.create_timestamp).tz('Europe/Berlin').startOf('minute').fromNow(),
				'detailed': moment(input.create_timestamp).tz('Europe/Berlin').format('Do MMMM YYYY, h:mm a')
			},
			'is_admin': input.is_admin,
			'email': input.email,
			'active': input.active
		};
	},
  setUserObject: function(input) {
		return {
			'id': input.id,
			'first_name': input.first_name,
			'last_name': input.last_name,
			'email': input.email,
			'customer': {'id': input.fk_customer_id},
			'create_timestamp': input.create_timestamp,
			'update_timestamp': input.update_timestamp,
			'active': input.active
		};
	}
}

module.exports = objects;
