<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-skeleton-loader
      v-if="isNil(group)"
      type="card"
    />
    <v-card v-else>
      <v-card-title>Group Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <GroupNameUniqueTextField
              v-model="group.name"
              label="Name *"
              :rules="[required]"
              :filters="groupNameFilters"
              variant="outlined"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="group.acronym"
              label="Acronym"
              clearable
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="group.description"
              label="Description"
              auto-grow
              clearable
              rows="3"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              :loading="isLoading"
              color="secondary"
              variant="outlined"
              v-bind="cancelButtonProps"
            >
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn
              class="ml-3"
              :loading="isLoading"
              type="submit"
              color="primary"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, ref, toRefs } from "vue"

import { type VBtn, type VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import useGroup from "@/use/use-group"
import useSnack from "@/use/use-snack"

import GroupNameUniqueTextField from "@/components/groups/GroupNameUniqueTextField.vue"

type CancelButtonOptions = VBtn["$props"]

const props = withDefaults(
  defineProps<{
    groupId: number
    cancelButtonProps?: CancelButtonOptions
  }>(),
  {
    cancelButtonProps: ({ groupId }) => ({
      to: {
        name: "administration/groups/GroupPage",
        params: {
          groupId,
        },
      },
    }),
  }
)

const emit = defineEmits<{
  saved: [groupId: number]
}>()

const { groupId } = toRefs(props)
const { group, save, isLoading } = useGroup(groupId)

const groupNameFilters = computed(() => ({
  excludeById: groupId.value,
}))

const snack = useSnack()

const form = ref<InstanceType<typeof VForm> | null>(null)

async function saveWrapper() {
  if (isNil(group.value)) return
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    await save()
    snack.success("Group saved!")
    emit("saved", group.value.id)
  } catch (error) {
    console.error(`Failed to save group: ${error}`, { error })
    snack.error(`Failed to save group: ${error}`)
  }
}
</script>
