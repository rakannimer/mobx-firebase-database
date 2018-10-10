import * as firebase from "firebase";
import { toJS } from "mobx";
import getMobxFire from "../";
import { config } from "../test-config";

describe("toArray", () => {
  const testPath = `mobx-fire/tests/${Date.now()}/`;
  const ARRAY_LENGTH = 2;
  const listAsObject = Array.from({ length: ARRAY_LENGTH }, (v, i) => {
    return {
      data: i
    };
  }).reduce((acc, cur, i) => {
    return {
      ...acc,
      [`id_${i}`]: cur
    };
  }, {}) as any;
  const TIMEOUT = 20000;

  let { toArray, getFirebaseRef, destroy } = getMobxFire({
    firebase,
    config: config.client
  });
  afterAll(async () => {
    const ref = getFirebaseRef({ path: `${testPath}` });
    await ref.set(null);
    destroy();
  });
  test("exists", () => {
    expect(toArray).toBeTruthy();
  });
  test("works", async () => {
    const ref = getFirebaseRef({ path: testPath });
    const { value: array, unsub } = toArray(ref);
    await ref.set(listAsObject);
    expect(toJS(array)).toMatchInlineSnapshot(`
Array [
  Object {
    "key": "id_0",
    "value": Object {
      "data": 0,
    },
  },
  Object {
    "key": "id_1",
    "value": Object {
      "data": 1,
    },
  },
]
`);
    await ref.set(null);
    expect(toJS(array)).toMatchInlineSnapshot(`Array []`);
    unsub();
  });
});
