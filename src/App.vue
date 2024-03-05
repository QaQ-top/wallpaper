<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <div :style="{ margin: '100px', width: '300px' }">
    <Card
      :back="backImgUrl"
      :front="frontImgUrl"
      :mask="mask"
      :foil="foil"
      :number="160"
      set="swsh12pt5"
      subtypes="Basic"
      supertype="Pokeom"
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
const backImgUrl =
  "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";
const frontImgUrl = "https://images.pokemontcg.io/swsh12pt5/160_hires.png";
const foil =
  "https://poke-holo.b-cdn.net/foils/swsh12pt5/foils/upscaled/160_foil_etched_swsecret_2x.webp";
const mask =
  "https://poke-holo.b-cdn.net/foils/swsh12pt5/masks/upscaled/160_foil_etched_swsecret_2x.webp";
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
