import { type GenericFormData } from "axios"

import { Category } from "@/api/categories-api"
import { type KnowledgeItemFile } from "@/api/knowledge-item-files-api"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type InformationSharingAgreementAccessGrant } from "@/api/information-sharing-agreement-access-grants-api"
import http from "@/api/http-client"
import { type User } from "@/api/users-api"

export enum SecurityLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum KnowledgeItemStatus {
  ACCEPTED = "Accepted",
  REVIEWED = "Reviewed",
  HIDDEN = "Hidden",
  EXPIRING_SOON = "Expiring Soon",
}

export type KnowledgeItem = {
  id: number
  title: string
  userId: number | null
  sharingPurpose: string | null
  confidentialityReceipt: boolean
  yukonFirstNations: string[] | null
  description: string | null
  summary: string | null
  status: KnowledgeItemStatus
  securityLevel: SecurityLevel
  tags: string[]
  submittedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null

  files: KnowledgeItemFile[] | null // TODO: move to appropriate view?
  categories: Category[] | null
}

export type KnowledgeItemAsShow = KnowledgeItem & {
  user: User
  accessGrants: InformationSharingAgreementAccessGrant[]
}

export type KnowledgeItemCreate = {
  title: string
  description: string | null
  summary: string | null
  sharingPurpose: string | null
  confidentialityReceipt: boolean
  yukonFirstNations: string[] | null
  securityLevel: SecurityLevel
  tags: string[] | null

  files: File[] | null
  categoryIds: number[] | null
}

export type KnowledgeItemWhereOptions = WhereOptions<
  KnowledgeItem,
  "id" | "title" | "userId" | "status" | "securityLevel"
>

export type KnowledgeItemFiltersOptions = FiltersOptions<{
  search: string | string[]
}>

export type KnowledgeItemQueryOptions = QueryOptions<
  KnowledgeItemWhereOptions,
  KnowledgeItemFiltersOptions
>

export const knowledgeItemsApi = {
  async list(params: KnowledgeItemQueryOptions): Promise<{
    knowledgeItems: KnowledgeItem[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/knowledge-items", {
      params,
    })
    return data
  },
  async get(knowledgeItemId: number): Promise<{
    knowledgeItem: KnowledgeItemAsShow
    policy: Policy
  }> {
    const { data } = await http.get(`/api/knowledge-items/${knowledgeItemId}`)
    return data
  },
  async create(attributes: FormData | GenericFormData | Partial<KnowledgeItemCreate>): Promise<{
    knowledgeItem: KnowledgeItemAsShow
  }> {
    const { data } = await http.post("/api/knowledge-items", attributes, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },
  async update(
    knowledgeItemId: number,
    attributes: Partial<KnowledgeItem>
  ): Promise<{
    knowledgeItem: KnowledgeItemAsShow
  }> {
    const { data } = await http.patch(`/api/knowledge-items/${knowledgeItemId}`, attributes)
    return data
  },
  async delete(knowledgeItemId: number): Promise<void> {
    const { data } = await http.delete(`/api/knowledge-items/${knowledgeItemId}`)
    return data
  },

  // Special Actions
  async createFiles(
    knowledgeItemId: number,
    files: File[]
  ): Promise<{
    knowledgeItemFiles: KnowledgeItemFile[]
  }> {
    const { data } = await http.post(
      `/api/knowledge-items/${knowledgeItemId}/files`,
      { files },
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return data
  },
  async download(knowledgeItemId: number, fileId: number, getProtected: boolean) {
    const { data } = await http.get(
      `/api/knowledge-items/${knowledgeItemId}/files/${fileId}${getProtected ? "?format=protected" : ""}`,
      {
        responseType: "blob",
      }
    )
    return data
  },
}

export default knowledgeItemsApi
