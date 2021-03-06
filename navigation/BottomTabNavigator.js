import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import TabBarIcon from '../components/TabBarIcon';
import AccompanimentScreen from '../screens/AccompanimentScreen';
// import Home from '../screens/snack/Home';
// import Error from '../screens/Error';
import DuetteScreen from '../screens/DuetteScreen';
import { toggleUserInfo } from '../redux/userInfo';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Accompaniment';

const BottomTabNavigator = (props) => {

  const { navigation, route } = props;
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html

  navigation.setOptions({
    headerTitle: getHeaderTitle(route, props.user), headerRight: () => <UserIcon />, headerStyle: { backgroundColor: '#0047B9', height: 70 }, headerTitleStyle: { color: 'white' }
  });

  const handlePress = () => {
    if (props.user.id) {
      props.toggleUserInfo(!props.displayUserInfo)
    }
  }

  const UserIcon = () => (
    <View style={{ paddingRight: 12 }}>
      <Icon onPress={handlePress} underlayColor="#0047B9" name="perm-identity" type="material" color="white" size={25} />
    </View>
  );

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Accompaniment"
        component={AccompanimentScreen}
        options={{
          title: 'Record a base track!',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-musical-note" />,
          // tabBarVisible: false,
        }}
      />
      <BottomTab.Screen
        name="Duette"
        component={DuetteScreen}
        options={{
          title: 'Record a Duette!',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-musical-notes" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route, user) {
  const routeName = route.state ?.routes[route.state.index] ?.name ?? INITIAL_ROUTE_NAME;
  switch (routeName) {
    case 'Accompaniment':
      return `Welcome${user.name ? `, ${user.name.split(' ')[0]}` : ' to Duette'}!`;
    case 'Duette':
      return `${user.name ? 'Choose a base track' : 'Welcome to Duette!'}`;
  }
}

const mapState = ({ displayUserInfo, user }) => {
  return {
    displayUserInfo,
    user
  }
}

const mapDispatch = dispatch => {
  return {
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
}

export default connect(mapState, mapDispatch)(BottomTabNavigator);