import db, {
  KnowledgeItem,
  KnowledgeItemAudit,
  KnowledgeItemCategory,
  KnowledgeItemFile,
  InformationSharingAgreementKnowledgeItem,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { KnowledgeItemFiles } from "@/services"

export class DestroyService extends BaseService {
  constructor(
    private knowledgeItem: KnowledgeItem,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { id: knowledgeItemId, title } = this.knowledgeItem
    const { displayName } = this.currentUser

    return db.transaction(async () => {
      await this.removeChildEntities(knowledgeItemId)

      await this.knowledgeItem.destroy()

      await this.trackKnowledgeItemDestroyEvent(knowledgeItemId, title, displayName)
    })
  }

  private async removeChildEntities(knowledgeItemId: number): Promise<void> {
    await this.removeInformationSharingAgreementLinks(knowledgeItemId)
    await this.removeCategories(knowledgeItemId)
    await this.removeFiles(knowledgeItemId)
    await this.removeAuditTrail(knowledgeItemId)
  }

  private async removeInformationSharingAgreementLinks(knowledgeItemId: number): Promise<void> {
    await InformationSharingAgreementKnowledgeItem.destroy({
      where: {
        knowledgeItemId,
      },
    })
  }

  private async removeCategories(knowledgeItemId: number): Promise<void> {
    await KnowledgeItemCategory.destroy({
      where: {
        knowledgeItemId,
      },
    })
  }

  private async removeFiles(knowledgeItemId: number): Promise<void> {
    await KnowledgeItemFile.findEach(
      {
        where: {
          knowledgeItemId,
        },
      },
      async (knowledgeItemFile) => {
        await KnowledgeItemFiles.DestroyService.perform(knowledgeItemFile, this.currentUser)
      }
    )
  }

  // TODO: Consider if we want to keep the audit trail even after the item is deleted.
  private async removeAuditTrail(knowledgeItemId: number): Promise<void> {
    await KnowledgeItemAudit.destroy({
      where: {
        knowledgeItemId,
      },
    })
  }

  private async trackKnowledgeItemDestroyEvent(
    knowledgeItemId: number,
    title: string,
    displayName: string
  ): Promise<void> {
    await KnowledgeItemAudit.create({
      knowledgeItemId,
      action: "Deleted",
      userId: this.currentUser.id,
      description: `${displayName} deleted knowledge item "${title}"`,
    })
  }
}

export default DestroyService
