import { observable } from "mobx";

function defaultMap<T>(a: T) {
  return a;
}
function defaultFilter<T>(a: T) {
  return true;
}

function defaultShouldUnsub<T>(a: T) {
  return false;
}

export type ToBoxArgs<T> = {
  map?: (m: T) => any;
  filter?: (m: T) => boolean;
  shouldUnsubWhen?: (m: T) => boolean;
  initial?: T | null;
};

export function toBox<T>(
  ref: any,
  {
    map = defaultMap,
    filter = defaultFilter,
    shouldUnsubWhen = defaultShouldUnsub,
    initial = null
  } = {
    map: defaultMap,
    filter: defaultFilter,
    shouldUnsubWhen: defaultShouldUnsub,
    initial: null
  } as ToBoxArgs<T>
) {
  const box = observable.box(initial);
  const unsub = ref.on("value", (v: any) => {
    const valueOrNull = !v ? null : v.val();
    if (filter(valueOrNull)) {
      box.set(map(valueOrNull));
    }
    if (shouldUnsubWhen(valueOrNull)) {
      unsub && unsub();
    }
  });
  const update = (value: any) => {
    return ref.update(value);
  };
  const set = (value: any) => {
    return ref.set(value);
  };
  return { value: box, unsub, update, set };
}
