import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User, InformationSharingAgreement } from "@/models"
import BaseService from "@/services/base-service"
import { EnsureAdminAccessService } from "@/services/information-sharing-agreements/admin-access-grants-service"

export type InformationSharingAgreementCreationAttributes = Partial<
  Attributes<InformationSharingAgreement>
>

export class CreateService extends BaseService {
  constructor(
    private attributes: InformationSharingAgreementCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreement> {
    const {
      title,
      sharingGroupId,
      sharingGroupContactId,
      receivingGroupId,
      receivingGroupContactId,
      startDate,
      endDate,
      ...optionalAttributes
    } = this.attributes

    if (isNil(title)) {
      throw new Error("Title is required")
    }

    if (isNil(sharingGroupId)) {
      throw new Error("Sharing group is required")
    }

    if (isNil(sharingGroupContactId)) {
      throw new Error("Sharing group contact is required")
    }

    if (isNil(receivingGroupId)) {
      throw new Error("Receiving group is required")
    }

    if (isNil(receivingGroupContactId)) {
      throw new Error("Receiving group contact is required")
    }

    if (isNil(startDate)) {
      throw new Error("Start date is required")
    }

    if (isNil(endDate)) {
      throw new Error("End date is required")
    }

    return db.transaction(async () => {
      const informationSharingAgreement = await InformationSharingAgreement.create({
        creatorId: this.currentUser.id,
        title,
        sharingGroupId,
        sharingGroupContactId,
        receivingGroupId,
        receivingGroupContactId,
        startDate,
        endDate,
        ...optionalAttributes,
      })

      await this.ensureAdminAccessGrants(
        informationSharingAgreement.id,
        informationSharingAgreement.sharingGroupId,
        informationSharingAgreement.sharingGroupContactId,
        informationSharingAgreement.receivingGroupId,
        informationSharingAgreement.receivingGroupContactId,
        this.currentUser
      )

      return informationSharingAgreement
    })
  }

  private async ensureAdminAccessGrants(
    informationSharingAgreementId: number,
    sharingGroupId: number,
    sharingGroupContactId: number,
    receivingGroupId: number,
    receivingGroupContactId: number,
    currentUser: User
  ) {
    await EnsureAdminAccessService.perform(
      informationSharingAgreementId,
      sharingGroupId,
      sharingGroupContactId,
      receivingGroupId,
      receivingGroupContactId,
      currentUser
    )
  }
}

export default CreateService
