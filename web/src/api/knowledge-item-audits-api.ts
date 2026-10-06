import http from "@/api/http-client"
import { type User } from "@/api/users-api"
import { type KnowledgeItem } from "@/api/knowledge-items-api"
import { type KnowledgeItemFile } from "@/api/knowledge-item-files-api"

export type KnowledgeItemAudit = {
  id: number
  userId?: number
  knowledgeItemId: number
  knowledgeItemFileId: number
  action: string
  description: string | null
  createdAt: Date | null
  updatedAt: Date | null

  knowledgeItem?: KnowledgeItem | null
  file?: KnowledgeItemFile | null
  user?: User | null
}

export type KnowledgeItemAuditWhereOptions = {
  name?: string
}

export type KnowledgeItemAuditFiltersOptions = {
  search?: string | string[]
}

export const knowledgeItemAuditsApi = {
  async list(
    knowledgeItemId: number,
    params: {
      where?: KnowledgeItemAuditWhereOptions
      filters?: KnowledgeItemAuditFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    knowledgeItemAudits: KnowledgeItemAudit[]
    totalCount: number
  }> {
    const { data } = await http.get(`/api/knowledge-items/${knowledgeItemId}/audits`, {
      params,
    })
    return data
  },
}

export default knowledgeItemAuditsApi
