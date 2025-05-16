import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type InformationSharingAgreement = {
  id: number
  creatorId: number
  sharingGroupId: number
  sharingGroupContactId: number
  receivingGroupId: number
  receivingGroupContactId: number
  title: string
  description: string | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export type InformationSharingAgreementWhereOptions = WhereOptions<
  InformationSharingAgreement,
  | "creatorId"
  | "sharingGroupId"
  | "sharingGroupContactId"
  | "receivingGroupId"
  | "receivingGroupContactId"
  | "title"
  | "description"
  | "startDate"
  | "endDate"
>

export type InformationSharingAgreementFiltersOptions = FiltersOptions<{
  search: string | string[]
}>

export type InformationSharingAgreementQueryOptions = QueryOptions<
  InformationSharingAgreementWhereOptions,
  InformationSharingAgreementFiltersOptions
>

export const informationSharingAgreementsApi = {
  async list(params: InformationSharingAgreementQueryOptions = {}): Promise<{
    informationSharingAgreements: InformationSharingAgreement[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/information-sharing-agreements", {
      params,
    })
    return data
  },
  async get(informationSharingAgreementId: number): Promise<{
    informationSharingAgreement: InformationSharingAgreement
    policy: Policy
  }> {
    const { data } = await http.get(
      `/api/information-sharing-agreements/${informationSharingAgreementId}`
    )
    return data
  },
  async create(attributes: Partial<InformationSharingAgreement>): Promise<{
    informationSharingAgreement: InformationSharingAgreement
  }> {
    const { data } = await http.post("/api/information-sharing-agreements", attributes)
    return data
  },
  async update(
    informationSharingAgreementId: number,
    attributes: Partial<InformationSharingAgreement>
  ): Promise<{
    informationSharingAgreement: InformationSharingAgreement
  }> {
    const { data } = await http.patch(
      `/api/information-sharing-agreements/${informationSharingAgreementId}`,
      attributes
    )
    return data
  },
  async delete(informationSharingAgreementId: number): Promise<void> {
    const { data } = await http.delete(
      `/api/information-sharing-agreements/${informationSharingAgreementId}`
    )
    return data
  },
}

export default informationSharingAgreementsApi
