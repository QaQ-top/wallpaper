<script lang="ts">
import { adjust, clamp, round } from "@/helpers/Math";
import { useSpring } from "@/utils/spring";
import { CardProps } from './types.d'
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
  &.interacting {
    z-index: calc(var(--card-scale) * 120);
  }

  &,
  .card-rotator {
    /** 圆角 */
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