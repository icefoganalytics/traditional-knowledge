import { DataTypes, InferAttributes, InferCreationAttributes } from "@sequelize/core"
import { Attribute, PrimaryKey, Table } from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"

// NOTE: table is actual a "view" added to make policy checks simpler
// See api/src/db/migrations/20250522163912_add-information-sharing-agreement-acess-grant-siblings-view.ts
@Table({
  timestamps: false,
  paranoid: false,
})
export class InformationSharingAgreementAccessGrantSibling extends BaseModel<
  InferAttributes<InformationSharingAgreementAccessGrantSibling>,
  InferCreationAttributes<InformationSharingAgreementAccessGrantSibling>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  declare informationSharingAgreementAccessGrantId: number

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  declare informationSharingAgreementAccessGrantSiblingId: number
}

export default InformationSharingAgreementAccessGrantSibling
