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
import { RNCamera } from 'react-native-camera';
var headerHeight = iPhoneX ? 91 : 64;

class IDPicture extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Verificación"
  });

  constructor(props) {
    super(props);

    let ShowSkip = props.navigation.state.params != undefined && props.navigation.state.params.ShowSkip;

    this.state = {
      IneExists:false,
      IneURL:null,
      ShowSkip:ShowSkip
    }
  }

  componentDidMount(){
    AsyncStorage.getItem("IdPicture").then((value) => {
      if(value != undefined){
        value = JSON.parse(value);
        this.setState({IneURL: value, IneExists:true});
      }
    })
  }

  verifyNext(){
    let { IneURL, ShowSkip } = this.state;

    this.props.navigation.navigate(ShowSkip ? "VerifyUser3" : "SettingsVerifyUser3", {IneURL:IneURL, ShowSkip:ShowSkip});
  }

  async takePicture(){
    if(this.camera){
      const options = { quality: 0.7, base64: true, forceUpOrientation:true };
      const image = await this.camera.takePictureAsync(options);

      if(image != null){
        let isVertical = false;

        if(image.height > image.width){
          isVertical = true;
        }

        var pic = {uri:image.uri, url:image.uri, isVertical:isVertical, width:image.width,source:image.sourceURL != null ? image.sourceURL : image.uri,height:image.height,mime:image.mime, filename:image.filename};

        AsyncStorage.setItem("IdPicture", JSON.stringify(pic), (asyncError) => {
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
              this.setState({IneURL:pic, IneExists:true});
            }.bind(this),200);
          }
        });
      }
    }
  }


  render() {
    let { IneExists, IneURL } = this.state;

    return (
      <ScrollView style={{width:width, flex:1, backgroundColor:'white'}}>
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:height - (headerHeight + 50),  paddingTop:0, justifyContent:'center'}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <View style={{alignItems:'center',justifyContent:'center', height:height/2.2, width:width, backgroundColor:'white'}}>

        {IneExists ?
          <TouchableOpacity onPress={() => this.setState({IneURL:null, IneExists:false})} style={{overflow: 'hidden',alignSelf:'center',height:height/2.8, width:iPhoneX ? width-40 : width/1.3, borderRadius:25, borderWidth:2, borderColor:'green', justifyContent:'center'}}>
          <Image source={{uri:IneURL.uri}} resizeMode="cover" onPress={() => this.setState({IneURL:null, IneExists:false})} style={{alignSelf:'center',height:height/2.8, width:iPhoneX ? width-40 : width/1.3,borderRadius:20}} />
          </TouchableOpacity>
          :
          <RNCamera ref={ref => {
            this.camera = ref;
          }} type={RNCamera.Constants.Type.back}
          style={{flexDirection: 'row', overflow: 'hidden', alignItems: 'center',justifyContent:'center',borderWidth:2,borderColor:'green',borderRadius:25,height:height/2.8, width:iPhoneX ? width-40 : width/1.3}}>
            <View style={{alignSelf:'center',height:height/5, width:iPhoneX ? width-110 : width/1.5, borderRadius:20, borderStyle:'solid', justifyContent:'center', backgroundColor:'rgba(179,179,179,0.3)'}}>
              <Icon type="ionicon" size={85} color="rgba(50,205,50,.3)" name="ios-add" style={{color:'white', textAlign:'center'}} />
            </View>
          </RNCamera>
        }
        </View>
        <TouchableOpacity onPress={() => this.takePicture()} style={{marginBottom:20,alignSelf:'center',height:80,width:80, borderRadius:50, backgroundColor: '#7CB185', justifyContent:'center'}}>
          <View style={{height:70,width:70, backgroundColor:'#7CB185', borderWidth:5, borderColor:'white', borderRadius:35, alignSelf:'center'}}>
          </View>
        </TouchableOpacity>
        <Text style={{marginBottom:30,color:'grey',justifyContent:'center', textAlign:'center', paddingLeft:10, paddingRight:10}}>Una vez verifiquemos tu identidad, la foto de tu identificacion sera borrada de nuestros servidores.</Text>
        <ButtonAlt disabled={!IneExists} onPress={() => this.verifyNext()} title='Siguiente' titleStyle={{fontWeight:'bold'}} buttonStyle={{width:200,backgroundColor:IneExists ? '#7CB185' : 'gray', borderRadius:25,alignSelf:'center'}} containerStyle={{alignSelf:'center' , justifyContent:'center'}}/>
      </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

let IDPictureContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(IDPicture);
export default IDPictureContainer;
