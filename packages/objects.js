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
	},
	setCustomerObject: function(input) {

		var customer = {
			'id': input.id,
			'name': input.name,
			'email': input.email_contact,
			'create_timestamp': input.create_timestamp,
			'update_timestamp': input.update_timestamp,
			'admin': { 'id': input.fk_created_by_admin },
			'active': input.active
		};

		return customer;
	},
  setTicketObject: function(input) {
    var ticket = {
      'id': input.id,
      'description': input.description,
      'caption': input.caption,
      'comments': [],
      'create_timestamp': {
          'short': moment(input.create_timestamp).tz('Europe/Berlin').startOf('minute').fromNow(),
          'detailed': moment(input.create_timestamp).tz('Europe/Berlin').format('Do MMMM YYYY, h:mm a'),
          'system': input.create_timestamp
       },
       'update_timestamp': null,
      'agent': {'id': input.fk_agent_id },
      'user': { 'id': input.fk_user_id },
      'company' : { 'id': input.fk_customer_id},
      'solved': input.solved,
      'archived': input.archived
    };

    if(input.update_timestamp != null) {
      ticket.update_timestamp = {
          'short': moment(input.update_timestamp).tz('Europe/Berlin').startOf('minute').fromNow(),
          'detailed': moment(input.update_timestamp).tz('Europe/Berlin').format('Do MMMM YYYY, h:mm a')
      };
    }

    return ticket;
  },
  setCommentObject: function(input) {
    return {
      'id': input.id,
      'description': input.description,
      'user': {'id': input.fk_user_id},
      'agent': {'id': input.fk_agent_id},
      'ticket': {'id': input.fk_ticket_id},
      'previous_comment': {'id': input.fk_previous_comment_id},
      'create_timestamp': {
          'short': moment(input.create_timestamp).tz('Europe/Berlin').startOf('minute').fromNow(),
          'detailed': moment(input.create_timestamp).tz('Europe/Berlin').format('Do MMMM YYYY, h:mm a')
       }
    };
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
      'active': input.active,
      'login_pw_change': input.login_pw_change
    };
  }
}

module.exports = objects;
