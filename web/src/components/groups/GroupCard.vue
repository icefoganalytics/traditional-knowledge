<template>
  <v-skeleton-loader
    v-if="isNil(group)"
    type="card"
  />
  <v-card
    v-else
    class="border"
  >
    <template #title> Group Details </template>
    <template #text>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="group.name"
            label="Group Name"
            readonly
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="group.acronym"
            label="Acronym"
            readonly
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="group.description"
            label="Description"
            readonly
            auto-grow
            rows="3"
          />
        </v-col>
      </v-row>
      <v-btn
        v-if="policy?.update"
        class="mt-5"
        color="primary"
        variant="flat"
        v-bind="editButtonProps"
      >
        Edit
      </v-btn>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { isEmpty, isNil } from "lodash"
import { toRefs } from "vue"

import { type VBtn } from "vuetify/components"

import useGroup from "@/use/use-group"

type VBtnProps = VBtn["$props"]

const props = withDefaults(
  defineProps<{
    groupId: number
    cancelButtonProps?: VBtnProps
    editButtonProps?: VBtnProps
  }>(),
  {
    cancelButtonProps: () => ({
      to: {
        name: "administration/GroupsPage",
      },
    }),
    editButtonProps: ({ groupId }) => ({
      to: {
        name: "administration/groups/GroupEditPage",
        params: {
          groupId,
        },
      },
    }),
  }
)

const { groupId } = toRefs(props)
const { group, policy, isLoading } = useGroup(groupId)
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap; /* preserves line breaks and wraps text if it’s too long */
}
</style>
