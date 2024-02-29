import React, {Component} from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  View,
  StatusBar,
  Platform,
} from 'react-native';
import SigninLogo from './SigninLogo';
import {
  Header,
  HeaderHeightContext,
  useHeaderHeight,
} from 'react-navigation-stack';
import SigninLinks from './SigninLinks';
import SigninForm from './SigninForm';
var {height, width} = Dimensions.get('window');

export default class Signin extends Component {
  state = {
    isLogin: true,
  };

  render() {
    const {isLogin} = this.state;
    const {navigation} = this.props;

    return (
      <TouchableWithoutFeedback
        style={{height: height, backgroundColor: 'white'}}
        onPress={Keyboard.dismiss}>
        <View
          style={{justifyContent: 'center', flex: 1, backgroundColor: 'white'}}>
          <StatusBar barStyle={'dark-content'} />
          <SigninLogo />
          <SigninForm navigation={navigation} isLogin={isLogin} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
