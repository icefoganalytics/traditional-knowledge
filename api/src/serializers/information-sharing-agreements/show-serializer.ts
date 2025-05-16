import { pick } from "lodash"

import { InformationSharingAgreement } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AgreementShowView = Pick<
  InformationSharingAgreement,
  | "id"
  | "creatorId"
  | "sharingGroupId"
  | "sharingGroupContactId"
  | "receivingGroupId"
  | "receivingGroupContactId"
  | "title"
  | "description"
  | "startDate"
  | "endDate"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<InformationSharingAgreement> {
  perform(): AgreementShowView {
    return {
      ...pick(this.record, [
        "id",
        "creatorId",
        "sharingGroupId",
        "sharingGroupContactId",
        "receivingGroupId",
        "receivingGroupContactId",
        "title",
        "description",
        "startDate",
        "endDate",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
