import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("information_sharing_agreements", (table) => {
    table.increments("id").primary()
    table.integer("creator_id").notNullable()
    table.integer("sharing_group_id").notNullable()
    table.integer("sharing_group_contact_id").notNullable()
    table.integer("receiving_group_id").notNullable()
    table.integer("receiving_group_contact_id").notNullable()
    table.string("title").notNullable()
    table.text("description").nullable()
    table.date("start_date").notNullable()
    table.date("end_date").notNullable()

    table
      .specificType("created_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table
      .specificType("updated_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table.specificType("deleted_at", "DATETIME2(0)")

    table.foreign("creator_id").references("users.id")
    table.foreign("sharing_group_id").references("groups.id")
    table.foreign("sharing_group_contact_id").references("users.id")
    table.foreign("receiving_group_id").references("groups.id")
    table.foreign("receiving_group_contact_id").references("users.id")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("information_sharing_agreements")
}
