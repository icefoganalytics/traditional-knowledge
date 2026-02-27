import { DataTypes, InferAttributes, InferCreationAttributes } from "@sequelize/core"
import { Attribute, PrimaryKey, Table } from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import { type InformationSharingAgreementAccessGrantAccessLevels } from "@/models/information-sharing-agreement-access-grant"

// NOTE: table is actually a "view" added to make policy checks simpler
// See api/src/db/migrations/20260227210312_update-archive-item-information-sharing-agreement-access-grants-view.ts
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

export default ArchiveItemInformationSharingAgreementAccessGrant
