import { isEmpty } from "lodash"
import { type Ref } from "vue"
import { useRouteQuery } from "@vueuse/router"

import { type VDataTable } from "vuetify/lib/components/VDataTable/index.mjs"

import { jsonTransformer } from "@/utils/use-route-query-transformers"

export type SortItem = VDataTable["sortBy"][0]

export function useVuetifySortByToSafeRouteQuery(
  name: string,
  defaultValue?: SortItem[] | undefined
): Ref<SortItem[] | undefined> {
  const defaultValueString = jsonTransformer.set(defaultValue)

  function get<T>(value: string | undefined): T | undefined {
    if (isEmpty(value)) return undefined

    return jsonTransformer.get<T>(value)
  }

  function set<T>(value: T | undefined): string | undefined {
    if (isEmpty(value)) return undefined

    return jsonTransformer.set<T>(value)
  }

  return useRouteQuery<string | undefined, SortItem[] | undefined>(name, defaultValueString, {
    transform: {
      get,
      set,
    },
  })
}

export default useVuetifySortByToSafeRouteQuery
