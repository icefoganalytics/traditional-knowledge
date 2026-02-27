import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/external-organization.ts */
export type ExternalOrganization = {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/external-organizations/index.ts */
export type ExternalOrganizationAsIndex = Pick<
  ExternalOrganization,
  "id" | "name" | "createdAt" | "updatedAt"
>

/** Keep in sync with api/src/serializers/external-organizations/index.ts */
export type ExternalOrganizationAsShow = Pick<
  ExternalOrganization,
  "id" | "name" | "createdAt" | "updatedAt"
>

/** Keep in sync with api/src/serializers/external-organizations/index.ts */
export type ExternalOrganizationAsReference = Pick<
  ExternalOrganization,
  "id" | "name" | "createdAt" | "updatedAt"
>

export type ExternalOrganizationPolicy = Policy

export type ExternalOrganizationWhereOptions = WhereOptions<ExternalOrganization, "name">

/** must match model scopes */
export type ExternalOrganizationFiltersOptions = FiltersOptions<{
  search: string | string[]
  excludeById: number | number[]
  withUserId: number
}>

export type ExternalOrganizationQueryOptions = QueryOptions<
  ExternalOrganizationWhereOptions,
  ExternalOrganizationFiltersOptions
>

export const externalOrganizationsApi = {
  async list(params: ExternalOrganizationQueryOptions = {}): Promise<{
    externalOrganizations: ExternalOrganizationAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/external-organizations", {
      params,
    })
    return data
  },

  async get(externalOrganizationId: number): Promise<{
    externalOrganization: ExternalOrganizationAsShow
    policy: ExternalOrganizationPolicy
  }> {
    const { data } = await http.get(`/api/external-organizations/${externalOrganizationId}`)
    return data
  },

  async create(attributes: Partial<ExternalOrganization>): Promise<{
    externalOrganization: ExternalOrganizationAsShow
    policy: ExternalOrganizationPolicy
  }> {
    const { data } = await http.post("/api/external-organizations", attributes)
    return data
  },

  async update(
    externalOrganizationId: number,
    attributes: Partial<ExternalOrganization>
  ): Promise<{
    externalOrganization: ExternalOrganizationAsShow
    policy: ExternalOrganizationPolicy
  }> {
    const { data } = await http.patch(
      `/api/external-organizations/${externalOrganizationId}`,
      attributes
    )
    return data
  },

  async delete(externalOrganizationId: number): Promise<void> {
    const { data } = await http.delete(`/api/external-organizations/${externalOrganizationId}`)
    return data
  },
}

export default externalOrganizationsApi
