import { isNil } from "lodash"

import logger from "@/utils/logger"

import { ArchiveItem, InformationSharingAgreement } from "@/models"
import { ArchiveItemsPolicy, InformationSharingAgreementPolicy } from "@/policies"
import { InformationSharingAgreements } from "@/services"
import { ShowSerializer } from "@/serializers/archive-items"
import BaseController from "@/controllers/base-controller"

export class ArchiveItemsController extends BaseController<ArchiveItem> {
  async create() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found.",
        })
      }

      const informationSharingAgreementPolicy = this.buildInformationSharingAgreementPolicy(
        informationSharingAgreement
      )
      if (!informationSharingAgreementPolicy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this information sharing agreement.",
        })
      }

      const policy = this.buildPolicy()
      if (!policy.create()) {
        return this.response.status(403).json({
          message:
            "You are not authorized to create archive items for this information sharing agreement.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const archiveItem = await InformationSharingAgreements.ArchiveItems.CreateService.perform(
        informationSharingAgreement,
        permittedAttributes,
        this.currentUser
      )

      const serializedArchiveItem = ShowSerializer.perform(archiveItem)
      return this.response.status(201).json({
        archiveItem: serializedArchiveItem,
        policy,
      })
    } catch (error) {
      logger.error(`Error creating archive item: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error creating archive item: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreement(): Promise<InformationSharingAgreement | null> {
    return InformationSharingAgreement.findByPk(this.params.informationSharingAgreementId)
  }

  private buildInformationSharingAgreementPolicy(
    informationSharingAgreement: InformationSharingAgreement
  ): InformationSharingAgreementPolicy {
    return new InformationSharingAgreementPolicy(this.currentUser, informationSharingAgreement)
  }

  private buildPolicy(archiveItem: ArchiveItem = ArchiveItem.build()): ArchiveItemsPolicy {
    archiveItem.accessGrants ??= []
    return new ArchiveItemsPolicy(this.currentUser, archiveItem)
  }
}

export default ArchiveItemsController
