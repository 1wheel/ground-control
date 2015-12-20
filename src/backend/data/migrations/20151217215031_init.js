
exports.up = async function(knex, Promise) {
  let promises = [
    knex.schema.createTableIfNotExists('zip_codes', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.string('zip').unique().index();
      table.string('city').notNullable()
      table.string('state').notNullable();
      table.float('latitude').notNullable();
      table.float('longitude').notNullable();
      table.integer('timezone_offset').notNullable().index();
      table.boolean('has_dst').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_people', function(table) {
      table.bigint('cons_id').primary();
      table.string('prefix');
      table.string('firstname');
      table.string('middlename');
      table.string('lastname');
      table.string('suffix');
      table.specificType('gender', 'char(1)');
      table.date('birth_dt');
      table.string('title');
      table.string('employer');
      table.string('occupation');
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_addresses', function(table) {
      table.bigint('cons_addr_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').index();
      table.string('addr1', 300);
      table.string('addr2', 300);
      table.string('addr3', 300);
      table.string('city');
      table.string('state_cd').index();
      table.string('zip').index();
      table.string('zip_4');
      table.specificType('country', 'char(2)');
      table.float('latitude').notNullable().index();
      table.float('longitude').notNullable().index();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_surveys', function(table) {
      table.bigint('signup_form_id').primary();
      table.string('signup_form_slug');
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_events', function(table) {
      table.bigint('event_id').primary();
      table.string('event_id_obfuscated');
      table.boolean('flag_approval').notNullable();
      table.string('name').notNullable();
      table.text('description').notNullable();
      table.string('venue_name').notNullable();
      table.string('venue_zip');
      table.string('venue_city').notNullable();
      table.string('venue_state_cd').notNullable();
      table.string('venue_addr1').notNullable();
      table.string('venue_addr2')
      table.string('venue_country').notNullable();
      table.text('venue_directions');
      table.string('start_tz');
      table.dateTime('start_dt').index();
      table.float('duration');
      table.integer('capacity').notNullable();
      table.boolean('attendee_volunteer_show').notNullable();
      table.text('attendee_volunteer_message');
      table.integer('is_searchable').notNullable();
      table.boolean('public_phone').notNullable();
      table.string('contact_phone');
      table.boolean('host_receive_rsvp_emails').notNullable();
      table.boolean('rsvp_use_reminder_email').notNullable();
      table.float('rsvp_email_reminder_hours');
      table.float('latitude').notNullable().index();
      table.float('longitude').notNullable().index();
      table.bigint('creator_cons_id').index().notNullable();
      table.bigint('event_type_id').index().notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_groups', function(table) {
      table.bigint('cons_group_id').primary();
      table.string('name').notNullable();
      table.string('description')
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_person_bsd_groups', function(table) {
      table.bigint('cons_id').notNullable().index();
      table.bigint('cons_group_id').notNullable().index();
      table.primary(['cons_id', 'cons_group_id']);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_event_types', function(table) {
      table.bigint('event_type_id').primary();
      table.string('name').notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_phones', function(table) {
      table.bigint('cons_phone_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').notNullable();
      table.string('phone').notNullable();
      table.boolean('isunsub')
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_emails', function(table) {
      table.bigint('cons_email_id').primary();
      table.bigint('cons_id').notNullable().index();
      table.boolean('is_primary').notNullable().index();
      table.string('email').notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('bsd_event_attendees', function(table) {
      table.bigint('event_attendee_id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.bigint('attendee_cons_id').notNullable().index();
      table.bigint('event_id').notNullable().index();
    }),

    knex.schema.createTableIfNotExists('gc_bsd_surveys', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.enu('renderer', ['BSDSurvey', 'BSDPhonebankRSVPSurvey']);
      table.specificType('processors', 'varchar(255)[]');
      table.bigint('signup_form_id').notNullable().index();
    }),

    knex.schema.createTableIfNotExists('bsd_audits', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.string('class').notNullable();
      table.string('method').notNullable();
      table.string('params').notNullable();
      table.string('error').notNullable();
    }),

    knex.schema.createTableIfNotExists('gc_bsd_groups', function(table) {
      table.increments('id').primary();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
      table.text('query');
      table.bigint('cons_group_id').index().nullable();
    }),

    knex.schema.createTableIfNotExists('bsd_person_gc_bsd_groups', function(table) {
      table.bigint('cons_id').index().notNullable();
      table.integer('gc_bsd_group_id').index().notNullable();
      table.primary(['cons_id', 'gc_bsd_group_id']);
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('users', function (table) {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.boolean('is_admin').notNullable().defaultTo(false);
      table.string('password').notNullable();
      table.timestamp('modified_dt').notNullable();
      table.timestamp('create_dt').notNullable();
    }),

    knex.schema.createTableIfNotExists('sessions', function(table) {
      table.string('sid').primary();
      table.json('sess').notNullable();
      table.timestamp('expired', 'true').notNullable().index();
    })
  ]

  await Promise.all(promises);
  await knex.schema.createTableIfNotExists('bsd_call_assignments', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.string('name').notNullable();
    table.integer('gc_bsd_survey_id').index().references('id').inTable('gc_bsd_surveys').notNullable();
    table.integer('gc_bsd_group_id').index().references('id').inTable('gc_bsd_groups').notNullable();
  });
  await knex.schema.createTableIfNotExists('bsd_calls', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.timestamp('attempted_at').notNullable().index();
    table.boolean('left_voicemail');
    table.boolean('sent_text');
    table.enu('reason_not_completed', ['NO_PICKUP', 'CALL_BACK', 'NOT_INTERESTED', 'OTHER_LANGUAGE', 'WRONG_NUMBER', 'DISCONNECTED_NUMBER']).index()
    table.integer('caller_id').index().notNullable().references('id').inTable('users')
    table.bigint('interviewee_id').index().notNullable()
    table.integer('call_assignment_id').index().notNullable().references('id').inTable('bsd_call_assignments')
  });
  await knex.schema.createTableIfNotExists('bsd_assigned_calls', function(table) {
    table.increments('id').primary();
    table.timestamp('modified_dt').notNullable();
    table.timestamp('create_dt').notNullable();
    table.integer('caller_id').index().references('id').inTable('users').notNullable();
    table.bigint('interviewee_id').index().notNullable();
    table.integer('call_assignment_id').index().references('id').inTable('bsd_call_assignments').notNullable();
  });
};

exports.down = function(knex, Promise) {

};
