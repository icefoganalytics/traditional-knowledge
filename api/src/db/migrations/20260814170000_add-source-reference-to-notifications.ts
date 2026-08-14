import type { Knex } from "knex"

/**
 * Lets a notification point back at the record that caused it, so repeatable jobs such
 * as the agreement expiry scan can tell whether they have already notified someone.
 *
 * The filtered unique index is the backstop: without it two scheduler replicas running
 * at once would each pass the "already sent?" check and both send. See TK-6.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("notifications", function (table) {
    table.integer("source_id").nullable()
    table.string("source_key", 100).nullable()
  })

  await knex.raw(/* sql */ `
    CREATE UNIQUE INDEX notifications_source_reference_unique
    ON notifications (user_id, source_type, source_id, source_key)
    WHERE deleted_at IS NULL
      AND source_id IS NOT NULL
      AND source_key IS NOT NULL;
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    DROP INDEX notifications_source_reference_unique ON notifications;
  `)

  await knex.schema.alterTable("notifications", function (table) {
    table.dropColumn("source_id")
    table.dropColumn("source_key")
  })
}
