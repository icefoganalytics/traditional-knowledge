import { reactive, toRefs, watch, MaybeRefOrGetter, toValue } from "vue"
import { RouteLocationRaw } from "vue-router"
import { cloneDeep, isUndefined } from "lodash"

export type Breadcrumb = {
  title?: string
  disabled?: boolean
  exact?: boolean
  to: RouteLocationRaw
}

export const BASE_CRUMB: Breadcrumb = {
  title: "Home",
  disabled: false,
  to: {
    name: "DashboardPage",
  },
}
export const ADMIN_CRUMB: Breadcrumb = {
  title: "Administration Dashboard",
  disabled: false,
  to: {
    name: "administration/DashboardPage",
  },
  exact: true,
}

// Global state for breadcrumbs
const state = reactive<{
  breadcrumbs: Breadcrumb[]
  title: string | null
}>({
  breadcrumbs: [],
  title: null,
})

export function useBreadcrumbs(
  title?: MaybeRefOrGetter<string>,
  breadcrumbs?: MaybeRefOrGetter<Breadcrumb[]>
) {
  watch(
    () => toValue(title),
    (newTitle) => {
      if (isUndefined(newTitle)) return

      state.title = newTitle
    },
    {
      immediate: true,
    }
  )

  watch(
    () => cloneDeep(toValue(breadcrumbs)),
    (newBreadcrumbs) => {
      if (isUndefined(newBreadcrumbs)) return

      state.breadcrumbs = newBreadcrumbs
    },
    {
      immediate: true,
      deep: true,
    }
  )

  return {
    ...toRefs(state),
  }
}

export default useBreadcrumbs
