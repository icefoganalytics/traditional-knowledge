<template>
  <v-data-table-server
    v-model:items-per-page="perPage"
    v-model:page="page"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="informationSharingAgreements"
    :items-length="totalCount"
    :loading="isLoading"
    @click:row="
      (_event: unknown, { item }: InformationSharingAgreementTableRow) =>
        goToInformationSharingAgreementPage(item.id)
    "
  >
    <template #item.sharingGroupId="{ item }">
      <GroupChip :group-id="item.sharingGroupId" />
      <UserChip :user-id="item.sharingGroupContactId" />
    </template>
    <template #item.receivingGroupId="{ item }">
      <GroupChip :group-id="item.receivingGroupId" />
      <UserChip :user-id="item.receivingGroupContactId" />
    </template>
    <template #item.creatorId="{ item }">
      <UserChip :user-id="item.creatorId" />
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end align-center">
        <v-btn
          :to="{
            name: 'administration/information-sharing-agreements/InformationSharingAgreementEditPage',
            params: {
              informationSharingAgreementId: item.id,
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

import { formatDate } from "@/utils/formatters"

import informationSharingAgreementsApi from "@/api/information-sharing-agreements-api"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useSnack from "@/use/use-snack"
import useInformationSharingAgreements, {
  type InformationSharingAgreement,
  type InformationSharingAgreementWhereOptions,
  type InformationSharingAgreementFiltersOptions,
} from "@/use/use-information-sharing-agreements"

import GroupChip from "@/components/groups/GroupChip.vue"
import UserChip from "@/components/users/UserChip.vue"

type InformationSharingAgreementTableRow = {
  item: InformationSharingAgreement
}

const props = withDefaults(
  defineProps<{
    filters?: InformationSharingAgreementFiltersOptions
    where?: InformationSharingAgreementWhereOptions
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
    title: "Title",
    key: "title",
    minWidth: "300px",
  },
  {
    title: "Sharing Group",
    key: "sharingGroupId",
  },
  {
    title: "Receiving Group",
    key: "receivingGroupId",
  },
  {
    title: "Start Date",
    key: "startDate",
    value: (item: unknown) => {
      const { startDate } = item as InformationSharingAgreement
      return formatDate(startDate)
    },
  },
  {
    title: "End Date",
    key: "endDate",
    value: (item: unknown) => {
      const { endDate } = item as InformationSharingAgreement
      return formatDate(endDate)
    },
  },
  {
    title: "Creator",
    key: "creatorId",
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
    key: "title",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const informationSharingAgreementsQuery = computed(() => ({
  filters: props.filters,
  where: props.where,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))

const { informationSharingAgreements, totalCount, isLoading, refresh } =
  useInformationSharingAgreements(informationSharingAgreementsQuery)

const router = useRouter()

function goToInformationSharingAgreementPage(informationSharingAgreementId: number) {
  router.push({
    name: "administration/information-sharing-agreements/InformationSharingAgreementPage",
    params: {
      informationSharingAgreementId,
    },
  })
}

const snack = useSnack()
const isDeleting = ref(false)

async function confirmThenDelete(informationSharingAgreement: InformationSharingAgreement) {
  const { title } = informationSharingAgreement

  const result = confirm(`Are you sure you want to delete ${title}.`)
  if (result === false) return

  isDeleting.value = true
  try {
    await informationSharingAgreementsApi.delete(informationSharingAgreement.id)
    await refresh()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to delete information sharing agreement: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

defineExpose({
  refresh,
})
</script>
