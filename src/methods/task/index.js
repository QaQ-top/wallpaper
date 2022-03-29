/**
 * @description 单个异步执行队列
 * @author INCK <https://github.com/QaQ-top>
 * @date 2021-11-30
 * @class SingleQueue
 */
class SingleQueue {
  queue = Promise.resolve();
  /**
   * @description 追加一个任务到当前队列
   * @param {Function} task 任务
   */
  push(task) {
    this.queue = this.queue.finally(async () => {
      return await task;
    });
    return this;
  }
}
/**
 * @param {fa}
 */


/**
 * @description 异步执行队列管理器
 * @author INCK <https://github.com/QaQ-top>
 * @date 2021-11-30
 * @export
 * @class AsyncQueues
 */
export class AsyncQueues {
  /**
   * @description 全部任务集合
   * @type {Map<string, SingleQueue>}
   */
  tasks = new Map();
  
  /**
   * @description 初始化一个任务
   * @param {string} key 任务名称
   */
  initTask(key) {
    const queue = new SingleQueue();
    this.tasks.set(key, queue);
    return queue;
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
 * @author INCK <https://github.com/QaQ-top>
 * @param {number} time
 * @export
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
 * @author INCK <https://github.com/QaQ-top>
 * @export
 * @template T
 * @param {PollingProps<T>} params  frequency 轮询次数 | event 轮询事件 | onError 每次轮询发生错误时触发
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
