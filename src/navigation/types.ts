import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AddTransaction: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Categories: undefined;
  SMSTracking: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

