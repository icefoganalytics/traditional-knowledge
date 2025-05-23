import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ `
    CREATE VIEW archive_item_information_sharing_agreement_access_grants AS
    SELECT
      information_sharing_agreement_archive_items.archive_item_id,
      information_sharing_agreement_access_grants.id AS information_sharing_agreement_access_grant_id
    FROM
      information_sharing_agreement_archive_items
      JOIN information_sharing_agreement_access_grants ON information_sharing_agreement_access_grants.information_sharing_agreement_id = information_sharing_agreement_archive_items.information_sharing_agreement_id
    WHERE
      information_sharing_agreement_archive_items.deleted_at IS NULL
      AND information_sharing_agreement_access_grants.deleted_at IS NULL;
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(/* sql */ ` DROP VIEW archive_item_information_sharing_agreement_access_grants; `)
}
