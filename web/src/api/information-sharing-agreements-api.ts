import { isNil, omitBy } from "lodash"

import { API_BASE_URL } from "@/config"
import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type AttachmentAsReference } from "@/api/attachments-api"

export enum InformationSharingAgreementAccessLevels {
  INTERNAL = "internal",
  PROTECTED_AND_LIMITED = "protected_and_limited",
  CONFIDENTIAL_AND_RESTRICTED = "confidential_and_restricted",
}

export enum InformationSharingAgreementExpirationConditions {
  COMPLETION_OF_PURPOSE = "completion_of_purpose",
  EXPIRATION_DATE = "expiration_date",
  UNDETERMINED_WITH_DEFAULT_EXPIRATION = "undetermined_with_default_expiration",
}

// TODO: rename to InformationSharingAgreementConfidentialityTypes for consistency
export enum InformationSharingAgreementConfidentialityType {
  ACCORDANCE = "ACCORDANCE",
  ACCEPTED_IN_CONFIDENCE = "ACCEPTED_IN_CONFIDENCE",
}

export enum InformationSharingAgreementStatuses {
  DRAFT = "draft",
  SIGNED = "signed",
  CLOSED = "closed",
}

/** Keep in sync with api/src/models/information-sharing-agreement.ts */
export type InformationSharingAgreement = {
  id: number
  creatorId: number
  externalGroupId: number | null
  externalGroupContactId: number | null
  internalGroupId: number | null
  internalGroupContactId: number | null
  internalGroupSecondaryContactId: number | null
  status: InformationSharingAgreementStatuses
  identifier: string | null
  externalGroupInfo: string | null
  internalGroupInfo: string | null
  externalGroupContactName: string | null
  internalGroupContactName: string | null
  externalGroupContactTitle: string | null
  internalGroupContactTitle: string | null
  signedById: number | null
  signedAt: string | null
  title: string
  description: string | null
  purpose: string | null
  detailLevel: string | null
  detailNotes: string | null
  formats: string | null
  accessLevel: InformationSharingAgreementAccessLevels | null
  accessLevelDepartmentRestriction: string | null
  accessLevelBranchRestriction: string | null
  accessLevelUnitRestriction: string | null
  hasAdditionalAccessRestrictions: boolean | null
  additionalAccessRestrictions: string | null
  expirationCondition: InformationSharingAgreementExpirationConditions | null
  confidentialityType: InformationSharingAgreementConfidentialityType | null
  authorizedApplication: string | null
  creditLines: string | null
  creditNotes: string | null
  expirationActions: string | null
  expirationNotes: string | null
  breachActions: string | null
  breachNotes: string | null
  disclosureNotes: string | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/information-sharing-agreements/index-serializer.ts */
export type InformationSharingAgreementAsIndex = Pick<
  InformationSharingAgreement,
  | "id"
  | "creatorId"
  | "externalGroupId"
  | "externalGroupContactId"
  | "internalGroupId"
  | "internalGroupContactId"
  | "status"
  | "title"
  | "createdAt"
  | "updatedAt"
> & {
  startDate: string | null
  endDate: string | null
} & {
  policy: Policy
}

/** Keep in sync with api/src/serializers/information-sharing-agreements/show-serializer.ts */
export type InformationSharingAgreementAsShow = Pick<
  InformationSharingAgreement,
  | "id"
  | "creatorId"
  | "externalGroupId"
  | "externalGroupContactId"
  | "internalGroupId"
  | "internalGroupContactId"
  | "internalGroupSecondaryContactId"
  | "status"
  | "identifier"
  | "externalGroupInfo"
  | "internalGroupInfo"
  | "externalGroupContactName"
  | "internalGroupContactName"
  | "externalGroupContactTitle"
  | "internalGroupContactTitle"
  | "signedById"
  | "title"
  | "description"
  | "purpose"
  | "detailLevel"
  | "detailNotes"
  | "formats"
  | "accessLevel"
  | "accessLevelDepartmentRestriction"
  | "accessLevelBranchRestriction"
  | "accessLevelUnitRestriction"
  | "hasAdditionalAccessRestrictions"
  | "additionalAccessRestrictions"
  | "expirationCondition"
  | "confidentialityType"
  | "authorizedApplication"
  | "creditLines"
  | "creditNotes"
  | "expirationActions"
  | "expirationNotes"
  | "breachActions"
  | "breachNotes"
  | "disclosureNotes"
  | "createdAt"
  | "updatedAt"
> & {
  startDate: string | null
  endDate: string | null
  signedAt: string | null
  // Associations
  signedConfidentialityAcknowledgement: AttachmentAsReference | null
  signedConfidentialityReceipt: AttachmentAsReference | null
}

export type InformationSharingAgreementPolicy = Policy

export type InformationSharingAgreementWhereOptions = WhereOptions<
  InformationSharingAgreement,
  | "creatorId"
  | "externalGroupId"
  | "externalGroupContactId"
  | "internalGroupId"
  | "internalGroupContactId"
  | "internalGroupSecondaryContactId"
  | "status"
  | "identifier"
  | "externalGroupInfo"
  | "internalGroupInfo"
  | "externalGroupContactName"
  | "internalGroupContactName"
  | "externalGroupContactTitle"
  | "internalGroupContactTitle"
  | "signedById"
  | "signedAt"
  | "title"
  | "description"
  | "purpose"
  | "detailLevel"
  | "detailNotes"
  | "formats"
  | "accessLevel"
  | "accessLevelDepartmentRestriction"
  | "accessLevelBranchRestriction"
  | "accessLevelUnitRestriction"
  | "hasAdditionalAccessRestrictions"
  | "additionalAccessRestrictions"
  | "expirationCondition"
  | "confidentialityType"
  | "authorizedApplication"
  | "creditLines"
  | "creditNotes"
  | "expirationActions"
  | "expirationNotes"
  | "breachActions"
  | "breachNotes"
  | "disclosureNotes"
  | "startDate"
  | "endDate"
>

export type InformationSharingAgreementFiltersOptions = FiltersOptions<{
  search: string | string[]
  notAssociatedWithArchiveItem: number
  notLinkedToAnyArchiveItem: boolean
}>

export type InformationSharingAgreementQueryOptions = QueryOptions<
  InformationSharingAgreementWhereOptions,
  InformationSharingAgreementFiltersOptions
>

export const informationSharingAgreementsApi = {
  generateConfidentialityAcknowledgementPath(informationSharingAgreementId: number) {
    return `${API_BASE_URL}/api/information-sharing-agreements/${informationSharingAgreementId}/generate-confidentiality-acknowledgement?format=docx`
  },
  generateConfidentialityReceiptPath(informationSharingAgreementId: number) {
    return `${API_BASE_URL}/api/information-sharing-agreements/${informationSharingAgreementId}/generate-confidentiality-receipt?format=docx`
  },

  async list(params: InformationSharingAgreementQueryOptions = {}): Promise<{
    informationSharingAgreements: InformationSharingAgreementAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/information-sharing-agreements", {
      params,
    })
    return data
  },
  async get(informationSharingAgreementId: number): Promise<{
    informationSharingAgreement: InformationSharingAgreementAsShow
    policy: InformationSharingAgreementPolicy
  }> {
    const { data } = await http.get(
      `/api/information-sharing-agreements/${informationSharingAgreementId}`
    )
    return data
  },
  async create(attributes: Partial<InformationSharingAgreement>): Promise<{
    informationSharingAgreement: InformationSharingAgreementAsShow
  }> {
    const { data } = await http.post("/api/information-sharing-agreements", attributes)
    return data
  },
  async update(
    informationSharingAgreementId: number,
    attributes: Partial<InformationSharingAgreement>
  ): Promise<{
    informationSharingAgreement: InformationSharingAgreementAsShow
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

  // Stateful Actions
  async sign(
    informationSharingAgreementId: number,
    attributes: {
      signedConfidentialityAcknowledgement: File
      signedConfidentialityReceipt?: File | null
    }
  ): Promise<{
    informationSharingAgreement: InformationSharingAgreementAsShow
  }> {
    const cleanedAttributes = omitBy(attributes, isNil)
    // https://github.com/axios/axios?tab=readme-ov-file#files-posting
    // Axios supports the following shortcut methods: postForm, putForm, patchForm which are just the corresponding http methods with the Content-Type header preset to multipart/form-data.
    const { data } = await http.postForm(
      `/api/information-sharing-agreements/${informationSharingAgreementId}/sign`,
      cleanedAttributes
    )
    return data
  },
  async revertToDraft(informationSharingAgreementId: number): Promise<{
    informationSharingAgreement: InformationSharingAgreementAsShow
  }> {
    const { data } = await http.post(
      `/api/information-sharing-agreements/${informationSharingAgreementId}/revert-to-draft`
    )
    return data
  },
}

export default informationSharingAgreementsApi
