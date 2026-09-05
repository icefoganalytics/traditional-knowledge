import { isNil, isUndefined, pick } from "lodash"

import { formatDate } from "@/utils/formatters"
import { Attachments } from "@/serializers"

import { Attachment, InformationSharingAgreement } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type InformationSharingAgreementAsShow = Pick<
  InformationSharingAgreement,
  | "id"
  | "creatorId"
  | "externalGroupId"
  | "externalGroupContactId"
  | "internalGroupId"
  | "internalGroupContactId"
  | "internalGroupSecondaryContactId"
  | "status"
  | "identifier"
  | "externalGroupInfo"
  | "internalGroupInfo"
  | "externalGroupContactName"
  | "internalGroupContactName"
  | "externalGroupContactTitle"
  | "internalGroupContactTitle"
  | "signedById"
  | "title"
  | "description"
  | "purpose"
  | "detailLevel"
  | "detailNotes"
  | "formats"
  | "accessLevel"
  | "accessLevelDepartmentRestriction"
  | "accessLevelBranchRestriction"
  | "accessLevelUnitRestriction"
  | "hasAdditionalAccessRestrictions"
  | "additionalAccessRestrictions"
  | "expirationCondition"
  | "confidentialityType"
  | "authorizedApplication"
  | "creditLines"
  | "creditNotes"
  | "expirationActions"
  | "expirationNotes"
  | "breachActions"
  | "breachNotes"
  | "disclosureNotes"
  | "createdAt"
  | "updatedAt"
> & {
  startDate: string | null
  endDate: string | null
  signedAt: string | null
  // Associations
  signedConfidentialityAcknowledgement: Attachments.AsReference | null
  signedConfidentialityReceipt: Attachments.AsReference | null
}

export class ShowSerializer extends BaseSerializer<InformationSharingAgreement> {
  perform(): InformationSharingAgreementAsShow {
    const { signedConfidentialityAcknowledgement, signedConfidentialityReceipt } = this.record
    if (isUndefined(signedConfidentialityAcknowledgement)) {
      throw new Error(
        "Expected signed confidentiality acknowledgement association to be preloaded."
      )
    }

    if (isUndefined(signedConfidentialityReceipt)) {
      throw new Error("Expected signed confidentiality receipt association to be preloaded.")
    }

    const { startDate, endDate, signedAt } = this.record
    const formattedStartDate = formatDate(startDate)
    const formattedEndDate = formatDate(endDate)
    const formattedSignedAt = formatDate(signedAt)

    const serializedSignedConfidentialityAcknowledgement =
      this.serializeSignedConfidentialityAcknowledgement(signedConfidentialityAcknowledgement)
    const serializedSignedConfidentialityReceipt = this.serializeSignedConfidentialityReceipt(
      signedConfidentialityReceipt
    )

    return {
      ...pick(this.record, [
        "id",
        "creatorId",
        "externalGroupId",
        "externalGroupContactId",
        "internalGroupId",
        "internalGroupContactId",
        "internalGroupSecondaryContactId",
        "status",
        "identifier",
        "externalGroupInfo",
        "internalGroupInfo",
        "externalGroupContactName",
        "internalGroupContactName",
        "externalGroupContactTitle",
        "internalGroupContactTitle",
        "signedById",
        "title",
        "description",
        "purpose",
        "detailLevel",
        "detailNotes",
        "formats",
        "accessLevel",
        "accessLevelDepartmentRestriction",
        "accessLevelBranchRestriction",
        "accessLevelUnitRestriction",
        "hasAdditionalAccessRestrictions",
        "additionalAccessRestrictions",
        "expirationCondition",
        "confidentialityType",
        "authorizedApplication",
        "creditLines",
        "creditNotes",
        "expirationActions",
        "expirationNotes",
        "breachActions",
        "breachNotes",
        "disclosureNotes",
        "createdAt",
        "updatedAt",
      ]),
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      signedAt: formattedSignedAt,
      signedConfidentialityAcknowledgement: serializedSignedConfidentialityAcknowledgement,
      signedConfidentialityReceipt: serializedSignedConfidentialityReceipt,
    }
  }

  private serializeSignedConfidentialityAcknowledgement(
    signedConfidentialityAcknowledgement: Attachment | null
  ): Attachments.AsReference | null {
    if (isNil(signedConfidentialityAcknowledgement)) return null

    return Attachments.ReferenceSerializer.perform(signedConfidentialityAcknowledgement)
  }

  private serializeSignedConfidentialityReceipt(
    signedConfidentialityReceipt: Attachment | null
  ): Attachments.AsReference | null {
    if (isNil(signedConfidentialityReceipt)) return null

    return Attachments.ReferenceSerializer.perform(signedConfidentialityReceipt)
  }
}

export default ShowSerializer
