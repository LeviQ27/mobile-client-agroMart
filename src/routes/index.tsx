import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import TabRoutes from './tab.routes';
import {
  StoreDetails,
  Plan,
  ProfileInfo,
  SignIn,
  SignUp,
  AddressForm,
  ProductPage,
  SearchResult,
  Cart,
  Notifications,
  CreditCardRegister,
  BillingAddress,
  SelectCSA,
  Payments,
} from '../pages';
import History from '../pages/History';
import { useAuth } from '../hooks/AuthProvider';
import { colors } from '../styles';

const Stack = createStackNavigator();

const AuthRoutes: React.FC = () => (
  <Stack.Navigator
    initialRouteName="SignIn"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#fff' },
    }}
  >
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="SignUp" component={SignUp} />
  </Stack.Navigator>
);

const AppRoutes: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#fff' },
    }}
  >
    <Stack.Screen name="Home" component={TabRoutes} />
    <Stack.Screen name="SelectCSA" component={SelectCSA} />
    <Stack.Screen name="StoreDetail" component={StoreDetails} />
    <Stack.Screen name="Plan" component={Plan} />
    <Stack.Screen name="ProfileInfo" component={ProfileInfo} />
    <Stack.Screen name="AddressForm" component={AddressForm} />
    <Stack.Screen name="ProductPage" component={ProductPage} />
    <Stack.Screen name="SearchResult" component={SearchResult} />
    <Stack.Screen name="Cart" component={Cart} />
    <Stack.Screen name="Notifications" component={Notifications} />
    <Stack.Screen name="CreditCardRegister" component={CreditCardRegister} />
    <Stack.Screen name="BillingAddress" component={BillingAddress} />
    <Stack.Screen name="History" component={History} />
    <Stack.Screen name="Payments" component={Payments} />
  </Stack.Navigator>
);

const Routes: React.FC = () => {
  const { loading, signed } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return signed ? <AppRoutes /> : <AuthRoutes />;
};

export default Routes;
