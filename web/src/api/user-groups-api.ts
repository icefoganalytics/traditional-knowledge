import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type User } from "@/api/users-api"

export type UserGroup = {
  id: number
  userId: number
  groupId: number
  creatorId: number
  createdAt: string
  updatedAt: string
}

export type UserGroupAsIndex = UserGroup & {
  user: User
}

export type UserGroupWhereOptions = WhereOptions<UserGroup, "userId" | "groupId" | "creatorId">

export type UserGroupFiltersOptions = FiltersOptions<{
  searchUser: string | string[]
}>

export type UserGroupQueryOptions = QueryOptions<UserGroupWhereOptions, UserGroupFiltersOptions>

export const userGroupsApi = {
  async list(params: UserGroupQueryOptions = {}): Promise<{
    userGroups: UserGroupAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/user-groups", {
      params,
    })
    return data
  },
  async get(userGroupId: number): Promise<{
    userGroup: UserGroup
    policy: Policy
  }> {
    const { data } = await http.get(`/api/user-groups/${userGroupId}`)
    return data
  },
  async create(attributes: Partial<UserGroup>): Promise<{
    userGroup: UserGroup
  }> {
    const { data } = await http.post("/api/user-groups", attributes)
    return data
  },
  async update(
    userGroupId: number,
    attributes: Partial<UserGroup>
  ): Promise<{
    userGroup: UserGroup
  }> {
    const { data } = await http.patch(`/api/user-groups/${userGroupId}`, attributes)
    return data
  },
  async delete(userGroupId: number): Promise<void> {
    const { data } = await http.delete(`/api/user-groups/${userGroupId}`)
    return data
  },
}

export default userGroupsApi
