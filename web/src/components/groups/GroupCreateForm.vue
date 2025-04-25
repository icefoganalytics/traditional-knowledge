<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-card>
      <v-card-title>Group Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="8"
          >
            <GroupNameUniqueTextField
              v-model="groupAttributes.name"
              label="Name *"
              :rules="[required]"
              variant="outlined"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="groupAttributes.acronym"
              label="Acronym"
              clearable
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="groupAttributes.description"
              label="Description"
              auto-grow
              clearable
              rows="3"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-switch
              v-model="groupAttributes.isHost"
              label="Is Host"
              inset
              color="primary"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              :loading="isLoading"
              color="secondary"
              variant="outlined"
              :to="{
                name: 'administration/GroupsPage',
              }"
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
              Create
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref } from "vue"
import { useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import groupsApi, { type Group } from "@/api/groups-api"
import useSnack from "@/use/use-snack"

import GroupNameUniqueTextField from "@/components/groups/GroupNameUniqueTextField.vue"

const snack = useSnack()
const router = useRouter()

const groupAttributes = ref<Partial<Group>>({
  name: "",
})
const isLoading = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    await groupsApi.create(groupAttributes.value)
    snack.success("Group created.")
    router.push({
      name: "administration/GroupsPage",
    })
  } catch (error) {
    console.error(`Failed to create group: ${error}`, { error })
    snack.error(`Failed to create group: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
