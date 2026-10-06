import { pick } from "lodash"

import { InformationSharingAgreementKnowledgeItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type KnowledgeItemShowView = Pick<
  InformationSharingAgreementKnowledgeItem,
  | "id"
  | "informationSharingAgreementId"
  | "knowledgeItemId"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<InformationSharingAgreementKnowledgeItem> {
  perform(): KnowledgeItemShowView {
    return {
      ...pick(this.record, [
        "id",
        "informationSharingAgreementId",
        "knowledgeItemId",
        "creatorId",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
