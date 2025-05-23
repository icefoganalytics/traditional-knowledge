import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("notifications", function (table) {
    table.increments("id").notNullable().primary()
    table.integer("user_id").notNullable()
    table.specificType("read_at", "DATETIME2(0)").nullable()
    table.string("title", 250).notNullable()
    table.string("subtitle", 250).nullable()
    table.string("href", 1000).nullable()
    table.string("source_type", 50).notNullable()

    table
      .specificType("created_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table
      .specificType("updated_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table.specificType("deleted_at", "DATETIME2(0)")

    table.foreign("user_id").references("users.id")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("notifications")
}
