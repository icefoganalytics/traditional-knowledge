import { pick } from "lodash"

import { InformationSharingAgreement } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type AgreementIndexView = Pick<
  InformationSharingAgreement,
  | "id"
  | "creatorId"
  | "sharingGroupId"
  | "sharingGroupContactId"
  | "receivingGroupId"
  | "receivingGroupContactId"
  | "title"
  | "startDate"
  | "endDate"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<InformationSharingAgreement> {
  perform(): AgreementIndexView {
    return {
      ...pick(this.record, [
        "id",
        "creatorId",
        "sharingGroupId",
        "sharingGroupContactId",
        "receivingGroupId",
        "receivingGroupContactId",
        "title",
        "startDate",
        "endDate",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default IndexSerializer
