import { isNil, truncate } from "lodash"
import { DateTime } from "luxon"

import db, { Group, InformationSharingAgreement, User, UserGroup } from "@/models"
import BaseService from "@/services/base-service"
import { Groups, UserGroups } from "@/services"

export class CreateGroupsService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const {
      id: informationSharingAgreementId,
      externalGroupContactId,
      externalGroupId,
      internalGroupContactId,
      internalGroupId,
      signedAt,
    } = this.informationSharingAgreement

    if (isNil(externalGroupContactId)) {
      throw new Error("External group contact ID must be present to create external group")
    }
    if (isNil(internalGroupContactId)) {
      throw new Error("Internal group contact ID must be present to create internal group")
    }
    if (isNil(signedAt)) {
      throw new Error("Signed date must be present to create groups")
    }

    return db.transaction(async () => {
      const externalGroup = await this.ensureExternalGroup(
        informationSharingAgreementId,
        externalGroupId,
        externalGroupContactId,
        signedAt
      )
      const internalGroup = await this.ensureInternalGroup(
        informationSharingAgreementId,
        internalGroupId,
        internalGroupContactId,
        signedAt
      )

      await this.informationSharingAgreement.update({
        externalGroupId: externalGroup.id,
        internalGroupId: internalGroup.id,
      })

      await this.ensureExternalGroupAdmin(externalGroupContactId, externalGroup)
      await this.ensureInternalGroupAdmin(internalGroupContactId, internalGroup)
    })
  }

  private async ensureExternalGroup(
    informationSharingAgreementId: number,
    externalGroupId: number | null,
    externalGroupContactId: number,
    signedAt: Date
  ): Promise<Group> {
    if (!isNil(externalGroupId)) {
      const existingGroup = await Group.findByPk(externalGroupId)
      if (!isNil(existingGroup)) return existingGroup
    }

    const externalGroupContact = await User.findByPk(externalGroupContactId, {
      include: ["externalOrganization"],
    })
    if (isNil(externalGroupContact)) {
      throw new Error("External group contact not found")
    }

    if (externalGroupContact.isExternal !== true) {
      throw new Error("External group contact must be an external user")
    }

    if (isNil(externalGroupContact.externalOrganization)) {
      throw new Error("External group contact is missing its associated external organization")
    }

    const signedDate = this.formatSignedDate(signedAt)
    const externalGroupName = this.buildGroupName(
      informationSharingAgreementId,
      externalGroupContact.externalOrganization.name,
      signedDate
    )
    return Groups.CreateService.perform(
      {
        name: externalGroupName,
        isExternal: true,
      },
      this.currentUser
    )
  }

  private async ensureInternalGroup(
    informationSharingAgreementId: number,
    internalGroupId: number | null,
    internalGroupContactId: number,
    signedAt: Date
  ): Promise<Group> {
    if (!isNil(internalGroupId)) {
      const existingGroup = await Group.findByPk(internalGroupId)
      if (!isNil(existingGroup)) return existingGroup
    }

    const internalGroupContact = await User.findByPk(internalGroupContactId)
    if (isNil(internalGroupContact)) {
      throw new Error("Internal group contact not found")
    }

    if (internalGroupContact.isExternal !== false) {
      throw new Error("Internal group contact must be an internal user")
    }

    const signedDate = this.formatSignedDate(signedAt)
    const internalGroupName = this.buildGroupName(
      informationSharingAgreementId,
      internalGroupContact.department ?? "UNKNOWN",
      signedDate
    )
    return Groups.CreateService.perform(
      {
        name: internalGroupName,
        isExternal: false,
      },
      this.currentUser
    )
  }

  private async ensureExternalGroupAdmin(
    externalGroupContactId: number,
    externalGroup: Group
  ): Promise<void> {
    const externalGroupContact = await User.findByPk(externalGroupContactId)
    if (isNil(externalGroupContact)) {
      throw new Error("External group contact not found")
    }

    await this.ensureGroupAdmin(externalGroupContact, externalGroup)
  }

  /**
   * The secondary contact (Manager) is deliberately excluded: that field records who
   * the Manager is on the contract, and must not grant group admin or membership.
   * See TK-66.
   */
  private async ensureInternalGroupAdmin(
    internalGroupContactId: number,
    internalGroup: Group
  ): Promise<void> {
    const internalGroupContact = await User.findByPk(internalGroupContactId)
    if (isNil(internalGroupContact)) {
      throw new Error("Internal group contact not found")
    }

    await this.ensureGroupAdmin(internalGroupContact, internalGroup)
  }

  private async ensureGroupAdmin(user: User, group: Group): Promise<void> {
    const existingUserGroup = await UserGroup.findOne({
      where: {
        userId: user.id,
        groupId: group.id,
      },
    })

    if (!isNil(existingUserGroup)) {
      if (!existingUserGroup.isAdmin) {
        await existingUserGroup.update({
          isAdmin: true,
        })
      }

      return
    }

    await UserGroups.CreateService.perform(
      {
        userId: user.id,
        groupId: group.id,
        isAdmin: true,
      },
      this.currentUser
    )
  }

  private formatSignedDate(signedAt: Date): string {
    return DateTime.fromJSDate(signedAt).toFormat("yyyy-MM-dd")
  }

  private buildGroupName(
    informationSharingAgreementId: number,
    groupName: string,
    signedDate: string
  ): string {
    const prefix = `ISA#${informationSharingAgreementId}-`
    const suffix = `-${signedDate}`
    const groupNameMaxLength = 100 - prefix.length - suffix.length
    const truncatedGroupName = truncate(groupName, {
      length: groupNameMaxLength,
      omission: "",
    })
    return `${prefix}${truncatedGroupName}${suffix}`
  }
}

export default CreateGroupsService
