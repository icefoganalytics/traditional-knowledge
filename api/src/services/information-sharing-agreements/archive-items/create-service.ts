import { type CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import db, {
  ArchiveItem,
  ExternalOrganization,
  InformationSharingAgreement,
  InformationSharingAgreementArchiveItem,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { ArchiveItemFiles } from "@/services"

const ACCESS_LEVEL_TO_SECURITY_LEVEL: Record<string, number> = {
  [InformationSharingAgreement.AccessLevels.INTERNAL]: ArchiveItem.Levels.LOW,
  [InformationSharingAgreement.AccessLevels.PROTECTED_AND_LIMITED]: ArchiveItem.Levels.MEDIUM,
  [InformationSharingAgreement.AccessLevels.CONFIDENTIAL_AND_RESTRICTED]: ArchiveItem.Levels.HIGH,
}

export type ArchiveItemFilesAttributes = {
  name: string
  path: string
}

export type ArchiveItemCreationAttributes = Partial<CreationAttributes<ArchiveItem>> & {
  archiveItemFilesAttributes?: ArchiveItemFilesAttributes[]
}

export class CreateService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private attributes: ArchiveItemCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<ArchiveItem> {
    const { confidentialityReceipt, archiveItemFilesAttributes, ...optionalAttributes } =
      this.attributes

    if (isNil(confidentialityReceipt) || confidentialityReceipt !== true) {
      throw new Error("Confidentiality receipt is required, and must be true")
    }

    const { title, purpose, authorizedApplication, accessLevel, externalGroupContactId } =
      this.informationSharingAgreement

    if (isNil(title) || isEmpty(title)) {
      throw new Error("Title is required")
    }

    const accessLevelOrDefault = accessLevel ?? InformationSharingAgreement.AccessLevels.INTERNAL
    const securityLevel = ACCESS_LEVEL_TO_SECURITY_LEVEL[accessLevelOrDefault]

    const yukonFirstNations = await this.resolveYukonFirstNations(externalGroupContactId)

    return db.transaction(async () => {
      const archiveItem = await ArchiveItem.create({
        ...optionalAttributes,
        title,
        confidentialityReceipt,
        isDecision: false,
        status: ArchiveItem.Statuses.ACCEPTED,
        securityLevel,
        sharingPurpose: authorizedApplication,
        description: purpose,
        yukonFirstNations,
        userId: this.currentUser.id,
      })

      await this.linkArchiveItemToInformationSharingAgreement(archiveItem.id)

      if (!isNil(archiveItemFilesAttributes)) {
        await this.uploadFilesForArchiveItem(archiveItem.id, archiveItemFilesAttributes)
      }

      return archiveItem.reload({
        include: ["categories", "accessGrants", "user"],
      })
    })
  }

  private async uploadFilesForArchiveItem(
    archiveItemId: number,
    archiveItemFilesAttributes: ArchiveItemFilesAttributes[]
  ): Promise<void> {
    for (const { name, path } of archiveItemFilesAttributes) {
      await ArchiveItemFiles.CreateService.perform(path, name, { archiveItemId })
    }
  }

  private async linkArchiveItemToInformationSharingAgreement(archiveItemId: number): Promise<void> {
    await InformationSharingAgreementArchiveItem.create({
      informationSharingAgreementId: this.informationSharingAgreement.id,
      archiveItemId: archiveItemId,
      creatorId: this.currentUser.id,
    })
  }

  private async resolveYukonFirstNations(
    externalGroupContactId: number | null
  ): Promise<string[] | null> {
    if (isNil(externalGroupContactId)) return null

    const organization = await ExternalOrganization.findOne({
      include: [
        {
          association: "users",
          attributes: [],
          where: {
            id: externalGroupContactId,
          },
        },
      ],
    })

    if (isNil(organization)) return null

    const { name } = organization
    return [name]
  }
}

export default CreateService
