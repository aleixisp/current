import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchView, TrendingPostView } from '../views';
import { colors } from '../../../styles';
import { BackHeader } from '../../../components';

const Stack = createStackNavigator();

const SearchNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Search Home"
      component={SearchView}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Trending Posts"
      component={TrendingPostView}
      options={({ navigation }) => ({
        header: () => <BackHeader navigation={navigation} />,
      })}
    />
  </Stack.Navigator>
);

export default SearchNavigator;
