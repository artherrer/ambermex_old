import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Alert, Modal, PixelRatio, Keyboard, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback,KeyboardAvoidingView, StatusBar, ActionSheetIOS } from 'react-native'
import { Icon,Slider, Button as ButtonAlt, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack'
import Ionicon from 'react-native-vector-icons/Ionicons'
import Upload from 'react-native-background-upload'
import { APP_INFO, PROVIDERS } from '../../util/constants';
import ActionSheet from 'react-native-actionsheet'

const textAMBER = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
const FEMINISTA = require('../../../assets/image/ALERTA_FEMINISTA.png');
const MEDICA = require('../../../assets/image/ALERTA_MEDICA.png');
const SEGURIDAD = require('../../../assets/image/ALERTA.png');
const VECINAL = require('../../../assets/image/ALERTA_VECINAL.png');
const BOTON_AMBERMEX = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
const ICON_MEDICO = require('../../../assets/image/ICON_MEDICO.png');
const ICON_PERSONAL = require('../../../assets/image/ICON_PERSONAL.png');
const ICON_SOSPECHA = require('../../../assets/image/ICON_SOSPECHA.png');
const ICON_VECINAL = require('../../../assets/image/ICON_VECINAL.png');
const ICON_FEMINISTA = require('../../../assets/image/ICON_FEMINISTA.png');
const SAFEGUARD = require('../../../assets/image/SAFEGUARD.png');
const KEYBOARD_VERTICAL_OFFSET = iPhoneX ? (headerHeight == 64 ? 88 + StatusBar.currentHeight : headerHeight + StatusBar.currentHeight) : headerHeight + StatusBar.currentHeight;
import ImagePicker from 'react-native-image-crop-picker';

import ErrorMedical from './convos/error_medical'

var { height, width } = Dimensions.get('window');
height = StatusBar.currentHeight > 24 ? height : height - StatusBar.currentHeight;
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class PublicAlertModal extends Component{
  constructor(props) {
    super(props)
    let alertType = props.alertType != undefined ? props.alertType : "Emergency";
    let officialChannel = props.officialChannel != undefined ? props.officialChannel : false;
    this.state = {
      alertType:alertType,
      fromOfficialChannel:officialChannel,
      triggerAlertModal:true,
      alertMessage:"Alerta Activada",
      sliderValue:0,
      errorMedical:false,
      reportImage:null,
      reportText:null,
      completeReport:false,
      uploading:false
    }
  }

  reportAfterAlert(){
    this.setState({triggerAlertModal:false,alertType:"", uploading:false, loading:false, sliderValue:0});
    this.props.closeModal();
  }

  checkComplete(){
    let { sliderValue } = this.state;
    let { alertType } = this.props;
    if(sliderValue === 100){
      if(alertType === "Emergency"){
        this.setState({alertType:"Emergency", uploading:true, alertMessage:"Alerta Activada", triggerAlertModal:true});
        setTimeout(function(){
          this.props.startAlert({alertType:"Emergency", alertMessage:"Alerta Activada"});
        }.bind(this),200);
      }
      else if(alertType === "Feminist"){
        this.setState({alertType:"Feminist", uploading:true, alertMessage:"Alerta Mujeres Activada", triggerAlertModal:true});
        setTimeout(function(){
          this.props.startAlert({alertType:"Feminist", alertMessage:"Alerta Mujeres Activada"});
        }.bind(this),200);
      }
      else{
        this.setState({alertType:"Medical", uploading:true, alertMessage:"Alerta Médica Activada", triggerAlertModal:true});
        setTimeout(function(){
          this.props.startAlert({alertType:"Medical", alertMessage:"Alerta Médica Activada"});
        }.bind(this),200);
      }
    }
    else{
      this.setState({sliderValue:0});
    }
  }

  uploadReport(){
    let { reportText, reportImage } = this.state;
    this.setState({alertType:"Suspicious", uploading:true, triggerAlertModal:true});
    let url = APP_INFO.UPLOAD_URL + "/image/upload";
    let fileType = "image";
    let preset = APP_INFO.PICTURE_PRESET;
    let fileName;

    let pathUrl = reportImage.uri.replace('file://', '');

    const options = {
      url: url,
      path: pathUrl,
      method: 'POST',
      field: "file",
      type: 'multipart',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      parameters: {
        upload_preset: preset,
        public_id:fileName
      },
      notification: {
        enabled: true
      }
    };

    Upload.startUpload(options).then((uploadId) => {
      Upload.addListener('progress', uploadId, (data) => {
        this.setState({progressUpload:data.progress/100, uploadingThumb:false});
      })
      Upload.addListener('error', uploadId, (data) => {
        if(data.error != undefined){
          Alert.alert(
           'Error',
           data.error,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        else{
          Alert.alert(
           'Error',
           "Hubo un error al subir el contenido. Intentalo más tarde",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }

        setTimeout(function(){
          this.setState({uploading:false, progressUpload:0, uploadingThumb:true});
        }.bind(this),200);
      })
      Upload.addListener('cancelled', uploadId, (data) => {
        setTimeout(function(){
          this.setState({uploading:false, progressUpload:0, uploadingThumb:true});
        }.bind(this),200);
      })
      Upload.addListener('completed', uploadId, (data) => {
        let response = JSON.parse(data.responseBody);

        if(response.secure_url != null){
          this.setState({fileUploadModal:false});

          setTimeout(function(){
            this.setState({reportImageUrl:response.secure_url, progressUpload:0});
            this.props.startAlert({alertType:"Suspicious", alertMessage:reportText, alertImage:response.secure_url});
          }.bind(this),250);
        }
        else{
          if(response.error != undefined){
            Alert.alert(
             'Error',
             data.error,
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }
          else{
            Alert.alert(
             'Error',
             "Hubo un error al subir el contenido. Intentalo más tarde",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }

          setTimeout(function(){
            this.setState({uploading:false, videoThumbnail:null, uploadingThumb:true, progressUpload:0});
          }.bind(this),200);
        }
      })
    }).catch((err) => {
      Alert.alert(
       'Error',
       "Hubo un error al subir el contenido. Intentalo más tarde",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
      setTimeout(function(){
        this.setState({uploading:false, progressUpload:0, uploadingThumb:true});
      }.bind(this),200);
    });
  }

  pressMedical(medicalCoverage){
    if(medicalCoverage){
      this.setState({alertType:"Medical", alertMessage:"Alerta Activada", triggerAlertModal:true});
    }
    else{
      this.setState({errorMedical:true});
    }
  }

  createReport(text){
    let { reportImage } = this.state;
    if(text != undefined && reportImage != undefined && text.length > 5){
       this.setState({reportText:text, completeReport:true});
    }
    else{
      this.setState({reportText:text, completeReport:false});
    }
  }

  fileUploadOptions(){
    if(Platform.OS === 'android'){
      this.ActionSheet.show();
      return false;
    }
    ActionSheetIOS.showActionSheetWithOptions({
     title:"Opciones de Contenido",
        options: ['Cancelar', 'Elegir foto de galería', 'Tomar foto'],
        cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex === 1) {
        this.loadPictures();
      }
     else if(buttonIndex === 2){
       this.takePicture();
     }
    });
  }

  loadPictures(){
     ImagePicker.openPicker({
       multiple: false,
       width: width/1.5,
       height: height/1.5,
       forceJpg:true,
       compressImageMaxWidth: 2000,
       compressImageMaxHeight: 3000,
       mediaType:'photo',
     }).then(image => {

       if(image != null){
         let isVertical = false;

         if(image.height > image.width){
           isVertical = true;
         }

         var pic = {uri:image.path, url:image.path, isVertical:isVertical, width:image.width,source:image.sourceURL != null ? image.sourceURL : image.path,height:image.height,mime:image.mime, filename:image.filename};

         setTimeout(function(){
           this.setState({reportImage:pic, padHeight:0, completeReport: this.state.reportText != undefined && this.state.reportText.length > 5 ? true : false});
         }.bind(this),200);
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

 takePicture(){
   let { modalAlertHeight } = this.state;

   ImagePicker.openCamera({
     width: width/1.5,
     height: height/1.5,
     forceJpg:true,
     compressImageMaxWidth: 2000,
     compressImageMaxHeight: 3000,
     includeExif: true,
    compressImageQuality:0.8,
   }).then(image => {
    if(image != null){
      let filename = null;

      if(image.filename == null || image.filename == ""){
        filename = image.path.substring(image.path.lastIndexOf('/')+1);
      }
      else{
        filename = image.filename;
      }

      let isVertical = false;

      if(image.height > image.width){
        isVertical = true;
      }

      var pic = {uri:image.path, url:image.path, isVertical:isVertical,width:image.width,source:image.path,height:image.height,mime:image.mime, filename:filename};

      setTimeout(function(){
        this.setState({reportImage:pic, fileUploadModal:true, completeReport: this.state.reportText != undefined && this.state.reportText.length > 5 ? true : false });
      }.bind(this),200);
    }
    else{
      console.log('cancelled');
    }
   }).catch(error => {
     if(error.code === "E_PICKER_NO_CAMERA_PERMISSION"){
       Alert.alert(
         'La aplicación no tiene los permisos necesarios.',
         "Para accesar a la cámara, la aplicación necesita el permiso.",
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

 getAddressString(){
   if(this.props.UserData != undefined && this.props.UserData.primaryAddress != undefined){
     let address1 = this.props.UserData.primaryAddress.address1;
     let address2 = this.props.UserData.primaryAddress.address2;
     let cp = this.props.UserData.primaryAddress.postalCode;
     let city = this.props.UserData.primaryAddress.city;
     let entity = this.props.UserData.primaryAddress.entity;

     return address1 + " " + address2 + ", " + entity  + " C.P " + cp + ", " + city;
   }

   return "";
 }

 getProviderInfo(alertType, fromOfficialChannel){
   if(false && this.props.UserData.membershipProducts != undefined && this.props.UserData.membershipProducts.find(o => o.type === 4)){
     let providerInformation = this.props.UserData.membershipProducts.find(o => o.type === 4);
     return <View>
            <Text allowFontScaling={false} style={{textAlign:'center', fontSize:this.getFontSize(iPhoneX ? 14 : 12),marginBottom:iPhoneX ? 7:5, color:"#848484"}}>MONITOREADO POR</Text>
            <Image source={{uri:providerInformation.providerLogo}} style={{height:(width/2.25)/2, width:(width/2)/2, alignSelf:'center'}} resizeMode="contain" />
            </View>
   }
   else{
     if(alertType === "Emergency" && fromOfficialChannel){
       return <Image source={ICON_VECINAL} style={{height:(width/2.5)/2, width:(width/2.5)/2, alignSelf:'center',}} resizeMode="contain" />
     }
     else if(alertType === "Suspicious"){
       return <Image source={ICON_SOSPECHA} style={{height:(width/3.25)/2, width:(width/2)/2, alignSelf:'center',}} resizeMode="contain" />
     }
     else if(alertType === "Medical"){
       return <Image source={ICON_MEDICO} style={{height:(width/3.25)/2, width:(width/2.25)/2, alignSelf:'center',}} resizeMode="contain" />
     }
     else if(alertType === "Feminist"){
       return <Image source={ICON_FEMINISTA} style={{height:(width/2.25)/2, width:(width/2)/2, alignSelf:'center'}} resizeMode="contain" />
     }
     else{
       return <Image source={ICON_PERSONAL} style={{height:(width/2.5)/2, width:(width/2.5)/2, alignSelf:'center',}} resizeMode="contain" />
     }
   }
   /*
   return <View>
          <Text allowFontScaling={false} style={{textAlign:'center', fontSize:this.getFontSize(iPhoneX ? 14 : 12),marginBottom:iPhoneX ? 7:5, color:"#848484"}}>MONITOREADO POR</Text>
          <Image source={SAFEGUARD} style={{height:(width/2.25)/2, width:(width/2)/2, alignSelf:'center'}} resizeMode="contain" />
          </View>
   */
  }

  getFontSize(originalSize){
        if(PixelRatio.get() < 1.5) {
            return (originalSize * 0.5 ) / PixelRatio.get()
        }else if(PixelRatio.get() >= 1.5 && PixelRatio.get() < 2.5) {
            return (originalSize * 1.5 ) / PixelRatio.get()
        }else if(PixelRatio.get() >= 2.5){
            return (originalSize * 2.5 ) / PixelRatio.get()
        }else{
            return originalSize
        }
    }

  getMainComponent(alertType, fromOfficialChannel){
    if(alertType === "Emergency" && fromOfficialChannel){
      return <View style={{height:(height - headerHeight),alignItems:'center',justifyContent:'center',paddingTop:10,paddingBottom:10}}>
                <View style={{height:(((height - headerHeight)/5)*1.5), justifyContent:'flex-end'}}>
                {this.getProviderInfo(alertType, fromOfficialChannel)}
                <Text allowFontScaling={false} style={{color:'#7d9d78', marginBottom:0,fontWeight:'700',fontSize:this.getFontSize(35),marginTop:10, letterSpacing:-.5, textAlign:'center', alignSelf:'center'}}>ALERTA VECINAL</Text>
                </View>
                <View style={{height:(((height - headerHeight)/5)*1.5), width:width, justifyContent:'center'}}>
                <View testID='LocationAlert' disabled={this.props.uploading || this.props.loadLocation} style={{marginTop:30,height:(width/3.25), backgroundColor:'transparent', borderRadius:(width/3.25)/2, width:width/3.25, borderWidth:0, borderColor:'white', alignSelf:'center', justifyContent:'center'}}
                onPress={() => {
                  this.setState({alertType:"Emergency", alertMessage:"Alerta Activada", triggerAlertModal:true});
                }}>
                <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:"transparent", alignSelf:'center', justifyContent:'center', borderWidth:0, borderColor:'white'}}>
                {this.props.loading ?
                  <ActivityIndicator size="large" color="#7d9d78" style={{alignSelf:'center'}}/>
                  :
                  <Image source={VECINAL} style={{height:(width/3), width:(width/3), alignSelf:'center', top:-7}} resizeMode="contain" />
                }
                </View>
                </View>
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'center'}}>
                {this.props.loading ?
                  <Text allowFontScaling={false} style={{alignSelf:'center',color:'#858585',fontSize:this.getFontSize(25),width:width/2, letterSpacing:-.5, textAlign:'center'}}>Procesando alerta</Text>
                  :
                  <View style={{width:'90%', alignItems:'center', justifyContent:'center', alignSelf:'center'}}>
                  <Text allowFontScaling={false} style={{textAlign:'center',fontSize:this.getFontSize(20), alignSelf:'center'}}>Solicitando apoyo para:</Text>
                  <Text allowFontScaling={false} numberOfLines={2} style={{marginTop:5,textAlign:'center', fontSize:this.getFontSize(17), fontWeight:'700'}}>{this.getAddressString()}</Text>
                  </View>
                }
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'flex-start'}}>
                <View style={{height:50, justifyContent:'center'}}>
                <Text allowFontScaling={false} style={{color:'white',fontSize:this.getFontSize(17), fontWeight:'700',textAlign:'center',position:'absolute',alignSelf:'center', zIndex:100}}>    DESLIZA PARA CONFIRMAR</Text>
                <Slider style={{alignSelf:'center',backgroundColor:'#7d9d78',borderStyle: 'solid', borderWidth: 3, borderColor: '#7d9d78',width: width*.75, height:50, borderRadius: 25}}
                        minimumValue={0}
                        value={this.state.sliderValue}
                        step={1}
                        disabled={this.props.loading}
                        onSlidingComplete={() => this.checkComplete()}
                        maximumValue={100}
                        onValueChange={(value) => this.setState({sliderValue:value})}
                        thumbTintColor={'white'}
                        thumbTouchSize={{width: 125, height: 125}}
                        thumbStyle={{width: 40, height: 40, borderRadius: 50}}
                        trackStyle={{height:0,width:0}}
                        />
                </View>
              </View>
            </View>
    }
    else if(alertType === "Feminist"){
      return  <View style={{height:(height - headerHeight),alignItems:'center',justifyContent:'center',paddingTop:10,paddingBottom:10}}>
                <View style={{height:(((height - headerHeight)/5)*1.5), justifyContent:'flex-end'}}>
                {this.getProviderInfo(alertType, fromOfficialChannel)}
                <Text allowFontScaling={false} style={{color:'#635592', width:width/1.25,marginBottom:0,fontWeight:'700',fontSize:this.getFontSize(40),marginTop:10, letterSpacing:-.5, textAlign:'center'}}>ALERTA MUJERES</Text>
                </View>
                <View style={{height:(((height - headerHeight)/5)*1.5), width:width, justifyContent:'center'}}>
                <View testID='LocationAlert' disabled={this.props.uploading || this.props.loadLocation} style={{height:(width/3.25), backgroundColor:'transparent', borderRadius:(width/3.25)/2, width:width/3.25, borderWidth:0, alignSelf:'center',justifyContent:'center'}}
                onPress={() => {
                  this.setState({alertType:"Feminist", alertMessage:"Alerta Mujeres Activada", triggerAlertModal:true});
                }}>
                <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:'transparent', alignSelf:'center', justifyContent:'center', borderWidth:0, borderColor:'white'}}>
                {this.props.loading ?
                  <ActivityIndicator size="large" color="#635592" style={{alignSelf:'center'}}/>
                  :
                  <Image source={FEMINISTA} style={{height:(width/3), width:(width/3), alignSelf:'center'}} resizeMode="contain" />
                }
                </View>
                </View>
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'center'}}>
                  <Text allowFontScaling={false} style={{alignSelf:'center',color:'#858585',fontSize:this.getFontSize(25),width:width/1.25, letterSpacing:-.5, textAlign:'center'}}>Procesando tu alerta. Se notificará únicamente a mujeres y a la central de monitoreo</Text>
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'flex-start'}}>
                <View style={{height:50, justifyContent:'center'}}>
                <Text allowFontScaling={false} style={{color:'white',fontSize:this.getFontSize(17), fontWeight:'700',textAlign:'center',position:'absolute',alignSelf:'center', zIndex:100}}>    DESLIZA PARA CONFIRMAR</Text>
                <Slider style={{backgroundColor:'#635592', alignSelf:'center',borderStyle: 'solid', borderWidth: 3, borderColor: '#D3D3D3',width: width*.75, height:50, borderRadius: 25}}
                         minimumValue={0}
                        value={this.state.sliderValue}
                        step={1}
                        disabled={this.props.loading}
                        onSlidingComplete={() => this.checkComplete()}
                        maximumValue={100}
                        onValueChange={(value) => this.setState({sliderValue:value})}
                        thumbTintColor={'white'}
                        thumbTouchSize={{width: 100, height: 100}}
                        thumbStyle={{width: 40, height: 40, borderRadius: 50}}
                        trackStyle={{height:0,width:0}}
                        />
                </View>
              </View>
            </View>
    }
    else if(alertType === "Suspicious"){
      return  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{height:(height - headerHeight), width:width,alignItems:'center',justifyContent:'center'}}>
                <View style={{height:(height - headerHeight),alignItems:'center',justifyContent:'center',paddingTop:10,paddingBottom:10}}>
                <View style={{height:(((height - headerHeight)/5)*1.25), justifyContent:'center', marginBottom:10}}>
                  {this.getProviderInfo(alertType, fromOfficialChannel)}
                  <Text allowFontScaling={false} style={{color:'#fcaf00', maxWidth:'80%', alignSelf:'center', marginBottom:0,fontWeight:'700',fontSize:this.getFontSize(iPhoneX ? 28 : 24), marginTop:10, letterSpacing:-.5, textAlign:'center'}}>ACTIVIDAD SOSPECHOSA</Text>
                </View>
                {this.props.loading || this.state.uploading ?
                  <View style={{height:(((height - headerHeight)/5)*3), width:width}}>
                    <View style={{height:'70%', width:width,justifyContent:'center'}}>
                    <ActivityIndicator size="large" color="#fcaf00" style={{alignSelf:'center'}}/>
                    </View>
                    <View style={{height:'30%', width:width,justifyContent:'center'}}>
                    <Text allowFontScaling={false} style={{alignSelf:'center',color:'#858585',fontSize:this.getFontSize(22),width:width/2, letterSpacing:-.5, textAlign:'center'}}>Procesando reporte</Text>
                    </View>
                  </View>
                  :
                  <View style={{height:(((height - headerHeight)/5)*3), width:width}}>
                    <View style={{height:'60%'}}>
                      <Text allowFontScaling={false} style={{fontSize:this.getFontSize(15), left:'10%', marginBottom:10}}>Agrega una foto*</Text>
                      <TouchableOpacity onPress={() => this.fileUploadOptions()} style={{justifyContent:'center',alignSelf:'center',width:'80%', height:'90%', borderRadius:20, backgroundColor:"#f6f6f6"}}>
                        {this.state.reportImage == undefined ?
                          <Ionicon name="ios-camera" size={50} color="gray" style={{textAlign:'center'}} />
                          :
                          <Image source={{uri:this.state.reportImage.uri}} resizeMode="contain" style={{height:'100%', width:'100%'}}/>
                        }
                      </TouchableOpacity>
                    </View>
                    <View style={{height:'37%', justifyContent:'center', marginTop:'3%'}}>
                    <Text style={{fontSize:this.getFontSize(15), left:'10%', marginBottom:10}}>Agrega una descripción*</Text>
                    <Input multiline={true} containerStyle={{textAlignVertical: 'top', height:'80%',maxHeight:'80%', backgroundColor:"#f6f6f6", width:'80%', alignSelf:'center', borderRadius:20}}
                      inputContainerStyle={{textAlignVertical: 'top', borderBottomWidth:0}}
                      maxFontSizeMultiplier={1.25} inputStyle={{textAlignVertical: 'top', height:'100%',maxHeight:'100%', padding:10, paddingTop:15, backgroundColor:"#f6f6f6", borderRadius:20}}
                      style={{textAlignVertical: 'top', fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold', borderBottomColor:'transparent'}} placeholder="Descripción"
                      autoCapitalize="none" value={this.state.reportText} onChangeText={(text) => this.createReport(text)}/>
                    </View>
                  </View>
                }
                  <View style={{flex:1,width:width,height:(height - headerHeight)/5, justifyContent:'center'}}>
                    <ButtonAlt title={"Enviar reporte"} loading={this.props.loading || this.state.uploading} disabled={!this.state.completeReport || this.props.loading || this.state.uploading} borderRadius={5} titleStyle={{fontSize:this.getFontSize(20),fontWeight:'bold', paddingLeft:20, paddingRight:20}} buttonStyle={{padding:10, width:200,backgroundColor: !this.state.completeReport || this.state.isLoading ? "red" : "#fcaf00", borderRadius:25, alignSelf:'center'}}
                      onPress={() => { this.uploadReport(); }} style={{alignSelf:'center'}}/>
                  </View>
                </View>
              </TouchableWithoutFeedback>
    }
    else if(alertType === "Medical"){
      return  <View style={{height:(height - headerHeight),alignItems:'center',justifyContent:'center',paddingTop:10,paddingBottom:10}}>
                <View style={{height:(((height - headerHeight)/5)*1.5), justifyContent:'flex-end'}}>
                {this.getProviderInfo(alertType, fromOfficialChannel)}
                <Text allowFontScaling={false} style={{color:'#0C479D', marginBottom:0,fontWeight:'700',fontSize:this.getFontSize(35),marginTop:10, letterSpacing:-.5, textAlign:'center'}}>ALERTA MÉDICA</Text>
                </View>
                <View style={{height:(((height - headerHeight)/5)*1.5), width:width, justifyContent:'center'}}>
                <View testID='LocationAlert' disabled={this.props.uploading || this.props.loadLocation} style={{height:(width/3.25), backgroundColor:'transparent', borderRadius:(width/3.25)/2, width:width/3.25, borderWidth:0, alignSelf:'center',justifyContent:'center'}}
                onPress={() => {
                  this.setState({alertType:"Medica", alertMessage:"Alerta Medica Activada", triggerAlertModal:true});
                }}>
                <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:'transparent', alignSelf:'center', justifyContent:'center', borderWidth:0, borderColor:'white'}}>
                {this.props.loading ?
                  <ActivityIndicator size="large" color="#0C479D" style={{alignSelf:'center'}}/>
                  :
                  <Image source={MEDICA} style={{height:(width/3), width:(width/3), alignSelf:'center'}} resizeMode="contain" />
                }
                </View>
                </View>
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'center'}}>
                {this.props.loading ?
                  <Text allowFontScaling={false} style={{alignSelf:'center',color:'#858585',fontSize:this.getFontSize(25),width:width/2, letterSpacing:-.5, textAlign:'center'}}>Procesando alerta</Text>
                  :
                  null
                }
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'flex-start'}}>
                <View style={{height:50, justifyContent:'center'}}>
                <Text allowFontScaling={false} style={{color:'white',fontSize:this.getFontSize(17), fontWeight:'700',textAlign:'center',position:'absolute',alignSelf:'center', zIndex:100}}>    DESLIZA PARA CONFIRMAR</Text>
                <Slider style={{backgroundColor:'#0C479D', alignSelf:'center',borderStyle: 'solid', borderWidth: 3, borderColor: '#D3D3D3',width: width*.75, height:50, borderRadius: 25}}
                         minimumValue={0}
                        value={this.state.sliderValue}
                        step={1}
                        disabled={this.props.loading}
                        onSlidingComplete={() => this.checkComplete()}
                        maximumValue={100}
                        onValueChange={(value) => this.setState({sliderValue:value})}
                        thumbTintColor={'white'}
                        thumbTouchSize={{width: 100, height: 100}}
                        thumbStyle={{width: 40, height: 40, borderRadius: 50}}
                        trackStyle={{height:0,width:0}}
                        />
                </View>
              </View>
            </View>
    }
    else{
      return <View style={{height:(height - headerHeight),alignItems:'center',justifyContent:'center',paddingTop:10,paddingBottom:10}}>
                <View style={{height:(((height - headerHeight)/5)*1.5), justifyContent:'flex-end'}}>
                {this.getProviderInfo(alertType, fromOfficialChannel)}
                <Text allowFontScaling={false} style={{color:'#e30613', marginBottom:0,fontWeight:'700',fontSize:this.getFontSize(35),marginTop:10, letterSpacing:-.5, textAlign:'center'}}>ALERTA PERSONAL</Text>
                </View>
                <View style={{height:(((height - headerHeight)/5)*1.5), width:width, justifyContent:'center'}}>
                <View testID='LocationAlert' disabled={this.props.uploading || this.props.loadLocation} style={{marginTop:30,height:(width/3.25), backgroundColor:"transparent", borderRadius:(width/3.25)/2, width:width/3.25, borderWidth:0, borderColor:'white', alignSelf:'center', justifyContent:'center'}}
                onPress={() => {
                  this.setState({alertType:"Emergency", alertMessage:"Alerta Activada", triggerAlertModal:true});
                }}>
                <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:"transparent", alignSelf:'center', justifyContent:'center', borderWidth:0, borderColor:'white'}}>
                {this.props.loading ?
                  <ActivityIndicator size="large" color="#e30613" style={{alignSelf:'center'}}/>
                  :
                  <Image source={SEGURIDAD} style={{height:(width/3), width:(width/3), alignSelf:'center', top:-7}} resizeMode="contain" />
                }
                </View>
                </View>
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'center'}}>
                {this.props.loading ?
                  <Text allowFontScaling={false} style={{alignSelf:'center',color:'#858585',fontSize:this.getFontSize(25),width:width/2, letterSpacing:-.5, textAlign:'center'}}>Procesando alerta</Text>
                  :
                  null
                }
                </View>
                <View style={{height:(((height - headerHeight)/5)), width:width, justifyContent:'flex-start'}}>
                <View style={{height:50, justifyContent:'center'}}>
                <Text allowFontScaling={false} style={{color:'white',fontSize:this.getFontSize(17), fontWeight:'700',textAlign:'center',position:'absolute',alignSelf:'center', zIndex:100}}>    DESLIZA PARA CONFIRMAR</Text>
                <Slider style={{alignSelf:'center',backgroundColor:'#e30613',borderStyle: 'solid', borderWidth: 3, borderColor: '#e30613',width: width*.75, height:50, borderRadius: 25}}
                        minimumValue={0}
                        value={this.state.sliderValue}
                        step={1}
                        disabled={this.props.loading}
                        onSlidingComplete={() => this.checkComplete()}
                        maximumValue={100}
                        onValueChange={(value) => this.setState({sliderValue:value})}
                        thumbTintColor={'white'}
                        thumbTouchSize={{width: 125, height: 125}}
                        thumbStyle={{width: 40, height: 40, borderRadius: 50}}
                        trackStyle={{height:0,width:0}}
                        />
                </View>
              </View>
            </View>
    }
  }

  render(){
    let { alertType, fromOfficialChannel } = this.state;

    let inCoverage = this.props.inCoverage;
    let medicalCoverage = inCoverage && this.props.medicalEnabled ? true : false;
    let header = headerHeight;

    return (
      <View>
      <Modal
      animationType="slide"
      transparent={false}
      backdropPressToClose={false}
      backdrop={false}
      visible={this.props.confirmAlert && !this.state.triggerAlertModal ? true : false}
      onRequestClose={() => {
        Keyboard.dismiss;
        this.props.goBack();

        this.setState({modal:false,picture:null, pictureModal:false, alertMessage:"", alertValid:true,padHeight:70, modalAlertHeight:iPhoneX ? (height - 350) : (height - 180)})
      }}>
      <ErrorMedical errorMedical={this.state.errorMedical} closeModal={() => this.setState({errorMedical:false})} />
      <View style={{
        backgroundColor: 'transparent',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex:1,flexDirection:'column',backgroundColor:'#f6f6f6'}}>
        <View style={{padding:10,alignItems:'flex-end',justifyContent:'flex-end', height:50,backgroundColor:!medicalCoverage ? 'lightgray' : '#f6f6f6'}}>
          <TouchableOpacity onPress={() => {
            Keyboard.dismiss;
            this.props.goBack();

          this.setState({modal:false,picture:null, pictureModal:false, alertMessage:"", alertValid:true,padHeight:70, modalAlertHeight:iPhoneX ? (height - 350) : (height - 180)})}
        }>
            <Text style={{fontSize:20,color:'#0C479D'}}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        <View style={{alignItems:'center', width:width, borderBottomColor:'lightgray', borderBottomWidth:4, justifyContent:'center',backgroundColor:!medicalCoverage ? 'lightgray' : '#f6f6f6',height:(height/2) - (header/2)}}>
        <Text style={{color:!medicalCoverage ? '#6a6b99' : "#0C479D",fontWeight:'bold',fontSize:25,marginBottom:20, width:width/2, letterSpacing:-.5, textAlign:'center'}}>ALERTA MÉDICA</Text>
        <TouchableOpacity testID='LocationAlert' disabled={this.state.uploading || this.props.loadLocation} style={{height:(width/2.25), backgroundColor:(this.state.loading || !medicalCoverage) ? '#6a6b99' : "#0C479D", borderRadius:(width/2.25)/2, width:width/2.25, elevation: 15, borderColor:'black', borderWidth:0, alignSelf:'center',shadowOffset: {width: 0,height: 15},shadowOpacity:.5,shadowRadius:15, justifyContent:'center'}}
        onPress={() => {
          this.pressMedical(medicalCoverage);
        }}>
        <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:(this.props.loading || !medicalCoverage) ? '#6a6b99' : "#0C479D", alignSelf:'center', justifyContent:'center', borderWidth:10, borderColor:'white'}}>
        <Image source={MEDICA} style={{height:(width/2.25)/2, width:(width/2.25)/2, alignSelf:'center', top:0}} resizeMode="contain" />
        </View>
        </TouchableOpacity>
        {this.props.medicalEnabled ?
          null
          :
          <View style={{height:50, marginTop:iPhoneX ? 25 : 15}}>
          <Text style={{textAlign:'center', color:'gray', width:width/1.25, alignSelf:'center', fontSize:iPhoneX ? 15 : 12}}>"Sin servicio médico"</Text>
          <Text style={{textAlign:'center', color:'gray', width:width/1.25, alignSelf:'center', fontSize:iPhoneX ? 15 : 12}}>Esta función se encuentra deshabilitada ya que no cuentas con servicio médico.</Text>
          </View>
        }
        </View>
        <View style={{alignItems:'center', width:width, justifyContent:'center',backgroundColor:'#f6f6f6',height:(height/2) - (header/2)}}>
        <Text style={{color:"#e30613",fontWeight:'bold',fontSize:25,marginBottom:20, width:width/2, letterSpacing:-.5, textAlign:'center'}}>ALERTA SEGURIDAD</Text>
        <TouchableOpacity testID='LocationAlert' disabled={this.state.uploading || this.props.loadLocation} style={{height:(width/2.25), backgroundColor:this.state.loading ? '#cc555c' : "#e30613", borderRadius:(width/2.25)/2, elevation: 15, width:width/2.25, borderColor:'black', borderWidth:0, alignSelf:'center',shadowOffset: {width: 0,height: 15},shadowOpacity:.5,shadowRadius:15, justifyContent:'center'}}
        onPress={() => {
          this.setState({alertType:"Emergency", alertMessage:"Alerta Activada", triggerAlertModal:true});
        }}>
        <View style={{height:'100%', width:'100%', paddingTop:2, borderRadius:100, backgroundColor:this.props.loading ? '#cc555c' : "#e30613", alignSelf:'center', justifyContent:'center', borderWidth:10, borderColor:'white'}}>
        <Image source={SEGURIDAD} style={{height:(width/2.25)/2, width:(width/2.25)/2, alignSelf:'center', top:-7}} resizeMode="contain" />
        </View>
        </TouchableOpacity>
        </View>
        </View>
          </TouchableWithoutFeedback>
          </View>
          </Modal>
          <Modal
          animationType="fade"
          transparent={true}
          onDismiss={() => this.reportAfterAlert()}
          backdropPressToClose={false}
          backdrop={false}
          visible={this.props.confirmAlert && this.state.triggerAlertModal ? true : false}
          onRequestClose={() => {
            this.setState({triggerAlertModal:false});
            this.props.closeModal();
            this.props.goBack();
          }}>
            <ScrollView style={{flex: 1, backgroundColor:'white'}}>
            <View style={{height: height, width:width, backgroundColor:'white'}}>
            <View style={{ overflow: 'hidden', paddingBottom: 5 }}>
            <View
            style={{
              flexDirection:'row',
              backgroundColor: '#fff',
              width: width,
              height: 55,
              shadowColor: '#000',
              shadowOffset: { width: 1, height: 1 },
              shadowOpacity:  0.4,
              shadowRadius: 3,
              elevation: 5,
            }}
            >
            <View style={{height:55,flex:.25, flexDirection:'column', justifyContent:'center'}}>
            <TouchableOpacity
                        onPress={() => {
                          this.setState({triggerAlertModal:false});
                          this.props.closeModal();
                          this.props.goBack();}}  style={{height:50, marginLeft:5, width:40, justifyContent:'center'}}>
                          <Ionicon name="ios-arrow-back" color={"#7D9D78"} size={28} style={{textAlign:'center'}} />
                      </TouchableOpacity>
            </View>
            <View style={{height:55, flex:.5, flexDirection:'column', justifyContent:'center'}}>
            <Image source={BOTON_AMBERMEX} resizeMode={"contain"} style={{height:40, width:width/3, alignSelf:'center'}} />
            </View>
            <View style={{flex:.25, flexDirection:'column', justifyContent:'center'}}/>
            </View>
            </View>
            <View style={{height:height - header}}>
            { this.getMainComponent(alertType, fromOfficialChannel) }
            </View>
            </View>
            </ScrollView>
            </Modal>
            <ActionSheet
              ref={o => this.ActionSheet = o}
              title={'Opciones de contenido'}
              options={['Cancelar', 'Elegir foto de Galeria', 'Tomar Foto']}
              cancelButtonIndex={0}
              onPress={(index) => {
                if(index === 0){
                  this.ActionSheet.hide();
                }
                else if (index === 1) {
                  this.loadPictures();
                }
                else if(index === 2){
                 this.takePicture();
                }
              }}
            />
            </View>
          )
        }
      }

      export default PublicAlertModal;
