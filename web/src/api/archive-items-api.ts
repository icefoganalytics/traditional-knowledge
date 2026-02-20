import { type GenericFormData } from "axios"

import { Category } from "@/api/categories-api"
import { type ArchiveItemFile } from "@/api/archive-item-files-api"
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

export enum ArchiveItemStatus {
  ACCEPTED = "Accepted",
  REVIEWED = "Reviewed",
  HIDDEN = "Hidden",
  EXPIRING_SOON = "Expiring Soon",
}

export type ArchiveItem = {
  id: number
  title: string
  userId: number | null
  sharingPurpose: string | null
  confidentialityReceipt: boolean
  yukonFirstNations: string[] | null
  description: string | null
  summary: string | null
  status: ArchiveItemStatus
  securityLevel: SecurityLevel
  tags: string[]
  submittedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null

  files: ArchiveItemFile[] | null // TODO: move to appropriate view?
  categories: Category[] | null
}

export type ArchiveItemShowView = ArchiveItem & {
  user: User
  informationSharingAgreementAccessGrants: InformationSharingAgreementAccessGrant[]
}

export type ArchiveItemCreate = {
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

export type ArchiveItemWhereOptions = WhereOptions<
  ArchiveItem,
  "id" | "title" | "userId" | "status" | "securityLevel"
>

export type ArchiveItemFiltersOptions = FiltersOptions<{
  search: string | string[]
}>

export type ArchiveItemQueryOptions = QueryOptions<
  ArchiveItemWhereOptions,
  ArchiveItemFiltersOptions
>

export const archiveItemsApi = {
  async list(params: ArchiveItemQueryOptions): Promise<{
    archiveItems: ArchiveItem[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/archive-items", {
      params,
    })
    return data
  },
  async get(archiveItemId: number): Promise<{
    archiveItem: ArchiveItemShowView
    policy: Policy
  }> {
    const { data } = await http.get(`/api/archive-items/${archiveItemId}`)
    return data
  },
  async create(attributes: FormData | GenericFormData | Partial<ArchiveItemCreate>): Promise<{
    archiveItem: ArchiveItemShowView
  }> {
    const { data } = await http.post("/api/archive-items", attributes, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },
  async update(
    archiveItemId: number,
    attributes: Partial<ArchiveItem>
  ): Promise<{
    archiveItem: ArchiveItemShowView
  }> {
    const { data } = await http.patch(`/api/archive-items/${archiveItemId}`, attributes)
    return data
  },
  async delete(archiveItemId: number): Promise<void> {
    const { data } = await http.delete(`/api/archive-items/${archiveItemId}`)
    return data
  },

  async download(archiveItemId: number, fileId: number, getProtected: boolean) {
    const { data } = await http.get(
      `/api/archive-items/${archiveItemId}/files/${fileId}${getProtected ? "?format=protected" : ""}`,
      {
        responseType: "blob",
      }
    )
    return data
  },
}

export default archiveItemsApi
