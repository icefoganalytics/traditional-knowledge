import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_groups", (table) => {
    table.boolean("is_admin").notNullable().defaultTo(false)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("user_groups", (table) => {
    table.dropColumn("is_admin")
  })
}
