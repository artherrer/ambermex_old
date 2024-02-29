/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { View, AsyncStorage, TextInput, Text, TouchableOpacity, WebView, ScrollView, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Dimensions, Button, Linking, Alert, Image } from 'react-native';
import { Avatar, Input, Button as ButtonAlt, Icon } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'

import PhoneInput from 'react-native-phone-input';

const placeholder = require('../../../assets/image/profile_pholder.png');
import { connect } from 'react-redux';

var { height, width } = Dimensions.get('window');

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class VerificationResult extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Verificación"
  });

  constructor(props) {
    super(props);

  }

  componentDidMount(){

  }

  render() {

    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:height - (headerHeight + 49), padding:20, paddingTop:0, justifyContent:'space-around'}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        {this.props.userState.UserData.verifiedIdentity == 1 ?
          <View style={{justifyContent:'flex-start', height:height/1.95}}>
          <Text style={{marginBottom:(height/1.95)/6,color:'darkgray', textAlign:'center', fontSize:17}}>Tus datos fueron enviados correctamente, y nuestro personal esta verificando tu información; Se te enviara un correo con el resultado de la verificación pronto.</Text>
          <Icon type="feather" name="clock" color="blue" size={130} style={{textAlign:'right'}} />
          </View>
          :
          (this.props.userState.UserData.verifiedIdentity == 2 ?
            <View style={{justifyContent:'flex-start', height:height/1.95}}>
            <Text style={{marginBottom:(height/1.95)/6,color:'darkgray', textAlign:'center', fontSize:17}}>La verificación de tu identidad ha sido exitosa, las fotos se han borrado de nuestros servidores.</Text>
            <Icon type="ionicon" name="ios-checkmark-circle" color="#59a711" size={130} />
            </View>
            :
            <View style={{justifyContent:'flex-start', height:height/1.95}}>
            <Text style={{marginBottom:(height/1.95)/6,color:'darkgray', textAlign:'center', fontSize:17}}>No se pudo verificar tu identidad correctamente, por favor, realiza el proceso una vez más.</Text>
            <Icon type="ionicon" name="ios-close-circle-outline" color="red" size={130} />
            </View>
          )
        }
      </KeyboardAvoidingView>
    );
  }
}

let VerificationResultContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(VerificationResult);
export default VerificationResultContainer;
