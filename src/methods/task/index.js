class Task {
  task = Promise.resolve();
  /**
   * @description 追加一个任务到当前队列
   * @param {Function} taks 任务
   */
  push(taks) {
    this.task = this.task.finally(async () => {
      return await taks;
    });
    return this;
  }
}


export class Tasks {
  /**
   * @description 全部任务集合
   * @type {Map<string, Task>}
   */
  tasks = new Map();
  
  /**
   * @description 初始化一个任务
   * @param {string} key 任务名称
   */
  initTask(key) {
    const taks = new Task();
    this.tasks.set(key,taks);
    return taks;
  }

  /**
   * @description 获取一个任务
   * @param {string} key 任务名称
   */
  getTask(key) {
    return this.tasks.get(key);
  }

  /**
   * @description 是否有该任务存在
   * @param {string} key 任务名称
   */
  hasTask(key) {
    return this.tasks.has(key);
  }
}


/**
 * @description 异步睡眠
 * @param {number} time
 */
export function sleep(time) {
  let a = 0;
  return new Promise((resolve) => {
    const int = setInterval(() => {
      console.log(++a);
    }, 1000);
    setTimeout(() => {
      resolve(true);
      clearInterval(int);
    }, time);
  });
}

/**
 * 测试JavaScript实现typescript 统一函数类型功能
 * @callback Predicate
 * @param {string} data
 * @param {number} [index]
 * @returns {boolean}
 */
/** @type {Predicate} */
const predicate;

/**
 * 测试JavaScript实现typescript 泛型功能
 * @template T
 * @template S
 * @typedef {object} Generic
 * @property {T} data
 * @property {S} value
 */
/** 
 * @type {Generic<number, string>}
 */
const generic;
/** 
 * @type {Generic<number[], Promise<string>>}
 */
const generic2;

/**
 * 测试JavaScript实现typescript 接口功能
 * @typedef {object} Test
 * @property {number} prop1 等待执行时长 秒为单位
 * @property {boolean} [prop2] 是否结束 Generator
 * @property {number} [prop3 = 78] 是否结束 Generator
 * @prop {boolean=} prop4 是否结束 Generator
 */
/** @type {Test} */
const test;

/**
 * Generator.property.next 方法接收的参数
 * @typedef {object} NextParams
 * @property {number} time 等待执行时长 秒为单位
 * @property {boolean} [end] 是否结束 Generator
 */

/**
 * createPolling 函数接收的参数
 * @template T
 * @typedef {object} PollingProps
 * @property {number} [frequency = 0] - 轮询次数
 * @property {() => Promise<T>} event 轮询事件
 * @property {(e: any) => void} onError 每次轮询发生错误时触发
 */

/**
 * 
 * @description 生成轮询器
 * 执行 next 会得到4种值 event执行结果:
 * 1:手动退出并结束轮询;
 * 2: 到底执行上限并结束轮询;
 * 3: event的执行发生错误并结束轮询;
 * @export
 * @template T
 * @param {PollingProps<T>} {
 *   frequency,
 *   event,
 *   onError,
 * } frequency 轮询次数 | event 轮询事件 | onError 每次轮询发生错误时触发
 * @returns
 */
export async function* createPolling({ frequency, event, onError }) {
  /** @type {NextParams} */
  let execution = {
    time: 0,
  };
  /** @type {NextParams} */
  let nextParams;
  let count = -1;
  while (true) {
    await sleep(execution.time);
    try {
      ++count;
      nextParams = yield await event();
    } catch (error) {
      onError?.(error);
      return 3;
    }
    //--- yield 执行分割 ---
    console.log(nextParams, frequency, count, '====');
    if (frequency !== undefined && count >= frequency) {
      return 2;
    }
    if (execution.end) {
      return 1;
    }
    execution = nextParams;
  }
}
