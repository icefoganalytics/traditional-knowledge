<template>
  <v-skeleton-loader
    v-if="isNil(archiveItem)"
    type="card@2"
  />
  <v-row v-else>
    <v-col
      cols="12"
      md="8"
    >
      <v-card class="mb-5">
        <v-card-title>Archive Item Description</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="8"
            >
              <v-text-field
                v-model="archiveItem.title"
                label="Title"
                readonly
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <SecurityLevelSelect
                v-model="archiveItem.securityLevel"
                label="Security level"
                readonly
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="archiveItem.description"
                label="Description"
                readonly
                rows="3"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-title>Tags</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Tags are used as filter criteria to find items in the archive. You can select as many as
            are applicable to this item.
          </p>
          <v-combobox
            v-model="archiveItem.tags"
            label="Tags"
            multiple
            chips
            readonly
          />
        </v-card-text>
      </v-card>

      <ArchiveItemAccessCard :archive-item-id="archiveItem.id" />
    </v-col>

    <v-col
      cols="12"
      md="4"
    >
      <v-card
        class="mb-5"
        variant="tonal"
      >
        <v-card-title>
          <div class="text-subtitle-2 mb-n2 text-grey">RECORDED AT</div>
          {{ formatDateTime(archiveItem.createdAt) }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div v-if="archiveItem.userId">
            <div class="text-subtitle-2 mb-n1 text-grey">RECORDED BY</div>
            {{ archiveItem.user?.displayName }}

            <p
              v-if="archiveItem.user?.title"
              class="mb-0"
            >
              {{ archiveItem.user?.title }}
            </p>
          </div>
        </v-card-text>
      </v-card>

      <v-card class="mb-5">
        <v-card-title>Attachments</v-card-title>
        <v-card-text v-if="archiveItem.files && archiveItem.files.length > 0">
          <div
            v-for="file of archiveItem.files"
            :key="file.id"
          >
            <ArchiveItemFileCard
              :file="file"
              @reload-audit="reloadAudit"
            />
          </div>
        </v-card-text>
        <v-card-text v-else> No Attachments </v-card-text>
      </v-card>

      <ArchiveItemAuditCard
        ref="auditCard"
        :item-id="archiveItemId"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import { formatDateTime } from "@/utils/formatters"
import useArchiveItem from "@/use/use-archive-item"

import ArchiveItemAccessCard from "@/components/archive-item/ArchiveItemAccessCard.vue"
import ArchiveItemAuditCard from "@/components/archive-item/ArchiveItemAuditCard.vue"
import ArchiveItemFileCard from "@/components/archive-item-files/ArchiveItemFileCard.vue"
import SecurityLevelSelect from "@/components/archive-item/SecurityLevelSelect.vue"

const props = defineProps<{
  archiveItemId: number
}>()

const { archiveItemId } = toRefs(props)
const { archiveItem } = useArchiveItem(archiveItemId)

const auditCard = ref<InstanceType<typeof ArchiveItemAuditCard>>()

function reloadAudit() {
  auditCard.value?.reload()
}
</script>
