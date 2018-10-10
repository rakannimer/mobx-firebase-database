import * as firebase from "firebase";
import { config } from "../test-config";
import getMobxFire from "../";
import { waitUntilBox } from "../test-utils";
import { observable } from "mobx";

describe("toBox", () => {
  const testPath = `mobx-fire/tests/${Date.now()}/`;
  const firstValue = {
    val_1: {
      i_am_an: "object"
    }
  };
  const firstKey = `1`;
  const TIMEOUT = 20000;
  const { toBox, getFirebaseRef } = getMobxFire({
    firebase,
    config: config.client
  });
  // initializeFirebaseApp({ firebase, ...config.client });
  afterAll(async () => {
    const ref = getFirebaseRef({ path: `${testPath}` });
    await ref.set(null);
  });
  test("exists", () => {
    expect(toBox).toBeTruthy();
  });
  test("returns the right data", () => {
    let ref = getFirebaseRef({ path: `${testPath}/${firstKey}` });
    const returnVal = toBox(ref);
    expect(returnVal.value.get).toBeTruthy();
    expect(returnVal.value.set).toBeTruthy();
    expect(returnVal.unsub).toBeInstanceOf(Function);
    expect(returnVal.update).toBeInstanceOf(Function);
    expect(returnVal.set).toBeInstanceOf(Function);
  });

  test(
    "works with object",
    async () => {
      let ref = getFirebaseRef({ path: `${testPath}/${firstKey}` });
      const { value: box, update } = toBox(ref);
      await Promise.all([
        update(firstValue),
        waitUntilBox(box, ({ oldValue, newValue }) => {
          return oldValue !== newValue;
        })
      ]);
      expect(box.get()).toEqual(firstValue);
    },
    TIMEOUT
  );
  test(
    "works with string",
    async () => {
      const STRING_VALUE = "string";
      let ref = getFirebaseRef({ path: `${testPath}/str` });
      const { value: box, set } = toBox(ref);
      if (box.get() !== null) {
        expect(box.get()).toEqual(STRING_VALUE);
      }
      await Promise.all([
        set(STRING_VALUE),
        waitUntilBox(box, ({ oldValue, newValue }) => {
          // throw newValue;
          return oldValue !== newValue;
        })
      ]);
      expect(box.get()).toEqual(STRING_VALUE);
    },
    TIMEOUT
  );
  test(
    "works with custom map",
    async () => {
      let ref = getFirebaseRef({ path: `${testPath}/asd` });
      const { value: box, update } = toBox<{ a: any }>(ref, {
        map: value => {
          if (!value) return value;
          return value.a.toUpperCase();
        }
      });
      if (box.get() !== null) {
        expect(box.get()).toEqual({ a: "firstValue" });
        return;
      }
      await Promise.all([
        update({ a: "firstValue" }),
        waitUntilBox(box, ({ oldValue, newValue }) => {
          return oldValue !== newValue;
        })
      ]);
      expect(box.get()).toEqual("FIRSTVALUE");
    },
    TIMEOUT
  );
});
