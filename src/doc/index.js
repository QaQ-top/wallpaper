
/** @type {void} */
var count = 0;
count = 45;
//@ts-ignore 
count = true;

// number string boolean null undefined  never unknown void
/**
 * 测试JavaScript实现typescript 统一函数类型功能
 * @callback Predicate
 * @param {string} data
 * @param {number} [index]
 * @returns {boolean}
 */

/**
 * 
 */

/** 
 *  @type {Predicate}
 */
let predicate;


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
let generic;


/** 
 * @type {Generic<number[], Promise<string>>}
 */
let generic2;



/**
 * 测试JavaScript实现typescript 接口功能
 * @typedef {object} Test
 * @property {number} prop1 
 * @property {boolean} [prop2]
 * @property {number} [prop3 = 78]
 * @prop {boolean} prop4
 * @prop {boolean=} prop5
 */
/**
 * @type {Test}
 */
let test;



/**
 * 测试 typeof 获取值的类型
 * @type {typeof test} 
*/
let type;



/** 
 * 测试 typeof 获取对象的 key
 * @type {keyof Test}
 */
let keyof;


