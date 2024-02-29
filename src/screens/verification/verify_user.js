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

class VerifyUser extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Verificación"
  });

  constructor(props) {
    super(props);

    let PreviousRoute = props.navigation.state.params.PreviousRoute;
    let Creds = props.navigation.state.params.Creds;

    this.state = {
      ShowSkip: PreviousRoute === "Settings" ? false : true,
      Creds: Creds
    }
  }

  componentDidMount(){
   let { Creds, ShowSkip } = this.state;

    if(ShowSkip && Creds != undefined){
      this.props.dispatch({type:'ADD_USERNAME', Password:Creds.Password, Username:Creds.Username});
    }
  }

  verifyNext(){

    this.props.navigation.navigate("SettingsVerifyUser2");

  }

  skipVerification(){
    Alert.alert(
     'Si no completas la verificación, la aplicación estara limitada en funcionalidad.',
     "Puedes completar la verificación en cualquier momento, en la sección de Ajustes.",
     [
       {text: 'Terminar despues', onPress: () => this.goHome()},
       {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
     ],
     { cancelable: false }
   )
  }

  goHome(){
    let { ShowSkip, Creds } = this.state;

    if(ShowSkip && Creds != undefined){
      this.props.clientState.LoginXMPP(Creds.Username, Creds.Password, Creds.Resource);
      this.props.clientState.ConfigurePush(Creds.Username);
    }
    else{
      this.props.navigation.navigate('Profile');
    }
  }

  render() {

    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:height - (headerHeight + 49), padding:20, paddingTop:0, justifyContent:'space-around'}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <View style={{justifyContent:'center', height:height/1.95}}>
        <Text style={{marginBottom:20,color:'grey', textAlign:'center'}}>Para poder tener toda la funcionalidad de nuestra aplicación, necesitamos verificar tu identidad.</Text>
        <Text style={{color:'grey', textAlign:'center', marginBottom:20}}>Te pedimos tener tu INE vigente a la mano y una buena iluminación para capturar una imagen clara de tu identificación.</Text>
        <Image source={require('../../../assets/image/INEEjemplo.png')} resizeMode="contain" style={{height:height/3, width:width-40}} />
        </View>
        <View>
        {this.state.ShowSkip ?
          <ButtonAlt type='outline' title='Completar después' onPress={() => this.skipVerification()} titleStyle={{color:'grey',fontWeight:'bold'}} buttonStyle={{width:200, borderColor:'grey', borderRadius:25,alignSelf:'center'}} containerStyle={{alignSelf:'center',marginTop:15,marginBottom:15, borderRadius:25, backgroundColor:'white', justifyContent:'center'}}/>
          :
          null
        }
        <ButtonAlt title='Verificar' onPress={() => this.verifyNext()} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:200,backgroundColor:'#7CB185', borderRadius:25,alignSelf:'center'}} containerStyle={{alignSelf:'center' , justifyContent:'center'}}/>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

let VerifyUserContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(VerifyUser);
export default VerifyUserContainer;
