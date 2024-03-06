<script lang="ts">
import { adjust, clamp, round } from "@/helpers/Math";
import { useSpring } from "@/utils/spring";
import { CardProps } from "./types.d";
import {
  defineComponent,
  ref,
  computed,
  defineProps,
  watch,
  onMounted,
} from "vue";
import {
  springInteractSettings,
  springPopoverSettings,
  activateSpring,
} from "./const";
export default defineComponent({
  name: "card",
});
</script>

<script lang="ts" setup>
const props = defineProps<CardProps>();
console.log(props, "props");

const active = ref(false);
const loading = ref(true);
const interacting = ref(false);
const cardHtmlNode = ref<HTMLDivElement>();

const timer = {
  reposition: null as any,
};

const activate = (e: WindowEventMap["click"]) => {
  if (active.value) {
    active.value = false;
  } else {
    active.value = true;
  }
};

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

const interactEnd = (e: WindowEventMap["mouseout"] | null, delay = 500) => {
  setTimeout(() => {
    const out = {
      stiffness: 200,
      damping: 8,
    };
    interacting.value = false;
    spring.rotate.set({ x: 0, y: 0 }, out);
    spring.glare.set({ x: 50, y: 50, o: 0 }, out);
    spring.background.set({ x: 50, y: 50 }, out);
  }, delay);
};

const deactivate = (e: WindowEventMap["blur"]) => {
  active.value = false;
  interactEnd(null, 0);
};

/** 更新图片居中的位置 */
const reposition = (e: WindowEventMap["scroll"]) => {
  clearTimeout(timer.reposition);
  timer.reposition = setTimeout(() => {
    if (active.value) {
      setCenter();
    }
  }, 300);
};

/** 卡片正面图加载完后触发 */
const imageLoader = (e: Event) => {
  loading.value = false;
  if (props.mask || props.foil) {
    // 图片加载完后添加炫光
    foilStyles.value = `
    --mask: url(${props.mask});
    --foil: url(${props.foil});
      `;
  }
};

/** 卡片居中 */
const setCenter = () => {
  const rect = cardHtmlNode.value!.getBoundingClientRect(); // get element's size/position
  const view = document.documentElement; // get window/viewport size

  const delta = {
    x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
    y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
  };
  spring.translate.set(
    {
      x: delta.x,
      y: delta.y,
    },
    activateSpring
  );
};

/** 打开卡片 */
const popover = () => {
  const rect = cardHtmlNode.value!.getBoundingClientRect(); // get element's size/position
  let delay = 100;
  let scaleW = (window.innerWidth / rect.width) * 0.9;
  let scaleH = (window.innerHeight / rect.height) * 0.9;
  let scaleF = 1.75;
  setCenter();
  // if (firstPop) {
  // delay = 1000;
  spring.rotateDelta.set(
    {
      x: 360,
      y: 0,
    },
    activateSpring
  );
  // }
  // firstPop = false;
  spring.scale.set({ value: Math.min(scaleW, scaleH, scaleF) }, activateSpring);
  interactEnd(null, delay);
};

/** 关闭卡片 */
const retreat = () => {
  spring.scale.set({ value: 1 }, activateSpring);
  spring.translate.set({ x: 0, y: 0 }, activateSpring);
  spring.rotateDelta.set({ x: 0, y: 0 }, activateSpring);
  interactEnd(null, 100);
};

watch(
  () => active.value,
  (value) => {
    if (value) {
      popover();
    } else {
      retreat();
    }
  }
);

const spring = {
  /** 拿起卡片的角度 
   * - `.card-rotator`dom节点会根据数据变化角度
  */
  rotate: useSpring(
    {
      x: 0,
      y: 0,
    },
    springInteractSettings
  ),

  /** 眩光光晕位置 (灯光照射效果)
   * - `.card-glare`dom节点会根据数据变化光晕位置
   * - `o`为 0 时 `.card-glare`(光晕层)和`.card-shine`(反光层)将完全透明
   */
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
  /** 卡片位置
   *  - 数据变化时`.card-translate`dom节点会位移
   */
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
const foilStyles = ref(``);
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

onMounted(() => {
  window.addEventListener("scroll", reposition);
  imageLoader(null)
  return () => {
    window.removeEventListener("scroll", reposition);
  };
});
</script>

<template>
  <div
    :class="[
      {
        card: 'card',
        interactive: 'interactive',
        active,
        masked: !!mask,
        loading,
        interacting,
      },
      props.glow,
    ]"
    :data-number="number"
    :data-set="set"
    :data-subtypes="subtypes"
    :data-supertype="supertype"
    :data-rarity="rarity"
    :data-trainer-gallery="false"
    :style="dynamicStyles"
    ref="cardHtmlNode"
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
          :src="props.back"
          loading="lazy"
          width="660"
          height="921"
        />
        <div class="card-front" :style="(staticStyles, foilStyles)">
          <img
            :src="props.front"
            alt=""
            @load="imageLoader"
            loading="lazy"
            width="660"
            height="921"
          />
          <div class="card-shine"></div>
          <!-- 聚焦灯光效果层 -->
          <div class="card-glare"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
/** 基础变量 👇----------------------------------------------------------------------------*/
:global(:root) {
  /** 卡片比例 */
  --card-aspect: 0.718;
  --card-radius: 4.55% / 3.5%;
  --card-edge: hsl(47, 100%, 78%);
  --card-back: hsl(205, 100%, 25%);
  --card-glow: hsl(175, 100%, 90%);

  --sunpillar-1: hsl(2, 100%, 73%);
  --sunpillar-2: hsl(53, 100%, 69%);
  --sunpillar-3: hsl(93, 100%, 69%);
  --sunpillar-4: hsl(176, 100%, 76%);
  --sunpillar-5: hsl(228, 100%, 74%);
  --sunpillar-6: hsl(283, 100%, 73%);

  --sunpillar-clr-1: var(--sunpillar-1);
  --sunpillar-clr-2: var(--sunpillar-2);
  --sunpillar-clr-3: var(--sunpillar-3);
  --sunpillar-clr-4: var(--sunpillar-4);
  --sunpillar-clr-5: var(--sunpillar-5);
  --sunpillar-clr-6: var(--sunpillar-6);
}

.card {
  --grain: url("/img/grain.webp");
  --glitter: url("/img/glitter.png");
  --glitter-size: 25%;

  --space: 5%;
  --angle: 133deg;
  --img-size: cover;

  --red: #f80e35;
  --yellow: #eedf10;
  --green: #21e985;
  --blue: #0dbde9;
  --violet: #c929f1;

  --clip: inset(9.85% 8% 52.85% 8%);
  --clip-invert: polygon(0% 0%,
      100% 0%,
      100% 100%,
      0% 100%,
      0 47.15%,
      91.5% 47.15%,
      91.5% 9.85%,
      8% 9.85%,
      8% 47.15%,
      0 50%);

  --clip-stage: polygon(91.5% 9.85%,
      57% 9.85%,
      54% 12%,
      17% 12%,
      16% 14%,
      12% 16%,
      8% 16%,
      8% 47.15%,
      92% 47.15%);
  --clip-stage-invert: polygon(0% 0%,
      100% 0%,
      100% 100%,
      0% 100%,
      0 47.15%,
      91.5% 47.15%,
      91.5% 9.85%,
      57% 9.85%,
      54% 12%,
      17% 12%,
      16% 14%,
      12% 16%,
      8% 16%,
      8% 47.15%,
      0 50%);

  --clip-trainer: inset(14.5% 8.5% 48.2% 8.5%);
  --clip-borders: inset(2.8% 4% round 2.55% / 1.5%);
  --foil-brightness: 0.55;

  &.water {
    --card-glow: hsl(192, 97%, 60%);
  }

  &.fire {
    --card-glow: hsl(9, 81%, 59%);
  }

  &.grass {
    --card-glow: hsl(96, 81%, 65%);
  }

  &.lightning {
    --card-glow: hsl(54, 87%, 63%);
  }

  &.psychic {
    --card-glow: hsl(281, 62%, 58%);
  }

  &.fighting {
    --card-glow: rgb(145, 90, 39);
  }

  &.darkness {
    --card-glow: hsl(189, 77%, 27%);
  }

  &.metal {
    --card-glow: hsl(184, 20%, 70%);
  }

  &.dragon {
    --card-glow: hsl(51, 60%, 35%);
  }

  &.fairy {
    --card-glow: hsl(323, 100%, 89%);
  }
}

/** 👆----------------------------------------------------------------------------*/

.card-shine,
.card-glare {
  will-change: transform, opacity, background-image, background-size,
    background-position, background-blend-mode, filter;
}

.card,
.card-rotator,
.card-rotator * {
  aspect-ratio: var(--card-aspect);
  border-radius: var(--card-radius);
}

.card,
.card * {
  outline: 1px solid transparent;
}

.card {
  /* 将卡放置在新的转换层上，以确保它有硬加速 */
  -webkit-transform: translate3d(0px, 0px, 0.01px);
  transform: translate3d(0px, 0px, 0.01px);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  pointer-events: none;
  /* 如果卡片按比例放大，确保卡片在其他卡片之上 */
  z-index: calc(var(--card-scale) * 2);
  will-change: transform, visibility, z-index;

  &.interacting {
    z-index: calc(var(--card-scale) * 120);
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
    box-shadow: 
      0 0 3px -1px transparent, 
      0 0 2px 1px transparent, 
      0 0 5px 0px transparent,
      0px 10px 20px -5px black, 
      0 2px 15px -5px black,
      0 0 20px 0px transparent;
  }

  &.active .card-rotator,
  .card-rotator:focus {
    box-shadow: 
      0 0 3px -1px white, 
      0 0 3px 1px var(--card-edge), 
      0 0 12px 2px var(--card-glow), 
      0px 10px 20px -5px black, 
      0 0 40px -30px var(--card-glow), 
      0 0 50px -20px var(--card-glow)
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
    -webkit-transform: translate3d(var(--translate-x),
        var(--translate-y),
        0.1px) scale(var(--card-scale));
    transform: translate3d(var(--translate-x), var(--translate-y), 0.1px) scale(var(--card-scale));

    >.card-rotator {
      /** 清除button默认样式 */
      border: none;
      background: transparent;
      padding: 0;
      -webkit-appearance: none;
      appearance: none;

      /** 3d角度偏转 */
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
        image-rendering: optimizeQuality;
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        pointer-events: none;
        overflow: hidden;
      }
    }
  }
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

.card-back {
  background-color: var(--card-back);
  -webkit-transform: rotateY(180deg) translateZ(1px);
  transform: rotateY(180deg) translateZ(1px);
  /** 属性决定元素的背面是否对用户可见。它是正面的镜像，正作为元素的背面显示给用户。旋转元素然后决定元素的背面是否可见时，这很有用 */
  /** 下层视为背面，开启下层背面显示，保证旋转时卡背显示正常 */
  backface-visibility: visible;
}

.card-front,
.card-front * {
  /** 卡片上层视为前面，隐藏上层背面 */
  backface-visibility: hidden;
}

.card-front {
  opacity: 1;
  transition: opacity 0.33s ease-out;
  -webkit-transform: translate3d(0px, 0px, 0.01px);
  transform: translate3d(0px, 0px, 0.01px);

  .card-shine {
    display: grid;
    transform: translateZ(1px);
    overflow: hidden;
    z-index: 3;

    background: transparent;
    background-size: cover;
    background-position: center;

    filter: brightness(.85) contrast(2.75) saturate(.65);
    mix-blend-mode: color-dodge;

    opacity: var(--card-opacity);

    &:before,
    &:after {
      grid-area: 1/1;
      border-radius: var(--card-radius);
    }

    &:before {
      --sunpillar-clr-1: var(--sunpillar-5);
      --sunpillar-clr-2: var(--sunpillar-6);
      --sunpillar-clr-3: var(--sunpillar-1);
      --sunpillar-clr-4: var(--sunpillar-2);
      --sunpillar-clr-5: var(--sunpillar-3);
      --sunpillar-clr-6: var(--sunpillar-4);

      transform: translateZ(1px);
    }
 
    &:after {
      --sunpillar-clr-1: var(--sunpillar-6);
      --sunpillar-clr-2: var(--sunpillar-1);
      --sunpillar-clr-3: var(--sunpillar-2);
      --sunpillar-clr-4: var(--sunpillar-3);
      --sunpillar-clr-5: var(--sunpillar-4);
      --sunpillar-clr-6: var(--sunpillar-5);

      transform: translateZ(1.2px);
    }
  }

  .card-glare {
    /* 保证眩光光晕效果在最上层 */
    transform: translateZ(1.41px); // 
    overflow: hidden;
    
    background-image: radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y),
        hsla(0, 0%, 100%, 0.8) 10%,
        hsla(0, 0%, 100%, 0.65) 20%,
        hsla(0, 0%, 0%, 0.5) 90%);

    opacity: var(--card-opacity);
    mix-blend-mode: overlay;

  }
}

/** Masking Effects **/

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
.card[data-rarity="rare holo cosmos"][data-supertype="trainer"] .card-glare:after,
.card[data-rarity$="reverse holo"][data-supertype="trainer"] .card-glare:after {
  clip-path: var(--clip-trainer);
}



</style>