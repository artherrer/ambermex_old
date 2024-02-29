/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { View, AsyncStorage, TextInput, ActivityIndicator, Text, ProgressViewIOS, TouchableOpacity, WebView, ScrollView, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Dimensions, Button, Linking, Alert, Image } from 'react-native';
import { Avatar, Input, Button as ButtonAlt, Icon } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'

import PhoneInput from 'react-native-phone-input';

const placeholder = require('../../../assets/image/profile_pholder.png');
import { connect } from 'react-redux';
const cloneDeep = require('lodash/cloneDeep');

var { height, width } = Dimensions.get('window');
import Upload from 'react-native-background-upload'
import RNFetchBlob from 'rn-fetch-blob'
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
import * as Progress from 'react-native-progress';

class UploadVerificationPics extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Confirmar"
  });

  constructor(props) {
    super(props);

    let IneURL = props.navigation.state.params.IneURL;
    let SelfieURL = props.navigation.state.params.SelfieURL;
    let ShowSkip = props.navigation.state.params.ShowSkip;

    this.state = {
      IneURL:IneURL,
      SelfieURL:SelfieURL,
      loadingUpload:false,
      progress:0.0,
      ShowSkip:ShowSkip
    }
  }

  componentDidMount(){

  }

  noUploadDialog(){
    Alert.alert(
     'Atención',
     "La subida de archivos de verificación esta desactivada.",
     [
       {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
     ],
     { cancelable: false }
    )
  }

  async uploadPictureAzure(){
    let { IneURL, SelfieURL, progress } = this.state;

    this.setState({loadingUpload:true});

    let Filename;

    if(IneURL.filename == null || IneURL.filename == undefined){
      let FileInfo = IneURL.uri.split("/");
      Filename = FileInfo[FileInfo.length - 1];
    }
    else{
      Filename = IneURL.filename;
    }

    if(IneURL.mime == undefined){
      IneURL.mime = 'image/jpeg';
    }

    if(IneURL.uri.startsWith("file://")){
      IneURL.uri = IneURL.uri.split("file://")[1];
    }

    let urlUpload = "https://alertamxstorage1.blob.core.windows.net/verificationimages/" + Filename;
    let sasToken = "";

    let uploadString = urlUpload + sasToken;

    try{
      await RNFetchBlob.fetch('PUT', uploadString, {
      'x-ms-blob-type': 'BlockBlob',
      'content-type': 'application/octet-stream',
      'x-ms-blob-content-type': IneURL.mime,
      }, RNFetchBlob.wrap(IneURL.uri))
      .uploadProgress((written, total) => {
        this.setState({progress:(written/total)/2});
        console.log('uploaded', written / total)
      })
      .then((res) => {
        this.setState({progress:.5, INEUploadURL: urlUpload});
        this.uploadSelfieAzure();
      })
      .catch((err) => {
        // error handling ..
        this.setState({loadingUpload:false});
        Alert.alert(
         'Error',
         "Hubo un error al subir tu información. Intenta de nuevo.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
        console.log(err);
      })
    }
    catch(err){
      this.setState({loadingUpload:false});
      Alert.alert(
       'Error',
       "Hubo un error al subir tu información. Intenta de nuevo.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
      console.log(err);
    }
  }

  async uploadSelfieAzure(){
    let { SelfieURL, progress } = this.state;

    let Filename;

    if(SelfieURL.filename == null || SelfieURL.filename == undefined){
      let FileInfo = SelfieURL.uri.split("/");
      Filename = FileInfo[FileInfo.length - 1];
    }
    else{
      Filename = SelfieURL.filename;
    }

    if(SelfieURL.mime == undefined){
      SelfieURL.mime = 'image/jpeg';
    }

    let urlUpload = "https://alertamxstorage1.blob.core.windows.net/verificationimages/" + Filename;
    let sasToken = "";

    let uploadString = urlUpload + sasToken;

    try{
      await RNFetchBlob.fetch('PUT', uploadString, {
      'x-ms-blob-type': 'BlockBlob',
      'content-type': 'application/octet-stream',
      'x-ms-blob-content-type': SelfieURL.mime,
      }, RNFetchBlob.wrap(SelfieURL.uri))
      .uploadProgress((written, total) => {
        this.setState({progress:.5 + (written/total)/2});
      })
      .then((res) => {
        this.setState({progress:1, SelfieUploadURL: urlUpload});
        this.sendData();
      })
      .catch((err) => {
        // error handling ..
        this.setState({loadingUpload:false});
        Alert.alert(
         'Error',
         "Hubo un error al subir tu información. Intenta de nuevo.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
        console.log(err);
      })
    }
    catch(err){
      this.setState({loadingUpload:false});
      Alert.alert(
       'Error',
       "Hubo un error al subir tu información. Intenta de nuevo.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
      console.log(err);
    }
  }

  sendData(){
    let { INEUploadURL, SelfieUploadURL, ShowSkip } = this.state;

    if(INEUploadURL != undefined && SelfieUploadURL != undefined){
      let verifyModel = {
        ImgIdentification: INEUploadURL,
        ImgSelfie: SelfieUploadURL
      };

      EndpointRequests.UploadVerificationImages(verifyModel, function(response){
        if(response.message === "Ok"){
          Alert.alert(
           'Tus fotos se han mandado correctamente.',
           "Verificaremos tu información y se te enviara un email en los siguientes dias.",
           [
             {text: 'Ok', onPress: () => this.nextScreen()}
           ],
           { cancelable: false }
         )
          this.setState({loadingUpload:false});
        }
        else{
          Alert.alert(
           'Error',
           "Hubo un error al subir tu información. Intenta de nuevo.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
          this.setState({loadingUpload:false});
        }
      }.bind(this));
    }
  }

  nextScreen(){
    let { ShowSkip } = this.state;

    let userData = cloneDeep(this.props.userState.UserData);
    userData.verifiedIdentity = 1;

    this.props.dispatch({type:"SET_USERDATA", UserData:userData});

    if(ShowSkip){
      AsyncStorage.setItem("Status", "pendingverification", (asyncError) => {
        this.props.clientState.LoginXMPP(this.props.userState.Username, this.props.userState.Password, this.props.userState.Resource);
        this.props.clientState.ConfigurePush(this.props.userState.Username);
      });
    }
    else{
      AsyncStorage.setItem("Status", "pendingverification", (asyncError) => {
        this.props.navigation.pop(4);
      });
    }
  }

  render() {
    let { IneURL, SelfieURL, loadingUpload } = this.state;

    return (
      <ScrollView style={{flex:1,height:height, width:width, backgroundColor:'white'}}>
      {loadingUpload ?
        <Progress.Bar progress={this.state.progress} width={width - 40} />
        :
        <View style={{height:10}} />
      }
        <View style={{padding:20, height:iPhoneX ? height - (headerHeight + 84) : height - (headerHeight + 55), justifyContent:'space-around'}}>
          <Text style={{marginBottom:10,color:'grey', textAlign:'center'}}>Confirma que las fotos sean clara; Presiona el botón para subirlas y seguir el proceso de verificación.</Text>
          <Text style={{fontWeight:'bold',textAlign:'center', color:'#2AA9E0'}}>Credencial / Selfie</Text>
          <Image source={{uri:SelfieURL != undefined ? SelfieURL.uri : null}} style={{marginTop:10,margin:20,backgroundColor:'#B3B3B3',alignSelf:'center',height:((width/3)-20) * 1.75, width:(width/3), borderRadius:10}} resizeMode="cover" />
          <Image source={{uri:IneURL != undefined ? IneURL.uri : null}} style={{marginTop:0,margin:20,backgroundColor:'#B3B3B3',alignSelf:'center',width:width/2, height:((width/2))/1.75, borderRadius:10}} resizeMode="cover" />
        <Text style={{marginTop:0, margin:20,color:'grey', textAlign:'center'}}>Una vez verifiquemos tu identidad, la foto de tu identificación sera borrada de nuestros servidores.</Text>
        <ButtonAlt loading={loadingUpload} disabled={loadingUpload} onPress={() => this.noUploadDialog()} title='Verificar' titleStyle={{fontWeight:'bold'}} buttonStyle={{width:200,backgroundColor:'#7CB185', borderRadius:25,alignSelf:'center'}} containerStyle={{alignSelf:'center' , justifyContent:'center'}}/>
        </View>
      </ScrollView>
    );
  }
}

let UploadVerificationPicsContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(UploadVerificationPics);
export default UploadVerificationPicsContainer;
