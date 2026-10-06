<template>
  <v-data-iterator
    v-model:items-per-page="perPage"
    v-model:page="page"
    :items="informationSharingAgreementKnowledgeItems"
    :items-length="totalCount"
    :loading="isLoading"
  >
    <template #loader>
      <v-skeleton-loader type="list-item-two-line" />
    </template>

    <template #default="{ items }">
      <v-list
        class="py-0 border rounded border-opacity-50"
        :loading="isLoading"
      >
        <InformationSharingAgreementListItem
          v-for="({ raw: item }, index) in items"
          :key="item.id"
          :information-sharing-agreement-id="item.informationSharingAgreementId"
          class="py-2 cursor-pointer"
          :class="{
            'border-b border-opacity-50': index < items.length - 1,
          }"
          @click.stop="goToInformationSharingAgreementPage(item.informationSharingAgreementId)"
        >
          <template #append>
            <v-btn
              v-if="isAdminForInformationSharingAgreement(item.informationSharingAgreementId)"
              :loading="isDeleting"
              size="x-small"
              icon="mdi-delete"
              color="error"
              @click.stop="deleteInformationSharingAgreementKnowledgeItem(item.id)"
            />
          </template>
        </InformationSharingAgreementListItem>
      </v-list>
    </template>

    <template #footer="{ pageCount }">
      <v-pagination
        v-model="page"
        :length="pageCount"
      />
    </template>

    <template #no-data>
      <p class="text-center pa-3">No information sharing agreements for this item</p>
    </template>
  </v-data-iterator>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useRouteQuery } from "@vueuse/router"

import informationSharingAgreementKnowledgeItemsApi from "@/api/information-sharing-agreement-knowledge-items-api"

import useCurrentUser from "@/use/use-current-user"
import useInformationSharingAgreementKnowledgeItems, {
  type InformationSharingAgreementKnowledgeItemWhereOptions,
  type InformationSharingAgreementKnowledgeItemFiltersOptions,
} from "@/use/use-information-sharing-agreement-knowledge-items"
import useSnack from "@/use/use-snack"

import InformationSharingAgreementListItem from "@/components/information-sharing-agreements/InformationSharingAgreementListItem.vue"

const props = withDefaults(
  defineProps<{
    filters?: InformationSharingAgreementKnowledgeItemFiltersOptions
    where?: InformationSharingAgreementKnowledgeItemWhereOptions
    routeQuerySuffix?: string
  }>(),
  {
    filters: () => ({}),
    where: () => ({}),
    routeQuerySuffix: "",
  }
)

const emit = defineEmits<{
  deleted: [informationSharingAgreementKnowledgeItemId: number]
}>()

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", { transform: Number })
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", { transform: Number })

const informationSharingAgreementKnowledgeItemsQuery = computed(() => ({
  filters: props.filters,
  where: props.where,
  perPage: perPage.value,
  page: page.value,
}))

const { informationSharingAgreementKnowledgeItems, totalCount, isLoading, refresh } =
  useInformationSharingAgreementKnowledgeItems(informationSharingAgreementKnowledgeItemsQuery)

const { isAdminForInformationSharingAgreement } = useCurrentUser()

const isDeleting = ref(false)
const snack = useSnack()

async function deleteInformationSharingAgreementKnowledgeItem(
  informationSharingAgreementKnowledgeItemId: number
) {
  isDeleting.value = true
  try {
    await informationSharingAgreementKnowledgeItemsApi.delete(
      informationSharingAgreementKnowledgeItemId
    )
    snack.success("Stopped sharing with information sharing agreement.")
    refresh()
    emit("deleted", informationSharingAgreementKnowledgeItemId)
  } catch (error) {
    console.error(`Failed to remove information sharing agreement knowledge item: ${error}`, {
      error,
    })
    snack.error(`Failed to remove share to information sharing agreement: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

const router = useRouter()

function goToInformationSharingAgreementPage(informationSharingAgreementId: number) {
  return router.push({
    name: "information-sharing-agreements/InformationSharingAgreementPage",
    params: {
      informationSharingAgreementId,
    },
  })
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
