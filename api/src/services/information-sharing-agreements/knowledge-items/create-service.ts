import { type CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import db, {
  KnowledgeItem,
  ExternalOrganization,
  InformationSharingAgreement,
  InformationSharingAgreementKnowledgeItem,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { KnowledgeItemFiles } from "@/services"

const ACCESS_LEVEL_TO_SECURITY_LEVEL: Record<string, number> = {
  [InformationSharingAgreement.AccessLevels.INTERNAL]: KnowledgeItem.Levels.LOW,
  [InformationSharingAgreement.AccessLevels.PROTECTED_AND_LIMITED]: KnowledgeItem.Levels.MEDIUM,
  [InformationSharingAgreement.AccessLevels.CONFIDENTIAL_AND_RESTRICTED]: KnowledgeItem.Levels.HIGH,
}

export type KnowledgeItemFilesAttributes = {
  name: string
  path: string
}

export type KnowledgeItemCreationAttributes = Partial<CreationAttributes<KnowledgeItem>> & {
  knowledgeItemFilesAttributes?: KnowledgeItemFilesAttributes[]
}

export class CreateService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private attributes: KnowledgeItemCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<KnowledgeItem> {
    const { confidentialityReceipt, knowledgeItemFilesAttributes, ...optionalAttributes } =
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
      const knowledgeItem = await KnowledgeItem.create({
        ...optionalAttributes,
        title,
        confidentialityReceipt,
        isDecision: false,
        status: KnowledgeItem.Statuses.ACCEPTED,
        securityLevel,
        sharingPurpose: authorizedApplication,
        description: purpose,
        yukonFirstNations,
        userId: this.currentUser.id,
      })

      await this.linkKnowledgeItemToInformationSharingAgreement(knowledgeItem.id)

      if (!isNil(knowledgeItemFilesAttributes)) {
        await this.uploadFilesForKnowledgeItem(knowledgeItem.id, knowledgeItemFilesAttributes)
      }

      return knowledgeItem.reload({
        include: ["categories", "accessGrants", "user"],
      })
    })
  }

  private async uploadFilesForKnowledgeItem(
    knowledgeItemId: number,
    knowledgeItemFilesAttributes: KnowledgeItemFilesAttributes[]
  ): Promise<void> {
    for (const { name, path } of knowledgeItemFilesAttributes) {
      await KnowledgeItemFiles.CreateService.perform(path, name, { knowledgeItemId })
    }
  }

  private async linkKnowledgeItemToInformationSharingAgreement(
    knowledgeItemId: number
  ): Promise<void> {
    await InformationSharingAgreementKnowledgeItem.create({
      informationSharingAgreementId: this.informationSharingAgreement.id,
      knowledgeItemId: knowledgeItemId,
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
