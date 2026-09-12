import http from "@/api/http-client"
import { type User } from "@/api/users-api"

export type InformationSharingAgreementAudit = {
  id: number
  userId?: number
  informationSharingAgreementId: number
  action: string
  description: string | null
  createdAt: Date | null
  updatedAt: Date | null

  user?: User | null
}

export type InformationSharingAgreementAuditWhereOptions = {
  name?: string
}

export type InformationSharingAgreementAuditFiltersOptions = {
  search?: string | string[]
}

export const informationSharingAgreementAuditsApi = {
  async list(
    informationSharingAgreementId: number,
    params: {
      where?: InformationSharingAgreementAuditWhereOptions
      filters?: InformationSharingAgreementAuditFiltersOptions
      page?: number
      perPage?: number
    } = {}
  ): Promise<{
    informationSharingAgreementAudits: InformationSharingAgreementAudit[]
    totalCount: number
  }> {
    const { data } = await http.get(
      `/api/information-sharing-agreements/${informationSharingAgreementId}/audits`,
      {
        params,
      }
    )
    return data
  },
}

export default informationSharingAgreementAuditsApi
