## Mobx Firebase Database

## The Problem

While Firebase's Realtime Database enables you to build almost anything. Manipulating realtime data in your app can lead to writing code that is hard to debug & understand.

## This Solution

Enter MobX. MobX is a powerful state management library that works with all front-end frameworks.

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
const { toBox, toArray, toMap, getFirebaseRef, destroy } = getMobxFire({
  config,
  firebase
});

// toBox
const postId = `my_post_id`;
const postRef = getFirebaseRef({ path: `posts/${postId}` });
const { value, unsub, update, set } = toBox(postRef);

const post = value.get(); // always contains the latest value of posts/${postId}
await update({ last_seen_at: firebase.database.ServerValue.TIMESTAMP });
value.get(); // {...post, last_seen_at: number}
await set(null);
value.get(); // null

// toMap
const postId = `my_post_id`;
const postsRef = getFirebaseRef({ path: `posts`, orderByKey: true });
const { value, unsub } = toMap(postRef);
const allPostsIds = value.keys();
const post = value.get(`${postId}`);
```

## API

### `observable.box`

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
  value: IObservableValue<T>;
  unsub: () => void;
  update: (value: any) => Promise<void>;
  set: (value: any) => Promise<void>;
};
```
