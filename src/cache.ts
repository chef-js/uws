// Lazy Cache based on Map
export default class LaterMom {
  factory: (...args: any[]) => any;
  data = new Map();

  // factory for creating entries
  constructor(factory: (...args: any[]) => any) {
    this.factory = factory;
  }

  // creates a string from args
  getKey(...args: any[]) {
    return args.length > 1 ? args.join(",") : args[0];
  }

  // has entry at [args]
  has(...args: any[]) {
    const key = this.getKey(...args);
    return this.data.has(key);
  }

  // get entry at [args]
  get(...args: any[]) {
    const key = this.getKey(...args);
    let val = this.data.get(key);
    if (!val) {
      val = this.factory(...args);
      this.data.set(key, val);
    }
    return val;
  }

  // perform callback on each entry
  each(callback: any) {
    return this.data.forEach(callback);
  }

  // delete entry at [args]
  del(...args: any[]) {
    return this.data.delete(this.getKey(...args));
  }
}
