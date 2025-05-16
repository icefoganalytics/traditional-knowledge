import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export type Group = {
  id: number
  creatorId: number
  name: string
  acronym: string | null
  description: string | null
  isHost: boolean
  createdAt: string
  updatedAt: string
}

export type GroupWhereOptions = WhereOptions<Group, "name" | "acronym" | "isHost">

export type GroupFiltersOptions = FiltersOptions<{
  search: string | string[]
  excludeById: number | number[]
  isAdmin: number
}>

export type GroupQueryOptions = QueryOptions<GroupWhereOptions, GroupFiltersOptions>

export const groupsApi = {
  async list(params: GroupQueryOptions = {}): Promise<{
    groups: Group[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/groups", {
      params,
    })
    return data
  },
  async get(groupId: number): Promise<{
    group: Group
    policy: Policy
  }> {
    const { data } = await http.get(`/api/groups/${groupId}`)
    return data
  },
  async create(attributes: Partial<Group>): Promise<{
    group: Group
  }> {
    const { data } = await http.post("/api/groups", attributes)
    return data
  },
  async update(
    groupId: number,
    attributes: Partial<Group>
  ): Promise<{
    group: Group
  }> {
    const { data } = await http.patch(`/api/groups/${groupId}`, attributes)
    return data
  },
  async delete(groupId: number): Promise<void> {
    const { data } = await http.delete(`/api/groups/${groupId}`)
    return data
  },
}

export default groupsApi
