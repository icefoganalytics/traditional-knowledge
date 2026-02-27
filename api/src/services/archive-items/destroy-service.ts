import db, {
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemCategory,
  ArchiveItemFile,
  InformationSharingAgreementArchiveItem,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { ArchiveItemFiles } from "@/services"

export class DestroyService extends BaseService {
  constructor(
    private archiveItem: ArchiveItem,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { id: archiveItemId, title } = this.archiveItem
    const { displayName } = this.currentUser

    return db.transaction(async () => {
      await this.removeChildEntities(archiveItemId)

      await this.archiveItem.destroy()

      await this.trackArchiveItemDestroyEvent(archiveItemId, title, displayName)
    })
  }

  private async removeChildEntities(archiveItemId: number): Promise<void> {
    await this.removeInformationSharingAgreementLinks(archiveItemId)
    await this.removeCategories(archiveItemId)
    await this.removeFiles(archiveItemId)
    await this.removeAuditTrail(archiveItemId)
  }

  private async removeInformationSharingAgreementLinks(archiveItemId: number): Promise<void> {
    await InformationSharingAgreementArchiveItem.destroy({
      where: {
        archiveItemId,
      },
    })
  }

  private async removeCategories(archiveItemId: number): Promise<void> {
    await ArchiveItemCategory.destroy({
      where: {
        archiveItemId,
      },
    })
  }

  private async removeFiles(archiveItemId: number): Promise<void> {
    await ArchiveItemFile.findEach(
      {
        where: {
          archiveItemId,
        },
      },
      async (archiveItemFile) => {
        await ArchiveItemFiles.DestroyService.perform(archiveItemFile, this.currentUser)
      }
    )
  }

  // TODO: Consider if we want to keep the audit trail even after the item is deleted.
  private async removeAuditTrail(archiveItemId: number): Promise<void> {
    await ArchiveItemAudit.destroy({
      where: {
        archiveItemId,
      },
    })
  }

  private async trackArchiveItemDestroyEvent(
    archiveItemId: number,
    title: string,
    displayName: string
  ): Promise<void> {
    await ArchiveItemAudit.create({
      archiveItemId,
      action: "Deleted",
      userId: this.currentUser.id,
      description: `${displayName} deleted archive item "${title}"`,
    })
  }
}

export default DestroyService
