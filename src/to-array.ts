import { observable } from "mobx";

function defaultMap<K, V>(k: K, v: V) {
  return { key: k, value: v };
}
function defaultFilter<K, V>(k: K, v: V) {
  return true;
}

export type ToArrayArgs<K, V> = {
  map?: (k: K, v: V) => any;
  filter?: (k: K, v: V) => boolean;
  initial?: Array<V>;
  getUnsub?: (func: (() => () => void)) => void;
};

export function toArray<K, V>(
  ref: any,
  {
    map = defaultMap,
    filter = defaultFilter,
    initial = [],
    getUnsub = () => {}
  } = {
    map: defaultMap,
    filter: defaultFilter,
    initial: [],
    getUnsub: () => {}
  } as ToArrayArgs<K, V>
) {
  const array = observable.array(initial);
  const unsubChildAdded = ref.on("child_added", (v: any) => {
    getUnsub(() => () => {
      unsubChildAdded && unsubChildAdded();
      unsubChildRemoved && unsubChildRemoved();
    });
    const valueOrNull = !v ? null : v.val();
    const keyOrNull = !v ? null : v.key;
    array.push(map(keyOrNull, valueOrNull));
    return;
  });
  const unsubChildRemoved = ref.on("child_removed", (v: any) => {
    const valueOrNull = !v ? null : v.val();
    const keyOrNull = !v ? null : v.key;
    const childIndex = array.findIndex((v: any) => v.key === keyOrNull);
    if (childIndex === -1) {
      return;
    }
    array.splice(childIndex, 1);
    return;
  });
  const unsub = () => {
    unsubChildAdded && unsubChildAdded();
    unsubChildRemoved && unsubChildRemoved();
  };

  return { value: array, unsub };
}
