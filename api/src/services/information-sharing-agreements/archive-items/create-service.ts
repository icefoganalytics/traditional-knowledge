import { type CreationAttributes } from "@sequelize/core"
import { isEmpty, isNil } from "lodash"

import db, {
  ArchiveItem,
  ArchiveItemCategory,
  InformationSharingAgreement,
  InformationSharingAgreementArchiveItem,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { ArchiveItemFiles } from "@/services"

export type ArchiveItemCategoriesAttributes = {
  categoryId: number
}

export type ArchiveItemFilesAttributes = {
  name: string
  path: string
}

export type ArchiveItemCreationAttributes = Partial<CreationAttributes<ArchiveItem>> & {
  archiveItemCategoriesAttributes?: ArchiveItemCategoriesAttributes[]
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
    const {
      title,
      status,
      isDecision,
      confidentialityReceipt,
      securityLevel,
      archiveItemCategoriesAttributes,
      archiveItemFilesAttributes,
      ...optionalAttributes
    } = this.attributes

    if (isNil(title) || isEmpty(title)) {
      throw new Error("Title is required")
    }

    if (isNil(confidentialityReceipt) || confidentialityReceipt !== true) {
      throw new Error("Confidentiality receipt is required, and must be true")
    }

    if (isNil(securityLevel)) {
      throw new Error("Security level is required")
    }

    // TODO: remove these from the model if they are unused by the UI.
    const isDecisionOrFallback = isDecision ?? false
    const statusOrFallback = status ?? ArchiveItem.Statuses.ACCEPTED

    return db.transaction(async () => {
      const archiveItem = await ArchiveItem.create({
        ...optionalAttributes,
        title,
        confidentialityReceipt,
        isDecision: isDecisionOrFallback,
        status: statusOrFallback,
        securityLevel,
        userId: this.currentUser.id,
      })

      await this.linkArchiveItemToInformationSharingAgreement(archiveItem.id)

      if (!isNil(archiveItemFilesAttributes)) {
        await this.uploadFilesForArchiveItem(archiveItem.id, archiveItemFilesAttributes)
      }

      await this.assignCategoriesToArchiveItem(archiveItem.id, archiveItemCategoriesAttributes)

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

  private async assignCategoriesToArchiveItem(
    archiveItemId: number,
    archiveItemCategoriesAttributes: { categoryId: number }[] | undefined
  ): Promise<void> {
    if (isNil(archiveItemCategoriesAttributes) || isEmpty(archiveItemCategoriesAttributes)) {
      return
    }

    const archiveItemCategoriesAttributesWithArchiveItemId = archiveItemCategoriesAttributes.map(
      ({ categoryId }) => ({
        archiveItemId,
        categoryId,
      })
    )
    await ArchiveItemCategory.bulkCreate(archiveItemCategoriesAttributesWithArchiveItemId)
  }
}

export default CreateService
