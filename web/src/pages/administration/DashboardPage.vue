<template>
  <v-card
    class="border"
    title="Administration"
  >
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            color="white"
            class="border"
            title="Users"
            subtitle="Manage Current Users"
            :to="{
              name: 'users/UsersPage',
            }"
          >
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            color="white"
            class="border"
            title="Groups"
            subtitle="Manage Current Groups"
            :to="{
              name: 'administration/GroupsPage',
            }"
          >
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            color="white"
            class="border"
            title="Information Sharing Agreements"
            subtitle="Manage Current Information Sharing Agreements"
            :to="{
              name: 'administration/InformationSharingAgreementsPage',
            }"
          >
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs("Administration Dashboard", [
  /* {
    title: "Administration Dashboard",
    to: { name: "administration/DashboardPage" },
  }, */
])
</script>
