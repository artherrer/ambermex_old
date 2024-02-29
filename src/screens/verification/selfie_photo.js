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

const IDPlaceholder = require('../../../assets/image/ID.png');
import { connect } from 'react-redux';

var { height, width } = Dimensions.get('window');

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class SelfiePicture extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Selfie"
  });

  constructor(props) {
    super(props);

    let IneURL = props.navigation.state.params.IneURL;
    let ShowSkip = props.navigation.state.params.ShowSkip;

    this.state = {
      IneExists:true,
      IneURL:IneURL,
      SelfieExists:false,
      SelfieURL:null,
      ShowSkip:ShowSkip
    }
  }

  componentDidMount(){
    AsyncStorage.getItem("SelfiePicture").then((value) => {
      if(value != undefined){
        value = JSON.parse(value);
        this.setState({SelfieURL: value, SelfieExists:true});
      }
    })
  }

  verifyNext(){
    let { IneURL, SelfieURL, ShowSkip } = this.state;

    this.props.navigation.navigate(ShowSkip ? "VerificationPics" : "UploadVerificationPics",{IneURL:IneURL, SelfieURL:SelfieURL, ShowSkip:ShowSkip});
  }

  loadPictures(){
   ImagePicker.openCamera({
     multiple: false,
     width: width/1.5,
     height: height/1.5,
     forceJpg:true,
     compressImageMaxWidth: 2000,
     compressImageMaxHeight: 3000,
     mediaType:'photo',
     useFrontCamera:true
   }).then(image => {

     if(image != null){
       let isVertical = false;

       if(image.height > image.width){
         isVertical = true;
       }

       var pic = {uri:image.path, url:image.path, isVertical:isVertical, width:image.width,source:image.sourceURL != null ? image.sourceURL : image.path,height:image.height,mime:image.mime, filename:image.filename};

       AsyncStorage.setItem("SelfiePicture", JSON.stringify(pic), (asyncError) => {
         if(asyncError != null){
           Alert.alert(
            'Error',
            "Hubo un error guardando la foto.",
            [
              {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            ],
            { cancelable: false }
           )
         }
         else{
           setTimeout(function(){
             this.setState({SelfieURL:pic, SelfieExists:true});
           }.bind(this),200);
         }
       });
     }
     else{
       console.log('cancelled');
     }
   }).catch(error => {
     if(error.code === "E_PERMISSION_MISSING"){
       Alert.alert(
         'La aplicación no tiene los permisos necesarios.',
         "Para accesar a la galería, la aplicación necesita el permiso.",
         [
           {text: 'Ir a permisos', onPress: () => {
          Linking.openURL('app-settings:').catch(err => {
            console.error('An error occurred', err)
          });
           }},
           {text: 'Cancelar', onPress: () => {console.log('nope')}, style: 'cancel'},
         ],
         { cancelable: false }
       )
     }
   });
}

  render() {
    let { SelfieExists, SelfieURL } = this.state;

    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:iPhoneX ? height - (headerHeight + 79) : height - (headerHeight + 50), padding:20, paddingTop:0, justifyContent:'space-around'}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <View style={{justifyContent:'center', height:height/1.65, backgroundColor:'white'}}>
        <Text style={{color:'grey',justifyContent:'center', textAlign:'center'}}>Agrega una selfie, mostrando la identificacion que agregaste en el paso anterior.</Text>
        {SelfieExists ?
          <TouchableOpacity onPress={() => this.loadPictures()} style={{marginTop:25,marginBottom:25,alignSelf:'center',height:height/2.5, width:width/1.75, borderRadius:20, borderWidth:2, borderColor:'green', borderStyle:'solid', justifyContent:'center'}}>
          <Image source={{uri:SelfieURL.uri}} onPress={() => this.loadPictures()} resizeMode="cover" style={{alignSelf:'center',height:height/2.5, width:width/1.75,borderRadius:20}} />
          </TouchableOpacity>
          :
          <TouchableOpacity onPress={() => this.loadPictures()} style={{marginTop:25,marginBottom:25,alignSelf:'center',height:height/2.5, width:width/1.75, borderRadius:20, borderWidth:2, borderColor:'green', borderStyle:'solid', justifyContent:'flex-end'}}>
            <Image source={IDPlaceholder} resizeMode="contain" style={{alignSelf:'center',height:height/2.5, width:width/1.75,borderRadius:20}} />
          </TouchableOpacity>
        }
        <Text style={{color:'grey',justifyContent:'center', textAlign:'center'}}>Una vez verifiquemos tu identidad, la foto de tu identificacion sera borrada de nuestros servidores.</Text>

        </View>
        <ButtonAlt disabled={!SelfieExists} onPress={() => this.verifyNext()} title='Siguiente' titleStyle={{fontWeight:'bold'}} buttonStyle={{width:200,backgroundColor:SelfieExists ? '#7CB185' : 'gray', borderRadius:25,alignSelf:'center'}} containerStyle={{alignSelf:'center' , justifyContent:'center'}}/>

      </KeyboardAvoidingView>
    );
  }
}

let SelfiePictureContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(SelfiePicture);
export default SelfiePictureContainer;
