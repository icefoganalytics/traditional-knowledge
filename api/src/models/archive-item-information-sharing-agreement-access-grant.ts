import { DataTypes, InferAttributes, InferCreationAttributes } from "@sequelize/core"
import { Attribute, PrimaryKey, Table } from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"

// NOTE: table is actually a "view" added to make policy checks simpler
// See api/src/db/migrations/20250523215742_create-archive-item-information-sharing-agreement-access-grants-table.ts
@Table({
  timestamps: false,
  paranoid: false,
})
export class ArchiveItemInformationSharingAgreementAccessGrant extends BaseModel<
  InferAttributes<ArchiveItemInformationSharingAgreementAccessGrant>,
  InferCreationAttributes<ArchiveItemInformationSharingAgreementAccessGrant>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  declare archiveItemId: number

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  declare informationSharingAgreementAccessGrantId: number
}

export default ArchiveItemInformationSharingAgreementAccessGrant
