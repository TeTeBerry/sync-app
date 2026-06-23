import Taro, { getCurrentInstance } from '@tarojs/taro';

function getSelectorQueryScope(): TaroGeneral.IAnyObject | undefined {
  const inst = getCurrentInstance();
  return (inst?.page ?? inst) as TaroGeneral.IAnyObject | undefined;
}

/** Page-scoped selector query (required for WeChat mini program DOM lookup). */
export function createLineupSelectorQuery(): Taro.SelectorQuery {
  let query = Taro.createSelectorQuery();
  if (process.env.TARO_ENV === 'weapp') {
    const scope = getSelectorQueryScope();
    if (scope) {
      query = query.in(scope);
    }
  }
  return query;
}
