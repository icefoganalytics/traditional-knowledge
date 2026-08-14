import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type ExternalOrganizationAsReference } from "@/api/external-organizations-api"
import { type GroupAsReference } from "@/api/groups-api"
import { type InformationSharingAgreementAccessGrantAsReference } from "@/api/information-sharing-agreement-access-grants-api"

/** Keep in sync with api/src/models/user.ts */
export enum UserRoles {
  SYSTEM_ADMIN = "system_admin",
  /** Manages internal (Yukon Government) users only. */
  ADMIN = "admin",
  /** Manages external (First Nation and Indigenous Government) users only. */
  EXTERNAL_ADMIN = "external_admin",
  USER = "user",
}

/** Keep in sync with api/src/models/user.ts */
export type User = {
  id: number
  creatorId: number | null
  email: string
  auth0Subject: string
  activeDirectoryIdentifier: string | null
  isExternal: boolean
  firstName: string
  lastName: string
  displayName: string
  roles: UserRoles[]
  title: string | null
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
  phoneNumber: string | null
  externalOrganizationId: number | null
  lastSyncSuccessAt: string | null
  lastSyncFailureAt: string | null
  deactivatedAt: string | null
  deactivationReason: string | null
  lastActiveAt: string | null
  emailNotificationsEnabled: boolean
  createdAt: string
  updatedAt: string
}

/** Keep in sync with api/src/serializers/users/index-serializer.ts */
export type UserAsIndex = Pick<
  User,
  | "id"
  | "email"
  | "auth0Subject"
  | "activeDirectoryIdentifier"
  | "isExternal"
  | "externalOrganizationId"
  | "firstName"
  | "lastName"
  | "displayName"
  | "roles"
  | "title"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "phoneNumber"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "deactivatedAt"
  | "deactivationReason"
  | "lastActiveAt"
  | "emailNotificationsEnabled"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
> & {
  isActive: boolean
  /** Which Yukon First Nation or Indigenous Government an external user belongs to. */
  externalOrganization: ExternalOrganizationAsReference | null
}

/** Keep in sync with api/src/serializers/users/show-serializer.ts */
export type UserAsShow = Pick<
  User,
  | "id"
  | "email"
  | "auth0Subject"
  | "activeDirectoryIdentifier"
  | "isExternal"
  | "externalOrganizationId"
  | "firstName"
  | "lastName"
  | "displayName"
  | "roles"
  | "title"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "phoneNumber"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "deactivatedAt"
  | "deactivationReason"
  | "lastActiveAt"
  | "emailNotificationsEnabled"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
> & {
  isActive: boolean
} & {
  adminGroups: GroupAsReference[]
  adminInformationSharingAgreementAccessGrants: InformationSharingAgreementAccessGrantAsReference[]
  /** Which Yukon First Nation or Indigenous Government an external user belongs to. */
  externalOrganization: ExternalOrganizationAsReference | null
}

/** Keep in sync with api/src/serializers/users/reference-serializer.ts */
export type UserAsReference = Pick<
  User,
  | "id"
  | "email"
  | "firstName"
  | "lastName"
  | "displayName"
  | "title"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "emailNotificationsEnabled"
>

export type UserPolicy = Policy

export type UserWhereOptions = WhereOptions<
  User,
  | "email"
  | "isExternal"
  | "title"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "emailNotificationsEnabled"
>

/** must match model scopes */
export type UserFiltersOptions = FiltersOptions<{
  search: string | string[]
  inGroup: number
  notInGroup: number
  withoutAccessGrantFor: number
  withSameTypeAsGroup: number
  // TODO: implement isActive scope in back-end
}>

export type UserQueryOptions = QueryOptions<UserWhereOptions, UserFiltersOptions>

export const usersApi = {
  UserRoles,

  async list(params: UserQueryOptions = {}): Promise<{
    users: UserAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/users", {
      params,
    })
    return data
  },

  async get(userId: number): Promise<{
    user: UserAsShow
    policy: UserPolicy
  }> {
    const { data } = await http.get(`/api/users/${userId}`)
    return data
  },

  async create(attributes: Partial<User>): Promise<{
    user: UserAsShow
    policy: UserPolicy
  }> {
    const { data } = await http.post("/api/users", attributes)
    return data
  },

  async update(
    userId: number,
    attributes: Partial<User>
  ): Promise<{
    user: UserAsShow
    policy: UserPolicy
  }> {
    const { data } = await http.patch(`/api/users/${userId}`, attributes)
    return data
  },

  async delete(userId: number): Promise<void> {
    const { data } = await http.delete(`/api/users/${userId}`)
    return data
  },

  // Stateful Actions
  async activate(userId: number): Promise<{ user: UserAsShow }> {
    const { data } = await http.delete(`/api/users/${userId}/deactivate`)
    return data
  },

  async deactivate(userId: number, attributes: Partial<User>): Promise<{ user: UserAsShow }> {
    const { data } = await http.post(`/api/users/${userId}/deactivate`, attributes)
    return data
  },

  // Special Actions
  async directorySync(userId: number): Promise<{
    user: UserAsShow
    policy: UserPolicy
  }> {
    const { data } = await http.post(`/api/users/${userId}/directory-sync`)
    return data
  },
}

export default usersApi
