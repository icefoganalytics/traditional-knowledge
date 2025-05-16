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

import informationSharingAgreementsApi from "@/api/information-sharing-agreements-api"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useSnack from "@/use/use-snack"
import useInformationSharingAgreements, {
  type InformationSharingAgreement,
  type InformationSharingAgreementWhereOptions,
  type InformationSharingAgreementFiltersOptions,
} from "@/use/use-information-sharing-agreements"

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
  },
  {
    title: "Sharing Group",
    key: "sharingGroupId",
  },
  {
    title: "Sharing Group Contact",
    key: "sharingGroupContactId",
  },
  {
    title: "Receiving Group",
    key: "receivingGroupId",
  },
  {
    title: "Receiving Group Contact",
    key: "receivingGroupContactId",
  },
  {
    title: "Start Date",
    key: "startDate",
  },
  {
    title: "End Date",
    key: "endDate",
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
    name: "administration/groups/GroupPage",
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
