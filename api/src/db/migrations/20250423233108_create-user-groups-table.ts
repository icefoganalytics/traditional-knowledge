import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_groups", (table) => {
    table.increments("id").primary()
    table.integer("user_id").notNullable()
    table.integer("group_id").notNullable()
    table.integer("creator_id").notNullable()

    table
      .specificType("created_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table
      .specificType("updated_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table.specificType("deleted_at", "DATETIME2(0)")

    table
      .foreign("user_id")
      .references("users.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .foreign("group_id")
      .references("groups.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE")

    table
      .foreign("creator_id")
      .references("users.id")

    table.unique(["user_id", "group_id"], {
      indexName: "user_groups_user_id_group_id_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_groups")
}
