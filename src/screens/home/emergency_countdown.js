import React, { Component } from 'react'
import { View, Text, StyleSheet, Alert, Platform, Image, Vibration, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, StatusBar } from 'react-native'
import { Icon,Slider, Button as ButtonAlt } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Geolocation from '@react-native-community/geolocation';
const EndpointRequests = require("../../util/requests.js");
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
//COVERAGE ICONS
const BARRA_PERSONAL = require('../../../assets/image/BARRA_PERSONAL.png');
const BARRA_VECINAL = require('../../../assets/image/BARRA_VECINAL.png');
const BARRA_MUJERES = require('../../../assets/image/BARRA_MUJERES.png');

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
let counter;
class EmergencyCountdown extends Component{
  constructor(props) {
    super(props)
    this.state = {
      countdown:true,
      countdownValue: 5,
      textSteps:0,
      alertColor:this.props.emergencyTypeSelected == 0 ? '#e30613' : (this.props.emergencyTypeSelected  == 1 ? '#fcaf00'  : (this.props.emergencyTypeSelected  == 2 ? '#7d9d78' : '#635592')),
      officialChannelId:null,
      emergencyCreatedSuccess:false,
      emergencyResponse:null,
      messageBody:null,
      messageXML:null
    }
  }

  async componentDidUpdate(prevProps) {
    if(prevProps.emergencyTypeSelected != this.props.emergencyTypeSelected){
      this.setState({alertColor:this.props.emergencyTypeSelected == 0 ? '#e30613' : (this.props.emergencyTypeSelected  == 1 ? '#fcaf00'  : (this.props.emergencyTypeSelected  == 2 ? '#7d9d78' : '#635592'))});
    }
    if(!prevProps.showCountdown && prevProps.showCountdown != this.props.showCountdown){
      counter = setInterval(function(){
        this.countdown();
      }.bind(this), 1000);
      if(Platform.OS === "ios"){
        Vibration.vibrate([0], false);
      }
      else{
        Vibration.vibrate([500,500], true);
      }
    }
    if(prevProps.officialChannelId != this.props.officialChannelId){
      this.setState({officialChannelId:this.props.officialChannelId});
    }
  }

  countdown(){
    let { countdownValue } = this.state;
    if(countdownValue == 0){
      Vibration.cancel();
      clearInterval(counter);
      this.setState({countdownValue:0, countdown:false}); //start emergency call
      this.createModel();
      counter = setInterval(function(){
        this.stepCountdown();
      }.bind(this),1000);
    }
    else{
      if(Platform.OS === "ios"){
        Vibration.vibrate([0], false);
      }
      this.setState({countdownValue: countdownValue - 1});
    }
  }

  stepCountdown(){
    let { textSteps, emergencyCreatedSuccess, emergencyResponse, messageBody, messageXML } = this.state;
    if(textSteps >= 5){
      if(emergencyCreatedSuccess){
        this.props.createEmergency({id:emergencyResponse.chatId}, messageBody, messageXML);
        clearInterval(counter);
        setTimeout(function(){
          this.setState({countdownValue:5, textSteps:0, countdown:true, emergencyResponse:null, messageBody:null, messageXML:null, emergencyCreatedSuccess:false});
        }.bind(this),500);
      }
    }
    else{
      this.setState({textSteps:textSteps + 1});
    }
  }

  cancelCountdown(){
    Vibration.cancel();
    clearInterval(counter);
    this.props.cancelCountdown();
    this.setState({countdownValue:5, textSteps:0, countdown:true});
  }

  closeModal(){
    Vibration.cancel();
    this.props.closeModal();
    setTimeout(function(){
      this.setState({countdownValue:5, textSteps:0, countdown:true});
    }.bind(this),250);
  }

  getSteps(){
    let { textSteps, alertColor } = this.state;
    let steps = [];
    if(textSteps >= 1){
      let step1 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                  <View style={{width:'20%', justifyContent:'center'}}>
                  <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                  </View>
                  <View style={{width:'80%', justifyContent:'center'}}>
                  <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Iniciando sistema</Text>
                  </View>
                  </View>;
      steps.push(step1);
    }
    if(textSteps >= 2){
      let step2 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                  <View style={{width:'20%', justifyContent:'center'}}>
                  <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                  </View>
                  <View style={{width:'80%', justifyContent:'center'}}>
                  <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Identificando usuarios</Text>
                  </View>
                  </View>;
      steps.push(step2);
    }
    if(textSteps >= 3){
      let step3;
      if(this.props.emergencyTypeSelected == 0 || this.props.emergencyTypeSelected == 2){
        step3 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <View style={{width:'20%', justifyContent:'center'}}>
                    <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                    </View>
                    <View style={{width:'80%', justifyContent:'center'}}>
                    <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Activando infraestructura</Text>
                    </View>
                    </View>;
      }
      else if(this.props.emergencyTypeSelected == 3){
        step3 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <View style={{width:'20%', justifyContent:'center'}}>
                    <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                    </View>
                    <View style={{width:'80%', justifyContent:'center'}}>
                    <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Notificando contactos de emergencia</Text>
                    </View>
                    </View>;
      }
      steps.push(step3);
    }
    if(textSteps >= 4){
      let step4;
      if(this.props.emergencyTypeSelected == 0 || this.props.emergencyTypeSelected == 2){
        step4 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <View style={{width:'20%', justifyContent:'center'}}>
                    <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                    </View>
                    <View style={{width:'80%', justifyContent:'center'}}>
                    <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Activando protocolos de emergencia</Text>
                    </View>
                    </View>;
      }
      else if(this.props.emergencyTypeSelected == 3){
        step4 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                    <View style={{width:'20%', justifyContent:'center'}}>
                    <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                    </View>
                    <View style={{width:'80%', justifyContent:'center'}}>
                    <Text style={{textAlign:'left', paddingLeft:5,color:'dimgray', fontWeight:'300'}}>Notificando a central de monitoreo</Text>
                    </View>
                    </View>;
      }
      steps.push(step4);
    }
    if(textSteps >= 5){
      let step5 = <View style={{flexDirection:'row', width:'100%', justifyContent:'center'}}>
                  <View style={{width:'20%', justifyContent:'center'}}>
                  <FeatherIcon name="check" color={alertColor} size={25} style={{textAlign:'right'}} />
                  </View>
                  <View style={{width:'80%', justifyContent:'center'}}>
                  <Text style={{textAlign:'left', paddingLeft:5, color:'dimgray', fontWeight:'300'}}>Finalizando solicitud..</Text>
                  </View>
                  </View>;
      steps.push(step5);
    }
    return steps;
  }

  createModel(){
    let { emergencyTypeSelected } = this.props;
    if(emergencyTypeSelected == 0){
      this.setState({alertType:"Emergency", alertMessage:"Alerta Activada"});
      setTimeout(function(){
        this.createPublicAlarm({alertType:"Emergency", alertMessage:"Alerta Activada"});
      }.bind(this),200);
    }
    else if(emergencyTypeSelected == 2){
      this.setState({alertType:"Emergency", alertMessage:"Alerta Activada"});
      setTimeout(function(){
        this.createPublicAlarm({alertType:"Emergency", alertMessage:"Alerta Activada"});
      }.bind(this),200);
    }
    else if(emergencyTypeSelected == 3){
      this.setState({alertType:"Feminist", alertMessage:"Alerta Mujeres Activada"});
      setTimeout(function(){
        this.createPublicAlarm({alertType:"Feminist", alertMessage:"Alerta Mujeres Activada"});
      }.bind(this),200);
    }
    else{
      console.log("error");
    }
  }

  sendAlertMessage(model, chatId, xmppMessage, cb){
    let { alertImage } = this.state;

    let time = new Date().toISOString();
    let currentNickname = chatId + "/" + this.props.userState.Nickname;
    let messageBody = {
      id: id(),
      chat_id: chatId,
      timestamp: time,
      text: xmppMessage,
      time: new Date(time).getTime(),
      message_by: currentNickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isAlert:true,
      alertStart:true,
      isImage:alertImage != undefined,
      isMedia:alertImage != undefined,
      isVideo:false,
      isFile:false,
      url:alertImage,
      fileName:"image",
    };

    let message = "";
    if(model.Type == 0){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 1){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 2){
      if(model.ExternalChannelId != undefined)
      {
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 3){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName), xml("officialChannel",{}, "true"), xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName), xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 4){
      if(model.ExternalChannelId != undefined){
        message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("officialChannel",{}, "true"),  xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
        message = xml("message", {to: chatId, id:messageBody.id, from: currentNickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }

    cb(messageBody, message);
  }

  getChannelType(alertType, fromChannel){
    if(fromChannel){
      if(alertType === "Emergency"){
        return 1;
      }
      else if(alertType === "Fire"){
        return 2;
      }
      else if(alertType === "Suspicious"){
        return 7;
      }
      else if(alertType == "Feminist"){
        return 8;
      }
    }
    else{
      if(alertType === "Emergency"){
        return 3;
      }
      else if(alertType === "Medical"){
        return 4;
      }
      else if(alertType === "Suspicious"){
        return 6;
      }
      else if(alertType == "Feminist"){
        return 8;
      }
    }
  }

  createPublicAlarm(modelAlert){
    let { officialChannelId } = this.state;
    this.setState({loadingAlert:true, alertImage:modelAlert.alertImage, reportText:modelAlert.alertMessage});
    let UserAlias = this.props.userState.UserData.alias;
    Geolocation.getCurrentPosition((get_success) => {
          let addressString = "Coordenadas";
          let coordinatesString = "(" + get_success.coords.latitude + ", " + get_success.coords.longitude + ")";

          let model = {
            Location:null,
            Message: modelAlert.alertMessage != undefined ? modelAlert.alertMessage : "",
            Type: modelAlert.alertType === "Emergency" ? 0 : (modelAlert.alertType === "Medical" ? 1 : (modelAlert.alertType === "Fire" ? 2 : (modelAlert.alertType === "Suspicious" ? 3 : 4))),
            ChannelType: this.getChannelType(modelAlert.alertType , officialChannelId != undefined),
            ExternalChannelId:officialChannelId != undefined ? officialChannelId : null
          };

          let messageAlert = modelAlert.alertMessage != undefined ? modelAlert.alertMessage : "";
          let locationModel;
          if(this.props.userState.AreaCode != undefined && this.props.userState.CurrentPoint.length > 0){
             locationModel = {
               Latitude: get_success.coords.latitude,
               Longitude: get_success.coords.longitude,
               Neighborhood: this.props.userState.AreaCode,
               BeaconId:this.props.userState.CurrentPoint[0].id
             }
          }
          else if(this.props.userState.AreaCode != undefined && this.props.userState.CurrentPoint.length == 0){
            locationModel = {
              Latitude: get_success.coords.latitude,
              Longitude: get_success.coords.longitude,
              Neighborhood: this.props.userState.AreaCode,
              BeaconId:null
            }
          }
          else{
            locationModel = {
              Latitude: get_success.coords.latitude,
              Longitude: get_success.coords.longitude,
              Neighborhood: null,
              BeaconId:null
            }
          }

          model.Location = locationModel;
          model.Message = messageAlert;
          model.ImageUrl = modelAlert.alertImage;
          model.Address = addressString;
          EndpointRequests.CreateGlobalAlarm(model, (response) => {
            if(response.chatId != undefined){
              this.props.clientState.LoadChatList(false, (finished) => {
                setTimeout(async function(){
                  this.sendAlertMessage(model,response.chatId, response.xmppMessage, function(messageBody, messageXML){
                    //close countdown modal
                    this.setState({emergencyResponse:response, messageBody:messageBody, messageXML:messageXML, emergencyCreatedSuccess:true});
                    this.props.dispatch({type:'SET_ADDITIONAL_PROPS', Chat:response.chatId, Props: response.result, User:this.props.userState.UserData, Type:modelAlert.alertType});
                  }.bind(this));
                }.bind(this),1000);
              });
            }
            else{
              Alert.alert(
               'Error',
               "Hubo un error al crear el grupo de alerta.",
               [
                 {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
               ],
               { cancelable: false }
              )

              this.setState({loadingAlert:false,activeAlert:false});
            }
          })
    }, (geo_error) => {
        if(geo_error.code === 1){
          this.setState({loadingAlert:false});
          Alert.alert(
           'La aplicación no cuenta con los permisos adecuados.',
           "Para compartir tu ubicación, necesitas habilitar permisos de ubicación.",
           [
             {text: 'Ir a ajustes', onPress: () => Linking.openURL('app-settings:')},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        }
        else if(geo_error.code === 2){
          this.setState({loadingAlert:false});
          Alert.alert(
           'Error',
           "No se pudo adquirir tu ubicación. Intentalo de nuevo",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

        }
      },{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  render(){
    let header = headerHeight;
    let { countdown, countdownValue, alertColor, textSteps } = this.state;
    return (
      <View>
      <Modal
      animationType="fade"
      transparent={true}
      backdropPressToClose={false}
      backdrop={false}
      visible={this.props.showCountdown}
      onRequestClose={() => {
        this.closeWelcome();
      }}>
      <View style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        flex: 1,
        flexDirection: 'column',
        width:width,
        alignSelf:'center',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <View style={{width:(width/3)*2.25, height:iPhoneX ? height/2 : height/1.5, borderRadius:20,backgroundColor:'white',marginTop:15}}>
        {countdown ?
          <View style={{height:'100%', paddingTop:10, width:(width/3)*2.25,justifyContent:'space-around'}}>
          <View style={{height:'20%', justifyContent:'center'}}>
          <Text style={{fontSize:25, letterSpacing:-.5, fontFamily:'Kohinoor Bangla', color:'black',textAlign:'center'}}>Activando</Text>
          <Text style={{top:-5, fontSize:25, letterSpacing:-.5, fontFamily:'Kohinoor Bangla', color:'black',textAlign:'center', fontWeight:'700'}}>{this.props.emergencyTypeSelected == 0 ? 'Alerta de Emergencia' : (this.props.emergencyTypeSelected  == 2 ? 'Alerta Vecinal'  : 'Alerta Mujeres')}</Text>
          </View>
          <View style={{height:'50%', justifyContent:'center'}}>
          <View style={{justifyContent:'center',backgroundColor:alertColor, alignSelf:'center', width:(width/2.5), height:(width/2.5), borderRadius:(width/2.5)/2}}>
          <View style={{justifyContent:'center',alignSelf:'center', width:'95%', height:'95%', borderColor:'white', borderWidth:7, borderRadius:((width/2.5)*.95)/2}}>
          <Text style={{fontSize:80, fontWeight:'500', fontFamily:'Kohinoor Bangla', color:'white', textAlign:'center'}}>{this.state.countdownValue}</Text>
          </View>
          </View>
          </View>
          <View style={{height:'30%', justifyContent:'center'}}>
          <ButtonAlt title={"Cancelar"} borderRadius={5} titleStyle={{fontFamily:'Kohinoor Bangla', fontWeight:'bold', paddingLeft:10, paddingRight:10}}
           buttonStyle={{width:150, padding:10,backgroundColor: alertColor, borderRadius:25, alignSelf:'center'}}
           onPress={() => { this.cancelCountdown() }}style={{alignSelf:'center'}}/>
          </View>
          </View>
          :
          <View style={{height:'100%', paddingTop:10, width:(width/3)*2.25,justifyContent:'space-around'}}>
            <View style={{height:'20%', justifyContent:'center'}}>
            <Text style={{fontSize:25, letterSpacing:-.5, fontFamily:'Kohinoor Bangla', color:'black',textAlign:'center'}}>Activando</Text>
            <Text style={{top:-5, fontSize:25, letterSpacing:-.5, fontFamily:'Kohinoor Bangla', color:'black',textAlign:'center', fontWeight:'700'}}>{this.props.emergencyTypeSelected == 0 ? 'Alerta de Emergencia' : (this.props.emergencyTypeSelected  == 2 ? 'Alerta Vecinal'  : 'Alerta Mujeres')}</Text>
            </View>
            <View style={{height:'30%', justifyContent:'center'}}>
            <ActivityIndicator size="large" color={alertColor} style={{ alignSelf:'center', transform: [{ scale: 3.5 }]}}/>
            <Image resizeMode="contain" style={{backgroundColor:'white', borderRadius:20, position:'absolute', alignSelf:'center', height:40, width:40}} source={this.props.emergencyTypeSelected == 0 ? BARRA_PERSONAL : (this.props.emergencyTypeSelected == 2 ? BARRA_VECINAL : BARRA_MUJERES )} />
            </View>
            <View style={{height:'50%', width:'85%', borderRadius:20, alignSelf:'center', justifyContent:'center'}}>
            {this.getSteps()}
            </View>
          </View>
        }

        </View>
          </View>
          </Modal>
            </View>
          )
        }
      }

export default EmergencyCountdown;
