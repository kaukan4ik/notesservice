/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {


  return knex.schema.createTable("users", (table) => {
    table.increments("userId");
    table.string("login", 225).notNullable().unique();
    table.string("passwordHash", 225).notNullable();
    table.boolean("isBlock").defaultTo(false).notNullable();
  })
  .createTable("session", (table) => {
    table.string("sessionId").notNullable().unique();
    table.integer("userId").notNullable();
  })
  .createTable("note", (note) => {
    note.bigIncrements("noteId").notNullable().unique();
    note.integer("userId").notNullable();
    note.string("title",1024);
    note.text("text");
    note.timestamp("created", {useTz: true});
    note.boolean("isArhiv");
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex
};
