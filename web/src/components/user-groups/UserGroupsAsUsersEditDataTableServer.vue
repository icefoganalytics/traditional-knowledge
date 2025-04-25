<template>
  <v-data-table-server
    v-model:items-per-page="perPage"
    v-model:page="page"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="userGroups"
    :items-length="totalCount"
    :loading="isLoading"
    @click:row="(_event: unknown, { item }: UserGroupTableRow) => goToGroupUserPage(item.id)"
  >
    <template #item.actions="{ item }">
      <div class="d-flex justify-end align-center">
        <v-btn
          class="ml-2"
          :loading="isDeleting"
          title="Delete"
          icon="mdi-delete"
          size="x-small"
          color="error"
          variant="outlined"
          @click.stop="confirmThenDelete(item)"
        />
      </div>
    </template>
  </v-data-table-server>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouteQuery } from "@vueuse/router"
import { useRouter } from "vue-router"

import userGroupsApi from "@/api/user-groups-api"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useSnack from "@/use/use-snack"
import useUserGroups, {
  type UserGroupAsIndex,
  type UserGroupWhereOptions,
  type UserGroupFiltersOptions,
} from "@/use/use-user-groups"

type UserGroupTableRow = {
  item: UserGroupAsIndex
}

const props = withDefaults(
  defineProps<{
    filters?: UserGroupFiltersOptions
    where?: UserGroupWhereOptions
    routeQuerySuffix?: string
  }>(),
  {
    filters: () => ({}),
    where: () => ({}),
    routeQuerySuffix: "",
  }
)

const { t } = useI18n()

const headers = ref([
  {
    title: "Display Name",
    key: "user.displayName",
  },
  {
    title: "Email",
    key: "user.email",
  },
  {
    title: "Title",
    key: "user.title",
  },
  {
    title: "Department",
    key: "user.department",
    value: (item: unknown) => {
      const { department, division, branch, unit } = (item as UserGroupAsIndex).user
      return [department, division, branch, unit].filter(Boolean).join(" - ")
    },
    sortable: false,
  },
  {
    title: "Role",
    key: "user.roles",
    value: (item: unknown) => {
      const { roles } = (item as UserGroupAsIndex).user
      const formatedRoleTypes = roles.map((role) => t(`user.roles.${role}`, role))
      return formatedRoleTypes.join(", ")
    },
    sortable: false,
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
])

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", { transform: Number })
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", { transform: Number })
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "user.displayName",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const userGroupsQuery = computed(() => ({
  filters: props.filters,
  where: props.where,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))

const { userGroups, totalCount, isLoading, refresh } = useUserGroups(userGroupsQuery)

const router = useRouter()

function goToGroupUserPage(userGroupId: number) {
  router.push({
    name: "administration/groups/UserGroupPage",
    params: {
      userGroupId,
    },
  })
}

const snack = useSnack()
const isDeleting = ref(false)

async function confirmThenDelete(userGroup: UserGroupAsIndex) {
  const { displayName, email } = userGroup.user
  const result = confirm(
    `Are you sure you want to remove ${displayName}: ${email} from this group?`
  )
  if (result === false) return

  isDeleting.value = true
  try {
    await userGroupsApi.delete(userGroup.id)
    await refresh()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to remove user from group: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  refresh,
})
</script>
