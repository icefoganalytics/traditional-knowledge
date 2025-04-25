import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("groups", (table) => {
    table.increments("id").primary()
    table.integer("creator_id").notNullable()
    table.string("name").notNullable()
    table.string("acronym").nullable()
    table.text("description").nullable()
    table.boolean("is_host").notNullable().defaultTo(false)

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

    table.unique(["name"], {
      indexName: "groups_name_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("groups")
}
