import * as firebase from "firebase";
import { toJS } from "mobx";
import { config } from "../test-config";
import getMobxFire from "../";

describe("toMap", () => {
  const testPath = `mobx-fire/tests/${Date.now()}/`;
  const ARRAY_LENGTH = 2;
  const listAsObject = Array.from({ length: ARRAY_LENGTH }, (v, i) => {
    return {
      data: i
    };
  }).reduce((acc, cur, i) => {
    // acc[`id_${i}`] = cur;
    return {
      ...acc,
      [`id_${i}`]: cur
    };
  }, {}) as any;
  const { toMap, getFirebaseRef } = getMobxFire({
    config: config.client,
    firebase
  });
  afterAll(async () => {
    const ref = getFirebaseRef({ firebase, path: `${testPath}` });
    await ref.set(null);
  });
  test("exists", () => {
    expect(toMap).toBeTruthy();
  });

  test("returns the right data", () => {
    let ref = getFirebaseRef({ path: testPath });
    const returnVal = toMap(ref);
    expect(returnVal.value.get).toBeTruthy();
    expect(returnVal.value.set).toBeTruthy();
    expect(returnVal.unsub).toBeInstanceOf(Function);
  });

  test("works", async () => {
    const ref = getFirebaseRef({ firebase, path: testPath });
    const { value: map } = toMap(ref);
    await ref.set(listAsObject);
    expect(toJS(map)).toMatchInlineSnapshot(`
Object {
  "id_0": Object {
    "data": 0,
  },
  "id_1": Object {
    "data": 1,
  },
}
`);
    await ref.set({});
    expect(toJS(map)).toMatchInlineSnapshot(`Object {}`);
  });
  test("works with custom mapKey", async () => {
    const ref = getFirebaseRef({ firebase, path: testPath });
    const { value: map } = toMap(ref, {
      mapKey: key => {
        return `${key}`.toUpperCase();
      }
    });
    await ref.set(listAsObject);
    expect(toJS(map)).toMatchInlineSnapshot(`
Object {
  "ID_0": Object {
    "data": 0,
  },
  "ID_1": Object {
    "data": 1,
  },
}
`);
    await ref.set({});
    expect(toJS(map)).toMatchInlineSnapshot(`Object {}`);
  });

  test("works with custom mapValue", async () => {
    const ref = getFirebaseRef({ firebase, path: testPath, limitToFirst: 2 });
    const { value: map, unsub } = toMap<string, { data: any }>(ref, {
      mapValue: v => {
        if (!v) return v;
        return v.data;
      }
    });
    await firebase
      .database()
      .ref(testPath)
      .set(listAsObject);
    expect(toJS(map)).toMatchInlineSnapshot(`
Object {
  "id_0": 0,
  "id_1": 1,
}
`);
    await firebase
      .database()
      .ref(testPath)
      .set({});
    expect(toJS(map)).toMatchInlineSnapshot(`Object {}`);
    unsub();
  });
});
