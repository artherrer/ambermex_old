import { StackActions, createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import AppWrap from '../screens/appWrap';
import Signin from '../screens/signin/index';


export default createAppContainer(createSwitchNavigator(
    {
      AppWrap,
      Signin: createStackNavigator({
        Signin: {
          screen: Signin,
          navigationOptions: {
            headerShown: false
          }
        }
      }),
      // Home: createStackNavigator({
      //   Convos: {
      //       screen: Convos,
      //       navigationOptions: {
      //           headerTitle: 'Conversaciones',
      //       }
      //   },
      //   Chat: {
      //     screen: Chat,
      //     navigationOptions: {
      //         headerTitle: 'Conversacion',
      //     }
      //   },
      // }),
    },
    {
      initialRouteName: 'AppWrap',
    }
  ))

export const popToTop = StackActions.popToTop()

// const screens = {
//     Signin: {
//         screen: Signin,
//         navigationOptions: {
//             headerShown: false
//         }
//     },
//     Convos: {
//         screen: Convos
//     },
//     Home: {
//         screen: CounterApp
//     },
//     ReviewDetails : {
//         screen: reviewDetails
//     },
    
// }

// const NavigationStack = createStackNavigator(screens);

// export default createAppContainer(NavigationStack);