import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("information_sharing_agreement_archive_items", (table) => {
    table.increments("id").primary()
    table.integer("information_sharing_agreement_id").notNullable()
    table.integer("archive_item_id").notNullable()
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

    table.foreign("information_sharing_agreement_id").references("information_sharing_agreements.id")
    table.foreign("archive_item_id").references("archive_items.id")
    table.foreign("creator_id").references("users.id")

    table.unique(["information_sharing_agreement_id", "archive_item_id"], {
      indexName: "information_sharing_agreement_archive_items_unique",
      predicate: knex.whereNull("deleted_at"),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("information_sharing_agreement_archive_items")
}
