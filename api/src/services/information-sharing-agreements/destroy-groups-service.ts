import { isNil } from "lodash"

import db, {
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  UserGroup,
  User,
} from "@/models"
import BaseService from "@/services/base-service"

export class DestroyGroupsService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const {
      id: informationSharingAgreementId,
      externalGroupId,
      internalGroupId,
    } = this.informationSharingAgreement

    if (isNil(externalGroupId)) {
      throw new Error("External group ID is required")
    }

    if (isNil(internalGroupId)) {
      throw new Error("Internal group ID is required")
    }

    return db.transaction(async () => {
      await this.removeChildEntities(
        informationSharingAgreementId,
        externalGroupId,
        internalGroupId
      )
      await this.informationSharingAgreement.update({
        externalGroupId: null,
        internalGroupId: null,
      })
    })
  }

  private async removeChildEntities(
    informationSharingAgreementId: number,
    externalGroupId: number,
    internalGroupId: number
  ): Promise<void> {
    await this.removeChildAccessGrants(informationSharingAgreementId)
    await this.removeChildUserGroups(externalGroupId, internalGroupId)
    await this.removeChildGroup(externalGroupId, internalGroupId)
  }

  private async removeChildAccessGrants(informationSharingAgreementId: number): Promise<void> {
    await InformationSharingAgreementAccessGrant.destroy({
      where: {
        informationSharingAgreementId,
      },
    })
  }

  private async removeChildUserGroups(
    externalGroupId: number,
    internalGroupId: number
  ): Promise<void> {
    await UserGroup.destroy({
      where: {
        groupId: [externalGroupId, internalGroupId],
      },
    })
  }

  private async removeChildGroup(externalGroupId: number, internalGroupId: number): Promise<void> {
    await Group.destroy({
      where: {
        id: [externalGroupId, internalGroupId],
      },
    })
  }
}

export default DestroyGroupsService
