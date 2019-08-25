export default class StatCache {
  constructor() {
    return {
      _count: 20,
      _last: [],
      get() {
        return this._last.reduce((sum, cur) => (sum += cur), 0) / this._count;
      },
      add(item) {
        this._last.unshift(item);
        this._last = this._last.slice(0, this._count);
      }
    };
  }
}
