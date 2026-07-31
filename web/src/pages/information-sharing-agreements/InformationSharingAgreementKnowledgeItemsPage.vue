<template>
  <v-card>
    <v-card-title>Knowledge Items</v-card-title>
    <v-card-text>
      <v-list
        v-if="!isLoading && knowledgeItems.length > 0"
        class="border rounded"
      >
        <InformationSharingAgreementKnowledgeItemListItem
          v-for="item in knowledgeItems"
          :key="item.association.id"
          :archive-item="item.archiveItem"
          :information-sharing-agreement-id="item.association.informationSharingAgreementId"
          :information-sharing-agreement-archive-item-id="item.association.id"
        />
      </v-list>
      <v-skeleton-loader
        v-else-if="isLoading"
        type="list-item-two-line@3"
      />
      <p
        v-else
        class="text-center"
      >
        No knowledge items are linked to this information sharing agreement.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useArchiveItems from "@/use/use-archive-items"
import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"
import useInformationSharingAgreementArchiveItems from "@/use/use-information-sharing-agreement-archive-items"

import InformationSharingAgreementKnowledgeItemListItem from "@/components/information-sharing-agreements/InformationSharingAgreementKnowledgeItemListItem.vue"

const props = defineProps<{
  informationSharingAgreementId: string
}>()

const informationSharingAgreementArchiveItemsQuery = computed(() => ({
  where: {
    informationSharingAgreementId: parseInt(props.informationSharingAgreementId),
  },
  perPage: 1000,
}))
const { informationSharingAgreementArchiveItems, isLoading: isLoadingAssociations } =
  useInformationSharingAgreementArchiveItems(informationSharingAgreementArchiveItemsQuery)

const archiveItemIds = computed(() =>
  informationSharingAgreementArchiveItems.value.map((item) => item.archiveItemId)
)
const archiveItemsQuery = computed(() => ({
  where: {
    id: archiveItemIds.value,
  },
  perPage: 1000,
}))
const { items: archiveItems, isLoading: isLoadingArchiveItems } = useArchiveItems(
  archiveItemsQuery,
  {
    skipWatchIf: () => isLoadingAssociations.value || archiveItemIds.value.length === 0,
  }
)
const isLoading = computed(() => isLoadingAssociations.value || isLoadingArchiveItems.value)
const knowledgeItems = computed(() =>
  informationSharingAgreementArchiveItems.value.flatMap((association) => {
    const archiveItem = archiveItems.value.find((item) => item.id === association.archiveItemId)
    return archiveItem ? [{ association, archiveItem }] : []
  })
)

useBreadcrumbs("Knowledge Items", [
  BASE_CRUMB,
  {
    title: "Information Sharing Agreements",
    to: {
      name: "InformationSharingAgreementsPage",
    },
  },
])
</script>
