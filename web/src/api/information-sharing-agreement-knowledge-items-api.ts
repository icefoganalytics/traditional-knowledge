import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type InformationSharingAgreementKnowledgeItem = {
  id: number
  informationSharingAgreementId: number
  knowledgeItemId: number
  creatorId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type InformationSharingAgreementKnowledgeItemWhereOptions = WhereOptions<
  InformationSharingAgreementKnowledgeItem,
  "id" | "informationSharingAgreementId" | "knowledgeItemId" | "creatorId"
>

export type InformationSharingAgreementKnowledgeItemFiltersOptions = FiltersOptions<{
  search: string | string[]
}>

export type InformationSharingAgreementKnowledgeItemQueryOptions = QueryOptions<
  InformationSharingAgreementKnowledgeItemWhereOptions,
  InformationSharingAgreementKnowledgeItemFiltersOptions
>

export const informationSharingAgreementKnowledgeItemsApi = {
  async list(params: InformationSharingAgreementKnowledgeItemQueryOptions = {}): Promise<{
    informationSharingAgreementKnowledgeItems: InformationSharingAgreementKnowledgeItem[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/information-sharing-agreement-knowledge-items", {
      params,
    })
    return data
  },

  async get(informationSharingAgreementKnowledgeItemId: number): Promise<{
    informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/information-sharing-agreement-knowledge-items/${informationSharingAgreementKnowledgeItemId}`
    )
    return data
  },

  async create(attributes: Partial<InformationSharingAgreementKnowledgeItem>): Promise<{
    informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem
  }> {
    const { data } = await http.post(
      "/api/information-sharing-agreement-knowledge-items",
      attributes
    )
    return data
  },

  async update(
    informationSharingAgreementKnowledgeItemId: number,
    attributes: Partial<InformationSharingAgreementKnowledgeItem>
  ): Promise<{
    informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem
  }> {
    const { data } = await http.patch(
      `/api/information-sharing-agreement-knowledge-items/${informationSharingAgreementKnowledgeItemId}`,
      attributes
    )
    return data
  },

  async delete(informationSharingAgreementKnowledgeItemId: number): Promise<void> {
    const { data } = await http.delete(
      `/api/information-sharing-agreement-knowledge-items/${informationSharingAgreementKnowledgeItemId}`
    )
    return data
  },
}

export default informationSharingAgreementKnowledgeItemsApi
