import { DataTypes, InferAttributes, InferCreationAttributes } from "@sequelize/core"
import { Attribute, ColumnName, PrimaryKey, Table } from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import { type InformationSharingAgreementAccessGrantAccessLevels } from "@/models/information-sharing-agreement-access-grant"

// NOTE: table is actually a "view" added to make policy checks simpler
// See api/src/db/migrations/20260227210312_update-archive-item-information-sharing-agreement-access-grants-view.ts
// TODO: remove tableName/ColumnName pins once the archive_* tables are renamed to knowledge_*.
@Table({
  tableName: "archive_item_information_sharing_agreement_access_grants",
  timestamps: false,
  paranoid: false,
})
export class KnowledgeItemInformationSharingAgreementAccessGrant extends BaseModel<
  InferAttributes<KnowledgeItemInformationSharingAgreementAccessGrant>,
  InferCreationAttributes<KnowledgeItemInformationSharingAgreementAccessGrant>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @ColumnName("archive_item_id")
  declare knowledgeItemId: number

  @Attribute(DataTypes.INTEGER)
  declare informationSharingAgreementId: number

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  declare accessGrantId: number

  @Attribute(DataTypes.INTEGER)
  declare groupId: number

  @Attribute(DataTypes.INTEGER)
  declare userId: number

  @Attribute(DataTypes.INTEGER)
  declare accessLevel: InformationSharingAgreementAccessGrantAccessLevels
}

export default KnowledgeItemInformationSharingAgreementAccessGrant
