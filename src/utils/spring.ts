import { animate } from "popmotion";
import { reactive } from "vue";

export const useSpring = <T extends object>(
  values: T,
  initSpring?: { stiffness: number; damping: number }
) => {
  const target = reactive(values);
  const stopMap = new Map<string, Function>();
  return {
    target,
    set: (
      properties: Partial<T>,
      spring?: { stiffness: number; damping: number }
    ) => {
      Object.entries(properties).map(([key, value]) => {
        const oldValue = (target as any)[key];
        if (stopMap.has(key)) {
          const oldStop = stopMap.get(key);
          oldStop?.();
          stopMap.delete(key);
        }
        const { stop } = animate({
          type: "spring",
          from: oldValue,
          to: value,
          mass: 1,
          onUpdate: (v) => ((target as any)[key] = v),
          onComplete() {
            stopMap.delete(key);
          },
          ...(spring || initSpring || {}),
        });
        stopMap.set(key, stop);
      });
    },
  };
};
