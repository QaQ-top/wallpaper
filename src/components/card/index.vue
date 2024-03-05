<script lang="ts">
import { adjust, clamp, round } from "@/helpers/Math";
import { useSpring } from "@/utils/spring";
import { defineComponent, ref, computed } from "vue";
export default defineComponent({
  name: "card",
});
</script>

<script lang="ts" setup>
const backImgUrl =
  "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";
const frontImgUrl = "https://images.pokemontcg.io/swsh12pt5/160_hires.png";
const active = ref(false);
const interacting = ref(false);

const activate = (e: WindowEventMap["click"]) => {
  active.value = true;
};

const springInteractSettings = { stiffness: 10000, damping: 100 };
const springPopoverSettings = { stiffness: 5000, damping: 260 };

const interact = (e: WindowEventMap["pointermove"]) => {
  !interacting.value && (interacting.value = true);
  const $el = e.target as HTMLDivElement;
  const rect = $el.getBoundingClientRect(); // get element's current size/position
  const absolute = {
    x: e.clientX - rect.left, // get mouse position from left
    y: e.clientY - rect.top, // get mouse position from right
  };
  const percent = {
    x: clamp(round((100 / rect.width) * absolute.x)),
    y: clamp(round((100 / rect.height) * absolute.y)),
  };
  const center = {
    x: percent.x - 50,
    y: percent.y - 50,
  };

  spring.background.set({
    x: adjust(percent.x, 0, 100, 37, 63),
    y: adjust(percent.y, 0, 100, 33, 67),
  });
  spring.rotate.set({
    x: round(-(center.x / 3.5)),
    y: round(center.y / 2),
  });
  spring.glare.set({
    x: round(percent.x),
    y: round(percent.y),
    o: 1,
  });
};
const interactEnd = (e: WindowEventMap["mouseout"]) => {
  // setTimeout(() => {
  const out = {
    stiffness: 200,
    damping: 8,
  };
  interacting.value = false;
  spring.rotate.set({ x: 0, y: 0 }, out);
  spring.glare.set({ x: 50, y: 50, o: 0 }, out);
  spring.background.set({ x: 50, y: 50 }, out);
  // }, 500);
};
const deactivate = (e: WindowEventMap["blur"]) => {
  active.value = false;
};

const spring = {
  /** 拿起卡片的角度 */
  rotate: useSpring(
    {
      x: 0,
      y: 0,
    },
    springInteractSettings
  ),

  /** 灯光位置 */
  glare: useSpring(
    {
      x: 50,
      y: 50,
      o: 0,
    },
    springInteractSettings
  ),
  background: useSpring(
    {
      x: 50,
      y: 50,
    },
    springInteractSettings
  ),
  rotateDelta: useSpring(
    {
      x: 0,
      y: 0,
    },
    springPopoverSettings
  ),
  /** 卡片位置 */
  translate: useSpring(
    {
      x: 0,
      y: 0,
    },
    springPopoverSettings
  ),
  /** 卡片大小 */
  scale: useSpring({ value: 1 }, springPopoverSettings),
};
const randomSeed = {
  x: Math.random(),
  y: Math.random(),
};

const cosmosPosition = {
  x: Math.floor(randomSeed.x * 734),
  y: Math.floor(randomSeed.y * 1280),
};
let foilStyles = ``;
const staticStyles = `
    --seedx: ${randomSeed.x};
    --seedy: ${randomSeed.y};
    --cosmosbg: ${cosmosPosition.x}px ${cosmosPosition.y}px;
  `;

const dynamicStyles = computed(
  () => `
    --pointer-x: ${spring.glare.target.x}%;
    --pointer-y: ${spring.glare.target.y}%;
    --pointer-from-center: ${clamp(
      Math.sqrt(
        (spring.glare.target.y - 50) * (spring.glare.target.y - 50) +
          (spring.glare.target.x - 50) * (spring.glare.target.x - 50)
      ) / 50,
      0,
      1
    )};
    --pointer-from-top: ${spring.glare.target.y / 100};
    --pointer-from-left: ${spring.glare.target.x / 100};
    --card-opacity: ${spring.glare.target.o};
    --rotate-x: ${spring.rotate.target.x + spring.rotateDelta.target.x}deg;
    --rotate-y: ${spring.rotate.target.y + spring.rotateDelta.target.y}deg;
    --background-x: ${spring.background.target.x}%;
    --background-y: ${spring.background.target.y}%;
    --card-scale: ${spring.scale.target.value};
    --translate-x: ${spring.translate.target.x}px;
    --translate-y: ${spring.translate.target.y}px;
	`
);
</script>

<template>
  <div
    :class="{
      card: 'card',
      interactive: 'interactive',
      active,
      interacting,
    }"
    :style="dynamicStyles"
  >
    <div class="card-translate">
      <button
        class="card-rotator"
        @click="activate"
        @pointermove="interact"
        @mouseout="interactEnd"
        @blur="deactivate"
        aria-label="Expand the Pokemon Card; {name}."
        tabindex="0"
      >
        <img
          class="card-back"
          :src="backImgUrl"
          loading="lazy"
          width="660"
          height="921"
        />
        <div class="card-front" :style="(staticStyles, foilStyles)">
          <img
            :src="frontImgUrl"
            alt=""
            loading="lazy"
            width="660"
            height="921"
          />
          <div class="card-shine"></div>
          <div class="card-glare"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* .card:not(.interactive):hover {
  --pointer-x: 25% !important;
  --pointer-y: 10% !important;
  --pointer-from-center: 0.9 !important;
  --pointer-from-top: 0.11 !important;
  --pointer-from-left: 0.25 !important;
  --card-scale: 1.1 !important;
  --card-opacity: 1 !important;
  --translate-x: 0px !important;
  --translate-y: -10px !important;
  --rotate-x: 7deg !important;
  --rotate-y: -19deg !important;
  --background-x: 44% !important;
  --background-y: 36% !important;
} */

.interacting {
}

.card {
  --foil-brightness: 0.55;
  /* 将卡放置在新的转换层上，以确保它有硬加速 */
  -webkit-transform: translate3d(0px, 0px, 0.01px);
  transform: translate3d(0px, 0px, 0.01px);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  pointer-events: none;
  /* 如果卡片按比例放大，确保卡片在其他卡片之上 */
  z-index: calc(var(--card-scale) * 2);
  will-change: transform, visibility, z-index;

  &,
  .card-rotator {
    aspect-ratio: var(--card-aspect);
    border-radius: var(--card-radius);
  }

  &.active {
    .card-translate,
    .card-rotator {
      /** 禁止缩放 */
      touch-action: none;
    }
  }

  .card-rotator,
  &.active .card-rotator:focus {
    transition: box-shadow 0.4s ease, opacity 0.33s ease-out;
    box-shadow: 0 0 3px -1px transparent, 0 0 2px 1px transparent,
      0 0 5px 0px transparent, 0px 10px 20px -5px black, 0 2px 15px -5px black,
      0 0 20px 0px transparent;
  }

  &.active .card-rotator,
  .card-rotator:focus {
    box-shadow: 0 0 3px -1px white, 0 0 3px 1px var(--card-edge),
      0 0 12px 2px var(--card-glow), 0px 10px 20px -5px black,
      0 0 40px -30px var(--card-glow), 0 0 50px -20px var(--card-glow);
  }

  .card-translate,
  .card-rotator {
    display: grid;
    perspective: 600px;
    will-change: transform, box-shadow;
    transform-origin: center;
    -webkit-transform-origin: center;
  }

  .card-translate {
    width: auto;
    position: relative;
    -webkit-transform: translate3d(
        var(--translate-x),
        var(--translate-y),
        0.1px
      )
      scale(var(--card-scale));
    transform: translate3d(var(--translate-x), var(--translate-y), 0.1px)
      scale(var(--card-scale));

    > .card-rotator {
      /** 清除button默认样式 */
      border: none;
      background: transparent;
      padding: 0;
      -webkit-appearance: none;
      appearance: none;

      /** 3d角度偏转，实现鼠标拿起卡片的效果 */
      -webkit-transform: rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
      -webkit-transform-style: preserve-3d;
      transform: rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
      transform-style: preserve-3d;

      /* performance */
      pointer-events: auto;
      /* overflow: hidden; <-- this improves perf on mobile, but breaks backface visibility. */
      /* isolation: isolate; <-- this improves perf, but breaks backface visibility on Chrome. */

      img {
        height: auto;
        -webkit-transform: translate3d(0px, 0px, 0.01px);
        transform: translate3d(0px, 0px, 0.01px);
      }

      * {
        width: 100%;
        display: grid;
        grid-area: 1/1;
        aspect-ratio: var(--card-aspect);
        border-radius: var(--card-radius);
        image-rendering: optimizeQuality;
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        pointer-events: none;
        overflow: hidden;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.card-back {
  background-color: var(--card-back);
  -webkit-transform: rotateY(180deg) translateZ(1px);
  transform: rotateY(180deg) translateZ(1px);
  backface-visibility: visible;
}

.card-front,
.card-front * {
  backface-visibility: hidden;
}

.card-front {
  opacity: 1;
  transition: opacity 0.33s ease-out;
  -webkit-transform: translate3d(0px, 0px, 0.01px);
  transform: translate3d(0px, 0px, 0.01px);
}

.loading {
  .card-front {
    opacity: 0;
  }

  .card-back {
    -webkit-transform: rotateY(0deg);
    transform: rotateY(0deg);
  }
}

/**
  
Shine & Glare Effects

**/

.card-shine {
  display: grid;
  transform: translateZ(1px);
  overflow: hidden;
  z-index: 3;

  background: transparent;
  background-size: cover;
  background-position: center;

  filter: brightness(0.85) contrast(2.75) saturate(0.65);
  mix-blend-mode: color-dodge;

  opacity: var(--card-opacity);
}

.card-shine:before,
.card-shine:after {
  --sunpillar-clr-1: var(--sunpillar-5);
  --sunpillar-clr-2: var(--sunpillar-6);
  --sunpillar-clr-3: var(--sunpillar-1);
  --sunpillar-clr-4: var(--sunpillar-2);
  --sunpillar-clr-5: var(--sunpillar-3);
  --sunpillar-clr-6: var(--sunpillar-4);

  grid-area: 1/1;
  transform: translateZ(1px);
  border-radius: var(--card-radius);
}

.card-shine:after {
  --sunpillar-clr-1: var(--sunpillar-6);
  --sunpillar-clr-2: var(--sunpillar-1);
  --sunpillar-clr-3: var(--sunpillar-2);
  --sunpillar-clr-4: var(--sunpillar-3);
  --sunpillar-clr-5: var(--sunpillar-4);
  --sunpillar-clr-6: var(--sunpillar-5);

  transform: translateZ(1.2px);
}

.card-glare {
  /* make sure the glare doesn't clip */
  transform: translateZ(1.41px);
  overflow: hidden;
  /** 鼠标悬浮灯光照射效果 */
  background-image: radial-gradient(
    farthest-corner circle at var(--pointer-x) var(--pointer-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 0%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  );

  opacity: var(--card-opacity);
  mix-blend-mode: overlay;
}

/**

  Masking Effects

**/

.card.masked .card-shine,
.card.masked .card-shine:before,
.card.masked .card-shine:after {
  /** masking image for cards which are masked **/
  -webkit-mask-image: var(--mask);
  mask-image: var(--mask);
  -webkit-mask-size: cover;
  mask-size: cover;
  -webkit-mask-position: center center;
  mask-position: center center;
}

.card[data-rarity="rare holo"] .card-glare:after,
.card[data-rarity="rare holo cosmos"] .card-glare:after,
.card[data-rarity$="reverse holo"] .card-glare:after {
  clip-path: var(--clip);
}

.card[data-rarity="rare holo"][data-subtypes^="stage"] .card-glare:after,
.card[data-rarity="rare holo cosmos"][data-subtypes^="stage"] .card-glare:after,
.card[data-rarity$="reverse holo"][data-subtypes^="stage"] .card-glare:after {
  clip-path: var(--clip-stage);
}

.card[data-rarity="rare holo"][data-supertype="trainer"] .card-glare:after,
.card[data-rarity="rare holo cosmos"][data-supertype="trainer"]
  .card-glare:after,
.card[data-rarity$="reverse holo"][data-supertype="trainer"] .card-glare:after {
  clip-path: var(--clip-trainer);
}
</style>
