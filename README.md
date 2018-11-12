## Mobx Firebase Database

[![CircleCI][circleci-badge]][circleci-href]
[![NPM][npm-version-badge]][npm-href]
[![BundlePhobia][bundlephobia-badge]][bundlephobia-href]

mobx-firebase-database allows you to map your Firebase data to MobX observables and interact with/react to it using MobX.

## Install

```sh
  yarn add mobx-firebase-database
  # If you're using firebase web
  yarn add firebase
  # If you're using firebase-admin
  yarn add firebase-admin
  # If you're using react-native-firebase
  yarn add react-native-firebase
```

## Peer Dependencies

mobx-firebase-database works with : [`firebase`](https://www.npmjs.com/package/firebase), [`firebase-admin`](https://www.npmjs.com/package/firebase) and [`react-native-firebase`](https://www.npmjs.com/package/react-native-firebase)

Depending on which one you're using you will need to have it installed.

## Usage

### Web

Before starting to code, you need to get your Firebase Credentials :

Follow the steps [here](https://firebase.google.com/docs/web/setup#add_firebase_to_your_app) to get your config.

```typescript
import getMobxFire from "mobx-firebase-database";
import firebase from "firebase/app";
import "firebase/database";

// Don't worry about calling it more than once.
const { toBox, toMap, getFirebaseRef, destroy } = getMobxFire({
  config,
  firebase
});

// toBox
const postId = `my_post_id`;
const postRef = getFirebaseRef({ path: `posts/${postId}` });
const { value, unsub } = toBox(postRef);

const post = value.get(); // always contains the latest value of posts/${postId}
await postRef.update({ last_seen_at: firebase.database.ServerValue.TIMESTAMP });
value.get(); // {...post, last_seen_at: number}
await postRef.set(null);
value.get(); // null

// toMap
const postId = `my_post_id`;
const postsRef = getFirebaseRef({ path: `posts`, orderByKey: true });
const { value, unsub } = toMap(postRef);
const allPostsIds = value.keys();
const post = value.get(`${postId}`);
```

## API

### `mobxFirebaseDatabase`

#### Input :

getMobxFire requires as input an object with shape :

- config:

```typescript
{
  apiKey: string,
  authDomain: string,
  databaseURL: string,
  storageBucket: string
}
```

- firebase : Firebase web client from `firebase` package

#### Output :

Object with shape :

```typescript
type Output<T> = {
  toArray: ToArray;
  toBox: ToBox;
  toMap: ToMap;
  getFirebaseRef: (query: FirebaseQuery) => any;
  destroy: () => void;
};
```

### `toBox` and `toMap`

#### Input

All methods take in 2 arguments, the first is required and the second optional :

- `ref` : Any firebase ref, with or without sorting and/or limiting.
- `options` : depends on the method

##### toBox

```typescript
type ToBoxOptions<V> = {
  map?: (m: V) => any;
  filter?: (m: V) => boolean;
  initial?: V | null;
};
```

##### toMap

```typescript
type ToMapOptions<K, V> = {
  mapKey?: (m: K) => any;
  mapValue?: (m: V) => any;
  filter?: (prevValue: V, currentValue: V) => boolean;
  initial?: ObservableMap<K, V>;
};
```

#### Output

An object with the following shape :

- `value` : Observable box with the latest value of the ref inside, or null if it doesn't exist or is not fetched yet.

- `unsub` : A function to turn off the firebase ref listener when you don't need it anymore.

##### toBox

```typescript
const { value, unsub } = toBox(ref, { initial: "something" });
```

##### toMap

```typescript
const { value: map, keys } = toMap(ref);
// map: ObservableMap<string, any>
// keys: IObservableArray<string>
```

[circleci-href]: https://circleci.com/gh/rakannimer/mobx-firebase-database
[circleci-badge]: https://img.shields.io/circleci/project/github/rakannimer/mobx-firebase-database.svg
[npm-href]: https://www.npmjs.com/package/mobx-firebase-database
[npm-version-badge]: https://img.shields.io/npm/v/mobx-firebase-database.svg
[npm-license-badge]: https://img.shields.io/github/license/rakannimer/mobx-firebase-database.svg
[bundlephobia-badge]: https://img.shields.io/bundlephobia/minzip/mobx-firebase-database.svg
[bundlephobia-href]: https://bundlephobia.com/result?p=mobx-firebase-database
