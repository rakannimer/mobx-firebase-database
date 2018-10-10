import initializeFirebaseApp from "initialize-firebase-app";
import { getFirebaseRef, FirebaseQuery } from "get-firebase-ref";
import { toArray } from "./to-array";
import { toBox } from "./to-box";
import { toMap } from "./to-map";

export type GetMobxFireArgs = {
  config: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    storageBucket: string;
  };
  firebase: any;
};

export function getMobxFire({ config, firebase }: GetMobxFireArgs) {
  initializeFirebaseApp({ ...config, firebase });
  let refs = [] as any[];
  const destroy = () => {
    for (let ref of refs) {
      ref.off();
    }
  };
  const _getFirebaseRef = (query: FirebaseQuery) => {
    const ref = getFirebaseRef({ firebase, ...query });
    refs.push(ref);
    return ref;
  };

  return {
    toArray,
    toBox,
    toMap,
    getFirebaseRef: _getFirebaseRef,
    destroy
  };
}

export default getMobxFire;
