<template>
  <v-data-table-server
    v-model:items-per-page="perPage"
    v-model:page="page"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="groups"
    :items-length="totalCount"
    :loading="isLoading"
    @click:row="(_event: unknown, { item }: GroupTableRow) => goToGroupPage(item.id)"
  >
    <template #item.isHost="{ item }">
      {{ item.isHost ? "Yes" : "No" }}
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end align-center">
        <v-btn
          :to="{
            name: 'administration/groups/GroupEditPage',
            params: {
              groupId: item.id,
            },
          }"
          :loading="isDeleting"
          title="Edit"
          icon="mdi-pencil"
          size="x-small"
          color="primary"
          variant="outlined"
          @click.stop
        />
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
import { useRouter } from "vue-router"
import { useRouteQuery } from "@vueuse/router"

import groupsApi from "@/api/groups-api"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useSnack from "@/use/use-snack"
import useGroups, {
  type Group,
  type GroupWhereOptions,
  type GroupFiltersOptions,
} from "@/use/use-groups"

type GroupTableRow = {
  item: Group
}

const props = withDefaults(
  defineProps<{
    filters?: GroupFiltersOptions
    where?: GroupWhereOptions
    routeQuerySuffix?: string
  }>(),
  {
    filters: () => ({}),
    where: () => ({}),
    routeQuerySuffix: "",
  }
)

const headers = ref([
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Acronym",
    key: "acronym",
  },
  {
    title: "Description",
    key: "description",
    sortable: false,
  },
  {
    title: "Host",
    key: "isHost",
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
    key: "name",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const groupsQuery = computed(() => ({
  filters: props.filters,
  where: props.where,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))

const { groups, totalCount, isLoading, refresh } = useGroups(groupsQuery)

const router = useRouter()

function goToGroupPage(groupId: number) {
  router.push({
    name: "administration/groups/GroupPage",
    params: {
      groupId,
    },
  })
}

const snack = useSnack()
const isDeleting = ref(false)

async function confirmThenDelete(group: Group) {
  const { name, acronym } = group
  const displayName = acronym ? `${name} (${acronym})` : name

  const result = confirm(`Are you sure you want to delete ${displayName}.`)
  if (result === false) return

  isDeleting.value = true
  try {
    await groupsApi.delete(group.id)
    await refresh()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to delete group: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  refresh,
})
</script>
