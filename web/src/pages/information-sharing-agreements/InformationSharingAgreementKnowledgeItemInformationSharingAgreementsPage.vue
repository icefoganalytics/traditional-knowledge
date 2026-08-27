<template>
  <v-card>
    <template #text>
      <div v-if="!isNil(archiveItemId)">
        <InformationSharingAgreementArchiveItemsAsInformationSharingAgreementsEditDataIterator
          ref="informationSharingAgreementArchiveItemsAsInformationSharingAgreementsEditDataIterator"
          :where="informationSharingAgreementArchiveItemsWhereOptions"
          route-query-suffix="InformationSharingAgreementArchiveItems"
          @deleted="refreshArchiveAndLinks"
        />
      </div>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed } from "vue"

import useArchiveItem from "@/use/use-archive-item"
import useInformationSharingAgreementArchiveItem from "@/use/use-information-sharing-agreement-archive-item"
import useInformationSharingAgreementArchiveItems from "@/use/use-information-sharing-agreement-archive-items"

import InformationSharingAgreementArchiveItemsAsInformationSharingAgreementsEditDataIterator from "@/components/information-sharing-agreement-archive-items/InformationSharingAgreementArchiveItemsAsInformationSharingAgreementsEditDataIterator.vue"

const props = defineProps<{
  informationSharingAgreementId: string
  informationSharingAgreementArchiveItemId: string
}>()

const informationSharingAgreementArchiveItemIdAsNumber = computed(() =>
  parseInt(props.informationSharingAgreementArchiveItemId)
)
const {
  informationSharingAgreementArchiveItem: rawInformationSharingAgreementArchiveItem,
  refresh: refreshInformationSharingAgreementArchiveItem,
} = useInformationSharingAgreementArchiveItem(informationSharingAgreementArchiveItemIdAsNumber)

const archiveItemId = computed(() => {
  if (isNil(rawInformationSharingAgreementArchiveItem.value)) {
    return null
  }
  if (
    rawInformationSharingAgreementArchiveItem.value.informationSharingAgreementId !==
    parseInt(props.informationSharingAgreementId)
  ) {
    return null
  }
  return rawInformationSharingAgreementArchiveItem.value.archiveItemId
})

const { refresh: refreshArchiveItem } = useArchiveItem(archiveItemId)

const informationSharingAgreementArchiveItemsWhereOptions = computed(() => ({
  archiveItemId: archiveItemId.value ?? undefined,
}))

const informationSharingAgreementArchiveItemsQuery = computed(() => ({
  where: {
    archiveItemId: archiveItemId.value ?? undefined,
  },
  perPage: 1,
}))
const { refresh: refreshInformationSharingAgreementArchiveItems } =
  useInformationSharingAgreementArchiveItems(informationSharingAgreementArchiveItemsQuery, {
    skipWatchIf: () => isNil(archiveItemId.value),
  })

async function refreshArchiveAndLinks() {
  await Promise.all([
    refreshArchiveItem(),
    refreshInformationSharingAgreementArchiveItems(),
    refreshInformationSharingAgreementArchiveItem(),
  ])
}
</script>
