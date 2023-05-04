import { Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import devLog from '../../../utils/internal';
import TrendingNote from '../components/TrendingNote';
import { globalStyles } from '../../../styles';
import TrendingImages from '../components/TrendingImages';

const TrendingPostView = () => {
  const [trendingNotes, setTrendingNotes] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    async function getTrendingNotes() {
      try {
        const res = await fetch('https://api.nostr.band/v0/trending/notes');
        if (res.status !== 200) {
          const reqError = new Error('Request failed...');
          setError(reqError.message);
          throw reqError;
        }
        const data = await res.json();
        const trending = data.notes.map((note) => note.event);
        setTrendingNotes(trending);
      } catch (e) {
        setError(e.message);
        devLog(e);
      }
    }
    getTrendingNotes();
  }, []);
  return (
    <View style={globalStyles.screenContainer}>
      <View style={{ flex: 1, width: '100%' }}>
        {!error ? <FlashList
          data={trendingNotes}
          renderItem={({ item }) => <TrendingNote event={item} />}
          ListHeaderComponent={<TrendingImages />}
          estimatedItemSize={300}
        /> : <Text style={globalStyles.textBodyError}>{error}</Text>}
      </View>
    </View>
  );
};

export default TrendingPostView;
