<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-card class="border">
      <v-card-title>External User Details</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="userAttributes.email"
              label="Email *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <ExternalOrganizationSearchableAutocomplete
              v-model="userAttributes.externalOrganizationId"
              label="Yukon First Nation or Indigenous Government *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="userAttributes.firstName"
              label="First name *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="userAttributes.lastName"
              label="Last name *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="userAttributes.title"
              label="Title"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="userAttributes.phoneNumber"
              label="Phone Number"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text>
        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              :loading="isLoading"
              color="secondary"
              :to="{
                name: 'users/UsersPage',
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
              Create External User
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, useTemplateRef } from "vue"
import { useRouter } from "vue-router"

import { required } from "@/utils/validators"
import usersApi, { type User } from "@/api/users-api"
import useSnack from "@/use/use-snack"

import ExternalOrganizationSearchableAutocomplete from "@/components/external-organizations/ExternalOrganizationSearchableAutocomplete.vue"

const userAttributes = ref<Partial<User>>({
  // Role is set in back-end for external users
  isExternal: true,
})

const isLoading = ref(false)
const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    await usersApi.create(userAttributes.value)
    snack.success("External user created.")
    await router.push({
      name: "users/UsersPage",
    })
  } catch (error) {
    snack.error("Failed to create external user!")
    throw error
  } finally {
    isLoading.value = false
  }
}
</script>
