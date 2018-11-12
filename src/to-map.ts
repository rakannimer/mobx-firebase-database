import { observable, ObservableMap } from "mobx";

function defaultMap<T>(a: T) {
  return a;
}
function defaultFilter<V>(p: V, c: V) {
  return true;
}

export type ToMapArgs<K, V> = {
  mapKey?: (m: K) => any;
  mapValue?: (m: V) => any;
  filter?: (prevValue: V, currentValue: V) => boolean;
  initial?: ObservableMap<K, V>;
};

export function toMap<K, V>(
  ref: any,
  {
    mapKey = defaultMap,
    mapValue = defaultMap,
    filter = defaultFilter,
    // For better types. Object cant take enum for keys but maps can.
    initial = observable.map({})
  } = {
    map: defaultMap,
    filter: defaultFilter,
    initial: observable.map({})
  } as ToMapArgs<K, V>
) {
  const map = initial;
  const unsubChildAdded = ref.on("child_added", (v: any) => {
    const valueOrNull = !v ? null : v.val();
    const keyOrNull = !v ? null : v.key;
    const currentMapKey = mapKey(keyOrNull);
    const currentMapValue = mapValue(valueOrNull);
    if (!map.has(currentMapKey)) {
      map.set(currentMapKey, observable.box(currentMapValue));
      return;
    }
    const previousMapValue = map.get(currentMapKey).get();
    const shouldUpdateValue = filter(previousMapValue, currentMapValue);
    if (!shouldUpdateValue) {
      return;
    }
    map.get(currentMapKey).set(currentMapValue);

    return;
  });
  const unsubChildRemoved = ref.on("child_removed", (v: any) => {
    const valueOrNull = !v ? null : v.val();
    const keyOrNull = !v ? null : v.key;
    const currentMapKey = mapKey(keyOrNull);
    const currentMapValue = mapValue(valueOrNull);
    if (!map.has(currentMapKey)) {
      return;
    }
    const previousMapValue = map.get(currentMapKey).get();
    const shouldUpdateValue = filter(previousMapValue, currentMapValue);
    if (!shouldUpdateValue) {
      return;
    }
    map.delete(currentMapKey);
  });
  const unsub = () => {
    unsubChildAdded && unsubChildAdded();
    unsubChildRemoved && unsubChildRemoved();
  };

  return { value: map, unsub };
}
