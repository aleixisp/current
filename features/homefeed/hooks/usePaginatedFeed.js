/* eslint-disable operator-assignment */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Note, pool } from '../../../utils/nostrV2';
import { useRelayUrls } from '../../relays';
import { useRealm } from '@realm/react';
import Realm from 'realm';
import Kind1Note from '../../../models/Kind1Note';

export const usePaginatedFeed = () => {
  const { readUrls } = useRelayUrls();
  const realm = useRealm();

  const followedPubkeys = useSelector((state) => state.user.followedPubkeys);
  const events = useSelector((state) => state.messages.messages);

  let timer;

  const untilRef = useRef(Math.floor(Date.now() / 1000));

  async function get25RootPosts() {
    let windowHours = 1;

    if (followedPubkeys.length < 100) {
      windowHours = 12;
    } else if (followedPubkeys.length >= 100 && followedPubkeys.length < 250) {
      windowHours = 3;
    }
    if (followedPubkeys.length < 1) {
      return;
    }
    let until = untilRef.current;
    let since = until - windowHours * 3600;
    const results = [];
    while (results.length < 25) {
      await new Promise((resolve) => {
        const sub = pool.sub(
          readUrls,
          [
            {
              authors: followedPubkeys,
              kinds: [1],
              until,
              since,
            },
          ],
          { skipVerification: true },
        );
        const next = () => {
          resolve();
          sub.unsub();
        };
        timer = setTimeout(next, 3200);
        sub.on('event', (event) => {
          const newNote = new Kind1Note(event);
          try {
            realm.write(() => {
              realm.create('Note', {
                _id: new Realm.BSON.ObjectID(),
                content: newNote.content,
                images: newNote.images,
                id: newNote.id,
                pubkey: newNote.pubkey,
                createdAt: newNote.createdAt,
                tags: newNote.tags.map(tag => JSON.stringify(tag)),
                kind: newNote.kind,
                repliesTo: newNote.repliesTo,
                root: newNote.root,
                mentions: newNote.mentions,
                sig: newNote.sig,
              });
            });
          } catch (e) {
            console.log(e);
          }
          clearTimeout(timer);
          if (!event.tags.some((tag) => tag.includes('e'))) {
            const newEvent = new Note(event).saveToStore();
            results.push(newEvent);
          }
          timer = setTimeout(next, 3000);
        });
        sub.on('eose', () => {
          next();
        });
      });
      until = until - windowHours * 3600;
      since = since - windowHours * 3600;
    }
    untilRef.current = until;
  }

  const refresh = () => {
    untilRef.current = Math.floor(Date.now() / 1000);
    get25RootPosts();
  };

  useEffect(() => {
    if (readUrls.length > 0 && followedPubkeys.length > 0) {
      get25RootPosts();
    }
  }, []);

  return [get25RootPosts, refresh, events];
};

export default usePaginatedFeed;
