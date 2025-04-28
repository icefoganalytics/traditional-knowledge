<template>
  <v-skeleton-loader
    v-if="isNil(group)"
    type="card"
  />
  <v-card v-else>
    <template #title> Group Details </template>
    <template #text>
      <v-row>
        <v-col cols="12">
          {{ group.name }}<template v-if="!isEmpty(group.acronym)"> ({{ group.acronym }})</template>
        </v-col>
        <v-col cols="12">
          <p class="whitespace-pre-wrap">
            {{ group.description }}
          </p>
        </v-col>
      </v-row>
    </template>
    <template #actions>
      <v-btn
        :loading="isLoading"
        color="secondary"
        variant="outlined"
        v-bind="cancelButtonProps"
      >
        Return
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
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

import { type VBtn } from "vuetify/lib/components/index.mjs"

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
const { group, isLoading } = useGroup(groupId)
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap; /* preserves line breaks and wraps text if it’s too long */
}
</style>
