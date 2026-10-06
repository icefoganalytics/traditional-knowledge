import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type GroupAsReference } from "@/api/groups-api"
import { type UserAsReference } from "@/api/users-api"

export enum InformationSharingAgreementAccessGrantAccessLevels {
  READ = "read",
  READ_DOWNLOAD = "read_download",
  EDIT = "edit",
  ADMIN = "admin",
}

export type InformationSharingAgreementAccessGrant = {
  id: number
  informationSharingAgreementId: number
  groupId: number
  userId: number
  accessLevel: InformationSharingAgreementAccessGrantAccessLevels
  creatorId: number
  createdAt: string
  updatedAt: string
}

export type InformationSharingAgreementAccessGrantIndexView =
  InformationSharingAgreementAccessGrant & {
    user: UserAsReference
    group: GroupAsReference
  }

/** Keep in sync with api/src/serializers/information-sharing-agreement-access-grants/reference-serializer.ts */
export type InformationSharingAgreementAccessGrantAsReference = Pick<
  InformationSharingAgreementAccessGrant,
  "id" | "informationSharingAgreementId" | "groupId" | "userId" | "accessLevel" | "creatorId"
>

export type InformationSharingAgreementAccessGrantWhereOptions = WhereOptions<
  InformationSharingAgreementAccessGrant,
  "informationSharingAgreementId" | "groupId" | "userId" | "accessLevel" | "creatorId"
>

export type InformationSharingAgreementAccessGrantFiltersOptions = FiltersOptions<{
  search: string | string[]
  forKnowledgeItemId: number | number[]
}>

export type InformationSharingAgreementAccessGrantQueryOptions = QueryOptions<
  InformationSharingAgreementAccessGrantWhereOptions,
  InformationSharingAgreementAccessGrantFiltersOptions
>

export const informationSharingAgreementAccessGrantsApi = {
  async list(params: InformationSharingAgreementAccessGrantQueryOptions = {}): Promise<{
    informationSharingAgreementAccessGrants: InformationSharingAgreementAccessGrantIndexView[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/information-sharing-agreement-access-grants", {
      params,
    })
    return data
  },
  async get(informationSharingAgreementAccessGrantId: number): Promise<{
    informationSharingAgreementAccessGrant: InformationSharingAgreementAccessGrant
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/information-sharing-agreement-access-grants/${informationSharingAgreementAccessGrantId}`
    )
    return data
  },
  async create(attributes: Partial<InformationSharingAgreementAccessGrant>): Promise<{
    informationSharingAgreementAccessGrant: InformationSharingAgreementAccessGrant
  }> {
    const { data } = await http.post("/api/information-sharing-agreement-access-grants", attributes)
    return data
  },
  async delete(informationSharingAgreementAccessGrantId: number): Promise<void> {
    const { data } = await http.delete(
      `/api/information-sharing-agreement-access-grants/${informationSharingAgreementAccessGrantId}`
    )
    return data
  },
}

export default informationSharingAgreementAccessGrantsApi
