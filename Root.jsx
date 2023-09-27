/* eslint-disable max-len */
/* eslint-disable camelcase */
/* eslint-disable react/style-prop-object */
/* eslint-disable global-require */
import { View } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSelector, useDispatch } from 'react-redux';
import { loadAsync } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { getPublicKey, nip19 } from 'nostr-tools';

import { getValue } from './utils/secureStore';
import { logIn } from './features/authSlice';
import AuthedNavigator from './nav/AuthedNavigator';
import { loginToWallet } from './utils/wallet';
import { hydrateFromDatabase, init } from './utils/database';
import {
  getContactAndRelayList,
  updateFollowedUsers,
} from './utils/nostrV2/getUserData';
import { hydrateStore } from './utils/cache/asyncStorage';
import { WelcomeNavigator } from './features/welcome';
import { store } from './store/store';
import devLog from './utils/internal';
import useSilentFollow from './hooks/useSilentFollow';
import { setupRelay } from './features/relays/relaysSlice';
import { initRelays } from './utils/nostrV2';
import { hydrate } from './features/walletconnect/walletconnectSlice';
import './translations/translations';
import { initRC } from './features/premium/utils/utils';
import linkingConfig from './config/linking';

SplashScreen.preventAutoHideAsync();

const Root = () => {
  const [appIsReady, setAppIsReady] = useState(false);
  const silentFollow = useSilentFollow();
  const dispatch = useDispatch();
  const { isLoggedIn, walletExpires } = useSelector((state) => state.auth);

  const hydrateWc = async () => {
    const wcDataString = await getValue('wcdata');
    if (wcDataString) {
      const wcData = JSON.parse(wcDataString);
      dispatch(hydrate(wcData));
    }
  };

  const refreshToken = async () => {
    if (isLoggedIn && Date.now() > walletExpires) {
      const sk = await getValue('privKey');
      const pk = getPublicKey(sk);
      const {
        data: { access_token, username },
      } = await loginToWallet(sk);
      dispatch(logIn({ bearer: access_token, username, pubKey: pk }));
    }
  };

  useEffect(() => {
    const prepare = async () => {
      setAppIsReady(false);
      try {
        await init();
        await initRelays();
        await hydrateFromDatabase();
        await hydrateStore();
        await hydrateWc();
        const privKey = await getValue('privKey');
        await loadAsync({
          'Montserrat-Regular': require('./assets/Montserrat-Regular.ttf'),
          'Montserrat-Bold': require('./assets/Montserrat-Bold.ttf'),
          'Satoshi-Symbol': require('./assets/Satoshi-Symbol.ttf'),
        });
        if (privKey) {
          const {
            data: { access_token, username },
          } = await loginToWallet(privKey);
          const pubKey = getPublicKey(privKey);
          await initRC(pubKey);
          dispatch(logIn({ bearer: access_token, username, pubKey }));
          try {
            const contactList = await getContactAndRelayList(pubKey);
            if (contactList.content.length > 0) {
              const relayMetadata = JSON.parse(contactList.content);
              const relays = Object.keys(relayMetadata).map((relay) => ({
                url: relay,
                read: relayMetadata[relay].read,
                write: relayMetadata[relay].write,
              }));
              store.dispatch(setupRelay(relays));
            }
            if (contactList.tags.length > 0) {
              const pubkeys = contactList.tags.map((tag) => tag[1]);
              silentFollow(pubkeys);
            }
            await updateFollowedUsers();
          } catch (e) {
            devLog(e);
          }
        }
      } catch (e) {
        devLog(e);
      } finally {
        setAppIsReady(true);
      }
    };
    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }
  return (
    <NavigationContainer
      onStateChange={refreshToken}
      theme={DarkTheme}
      linking={linkingConfig}
    >
      <StatusBar style="light" />
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {isLoggedIn === false ? <WelcomeNavigator /> : <AuthedNavigator />}
      </View>
    </NavigationContainer>
  );
};

export default Root;
