import {
  CardStyleInterpolators,
  TransitionPresets,
  TransitionSpecs,
} from '@react-navigation/stack';
import {StackActions, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import AppWrap from '../screens/appWrap';
import Chat from '../screens/chat/index';
import AddUsers from '../screens/chat_settings/contact_list';
import ChatSettings from '../screens/chat_settings/index';
import SelectContacts from '../screens/create_group/index';
import CreateGroup from '../screens/create_group/second_screen';
import Convos from '../screens/home/convos/index';
import PublicAlert from '../screens/home/public_alert_new';
import AccountApply from '../screens/register/account_apply';
import VerifyCode from '../screens/register/confirm_phone';
import Register from '../screens/register/index';
import AddressLocation from '../screens/settings/AddressLocation';
import EULA from '../screens/settings/EULA';
import EmergencyContactsList from '../screens/settings/contact_list';
import EditUser from '../screens/settings/edit_user';
import EmergencyContacts from '../screens/settings/emergency_users';
import HistoryAlert from '../screens/settings/history_alert';
import Profile from '../screens/settings/index';
import MedicalData from '../screens/settings/medical_data';
import NewPassword from '../screens/settings/newPassword';
import Password from '../screens/settings/password';
import Settings from '../screens/settings/settings';
import TermsAndConditions from '../screens/settings/terms_and_conditions';
import VerifyEmail from '../screens/settings/verify_email';
import LandingScreen from '../screens/signin/LandingScreen';
import ChallengeStart from '../screens/signin/challenge_one';
import ChallengeEnd from '../screens/signin/challenge_two';
import Signin from '../screens/signin/index';
import RecoverPassword from '../screens/signin/recover_password';
import IDPhoto from '../screens/verification/id_photo';
import SelfiePhoto from '../screens/verification/selfie_photo';
import UploadVerificationPics from '../screens/verification/upload_pictures';
import VerificationResult from '../screens/verification/verification_result';
import VerifyUser from '../screens/verification/verify_user';

import React from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';

import {View} from 'react-native';

const ProfileScreenStack = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    EmergencyContacts: {
      screen: EmergencyContacts,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    EmergencyContactsList: {
      screen: EmergencyContactsList,
    },
    SettingsVerifyUser: {
      screen: VerifyUser,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    SettingsVerifyUser2: {
      screen: IDPhoto,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    SettingsVerifyUser3: {
      screen: SelfiePhoto,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    UploadVerificationPics: {
      screen: UploadVerificationPics,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    VerifyEmail: {
      screen: VerifyEmail,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    VerificationResult: {
      screen: VerificationResult,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    Password: {
      screen: Password,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    NewPassword: {
      screen: NewPassword,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    EditUser: {
      screen: EditUser,
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    MedicalData: {
      screen: MedicalData,
    },
    TermsAndConditions: {
      screen: TermsAndConditions,
    },
    AddressLocation: {
      screen: AddressLocation,
    },
    HistoryAlert: {
      screen: HistoryAlert,
    },
    EULA: {
      screen: EULA,
    },
  },
  {
    mode: 'card',
    defaultNavigationOptions: {
      gestureEnabled: false,
      cardOverlayEnabled: true,
      ...TransitionPresets.SlideFromRightIOS,
    },
  },
);

const SettingsScreenStack = createStackNavigator({
  Settings: {
    screen: Settings,
  },
});

const ConvosScreenStack = createStackNavigator(
  {
    Convos: {
      screen: Convos,
    },
    PublicAlert: {
      screen: PublicAlert,
      navigationOptions: {
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        header: () => <View />,
        headerStyle: {height: 1},
        gestureEnabled: false,
        swipeEnabled: false,
        mode: 'modal',
        headerTransparent: true,
        headerBackground: () => <View />,
        headerStyle: {backgroundColor: 'white'},
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        gesturesEnabled: false,
      },
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    ChatSettings: {
      screen: ChatSettings,
      navigationOptions: {
        gesturesEnabled: false,
      },
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    SelectContacts: {
      screen: SelectContacts,
      navigationOptions: {
        gesturesEnabled: false,
      },
      options: {
        transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
        },
      },
    },
    CreateGroup: {
      screen: CreateGroup,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    AddUsers: {
      screen: AddUsers,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
  },
  {
    mode: 'card',
    defaultNavigationOptions: {
      gestureEnabled: false,
      cardOverlayEnabled: true,
      tabBarVisible: false,
      ...TransitionPresets.SlideFromRightIOS,
    },
  },
);
ConvosScreenStack.navigationOptions = ({navigation}) => {
  let tabBarVisible = false;
  for (let i = 0; i < navigation.state.routes.length; i++) {
    if (
      navigation.state.routes[i].routeName == 'Chat' ||
      navigation.state.routes[i].routeName == 'PublicAlert'
    ) {
      tabBarVisible = false;
    }
  }
  let gesturesEnabled = false;
  let tabBarOptions = {activeTintColor: '#7CB185', keyboardHidesTabBar: false};
  let tabBarLabel = 'Canales';
  let tabBarIcon = ({tintColor}) => (
    <FeatherIcon name="message-circle" size={20} color={tintColor} />
  );

  return {
    gesturesEnabled,
    tabBarVisible,
    tabBarLabel,
    tabBarIcon,
    tabBarOptions,
  };
};

export default createSwitchNavigator(
  {
    AppWrap,
    Signin: createStackNavigator(
      {
        LandingScreen: {
          screen: LandingScreen,
          navigationOptions: {
            headerShown: false,
          },
        },
        Signin: {
          screen: Signin,
          navigationOptions: {
            headerShown: false,
          },
        },
        RecoverPassword: {
          screen: RecoverPassword,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        NewPasswordSignin: {
          screen: NewPassword,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        Register: {
          screen: Register,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        VerifyCode: {
          screen: VerifyCode,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        VerifyUser: {
          screen: VerifyUser,
          navigationOptions: {
            headerShown: false,
          },
        },
        VerifyUser2: {
          screen: IDPhoto,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        AccountApply: {
          screen: AccountApply,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        VerifyUser3: {
          screen: SelfiePhoto,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        VerificationPics: {
          screen: UploadVerificationPics,
          options: {
            transitionSpec: {
              open: TransitionSpecs.TransitionIOSSpec,
              close: TransitionSpecs.TransitionIOSSpec,
            },
          },
        },
        ChallengeStart: {
          screen: ChallengeStart,
        },
        ChallengeEnd: {
          screen: ChallengeEnd,
        },
      },
      {
        mode: 'card',
        defaultNavigationOptions: {
          gestureEnabled: false,
          cardOverlayEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
        },
      },
    ),
    Home: createStackNavigator(
      {
        Dashboard: {
          screen: createBottomTabNavigator(
            {
              Convos: ConvosScreenStack,
              Profile: ProfileScreenStack,
              Settings: SettingsScreenStack,
            },
            {defaultNavigationOptions: {tabBarVisible: false}},
          ),
          navigationOptions: {headerShown: false, tabBarVisible: false},
        },
      },
      {
        initialRouteName: 'Dashboard',
        mode: 'card',
        defaultNavigationOptions: {
          tabBarVisible: false,
          gestureEnabled: false,
          cardOverlayEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
        },
      },
    ),
  },
  {
    initialRouteName: 'AppWrap',
    mode: 'card',
    defaultNavigationOptions: {
      gestureEnabled: false,
      cardOverlayEnabled: true,
      ...TransitionPresets.SlideFromRightIOS,
    },
  },
);

export const popToTop = StackActions.popToTop();
