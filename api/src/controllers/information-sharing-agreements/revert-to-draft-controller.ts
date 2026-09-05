import { isNil } from "lodash"

import logger from "@/utils/logger"

import { InformationSharingAgreement } from "@/models"
import { RevertToDraftPolicy } from "@/policies/information-sharing-agreements"
import { RevertToDraftService } from "@/services/information-sharing-agreements"
import { ShowSerializer } from "@/serializers/information-sharing-agreements"
import BaseController from "@/controllers/base-controller"

export class RevertToDraftController extends BaseController<InformationSharingAgreement> {
  async create() {
    try {
      const informationSharingAgreement = await this.loadInformationSharingAgreement()
      if (isNil(informationSharingAgreement)) {
        return this.response.status(404).json({
          message: "Information sharing agreement not found.",
        })
      }

      const policy = this.buildPolicy(informationSharingAgreement)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to revert this agreement to draft.",
        })
      }

      const updatedInformationSharingAgreement = await RevertToDraftService.perform(
        informationSharingAgreement,
        this.currentUser
      )
      const serializedInformationSharingAgreement = ShowSerializer.perform(
        updatedInformationSharingAgreement
      )
      return this.response.json({
        informationSharingAgreement: serializedInformationSharingAgreement,
      })
    } catch (error) {
      logger.error(`Failed to revert information sharing agreement to draft: ${error}`, { error })
      return this.response.status(422).json({
        message: `Failed to revert information sharing agreement to draft: ${error}`,
      })
    }
  }

  private async loadInformationSharingAgreement(): Promise<InformationSharingAgreement | null> {
    return InformationSharingAgreement.findByPk(this.params.informationSharingAgreementId, {
      include: ["accessGrants"],
    })
  }

  private buildPolicy(informationSharingAgreement: InformationSharingAgreement) {
    return new RevertToDraftPolicy(this.currentUser, informationSharingAgreement)
  }
}

export default RevertToDraftController
