const React = require("react");
const { sourceLoader } = require("./load-source.cjs");

/** Deterministic effect/cleanup harness, exercising real hooks with controlled I/O. */
function hookHarness(
  file,
  exported,
  args = [],
  overrides = {},
  strictUpdates = false,
) {
  let cursor = 0,
    dirty = true,
    mounted = true,
    value;
  const slots = [],
    pendingEffects = [];
  const changed = (a, b) =>
    !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        const slot = {
          value: typeof initial === "function" ? initial() : initial,
        };
        slot.set = (update) => {
          if (!mounted) throw new Error("State update after unmount");
          if (strictUpdates && typeof update === "function") update(slot.value);
          const next =
            typeof update === "function" ? update(slot.value) : update;
          if (!Object.is(slot.value, next)) {
            slot.value = next;
            dirty = true;
          }
        };
        slots[index] = slot;
      }
      return [slots[index].value, slots[index].set];
    },
    useReducer(reducer, initial) {
      const [state, set] = hooks.useState(initial);
      return [state, (action) => set((previous) => reducer(previous, action))];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { current: initial };
      return slots[index];
    },
    useMemo(factory, dependencies) {
      const index = cursor++;
      if (!slots[index] || changed(slots[index].dependencies, dependencies))
        slots[index] = { dependencies, value: factory() };
      return slots[index].value;
    },
    useCallback(callback, dependencies) {
      return hooks.useMemo(() => callback, dependencies);
    },
    useEffect(effect, dependencies) {
      const index = cursor++;
      if (!slots[index] || changed(slots[index].dependencies, dependencies)) {
        const previous = slots[index];
        const slot = { dependencies };
        slots[index] = slot;
        pendingEffects.push(() => {
          previous?.cleanup?.();
          slot.cleanup = effect();
        });
      }
    },
  };
  const load = sourceLoader({ react: hooks, ...overrides });
  const component = load(file)[exported];
  const run = component.type || component;
  function render() {
    let limit = 30;
    do {
      dirty = false;
      cursor = 0;
      value = run(...args);
      pendingEffects.splice(0).forEach((effect) => effect());
      if (!--limit) throw new Error("Render loop");
    } while (dirty);
    return value;
  }
  render();
  return {
    get value() {
      return value;
    },
    render,
    async flush() {
      await new Promise(setImmediate);
      return render();
    },
    unmount() {
      slots.forEach((slot) => slot?.cleanup?.());
      mounted = false;
    },
  };
}
module.exports = { hookHarness };
