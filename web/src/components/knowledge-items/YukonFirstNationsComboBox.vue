<template>
  <v-combobox
    :items="yukonFirstNations"
    label="Yukon First Nations"
    multiple
    chips
    clearable
  />
</template>

<script setup lang="ts">
// information from https://yukon.ca/en/your-government/about-yukon/find-out-about-yukon-first-nations
const yukonFirstNations = [
  "Carcross/Tagish First Nation",
  "Champagne and Aishihik First Nations",
  "First Nation of Na-Cho Nyäk Dun",
  "Kluane First Nation",
  "Kwanlin Dün First Nation",
  "Liard First Nation",
  "Little Salmon/Carmacks First Nation",
  "Ross River Dena Council",
  "Selkirk First Nation",
  "Ta’an Kwäch’än Council",
  "Teslin Tlingit Council",
  "Tr’ondëk Hwëch’in",
  "Vuntut Gwitchin First Nation",
  "White River First Nation",
]
</script>
