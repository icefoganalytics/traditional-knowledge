<template>
  <v-row>
    <v-col
      cols="12"
      md="8"
    >
      <KnowledgeItemCard :knowledge-item-id="knowledgeItemIdAsNumber" />

      <v-card class="mt-5 border">
        <v-tabs
          slider-color="primary"
          grow
          bg-color="#ffffff77"
        >
          <v-tab
            :to="{
              name: 'knowledge-items/KnowledgeItemInformationSharingAgreementsPage',
              params: {
                knowledgeItemId,
              },
            }"
          >
            Information Sharing Agreements
          </v-tab>
          <v-tab
            :to="{
              name: 'knowledge-items/KnowledgeItemUsersWithAccessPage',
              params: {
                knowledgeItemId,
              },
            }"
          >
            Users with Access
          </v-tab>
        </v-tabs>
        <v-divider />
        <router-view></router-view>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <KnowledgeItemQuickInfoCard :knowledge-item-id="knowledgeItemIdAsNumber" />

      <KnowledgeItemAttachmentsCard
        :knowledge-item-id="knowledgeItemIdAsNumber"
        @accessed="reloadKnowledgeItemAuditCard"
      />

      <KnowledgeItemAuditCard
        ref="knowledgeItemAuditCard"
        :item-id="knowledgeItemIdAsNumber"
        class="mt-5"
      />
    </v-col>
  </v-row>

  <PreviewDialog />
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue"

import useBreadcrumbs, { BASE_CRUMB } from "@/use/use-breadcrumbs"

import KnowledgeItemAttachmentsCard from "@/components/knowledge-items/KnowledgeItemAttachmentsCard.vue"
import KnowledgeItemAuditCard from "@/components/knowledge-items/KnowledgeItemAuditCard.vue"
import KnowledgeItemCard from "@/components/knowledge-items/KnowledgeItemCard.vue"
import KnowledgeItemQuickInfoCard from "@/components/knowledge-items/KnowledgeItemQuickInfoCard.vue"
import PreviewDialog from "@/components/pdf/PreviewDialog.vue"

const props = defineProps<{
  knowledgeItemId: string
}>()

const knowledgeItemIdAsNumber = computed(() => parseInt(props.knowledgeItemId))

const knowledgeItemAuditCard =
  useTemplateRef<InstanceType<typeof KnowledgeItemAuditCard>>("knowledgeItemAuditCard")

function reloadKnowledgeItemAuditCard() {
  knowledgeItemAuditCard.value?.reload()
}

useBreadcrumbs("View Knowledge Item", [
  BASE_CRUMB,
  {
    title: "Knowledge Items",
    to: {
      name: "knowledge-items/KnowledgeItemListPage",
    },
  },
])
</script>
