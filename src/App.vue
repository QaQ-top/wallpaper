<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <div :style="{ margin: '100px', width: '300px' }">
    <Card
      back="backImgUrl"
      front="frontImgUrl"
      :mask="mask"
      :foil="foil"
      number="160"
      set="swsh12pt5"
      subtypes="basic"
      supertype="Pokémon"
      rarity="rare secret"
      glow="lightning"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import Card from "./components/card/index.vue";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
    Card,
  },
});
</script>

<script setup lang="ts">
const backImgUrl = "/tcg-card-back-2x.jpg";
const frontImgUrl = "/160_hires.png";
const mask =
  "/160_foil_etched_swsecret_2x.webp";
const  foil = "/160_mask_etched_swsecret_2x.webp";
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
