import { CommonActions, StackActions } from '@react-navigation/native';
import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName: routeName,
      params: params,
    })
  );
}

function pop(){
  _navigator.dispatch(
    NavigationActions.back({key:"Home"})
  );
}

// add other navigation functions that you need and export them

export default {
  navigate,
  pop,
  setTopLevelNavigator,
};
