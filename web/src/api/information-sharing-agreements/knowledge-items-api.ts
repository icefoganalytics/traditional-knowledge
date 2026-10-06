import http from "@/api/http-client"
import { type KnowledgeItemAsShow } from "@/api/knowledge-items-api"

export type KnowledgeItemCreationAttributes = {
  confidentialityReceipt: boolean
}

export const knowledgeItemsApi = {
  async create(
    informationSharingAgreementId: number,
    attributes: Partial<KnowledgeItemCreationAttributes>,
    files: File[]
  ): Promise<{
    knowledgeItem: KnowledgeItemAsShow
  }> {
    const { data } = await http.post(
      `/api/information-sharing-agreements/${informationSharingAgreementId}/knowledge-items`,
      {
        ...attributes,
        knowledgeItemFilesAttributes: files,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  },
}

export default knowledgeItemsApi
