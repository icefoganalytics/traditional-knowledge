import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("information_sharing_agreement_audits", function (table) {
    table.increments("id").notNullable().primary()
    table.integer("user_id").nullable().references("id").inTable("users")
    table
      .integer("information_sharing_agreement_id")
      .notNullable()
      .references("id")
      .inTable("information_sharing_agreements")
    table.string("action", 200).notNullable()
    table.string("description", 2000).nullable()

    table
      .specificType("created_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table
      .specificType("updated_at", "DATETIME2(0)")
      .notNullable()
      .defaultTo(knex.raw("GETUTCDATE()"))
    table.specificType("deleted_at", "DATETIME2(0)")
  })

  await knex.schema.alterTable("information_sharing_agreements", function (table) {
    table.boolean("audit_enabled").notNullable().defaultTo(false)
  })

  await knex("information_sharing_agreements")
    .whereNot({ status: "draft" })
    .update({ audit_enabled: true })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("information_sharing_agreements", function (table) {
    table.dropColumn("audit_enabled")
  })

  await knex.schema.dropTable("information_sharing_agreement_audits")
}
