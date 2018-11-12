import { observable, ObservableMap } from "mobx";
import FirebaseArray from "firebase-array";
function defaultMap(a: any) {
  return a;
}
function defaultFilter(p: any, c: any) {
  return true;
}

export type ToMapArgs = {
  mapKey?: (m: string | number) => any;
  mapValue?: (m: any) => any;
  filter?: (prevValue: any, currentValue: any) => boolean;
};

export function toMap(
  ref: any,
  { mapKey = defaultMap, mapValue = defaultMap, filter = defaultFilter } = {
    mapKey: defaultMap,
    mapValue: defaultMap,
    filter: defaultFilter
  }
) {
  const map = observable.map({});
  const orderedKeys = new FirebaseArray(observable.array([]));
  const unsubChildAdded = ref.on("child_added", (v: any, previousKey: any) => {
    const valueOrNull = !v ? null : v.val();
    const keyOrNull = !v ? null : v.key;
    const previousKeyOrNull = !previousKey ? null : previousKey;
    const currentMapKey = mapKey(keyOrNull);
    const currentMapValue = mapValue(valueOrNull);
    orderedKeys.childAdded(currentMapKey, mapKey(previousKeyOrNull));
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
    orderedKeys.childRemoved(currentMapKey);
    const previousMapValue = map.get(currentMapKey).get();
    const shouldUpdateValue = filter(previousMapValue, currentMapValue);
    if (!shouldUpdateValue) {
      return;
    }
    map.delete(currentMapKey);
  });
  const unsubChildChanged = ref.on("child_changed", (v: any) => {
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
  });

  const unsubChildMoved = ref.on("child_moved", (v: any, previousKey: any) => {
    const keyOrNull = !v ? null : v.key;
    const currentMapKey = mapKey(keyOrNull);
    const previousKeyOrNull = !previousKey ? null : previousKey;
    orderedKeys.childMoved(currentMapKey, mapKey(previousKeyOrNull));
  });

  const unsub = () => {
    unsubChildAdded && unsubChildAdded();
    unsubChildRemoved && unsubChildRemoved();
    unsubChildChanged && unsubChildChanged();
    unsubChildMoved && unsubChildMoved();
  };

  return { value: map, unsub, keys: orderedKeys.get() };
}
