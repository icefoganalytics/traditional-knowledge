import { pick } from "lodash"

import { InformationSharingAgreementKnowledgeItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type KnowledgeItemIndexView = Pick<
  InformationSharingAgreementKnowledgeItem,
  | "id"
  | "informationSharingAgreementId"
  | "knowledgeItemId"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<InformationSharingAgreementKnowledgeItem> {
  perform(): KnowledgeItemIndexView {
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

export default IndexSerializer
