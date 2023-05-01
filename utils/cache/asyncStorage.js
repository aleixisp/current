import AsyncStorage from '@react-native-async-storage/async-storage';
import { setGetStartedItems, setTwitterModal } from '../../features/introSlice';
import {
  setZapAmount,
  setZapNoconf,
  setZapComment,
  setPushToken,
} from '../../features/userSlice';
import { store } from '../../store/store';
import { getValue } from '../secureStore';

export const generateRandomString = async (length) => {
  const value = await AsyncStorage.getItem('appId');

  if (!value) {
    const char =
      'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const random = Array.from(
      { length },
      () => char[Math.floor(Math.random() * char.length)],
    );
    const randomString = random.join('');
    await AsyncStorage.setItem('appId', randomString);
    return randomString;
  }
  return value;
};

export const storeData = async (key, value) => {
  try {
    console.log(`Storing data for key: ${key}`);
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    throw new Error(`Error while storing item: ${e}`);
  }
};

export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    throw new Error(`Error while retrieving item: ${e}`);
  }
};

export async function getLastOpenedMessages() {
  try {
    const lastOpenedMessages = await getData('lastOpenedMessages');
    return lastOpenedMessages;
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

export const hydrateStore = async () => {
  const zapAmount = await getData('zapAmount');
  const zapComment = await getData('zapComment');
  const zapNoconf = await getData('zapNoconf');
  const pushToken = await getData('pushToken');
  const twitterModalShown = await getData('twitterModalShown');
  const getStartedItemsShown = await getData('getStartedItemsShown');
  if (zapAmount) {
    store.dispatch(setZapAmount(zapAmount));
  }
  if (zapComment) {
    store.dispatch(setZapComment(zapComment));
  }
  if (zapNoconf) {
    store.dispatch(setZapNoconf(zapNoconf));
  }
  if (pushToken) {
    store.dispatch(setPushToken(pushToken));
  }
  if (twitterModalShown) {
    store.dispatch(setTwitterModal(JSON.parse(twitterModalShown)));
  }
  if (getStartedItemsShown) {
    const array = JSON.parse(getStartedItemsShown);
    array.forEach((id) => store.dispatch(setGetStartedItems(id)));
  }
};

export const getAllKeys = async () => {
  let keys = [];
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch (e) {}

  console.log(keys);
};

export const removeData = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    // remove error
  }

  console.log(`Removed ${keys} from AsyncStorage`);
};

export async function getPrivateKey() {
  const sk = await getValue('privKey');
  return sk;
}
