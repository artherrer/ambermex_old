import React, { Component } from 'react'
import { View, Text, StyleSheet, AsyncStorage, ImageBackground, Alert, KeyboardAvoidingView, ScrollView, Linking, SafeAreaView, Platform, StatusBar, Animated, Image, FlatList, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button as ButtonAlt, ListItem } from 'react-native-elements';
import Avatar from '../cmps/avatar.js'
import { connect } from 'react-redux';
import MapView, { AnimatedRegion, Animated as AnimatedMap, ProviderPropType, Marker } from 'react-native-maps';
import AlertModal from './public_alert_modal'
import Toast, {DURATION} from 'react-native-easy-toast';
const EndpointRequests = require("../../util/requests.js");
const cloneDeep = require('lodash/cloneDeep');
import FeatherIcon from 'react-native-vector-icons/Feather'
import Ionicon from 'react-native-vector-icons/Ionicons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import ImagePicker from 'react-native-image-crop-picker';
const textAMBER = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
const newIconAlert = require('../../../assets/image/alert1.png');
const emergencyPin = require('../../../assets/image/EMERGENCY_PIN_ANDROID.png');
const medicalPin = require('../../../assets/image/MEDICAL_PIN_ANDROID.png');
const vecinalPin = require('../../../assets/image/NEIGHBOR_PIN.png');
const firePin = require('../../../assets/image/FIRE_PIN.png');
const suspiciousPin = require('../../../assets/image/SUSPICIOUS_PIN.png');
const feministPin = require('../../../assets/image/FEMINIST_PIN.png');
const ambulance = require('../../../assets/image/ambulance.png');
const empty_thumbnail = require("../../../assets/image/profile_pholder.png");
const BACKGROUND = require('../../../assets/image/background_chat.jpg');
import Upload from 'react-native-background-upload'
import { createThumbnail } from "react-native-create-thumbnail";
import ActionSheet from 'react-native-actionsheet'
import Message from './convos/cmps/message_alert'
import SuccessModal from '../chat/success_modal'
import SuspiciousReport from '../chat/suspicious_report'
import FileUploadModal from '../chat/file_upload_modal'
import DialogAlert from "./DialogAlert";
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Header } from 'react-navigation-stack';
var { height, width } = Dimensions.get('window');
height = StatusBar.currentHeight > 24 ? height : height - StatusBar.currentHeight;
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
var haversine = require('haversine');
import moment from 'moment';
const KEYBOARD_VERTICAL_OFFSET = headerHeight + StatusBar.currentHeight;
import Geolocation from '@react-native-community/geolocation';
import { CardStyleInterpolators } from 'react-navigation-stack';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
var ScrollableTabView = require('react-native-scrollable-tab-view');
import LinearGradient from 'react-native-linear-gradient';
const VECINAL = require('../../../assets/image/ALERTA_VECINAL.png');
const FEMINISTA = require('../../../assets/image/ALERTA_FEMINISTA.png');
const SEGURIDAD = require('../../../assets/image/ALERTA.png');
const MEDICA = require('../../../assets/image/ALERTA_MEDICA.png');
const INCENDIO = require('../../../assets/image/INCENDIO_ICONO.png');
const INDIVIDUAL_PIN = require('../../../assets/image/CREATE_INDIVIDUAL.png');
const PIN_LOCATION_EMERGENCY = require('../../../assets/image/PIN_LOCATION_EMERGENCY.png');
const PARTICIPANTS_EMERGENCY = require('../../../assets/image/PARTICIPANTS_EMERGENCY.png');
const NOTIFIED_EMERGENCY = require('../../../assets/image/NOTIFIED_EMERGENCY.png');
import { APP_INFO } from '../../util/constants';
const BARRA_MEDICAL = require('../../../assets/image/BARRA_MEDICO.png');
const BARRA_PERSONAL = require('../../../assets/image/BARRA_PERSONAL.png');
const BARRA_SOSPECHA = require('../../../assets/image/BARRA_SOSPECHA.png');
const BARRA_VECINAL = require('../../../assets/image/BARRA_VECINAL.png');
const BARRA_FEMINISTA = require('../../../assets/image/WOMEN_CIRCLE.png');
import Clipboard from '@react-native-clipboard/clipboard';

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
let HeaderHeight = iPhoneX ? 100 : 30;
let intervalObject;
let Options = [];
let coordinatesInterval;
let updatedInitial = false;
class PublicAlertNew extends Component{
  static navigationOptions = {
    header: null,
    headerStyle:{
      backgroundColor:"white",
      shadowColor: 'transparent'
    },
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  }

  constructor(props) {
    super(props)

    let activeAlert = props.navigation.state.params != undefined && props.navigation.state.params.Chat != undefined ? true : false;
    let alertType = props.navigation.state.params != undefined && props.navigation.state.params.type != undefined ? props.navigation.state.params.type : null;
    let channelId = props.navigation.state.params != undefined && props.navigation.state.params.channel != undefined ? props.navigation.state.params.channel : null;

    this.state = {
      openModal:false,
      latDelta:0.004,
      lonDelta:0.017,
      lat:0,
      lon:0,
      initialCoords:false,
      inCoverage:false,
      activeAlert:activeAlert,
      joining:false,
      createAlertConfirmation:false,
      alertType:alertType,
      channelId:channelId,
      alertMessage:null,
      alertComponentHeight:new Animated.Value((height/2) - 90),
      mapViewHeight:new Animated.Value(height/2),
      messagePosition:new Animated.Value((height/2) - 10),
      messages:[],
      Message:"",
      NumberMessages:0,
      disableMessageSending:false,
      endPermission:false,
      showSuccessModal:false,
      showParticipants:false,
      showAlertModal:true,
      backgroundColor:'red',
      isLoading:false,
      type:null,
      isParticipant:false,
      loadingAlert:false,
      historyData:{
        createdBy: "",
        startedOn: "",
        location: "",
        creatorAge: "",
        creatorAge:""
      },
      alertId:null,
      participantCount:0,
      distanceFrom:0,
      creator:false,
      contentContainerHeight:new Animated.Value(height/2),
      contentContainerMap:new Animated.Value(height/2),
      contentContainerMargin:new Animated.Value(height/2),
      contentEmergencyMargin:new Animated.Value(iPhoneX ? height/2.5 : height/2.75),
      contentContainerVisible:true,
      centerPosition:height/2.5,
      globalLoading:false,
      membersLoaded:false,
      deletingChannel:false,
      alertInitialMessage:null,
      picture:null, fileUploadModal:false,
      videoThumbnail:null,
      progressUpload:0,
      showImage:false,
      mode:"",
      chosenMsg:null,
      url:null,
      dialogEnd:false,
      textBackgroundColor:"#dc8888",
      emergencyTitleText:"ALERTA EMERGENCIA",
      emergencyTitleImage: BARRA_PERSONAL,
      emergencyAttendant:null,
      suspiciousReportModal:false,
      responseElementCoordinate:new AnimatedRegion({
        latitude: 0,
        longitude: 0,
        latitudeDelta:0,
        longitudeDelta:0
      }),
      emergencyCoordinate: new AnimatedRegion({
        latitude: 0,
        longitude: 0,
        latitudeDelta:0,
        longitudeDelta:0
      }),
      titleTextColor:'white',
      bodyTextColor:'white',
      initialMessageExists:false,
      checkStartDate:true
    }
  }

  componentDidMount(){
    let { activeAlert, responseElementCoordinate, emergencyCoordinate } = this.state;
    this.props.dispatch({type:"SET_LOAD_MEMBERS", LoadMembersFunction:(cb) => this.getMembersInfo()})

    this.setState({openModal:true, inCoverage: this.props.userState.CurrentPoint.length > 0 ? true : false});
    this.props.dispatch({type:"SET_ANDROID_PUBLICALERT", BackAndroidPublicAlert:() => this.closeModal()})

    if(activeAlert){
      this.getMembersInfo();
      coordinatesInterval = setInterval(() => {
                          this.moveMap();
                        }, 2500);
      let disableAlert = false;
      let type = "Emergency";
      let isParticipant = false;
      let creator = false;
      let globalLoading = false;
      let emergencyAttendant = null;
      let historyData = null;

      if(this.props.chatState.CurrentChat.members.length == 0){
        globalLoading = true;
      }
      else{
        let index = this.props.chatState.CurrentChat.members.findIndex(x => x.nickname == this.props.userState.Nickname);
        let Me = this.props.chatState.CurrentChat.members[index];

        if(Me != undefined){
          isParticipant = Me.admin || Me.owner ? true : false;
        }
      }
      //set emergencyInformation if not in memory
      if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined){
        disableAlert = this.props.chatState.CurrentChat.emergencyInformation.ended;
        type = this.props.chatState.CurrentChat.emergencyInformation.type;
        emergencyAttendant = this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant; //emergencyAttendant info if available
        if(this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
          creator = true;
        }
        if(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
          emergencyCoordinate =  new AnimatedRegion({
            latitude: Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude),
            longitude: Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude),
            latitudeDelta:0,
            longitudeDelta:0
          });
        }
        if(emergencyAttendant != undefined && emergencyAttendant.latestCoordinates != undefined){
          responseElementCoordinate = new AnimatedRegion({latitude:emergencyAttendant.latestCoordinates.latitude, longitude:emergencyAttendant.latestCoordinates.longitude,latitudeDelta:0,longitudeDelta:0});
        }
        if(this.props.chatState.CurrentChat.additionalProps != undefined){
          historyData = this.props.chatState.CurrentChat.additionalProps;
        }
      }
      else{
        globalLoading = true;
        intervalObject = setInterval(() => {
                            this.getParticipantCount();
                          }, 10000);
      }
      let permission = this.endEmergencyPermission();
      let emergencyMessageObject = this.getEmergencyUIObject();
      this.setState({globalLoading:globalLoading, historyData:historyData, emergencyCoordinate:emergencyCoordinate, responseElementCoordinate:responseElementCoordinate, emergencyAttendant:emergencyAttendant, creator:creator,isParticipant:isParticipant,contentContainerMap:!isParticipant ? new Animated.Value(height/2) : new Animated.Value(height/2),type:type,backgroundColor:emergencyMessageObject.buttonColor,showAlertModal:false,endPermission:permission, loadingAlert:false,activeAlert:true, createAlertConfirmation:true,disableMessageSending:disableAlert, textBackgroundColor: emergencyMessageObject.color, emergencyTitleText:emergencyMessageObject.text, emergencyTitleImage:emergencyMessageObject.image, titleTextColor:emergencyMessageObject.titleTextColor, bodyTextColor:emergencyMessageObject.bodyTextColor});
      this.animateChatComponentUp();
      this.moveMap();
      setTimeout(function(){
        this.moveMap();
      }.bind(this),200);
      this.props.clientState.DB.transaction((tx) => {
        tx.executeSql('UPDATE conversations SET last_time_read = ? WHERE JID = ?',
        [new Date().toISOString(), this.props.chatState.CurrentChat.id],
        (txt, results1) => {
          if (results1.rowsAffected > 0 ) {}
        });
      });
    }
    else{
      this.setState({contentContainerMap:new Animated.Value(height)});
    }
  }

  getEmergencyUIObject(){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined){
      if(this.props.chatState.CurrentChat.emergencyInformation.type != undefined){
        if(this.props.chatState.CurrentChat.emergencyInformation.type == "Emergency" && this.props.chatState.CurrentChat.emergencyInformation.text != undefined && this.props.chatState.CurrentChat.emergencyInformation.text.includes("casa")){
          return {text:"ALERTA VECINAL", image:BARRA_VECINAL, color: "#dc8888", buttonColor:"#e30613", titleTextColor:"white", bodyTextColor:'white'};
        }
        else if(this.props.chatState.CurrentChat.emergencyInformation.type == "Emergency"){
          return {text: "ALERTA SEGURIDAD", image:BARRA_PERSONAL, color: "#dc8888", buttonColor:"#e30613", titleTextColor:"white", bodyTextColor:'white'};
        }
        else if(this.props.chatState.CurrentChat.emergencyInformation.type == "Medical"){
          return {text: "ALERTA MEDICA", image:BARRA_MEDICAL, color:"#4474b4" , buttonColor:"#0C479D", titleTextColor:"white", bodyTextColor:'white'};
        }
        else if(this.props.chatState.CurrentChat.emergencyInformation.type == "Suspicious"){
          return {text: "ACTIVIDAD SOSPECHOSA", image:BARRA_SOSPECHA, color:"#fdcb7e", buttonColor:"#fcaf00", titleTextColor:"white", bodyTextColor:'white' };
        }
        else if(this.props.chatState.CurrentChat.emergencyInformation.type == "Fire"){
          return {text: "ALERTA INCENDIO", image:INCENDIO, color: "#f37a4e", buttonColor:"#f05a23", titleTextColor:"white", bodyTextColor:'white'};
        }
        else if(this.props.chatState.CurrentChat.emergencyInformation.type == "Feminist"){
          return {text: "ALERTA MUJERES", image:BARRA_FEMINISTA, color: "#B0ACD1", buttonColor:"#635592", titleTextColor:"#635592", bodyTextColor:'black'};
        }
        else{
          return {text: "", image:BARRA_PERSONAL, color:"#dc8888" , buttonColor:"white", titleTextColor:"white", bodyTextColor:'white'};
        }
      }
      else{
        return {text: "", image:BARRA_PERSONAL, color:"#dc8888" , buttonColor:"white", titleTextColor:"white", bodyTextColor:'white'};
      }
    }
    else{
      return {text: "", image:BARRA_PERSONAL, color:"#dc8888", buttonColor:"white" , titleTextColor:"white", bodyTextColor:'white'};
    }
  }

  getTime(updatedDate){
    const msgLastDate = new Date(updatedDate)
    const msgYear = msgLastDate.getFullYear()
    const msgMonth = msgLastDate.getMonth()
    const msgDate = msgLastDate.getDate()
    const msgDay = msgLastDate.getDay()
    const msgHours = msgLastDate.getHours()
    const msgMinutes = msgLastDate.getMinutes()
    const LastDate = new Date()
    const curYear = LastDate.getFullYear()
    const curMonth = LastDate.getMonth()
    const curDate = LastDate.getDate()
    const curDay = LastDate.getDay()

    return `${months[msgMonth]} ${msgDate} ${(msgHours > 9) ? msgHours : ('0' + msgHours)}:${(msgMinutes > 9) ? msgMinutes : ('0' + msgMinutes)}`;
  }

  setCustomDelta(nextlatDelta, nextlonDelta, values){
    let { latDelta, lonDelta } = this.state;

    if(nextlatDelta != latDelta || nextlonDelta != lonDelta){
      this.setState({latDelta:nextlatDelta, lonDelta:nextlonDelta, lat:values.latitude, lon:values.longitude, initialCoords:true});
    }
  }

  setRegionMultiplePoints(coordinateArray){
    let minLat, maxLat, minLng, maxLng;

    // init first point
    (point => {
      minLat = point.latitude;
      maxLat = point.latitude;
      minLng = point.longitude;
      maxLng = point.longitude;
    })(coordinateArray[0]);

    // calculate rect
    coordinateArray.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat);
    const deltaLng = (maxLng - minLng);
    let newRegion = new AnimatedRegion({
       latitude: midLat,
       longitude:midLng,
       latitudeDelta: deltaLat + 0.0154,
       longitudeDelta: deltaLng + 0.0154
    });
    return newRegion;
  }

  getRegionObjectMultiplePoints(coordinateArray){
    let minLat, maxLat, minLng, maxLng;
    // init first point
    (point => {
      minLat = point.latitude;
      maxLat = point.latitude;
      minLng = point.longitude;
      maxLng = point.longitude;
    })(coordinateArray[0]);
    // calculate rect
    coordinateArray.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat);
    const deltaLng = (maxLng - minLng);

    let newRegion = {
       latitude: midLat,
       longitude:midLng,
       latitudeDelta: deltaLat + 0.0154,
       longitudeDelta: deltaLng + 0.0154
    };

    return newRegion;
  }

  componentDidUpdate(prevProps, nextProps) {
    let { NumberMessages, activeAlert, creator, loadingAlert, disableMessageSending, deletingChannel, responseElementCoordinate, emergencyCoordinate } = this.state;

    if(prevProps.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && prevProps.chatState.CurrentChat.emergencyInformation.ended != this.props.chatState.CurrentChat.emergencyInformation.ended && this.props.chatState.CurrentChat.emergencyInformation.ended == true)
    {
      if(!creator && !disableMessageSending){
        Alert.alert(
         '¡Atención!',
         "La alerta se ha finalizado.  El canal de emergencia permanecerá activo por 24 horas.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
      }
      this.setState({disableMessageSending:true});
    }

    if(nextProps.loadingAlert && loadingAlert == false){
      this.setState({showSuccessModal:true});
    }

    if(prevProps.userState.CurrentPoint.length === 0 && this.props.userState.CurrentPoint.length > 0){
      this.setState({inCoverage:true});
    }

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages.length > NumberMessages){
      this.setState({NumberMessages:this.props.chatState.CurrentChat.messages.length});
    }

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined &&  prevProps.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat.emergencyInformation != undefined && prevProps.chatState.CurrentChat.emergencyInformation.latestCoordinates != this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates){
      this.setState({initialCoords:false});
    }

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined &&  prevProps.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat.emergencyInformation != undefined){
      if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && prevProps.chatState.CurrentChat.emergencyInformation.emergencyAttendant == undefined){
        this.getMembersInfo();
      }
      if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && prevProps.chatState.CurrentChat.emergencyInformation.emergencyAttendant == undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.assignedTo != undefined){
        /*
        if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.assignedTo != this.props.userState.Nickname && this.props.userState.UserData.isSupport && this.props.userState.UserData.responseType == 1){
          Alert.alert(
           '¡Atención!',
           "La alerta fue asignada a otro elemento de respuesta, gracias.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        */
      }
      if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && prevProps.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates != undefined && prevProps.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates != undefined){
        if(prevProps.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates != this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates){
          this.animateResponseElement(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates);
        }
        else if(responseElementCoordinate.latitude._value == 0){
          this.animateResponseElement(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates);
        }
      }
      if(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined && prevProps.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined && prevProps.chatState.CurrentChat.emergencyInformation.latestCoordinates != this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates){
        if(prevProps.chatState.CurrentChat.emergencyInformation.latestCoordinates != this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates){
          this.animateAlertElement(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates);
        }
        else if(emergencyCoordinate.latitude._value == 0){
          this.animateAlertElement(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates);
        }
      }
      else if(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined && emergencyCoordinate.latitude._value == 0 && !updatedInitial){
        updatedInitial = true;
        this.animateAlertElement(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates);
      }
    }

    if(this.props.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.last_update != undefined && prevProps.chatState.CurrentChat.last_update != undefined && this.props.chatState.CurrentChat.last_update != prevProps.chatState.CurrentChat.last_update){
      if(!deletingChannel){
        this.getMembersInfo();
      }
    }
  }

  endEmergencyPermission(){
    let adminIndex = this.props.chatState.CurrentChat.members.findIndex(n => n.jid === this.props.userState.Username);

    if(adminIndex >= 0){
      if(this.props.chatState.CurrentChat.members[adminIndex].owner){
        return true;
      }
      else if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
        return true;
      }
      else if(this.props.chatState.CurrentChat.members[adminIndex].isSupport == 1){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
        return true;
      }
      else{
        return false;
      }
    }
  }

  animateChatComponentUp(){
    Animated.parallel([
      Animated.timing(this.state.contentContainerMargin, {
          toValue: height/2,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentContainerHeight, {
          toValue: height/2,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentContainerMap, {
          toValue: height/2,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentEmergencyMargin, {
        toValue: iPhoneX ? height/2.5 : height/2.75,
        duration: 0,
        useNativeDriver: false
      })
    ]).start(() => {
        this.setState({contentContainerVisible:true, centerPosition:height/2.5})
    });
  }

  animateChatComponentDown(){
    let { type } = this.state;
    let contentContainerMargin;
    let contentContainerHeight;
    let contentContainerMap;
    let contentEmergencyMargin;

    if(type === "Suspicious"){
      contentContainerMargin = height - 70;
      contentContainerHeight = 70;
      contentContainerMap = height - 70;
      contentEmergencyMargin = height - 150;
    }
    else{
      contentContainerMargin = height - 120;
      contentContainerHeight = 120;
      contentContainerMap = height - 120;
      contentEmergencyMargin = height - 200;
    }

    Animated.parallel([
      Animated.timing(this.state.contentContainerMargin, {
          toValue: contentContainerMargin,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentContainerHeight, {
          toValue: contentContainerHeight,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentContainerMap, {
          toValue: contentContainerMap,
          duration: 0,
          useNativeDriver: false
      }),
      Animated.timing(this.state.contentEmergencyMargin, {
        toValue: contentEmergencyMargin,
        duration: 0,
        useNativeDriver: false
      })
    ]).start(() => {
      this.setState({contentContainerVisible:false,centerPosition:height/5.5})
    });
  }

  animateResponseElement(newCoordinate){
    const { responseElementCoordinate } = this.state;
    if (Platform.OS === 'android') {
      if (this.responseMarker != undefined) {
        this.responseMarker.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else {
      responseElementCoordinate.timing(newCoordinate).start();
    }
  }

  animateAlertElement(newCoordinate){
    const { emergencyCoordinate } = this.state;
    if (Platform.OS === 'android') {
      if (this.emergencyMarker != undefined) {
        this.emergencyMarker.animateMarkerToCoordinate(newCoordinate, 500);
      }
    } else {
      emergencyCoordinate.timing(newCoordinate).start();
    }
  }

  notifyUsers(){
    this.setState({uploading:true});

    let beaconList = [];

    for(let i = 0; i < this.props.userState.CurrentPoint.length;i++){
      let newBeaconModel = {
        BeaconId: this.props.userState.CurrentPoint[i].id,
        Latitude:this.props.userState.CurrentPoint[i].coords.latitude,
        Longitude:this.props.userState.CurrentPoint[i].coords.longitude,
        ZoneName:this.props.userState.CurrentPoint[i].zoneName
      };

      beaconList.push(newBeaconModel);
    }

    EndpointRequests.NotifyNearbyUsers(beaconList, function(response){
      if(response.message === "Ok" && response.usersNotified != null){
        Alert.alert(
         'Éxito',
         "Se notifico a " + response.usersNotified + " usuarios cerca",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
      }
      else{
        Alert.alert(
         'Atención',
         "No hay ningun usuario cerca",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
      }

      this.setState({uploading:false});
    }.bind(this));
  }

  openLocation(message){
    if(message != undefined && message.coordinates != undefined){
      let text = cloneDeep(message.coordinates);
      let StringCoords = text.match(/\(([^)]+)\)/)[1];
      StringCoords = StringCoords.split(",");

      if(StringCoords.length > 1){
        Coordinates = {
          latitude:parseFloat(StringCoords[0]),
          longitude:parseFloat(StringCoords[1])
        };

        let mapsUrl = "http://maps.google.com/?q=" + Coordinates.latitude + "," + Coordinates.longitude;

        Linking.openURL(mapsUrl);
      }
    }
  }

  copyMessage(message){
    if(message.text != undefined && /\S/.test(message.text)){
       Clipboard.setString(message.text);
    }
  }

  _keyExtractor = (item, index) => index.toString()
  _keyExtractorParticipant = (item, index) => index.toString() + "participant";

  _renderMessageItem(message) {
    const { Loading, alertType, textBackgroundColor,emergencyTitleText, emergencyTitleImage, historyData, titleTextColor, bodyTextColor } = this.state;

    const isOtherSender = message.username != this.props.userState.Nickname ? true : false;

    if(message === undefined || message.hidden){
      return null;
    }
    else if(message.id === undefined && !message.dateCategory){
      return null;
    }

    return (
      <TouchableWithoutFeedback>
      <View>
      <Message titleTextColor={titleTextColor} bodyTextColor={bodyTextColor}  initialCoords={historyData != undefined ? historyData.coordinates : {latitude:0,longitude:0}} textBackgroundColor={textBackgroundColor} textTitleAlert={emergencyTitleText} imageTitleAlert={emergencyTitleImage} alert={this.props.chatState.CurrentChat.emergencyInformation} resourceId={this.props.userState.Resource} openSheet={(mode, msg, url) => this.openSheetOptions(mode, msg, url)} nickname={this.props.userState.Nickname} alertMessage={this.state.alertInitialMessage} system_message={message.isSystemMsg} disableOptions={false} messageObject={message} loading={Loading} otherSender={isOtherSender}  message={{pending:message.pending, body:message.text, read_by_count:message.read_by_count, date_sent:new Date(message.timestamp), sent_by:message.username, id:message.id, message_by:message.message_by, read_by:message.read_by, user_data:message.user}} key={message.id} showImage={(image) => this.showImageModal(image)} />
      </View>
      </TouchableWithoutFeedback>
    )
  }

  endAlarm(){

    this.setState({activeAlert:false,createAlertConfirmation:false,alertType:null,alertMessage:null});

    Animated.parallel([
      Animated.timing(this.state.mapViewHeight, {
          toValue: height/2,
          duration: 300,
          useNativeDriver: true
      }),
      Animated.timing(this.state.messagePosition, {
          toValue: (height/2) - 10,
          duration: 300,
          useNativeDriver: true
      })
    ]).start(() => {
        // callback
    });
  }

  composingMessage(text){
    this.setState({Message:text});
  }

  getMembersInfo(cb){
    let { historyData, isLoading, NumberMessages, disableMessageSending } = this.state;

    if(isLoading){
      if(cb != undefined) { return cb(true); }
      return false;
    }
    if(this.props.chatState.CurrentChat == undefined || this.props.chatState.CurrentChat.id == undefined){
      return false;
    }

    let conversation_id = this.props.chatState.CurrentChat.id.split("@")[0];
    let members_ids = [];
    this.setState({isLoading:true});

    EndpointRequests.GetMembersInfo(conversation_id, function(responseData) {
      if(responseData.error != undefined){
        Alert.alert(
         'Error',
         responseData.message,
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           {text: 'Borrar', onPress: () => this.deleteGroup(), style: 'destructive'},
         ],
         { cancelable: false }
        )
        this.setState({isLoading:false});
      }
      else{
        if(responseData.members != null){
          for(let i = 0; i < responseData.members.length;i++){
            let member = responseData.members[i];
            members_ids.push(member.jid);

            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [member.nickname, member.jid, member.name, member.pictureUrl, "", "", member.phone, "", 'true', new Date().toISOString(), member.alias],
              (txx, results) => {
                tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on, last_visit, is_emcontact, is_response, response_type) VALUES (?,?,?,?,?,?, (SELECT last_visit FROM conversation_member WHERE user_id = ?), ?,?,?)',
                [member.nickname, this.props.chatState.CurrentChat.id, member.admin.toString(), member.owner.toString(), 'true', new Date().toISOString(), member.nickname, member.isEmergencyContact, member.isSupport, member.responseType],
                (txt, results1) => {
                  if (results1.rowsAffected > 0 ) {}
                })
              })
            });
          }

          if(historyData == undefined || historyData.createdBy === ""){
            let location = null;
            let coordinates = null;

            if(responseData.additionalInfo != undefined && responseData.additionalInfo.alertInitialMessage != undefined){
              try{
                location = responseData.additionalInfo.alertInitialMessage.split(":")
                if(location.length >= 2){
                  location = location[1].split("@");
                  if(location.length >= 2){
                    coordinates = location[1];
                    coordinates = coordinates.match(/\(([^)]+)\)/)[1];
                    coordinates = coordinates.split(",");
                    coordinates = {
                      latitude:parseFloat(coordinates[0]),
                      longitude:parseFloat(coordinates[1])
                    };
                    location = location[0];
                  }
                }
              }
              catch(err){
                location = "No disponible";
                coordinates = {
                  latitude:0,
                  longitude:0
                };
              }
            }
            else{
              location = "No disponible";
              coordinates = {
                latitude:0,
                longitude:0
              };
            }

            let user_data_ = responseData.members.find(n => n.jid.startsWith(responseData.additionalInfo.createdByXMPP));

            historyData = {
              createdBy: responseData.additionalInfo.createdByXMPP,
              startedOn: this.getTime(new Date(responseData.createdAt)),
              location: location,
              coordinates:coordinates,
              latestCoordinates:coordinates,
              creatorAge: responseData.additionalInfo.creatorAge,
              creatorGender: responseData.additionalInfo.creatorGender,
              creatorName: responseData.additionalInfo.creatorName,
              creatorPicture: responseData.additionalInfo.creatorPicture,
              alertInitialMessage: responseData.additionalInfo.alertInitialMessage,
              alertAttachedPicture: responseData.additionalInfo.attachedImage,
              alertMessageObject:  {
                  id: "initialAlertMessage",
                  chat_id: this.props.chatState.CurrentChat.id,
                  timestamp: new Date(responseData.createdAt).getTime(),
                  text: responseData.additionalInfo.alertInitialMessage,
                  time: new Date(responseData.createdAt).getTime(),
                  message_by: responseData.additionalInfo.createdByXMPP,
                  username: responseData.additionalInfo.createdByXMPP,
                  state: "Sent",
                  read_by:[responseData.additionalInfo.createdByXMPP],
                  sent_by: responseData.additionalInfo.createdByXMPP,
                  read_by_count:1,
                  isMedia:false,
                  isVideo:false,
                  isImage:false,
                  isFile:false,
                  user:user_data_
                }
            };

            setTimeout(function(){
              this.saveAdditionalProps(historyData);
            }.bind(this),500);
          }

          this.props.dispatch({type:"UPDATE_MEMBERS", Chat:conversation_id, MemberList: responseData.members, MembersLoaded:true, ChatInfo:{Description:responseData.description, CreatedAt: responseData.createdAt}});

          this.props.navigation.setParams({
            infoLoaded:true,
            loading:this.props.clientState.LoginLoading,
          });

          let Me = responseData.members.find(x => x.nickname == this.props.userState.Nickname);
          let isParticipant = false;
          if(Me != undefined){
            isParticipant = Me.admin || Me.owner ? true : false;
          }
          let emergencyAttendant = responseData.additionalInfo.assignedToInfo != null ? responseData.additionalInfo.assignedToInfo : null; //emergencyAttendant info if available
          let permission = this.endEmergencyPermission();
          let disableMessageSendingVar = this.disableMessageSending(responseData.emergencyType);

          let emergencyMessageObject = this.getEmergencyUIObject();
          this.setState({globalLoading:false, emergencyAttendant:emergencyAttendant, alertAttachedPicture:historyData.alertAttachedPicture, alertInitialMessage:historyData.alertInitialMessage, loadingAlert:false, isParticipant:isParticipant, membersLoaded:true, isLoading:false, creator:this.isCreator(), alertId:responseData.alertId, distanceFrom:this.getDistanceFrom(), participantCount:this.getParticipantCount(), historyData:historyData, type:responseData.emergencyType == 0 ? "Emergency" : (responseData.emergencyType == 1 ? "Medical" : (responseData.emergencyType == 2 ? "Fire" : (responseData.emergencyType == 4 ? "Feminist" : "Suspicious"))), MembersIds:members_ids, endPermission:permission, backgroundColor:emergencyMessageObject.buttonColor, textBackgroundColor: emergencyMessageObject.color, emergencyTitleText:emergencyMessageObject.text, emergencyTitleImage:emergencyMessageObject.image, titleTextColor:emergencyMessageObject.titleTextColor, bodyTextColor:emergencyMessageObject.bodyTextColor, disableMessageSending: disableMessageSendingVar});

          setTimeout(function(){
            this.props.dispatch({type:"ADD_USERDATA_MESSAGE"});
            if(cb != null){
              cb("Finished");
            }
          }.bind(this),200);

          this.props.clientState.DB.transaction((tx) => {
            tx.executeSql('UPDATE conversations SET description = ?, additionalProps = ? WHERE JID = ?',
            [responseData.description, JSON.stringify(responseData.additionalInfo), this.props.chatState.CurrentChat.id],
            (txx, results) => {})
          });

          if(historyData.createdBy == this.props.userState.Nickname && !disableMessageSendingVar){
            this.props.chatState.ExistingAlarm({id:this.props.chatState.CurrentChat.id, chat_id:this.props.chatState.CurrentChat.id, chat_name:this.props.chatState.CurrentChat.name});
          }

          if(emergencyAttendant != undefined && emergencyAttendant.assignedTo == this.props.userState.Nickname){
            if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.ended){
              AsyncStorage.removeItem("AttendingAlert",(error) => {
                if(error != null){
                  console.log("error removing attendingalert");
                }
              }); //remove AttendingAlert in case it failed to remove from App.js to stop sending location messages
            }
          }

          if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.type == "Suspicious" && this.props.chatState.CurrentChat.emergencyInformation.endedOn == undefined){
            setTimeout(function(){
              this.expireSuspiciousChannel(responseData.createdAt, historyData);
            }.bind(this),200);
          }
        }
      }
    }.bind(this));
  }

  expireSuspiciousChannel(creationTime, historyData){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined){
      if(this.props.chatState.CurrentChat.emergencyInformation.type === "Suspicious" &&  this.props.chatState.CurrentChat.emergencyInformation.endedOn == undefined){
        let startedDate = new Date(creationTime);
        let startedPlusOne = cloneDeep(startedDate);
        let endDate = new Date(startedPlusOne.setDate(startedPlusOne.getDate() + 1));
        let messageId = id();
        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('SELECT * FROM alert_message WHERE conversationid = ? AND message_end_id IS NULL', [this.props.chatState.CurrentChat.id],
          (tx2, results1) => {
            if(results1.rows.length > 0){
              tx2.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename, thumbnail, isAudio, isEdited, isQuoted, quoted_msg_id, quoted_text, isSystemMsg, isHidden) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [messageId, "Alerta Terminada", startedDate.toISOString(), 'false', this.props.userState.Nickname, this.props.chatState.CurrentChat.id, true, false, false, false, false, null, null, null, false, false, false, null, null, false, true],
              (txt, results2) => {
                txt.executeSql('UPDATE alert_message SET message_end_id = ?, ended_on = ?, ended_by = ?, expiration_date = ? WHERE conversationid = ?',
                [messageId, startedDate.toISOString(), historyData.createdBy, endDate.toISOString(), this.props.chatState.CurrentChat.id],
                (txx, results3) => {
                  if(results3.rowsAffected > 0){
                    this.props.dispatch({type:"END_ALERT_STATUS", Chat:this.props.chatState.CurrentChat.id, EndDate:endDate});
                  }
                })
              })
            }
          })
        });
      }
    }
  }

  disableMessageSending(alertType){
    if(alertType === "Suspicious"){
      return true;
    }
    else{
      if(this.props.chatState.CurrentChat.emergencyInformation != undefined){
        if(this.props.chatState.CurrentChat.emergencyInformation.ended){
          return true;
        }
        else{
          return false;
        }
      }
      else{
        return false;
      }
    }
  }

  isCreator(){
    if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
      return true;
    }
    return false;
  }

  getAge(){
    return moment().diff(moment(this.props.userState.UserData.dob), 'years')
  }

  getChannelType(alertType, fromChannel){
    // CHANNEL_TYPE { 0 = AMBERMEX, 1 = HOME_TEMP_SECURITY, 2 = HOME_TEMP_FIRE, 3 = LOCAL_TEMP_SECURITY, 4 = TEMP_MEDICAL, 5 = USER, 6 = ONEONONE, 7 = SUSPICIOUS }
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
      else if(alertType == "Medical"){
        return 4;
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
        return 7;
      }
      else if(alertType == "Feminist"){
        return 8;
      }
    }
  }

  createPublicAlarm(){
    let { alertType, channelId, reportText, reportImageUrl, alertImage } = this.state;

    this.setState({loadingAlert:true});

    let UserAlias = this.props.userState.UserData.alias;

    Geolocation.getCurrentPosition((get_success) => {
          let addressString = "Coordenadas";
          let coordinatesString = "(" + get_success.coords.latitude + ", " + get_success.coords.longitude + ")";
          //chat type 3 global emergency 4 global medical
          let model = {
            Location:null,
            Message: "",
            Type: alertType === "Emergency" ? 0 : (alertType === "Medical" ? 1 : (alertType === "Fire" ? 2 : (alertType === "Suspicious" ? 3 : 4))),
            ChannelType: this.getChannelType(alertType, channelId != undefined),
            ExternalChannelId:channelId != undefined ? channelId : null
          };
          let messageAlert = reportText != undefined ? reportText : "";
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
          model.Address = addressString;
          model.ImageUrl = alertImage;
          let firstLocation = {
            latitude: get_success.coords.latitude,
            longitude: get_success.coords.longitude,
          };

          EndpointRequests.CreateGlobalAlarm(model, (response) => {
            if(response.chatId != undefined){
              this.props.clientState.LoadChatList(false, (finished) => {
                setTimeout(async function(){
                  let messageXMPP = xml( "presence", { from:this.props.clientState.From, id:id(), to: response.chatId + '/' + this.props.userState.Nickname }, xml('x', 'http://jabber.org/protocol/muc'), xml("status", { code: '200'}) );
                  let responseXMPP = this.props.clientState.Client.send(messageXMPP);
                }.bind(this),250);
                let emergencyInformation = {
                  createdBy:this.props.userState.UserData,
                  latestCoordinates:firstLocation,
                  locationList:[firstLocation],
                  ended:alertType === "Suspicious" ? true : false,
                  endedOn:new Date().getTime(),
                  startedOn:new Date().getTime(),
                  text:messageAlert,
                  type:alertType
                };

                setTimeout(async function(){
                  this.props.dispatch({type:"ENTER_CHAT", Chat:response.chatId, Username:this.props.userState.Nickname, Props:response.result, Emergency:emergencyInformation});
                }.bind(this),500);
                setTimeout(async function(){
                  let emergencyMessageObject = this.getEmergencyUIObject();
                  this.setState({type: alertType, alertInitialMessage: response.xmppMessage, activeAlert:true, showAlertModal:false, isParticipant:true, creator:true, contentContainerMap:new Animated.Value(height/2),backgroundColor:emergencyMessageObject.buttonColor, textBackgroundColor: emergencyMessageObject.color, emergencyTitleText:emergencyMessageObject.text, emergencyTitleImage:emergencyMessageObject.image, titleTextColor:emergencyMessageObject.titleTextColor, bodyTextColor:emergencyMessageObject.bodyTextColor});
                  this.sendAlertMessage(model, response.xmppMessage, alertImage);
                }.bind(this),1000);
                coordinatesInterval = setInterval(() => {
                                    this.moveMap();
                                  }, 2500);
                //runs every 2 secods to refresh map tracking data
                setTimeout(async function(){
                  intervalObject = setInterval(function(){
                                    this.getParticipantCount();
                                   }.bind(this), 10000);
                }.bind(this),1500);

                setTimeout(async function(){
                  this.getMembersInfo();
                }.bind(this),2500);
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

  sendAlertMessage(model, xmppMessage, alertImage){
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: xmppMessage,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
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

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, messageBody.isMedia, messageBody.isImage, messageBody.isVideo, messageBody.isFile, messageBody.url, messageBody.fileName],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          if(model.Type == 0){
            if(model.ExternalChannelId != undefined){
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
            else{
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
          }
          else if(model.Type == 1){
            if(model.ExternalChannelId != undefined){
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"),  xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
            else{
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"),  xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
          }
          else if(model.Type == 3){
            if(model.ExternalChannelId != undefined){
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName), xml("officialChannel",{}, "true"),  xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
            else{
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName),  xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
          }
          else if(model.Type == 4){
            if(model.ExternalChannelId != undefined){
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("officialChannel",{}, "true"),  xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
            else{
              let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let response = this.props.clientState.Client.send(message);
            }
          }
        }
      })
    });
  }

  saveAdditionalProps(additionalProps){
    try{
      let emergencyId = this.props.chatState.CurrentChat.id;
      this.props.clientState.DB.transaction((tx) => {
        tx.executeSql('UPDATE alert_message SET started_by = ?, additionalProps = ? WHERE conversationid = ?',
        [additionalProps.createdBy, JSON.stringify(additionalProps), emergencyId],
        (txt, results1) => {
          if (results1.rowsAffected > 0 ) {
            this.props.dispatch({type:"UPDATE_EMERGENCY", Data:additionalProps, Chat:emergencyId});
            if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.username == this.props.userState.Username){
              this.setState({showSuccessModal:true});
            }

            setTimeout(function(){
              this.setState({creator:this.isCreator(), distanceFrom:this.getDistanceFrom(), participantCount:this.getParticipantCount()});
            }.bind(this),500);
          }
        })
      });
      if(this.props.chatState.CurrentChat.emergencyInformation == undefined || this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates == undefined){
        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('INSERT INTO alert_coords (latitude, longitude, date, alertid) VALUES (?, ?, ?, ?)',
          [String(additionalProps.coordinates.latitude), String(additionalProps.coordinates.longitude), new Date().toISOString(), emergencyId],
          (txt, results1) => {
          })
        });
      }
    }
    catch(exception){
      console.log(exception);
    }
  }

  endEmergency(reason){
    if(reason != undefined)
    {
      this.setState({dialogEnd:false});
    }
    if(this.state.endPermission){
      if(this.props.chatState.CurrentChat.emergencyInformation != undefined){
        let messageId = this.props.chatState.CurrentChat.emergencyInformation.messageId;
        let time = new Date().toISOString();
        let emergencyType = this.props.chatState.CurrentChat.emergencyInformation.type;

        let messageBody = {
          id: id(),
          chat_id: this.props.chatState.CurrentChat.id,
          timestamp: time,
          text: emergencyType === "Emergency" ? "Alerta Desactivada" : "Alerta Médica Desactivada.",
          time: new Date(time).getTime(),
          message_by: this.props.chatState.CurrentChat.nickname,
          username: this.props.userState.Nickname,
          state: "Pending",
          read_by:[this.props.userState.Nickname],
          read_by_count:0,
          user:this.props.userState.UserData,
          pending:true,
          isAlert:true,
          alertEnd:true
        };

        EndpointRequests.EndAlert(this.props.chatState.CurrentChat.id, reason,function(responseData) {
          if(responseData.message == "Ok"){
            this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent) VALUES (?,?,?,?,?,?,?)',
              [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false],
              (txt, results1) => {
                if (results1.rowsAffected > 0 ) {
                  let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageBody.text), xml("resourceId", {}, this.props.userState.Resource), xml("EmergencyId", {}, messageId), xml("type", {}, "Emergency"), xml("emergencyType", {}, emergencyType), xml("emergencyAction", {}, "End"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                  let response = this.props.clientState.Client.send(message);

                  this.setState({loadingAlert:false, disableMessageSending:true, Message:""});

                  Alert.alert(
                   '¡Alerta finalizada!',
                   "El canal de emergencia permanecerá activo por 24 horas.",
                   [
                     {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                   ],
                   { cancelable: true }
                 )
                }
              })
            });
          }
          else{
            Alert.alert(
             'Error',
             responseData.message,
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            this.setState({loadingAlert:false});
          }
        }.bind(this));
      }
    }
  }

  renderContacts(item, index){
    if(item.alias != undefined && (item.admin || item.owner)){
      return <ListItem
                key={item.alias + index}
                roundAvatar
                onPress={() => console.log('press')}
                underlayColor="lightgray"
                containerStyle={{height:55, justifyContent:'center', backgroundColor:'white', borderBottomColor:'white', borderBottomWidth:1}}
                leftAvatar={
                  <Avatar name={item.alias === undefined ? "?..." : item.alias} photo={item.pictureUrl != null ? item.pictureUrl : null} iconSize="small" />
                }
                rightIcon={item.admin && item.owner ? {type:"font-awesome-5", name:"crown", color:'blue'} : null}
                title={item.alias}
                titleStyle={{fontWeight:'bold'}}
                subtitleStyle={{fontSize:12}}
                subtitle={item.admin && item.owner ? "Creador" : "Participante"}
                />
    }
    else{
      return null;
    }
  }

  getParticipantCount(){
    let Count = 0;

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.members.length > 0){
      for(let i = 0; i < this.props.chatState.CurrentChat.members.length;i++){
        if(this.props.chatState.CurrentChat.members[i].admin || this.props.chatState.CurrentChat.members[i].owner){
          Count++;
        }
      }

      if(Count > 0){
        return Count - 1;
      }
      else{
        return Count;
      }
    }
  }

  deleteGroup(){
    let Role = "member";

    let memberIndex = this.props.chatState.CurrentChat.members.findIndex(n => n.jid === this.props.userState.Username);

    if(memberIndex < 0){
      memberIndex = this.props.chatState.CurrentChat.members.findIndex(n => n.nickname === this.props.userState.Nickname);
    }

    if(memberIndex >= 0){
      let userInfo = this.props.chatState.CurrentChat.members[memberIndex];

      if(userInfo.owner){
        Role = "owner";
      }
      else if(userInfo.admin){
        Role = "admin";
      }

      let model = {
        Role: Role,
        ChatId: this.props.chatState.CurrentChat.id
      };

      this.setState({deletingChannel:true});

      EndpointRequests.AbandonGroup(model, (response) => {
        if(response.message === "Ok"){
          //remove from local db and list
          this.props.dispatch({type:"REMOVE_ROOM", ChatId:this.props.chatState.CurrentChat.id});

          let message = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
          let response = this.props.clientState.Client.send(message);

          this.props.clientState.DB.transaction((tx) => {
            tx.executeSql('DELETE FROM conversations WHERE JID = ?',
            [this.props.chatState.CurrentChat.id],
            (txt, results1) => {
              if (results1.rowsAffected > 0 ) {
                this.props.clientState.LoadChatList();
                this.props.navigation.pop(1);
                this.props.dispatch({type:"CLEAR_CURRENT"});
              }
            })
          });
        }
        else{
          Alert.alert(
           'Error',
           response.message,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
      });
    }
  }

  _getHeader(){
    let { historyData, initialMessageExists } = this.state;
    if(!initialMessageExists && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.messages != undefined){
      if(this.props.chatState.CurrentChat.messages.length == 0){
        if(historyData != undefined && historyData.alertMessageObject != undefined){
          return this._renderMessageItem(historyData.alertMessageObject);
        }
        else{
          return null;
        }
      }

      if(historyData != undefined && historyData.alertMessageObject != undefined && historyData.alertMessageObject.text != undefined){
        let initialMessageIndex = this.props.chatState.CurrentChat.messages.findIndex(x => x.text == historyData.alertMessageObject.text);
        if(initialMessageIndex < 0){
          return this._renderMessageItem(historyData.alertMessageObject);
        }
        else{
          this.setState({initialMessageExists:true});
          return null;
        }
      }
      else{
        return null;
      }
    }
    return null;
  }

  emptyComponentList(){
    let { historyData } = this.state;
    if(historyData != undefined && historyData.alertMessageObject != undefined){
      return null;
    }
    else{
      return <View style={{top:(height/2)-200,width:(width/3)*2, justifyContent:'center', alignSelf:'center', borderRadius: 50, padding:15, backgroundColor:'#bbcbb7', borderBottomColor:'transparent'}}>
                <Text style={{textAlign:'center', fontSize:13}}>Envia un mensaje a personas cercanas a tu posicion.</Text>
            </View>
    }
  }

  getAlertComponent(){
    let { createAlertConfirmation, activeAlert, type, membersLoaded, loadingAlert, alertType, alertMessage, disableMessageSending, showParticipants, isParticipant, distanceFrom, creator, contentContainerVisible } = this.state;

    if(!isParticipant){
      return <View style={{backgroundColor:'transparent'}}/>;
    }
    else if(type == "Suspicious"){
      return <View style={{backgroundColor:'white',flex:1, paddingBottom:10, paddingTop:0}}>
                <ImageBackground source={BACKGROUND} style={{width: '100%', height: '100%'}} imageStyle={{ opacity: 0.5 }}>
                <View style={{height:5, flexDirection:'row', width:width,  borderBottomColor:'lightgray', borderBottomWidth:1.5}}>
                </View>
                  <View style={{flex:1}}>
                    <FlatList
                      style={{backgroundColor:'transparent', marginLeft:10,marginRight:10,zIndex:100, position:'relative'}}
                      inverted={this.props.chatState.CurrentChat != undefined ? (this.props.chatState.CurrentChat.messages.length == 0 ? false : true) : false}
                      data={this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.messages.sort((a, b) => { return b.time - a.time}) : []}
                      keyExtractor={this._keyExtractor}
                      renderItem={({ item }) => this._renderMessageItem(item)}
                      ListFooterComponent={() => this._getHeader()}
                      ListEmptyComponent={() => this.emptyComponentList()}
                    />
                    <View style={{paddingTop:5, borderTopColor:'gray', borderTopWidth:1, backgroundColor:'white',paddingLeft:5, paddingRight:5, flexDirection: 'row', marginTop: wp('1%'),alignItems:'center'}}>
                      <View>
                        <TouchableOpacity disabled={this.state.notMember || (this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.locked)} onPress={() => this.fileUploadOptions()}>
                          <FeatherIcon name="plus" size={35} color="#7CB185" />
                        </TouchableOpacity>
                      </View>
                      <View style={{backgroundColor: '#e3e3e3', borderRadius: 25, marginEnd: wp('0%'), marginLeft:5, flexGrow: 1, borderWidth:1, borderColor:'white',paddingTop:2,paddingBottom:2}}>
                        <AutoGrowingTextInput
                        style={{marginStart: wp('3%'), marginEnd: wp('0%'), color:'black', paddingTop:0,paddingBottom:0}}
                        value={this.state.Message}
                        placeholder={'Escribe un mensaje...'}
                        onBlur={() => this.statusBarReset()}
                        onChangeText={(text) => this.composingMessage(text)}
                        minHeight={35}
                        maxHeight={35}
                        maxWidth={width - 120} />
                      </View>
                      <View style={{marginLeft:5, marginRight:10}}>
                        {this.props.clientState.LoginLoading ?
                          <ActivityIndicator size="small" style={{width:30}} />
                          :
                          <TouchableOpacity delayPressOut={1000} disabled={this.state.Message.length > 0 ? false : true}  onPress={() => this.state.Message.length > 0 ? this.sendMessage() : null}>
                            <SimpleLineIcons name={"arrow-right-circle"} size={30} color={this.state.Message.length > 0 ? "#7CB185" : 'gray'} />
                          </TouchableOpacity>
                        }
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => contentContainerVisible ? this.animateChatComponentDown() : this.animateChatComponentUp()} style={{position:'absolute',zIndex:1000,width:width*.125, height:width*.125, borderRadius:(width*.125)/2, top:-(((width*.125)/2)), justifyContent:'center', backgroundColor:'white', alignSelf:'center', shadowColor: "#000",shadowOffset: {width: 0,height: 3,},shadowOpacity: 0.43,shadowRadius: 2.65,elevation: 15}}>
                    <Icon name={contentContainerVisible ? "ios-arrow-down" : "ios-arrow-up"} type="ionicon" color={"#7D9E78"} size={35} style={{textAlign:'center', top:0}} />
                  </TouchableOpacity>
                </ImageBackground>
              </View>
    }
    else{
        return <View style={{backgroundColor:'white',flex:1, paddingBottom:10, paddingTop:0}}>
                  <View style={{height:60, flexDirection:'row', width:width,  borderBottomColor:'lightgray', borderBottomWidth:1.5}}>
                    <TouchableOpacity disabled={true} style={{flex:.3, justifyContent:'center', borderRightColor:'lightgray', borderRightWidth:.75}}>
                      <View style={{height:30, alignSelf:'center', flexDirection:'row'}}>
                      <Icon name="person-outline" type="material" size={30} color={type == "Feminist" ? '#635592' : '#7D9E78'} />
                      <Text style={{color:type == "Feminist" ? '#635592' : '#7D9E78', top:5, fontSize:17}}>{this.props.chatState.CurrentChat != undefined ? this.getMemberCount() : ""}</Text>
                      </View>
                      <Text style={{fontSize:10, color:type == "Feminist" ? '#635592' : '#7D9E78', textAlign:'center'}}>{type == "Feminist" ? "Notificadas" : "Notificados"}</Text>
                    </TouchableOpacity>
                    <View onPress={() => this.setState({showParticipants:false})} style={{flex:.4, justifyContent:'center', borderRightColor:'lightgray', borderLeftColor:'lightgray', borderRightWidth:.75, borderLeftWidth:.75}}>
                      <TouchableOpacity onPress={() => contentContainerVisible ? this.animateChatComponentDown() : this.animateChatComponentUp()} style={{width:width*.125, height:width*.125, borderRadius:(width*.125)/2, top:-(width*.125)/4.5, justifyContent:'center', backgroundColor:'white', alignSelf:'center', shadowColor: "#000",shadowOffset: {width: 0,height: 3,},shadowOpacity: 0.43,shadowRadius: 2.65,elevation: 5}}>
                        <Icon name={contentContainerVisible ? "ios-arrow-down" : "ios-arrow-up"} type="ionicon" color={"#7D9E78"} size={35} style={{textAlign:'center', top:0}} />
                      </TouchableOpacity>
                      {!creator && membersLoaded && distanceFrom > 0 ?
                        <Text style={{textAlign:'center', fontSize:12, top:-10}}>A <Text style={{color:"#7D9E78"}}>{parseInt(distanceFrom)} km</Text> de ti</Text>
                        :
                        null
                      }
                    </View>
                    <TouchableOpacity disabled={true} style={{flex:.3, justifyContent:'center', borderLeftColor:'lightgray', borderLeftWidth:.75}}>
                      <View style={{height:30, alignSelf:'center', flexDirection:'row'}}>
                      <Icon name="person-outline" type="material" size={30} color={type == "Feminist" ? '#635592' : '#7D9E78'} />
                      <Text style={{color:type == "Feminist" ? '#635592' : '#7D9E78', top:5, fontSize:17}}>{this.props.chatState.CurrentChat != undefined ? this.state.participantCount : ""}</Text>
                      </View>
                      <Text style={{fontSize:10, color:type == "Feminist" ? '#635592' : '#7D9E78', textAlign:'center'}}>Participantes</Text>
                    </TouchableOpacity>
                  </View>
                    <View style={{flex:1}}>
                    <ImageBackground source={BACKGROUND} style={{width: '100%', height: '100%'}} imageStyle={{ opacity: 0.5 }}>
                      <FlatList
                        style={{backgroundColor:'transparent', marginLeft:10,marginRight:10,zIndex:100, position:'relative'}}
                        inverted={this.props.chatState.CurrentChat != undefined ? (this.props.chatState.CurrentChat.messages.length == 0 ? false : true) : false}
                        data={this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.messages.sort((a, b) => { return b.time - a.time}) : []}
                        keyExtractor={this._keyExtractor}
                        renderItem={({ item }) => this._renderMessageItem(item)}
                        ListFooterComponent={() => this._getHeader()}
                        ListEmptyComponent={() => this.emptyComponentList()}
                      />
                      <View style={{paddingTop:5, borderTopColor:'gray', borderTopWidth:1, backgroundColor:'white',paddingLeft:5, paddingRight:5, flexDirection: 'row', marginTop: wp('1%'),alignItems:'center'}}>
                        <View>
                          <TouchableOpacity disabled={this.state.notMember || (this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.locked)} onPress={() => this.fileUploadOptions()}>
                            <FeatherIcon name="plus" size={35} color="#7CB185" />
                          </TouchableOpacity>
                        </View>
                        <View style={{backgroundColor: '#e3e3e3', borderRadius: 25, marginEnd: wp('0%'), marginLeft:5, flexGrow: 1, borderWidth:1, borderColor:'white',paddingTop:2,paddingBottom:2}}>
                          <AutoGrowingTextInput
                          style={{marginStart: wp('3%'), marginEnd: wp('0%'), color:'black', paddingTop:0,paddingBottom:0}}
                          value={this.state.Message}
                          placeholder={'Escribe un mensaje...'}
                          onBlur={() => this.statusBarReset()}
                          onChangeText={(text) => this.composingMessage(text)}
                          minHeight={35}
                          maxHeight={35}
                          maxWidth={width - 120} />
                        </View>
                        <View style={{marginLeft:5, marginRight:10}}>
                          {this.props.clientState.LoginLoading ?
                            <ActivityIndicator size="small" style={{width:30}} />
                            :
                            <TouchableOpacity delayPressOut={1000} disabled={this.state.Message.length > 0 ? false : true}  onPress={() => this.state.Message.length > 0 ? this.sendMessage() : null}>
                              <SimpleLineIcons name={"arrow-right-circle"} size={30} color={this.state.Message.length > 0 ? "#7CB185" : 'gray'} />
                            </TouchableOpacity>
                          }
                        </View>
                      </View>
                      </ImageBackground>
                    </View>
                </View>
    }
  }

  getMemberCount(){
    let result = this.props.chatState.CurrentChat.members.filter(member => {
      return member.alias != undefined
    })

    if(result.length > 0){
      return result.length - 1;
    }
    else{
      return result.length;
    }
  }

  getDistanceFrom(){
    if(this.props.userState.Location != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
      let distance = haversine(this.props.userState.Location, this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates, {unit: 'km'});

      return distance;
    }

    return 0;
  }

  statusBarReset(){
    setTimeout(function(){
      StatusBar.setBarStyle("dark-content");
    }.bind(this),550);
  }

  sendMessage(){
    let { Message, messageTimeout } = this.state;

    if(this.props.chatState.CurrentChat == undefined || !this.props.chatState.CurrentChat.membersLoaded){
      return false;
    }

    let time = new Date().toISOString();
    let url = null;

    try{
      if(/(http|ftp|https|HTTP|HTTPS|Https|Http):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(Message)){
        url = Message.match(/(http|ftp|https|HTTP|HTTPS|Https|Http):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/);
        if(url.length > 0){
          url = url[0];
        }
      }
    }
    catch(error){
      console.log(error);
    }

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: Message,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      url:url
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, url, sent) VALUES (?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, url, false],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let MessageNotif = Message;
          let message = null;
          if(url != undefined){
            message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("resourceId", {}, this.props.userState.Resource), xml("url", {}, url), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          }
          else{
            message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("resourceId", {}, this.props.userState.Resource), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          }
          let response = this.props.clientState.Client.send(message);

          this.setState({Loading:false, Message: ""});
          this.props.dispatch({type:'END_LOADING', ChatId:  this.props.chatState.CurrentChat.id});
        }
      })
    });
  }

  getLocationMapObject(){
    let { latDelta, lonDelta, lon, lat, isParticipant, initialCoords } = this.state;

    if(isParticipant && !initialCoords && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
      return {
        latitude: Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude),
        longitude:Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude),
        latitudeDelta: this.state.latDelta,
        longitudeDelta: this.state.lonDelta
      }
    }
    else if(initialCoords){
      return {
        latitude: lat,
        longitude:lon,
        latitudeDelta: this.state.latDelta,
        longitudeDelta: this.state.lonDelta
      }
    }
    else{
      return {
          latitude: this.props.userState.Location != null ? Number(this.props.userState.Location.latitude) : 0,
          longitude:this.props.userState.Location != null ? Number(this.props.userState.Location.longitude) : 0,
          latitudeDelta: this.state.latDelta,
          longitudeDelta: this.state.lonDelta
      }
    }
  }

  endEmergencyAlert(){
    const { creator } = this.state;

    if(creator){
      Alert.alert(
       '¿Quieres terminar la alerta?',
       "El canal de emergencia permanecerá activo por 24 horas.",
       [
         {text: 'Terminar', onPress: () => this.endEmergency(), style: 'destructive'},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
     )
    }
    else{
      this.setState({dialogEnd:true});
    }
  }

  getOptionalComponent(){
    let { disableMessageSending, activeAlert, endPermission } = this.state;

    if(this.props.clientState.PermissionsEnabled){
      if(!disableMessageSending && activeAlert){
        return <Animated.View style={{position:'absolute', top:this.state.messagePosition, backgroundColor:'transparent', alignSelf:'center', padding:10}}>
                  <TouchableOpacity disabled={!endPermission || this.props.clientState.LoginLoading} onPress={() => this.endEmergencyAlert()} style={{borderRadius:50, paddingLeft:20, paddingRight:20, alignSelf:'center', padding:10, backgroundColor:endPermission ? 'black' : 'gray'}}>
                    <Text style={{color:'white', textAlign:'center'}}>Terminar Alerta</Text>
                  </TouchableOpacity>
                </Animated.View>
      }
      else{
        return <Animated.View style={{position:'absolute', borderRadius:10, top:this.state.messagePosition, backgroundColor:'rgba(211,211,211,0.5)', alignSelf:'center', padding:10}}>
                <Text style={{color:'black', textAlign:'center'}}>Área: {this.props.userState.AreaName != undefined ? this.props.userState.AreaName : "Desconocida."}</Text>
                <Text style={{color:'black', textAlign:'center', marginTop:5}}>{this.state.inCoverage ? "En Área de Cobertura 😀" : "Sin Cobertura 😔"}</Text>
              </Animated.View>
      }
    }
    else{
      return <Animated.View style={{position:'absolute', borderRadius:10, top:(height/2) - 25, backgroundColor:'rgba(211,211,211,0.5)', alignSelf:'center', padding:10}}>
              <Text style={{color:'black', textAlign:'center', fontWeight:'bold'}}>Los permisos requeridos para esta función no fueron habilitados.</Text>
              <Text style={{color:'black', textAlign:'center', marginTop:5, fontWeight:'bold'}}>Por favor, habilita la opción <Text style={{color:'red'}}>'Todo el Tiempo'</Text> en los permisos de ubicación.</Text>
            </Animated.View>
    }
  }

  closeModal(fromHeader){
    if(this.state.activeAlert){
      Keyboard.dismiss;
      this.props.navigation.popToTop();
      if(fromHeader){
        this.props.dispatch({type:"UPDATE_LAST_READ"});
      }

      clearInterval(intervalObject);
      clearInterval(coordinatesInterval);

      setTimeout(function(){
        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('UPDATE conversations SET last_time_read = ? WHERE JID = ?',
          [new Date().toISOString(), this.props.chatState.CurrentChat.id],
          (txt, results1) => {
            this.setState({openModal:false, alertMessage:"", alertValid:true});
            this.props.navigation.state.params.clearCurrent();
          });
        });
      }.bind(this),500);
    }
    else{
      Keyboard.dismiss;

      this.props.navigation.popToTop();

      setTimeout(function(){
        this.setState({openModal:false, alertMessage:"", alertValid:true});
      }.bind(this),500);
    }
  }

  getTopComponent(){
    let { createAlertConfirmation, activeAlert, type, alertType, alertMessage, disableMessageSending, endPermission, backgroundColor, isParticipant, globalLoading, checkStartDate, emergencyTitleText } = this.state;

    if(!activeAlert){
      return <View />
    }
    else if(!isParticipant){
      return <View style={{padding:10, paddingBottom:0, width:width,backgroundColor:'transparent', position:'absolute', justifyContent:'flex-end'}}>
                <TouchableOpacity style={{backgroundColor:'transparent', height:30, marginTop:10,width:60,justifyContent:'flex-start', alignSelf:'flex-start'}}
                onPress={() => {
                  this.closeModal(true);
                }}>
                <Ionicon name="ios-arrow-back" color={"#7D9D78"} size={28}/>
                </TouchableOpacity>
            </View>
      }
      else if(activeAlert && !disableMessageSending){
        if(endPermission){
          return <View style={{padding:10, paddingBottom:0, width:width,backgroundColor:'transparent', position:'absolute', justifyContent:'flex-end'}}>
                    <View style={{flexDirection:'row', flex:1}}>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', justifyContent:'flex-end'}}>
                    <TouchableOpacity style={{backgroundColor:'transparent', height:30, marginTop:10, width:60,justifyContent:'flex-start', alignSelf:'flex-start'}}
                    onPress={() => {
                      this.closeModal(true);
                    }}>
                    <Ionicon name="ios-arrow-back" color={"#7D9D78"} size={28}/>
                    </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', right:-10}}>
                    </View>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent'}}>
                    </View>
                    </View>
                    <ButtonAlt disabled={this.props.clientState.LoginLoading || (checkStartDate ? this.enableEndAlertButton() : false)} title="Terminar Alerta" borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{padding:10,backgroundColor:this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined ? backgroundColor : 'red', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
                     style={{alignSelf:'center'}} onPress={() => this.endEmergencyAlert()}/>
                     <Text style={{textAlign:'center', fontSize:14, marginTop:5, color:backgroundColor, fontWeight:'700'}}>ALERTA ACTIVA</Text>
                </View>
        }
        else{
          return <View style={{padding:10, paddingBottom:0, width:width,backgroundColor:'transparent', position:'absolute', justifyContent:'flex-end'}}>
                    <View style={{flexDirection:'row', flex:1}}>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', justifyContent:'flex-end'}}>
                    <TouchableOpacity style={{backgroundColor:'transparent', marginTop:10, height:30,width:60,justifyContent:'flex-start', alignSelf:'flex-start'}}
                    onPress={() => {
                      this.closeModal(true);
                    }}>
                    <Ionicon name="ios-arrow-back" color={"#7D9D78"} size={28}/>
                    </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', right:-10}}>
                    </View>
                    <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', right:-10}}>
                    </View>
                    </View>
                    <ButtonAlt loading={globalLoading} title={this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined ? (this.props.chatState.CurrentChat.emergencyInformation.type === "Suspicious" ? "Ver Reporte" :  (this.props.chatState.CurrentChat.emergencyInformation.type === "Feminist" ? "Alerta Mujeres" : (emergencyTitleText == "ALERTA VECINAL" ? "Alerta Vecinal" : "Alerta Seguridad"))) : ""} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{padding:10,backgroundColor:this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined ? backgroundColor : 'red', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
                     style={{alignSelf:'center'}}/>
                     <Text style={{textAlign:'center', fontSize:14, marginTop:5, color:backgroundColor, fontWeight:'700'}}>ALERTA ACTIVA</Text>
                </View>
        }
      }
      else if(disableMessageSending){
        return  <View style={{padding:10, paddingBottom:0, width:width,backgroundColor:'transparent', position:'absolute', justifyContent:'flex-end'}}>
                  <View style={{flexDirection:'row', flex:1}}>
                  <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', justifyContent:'flex-end'}}>
                  <TouchableOpacity style={{backgroundColor:'transparent', marginTop:10, height:30,width:60,justifyContent:'flex-start', alignSelf:'flex-start'}}
                  onPress={() => {
                    this.closeModal(true);
                  }}>
                  <Ionicon name="ios-arrow-back" color={"#7D9D78"} size={28}/>
                  </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', right:-10}}>
                  </View>
                  <View style={{flexDirection:'column',flex:.5, backgroundColor:'transparent', right:-10}}>
                  </View>
                  </View>
                  <ButtonAlt onPress={() => this.endedAlert()} loading={globalLoading} title={this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined ? (this.props.chatState.CurrentChat.emergencyInformation.type === "Suspicious" ? "Ver Reporte" :  (this.props.chatState.CurrentChat.emergencyInformation.type === "Feminist" ? "Alerta Mujeres" : (emergencyTitleText == "ALERTA VECINAL" ? "Alerta Vecinal" : "Alerta Seguridad"))) : ""} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{padding:10,backgroundColor:this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined ? backgroundColor : 'red', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
                   style={{alignSelf:'center'}}/>
                   {type != "Suspicious" ?
                    <View>
                      <Text style={{color:'black', textAlign:'center', fontSize:12, marginTop:5}}>"Alerta Finalizada"</Text>
                      <Text style={{color:'black', textAlign:'center', fontSize:11, marginTop:3}}>Canal activo durante 24 hrs.</Text>
                    </View>
                    :
                    <View style={{marginBottom:3}} />
                    }
              </View>
      }
  }

  enableEndAlertButton(){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.startedOn != undefined){
      let alertDate = new Date(this.props.chatState.CurrentChat.emergencyInformation.startedOn);
      let diff = new Date().getTime() - alertDate;
      diff = diff/1000;
      if(diff > 30){
        this.setState({checkStartDate:false});
        return false;
      }
      else{
        return true;
      }
    }
    else{
      return false;
    }
  }

  endedAlert(){
    if(this.state.type == "Suspicious"){
      if(this.state.alertInitialMessage != undefined){
        this.setState({suspiciousReportModal:true});
      }
    }
  }

  goBack(){
    Keyboard.dismiss;
    this.props.navigation.pop();

    if(intervalObject != undefined){
      clearInterval(intervalObject);
      clearInterval(coordinatesInterval);
    }

    setTimeout(function(){
      this.setState({openModal:false, alertMessage:"", alertValid:true});
      if(this.state.activeAlert){
        this.props.navigation.state.params.clearCurrent();
      }
    }.bind(this),500);
  }

  createAlert(model){
    this.setState({alertType:model.alertType, uploading:true, reportText:model.alertMessage, alertImage:model.alertImage});
    setTimeout(function(){
      this.createPublicAlarm();
    }.bind(this),500);
  }

  joinEmergencyChannelDialog(){
    Alert.alert(
     'Atención',
     "Revelaremos tu identidad para que puedas participar.",
     [
       {text: 'De acuerdo', onPress: () => { this.joinEmergencyChannel() }, style: 'cancel'},
       {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'destructive'},
     ],
     { cancelable: false }
    )
  }

  joinEmergencyChannel(){
    let { alertId } = this.state;

    if(alertId != undefined){
      this.setState({joining:true});

      let joinModel;

      if(this.props.userState.CurrentPoint.length > 0){
        joinModel = {
         alertId: alertId,
         beaconId: this.props.userState.CurrentPoint[0].id
       };
      }
      else{
        joinModel = {
         alertId: alertId
       };
      }

      EndpointRequests.JoinEmergencyChannel(joinModel, function(responseData) {
        if(responseData.message === "Ok"){
          this.setState({isParticipant:true, joining:false,contentContainerMap:new Animated.Value(height/2), initialCoords:false});
          this.getMembersInfo();
          this.sendJoinMessage();
        }
        else{
          this.setState({joining:false});

          Alert.alert(
           'Atención',
           responseData.message,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             {text: 'Borrar', onPress: () => {this.deleteGroup();}, style: 'destructive'},
           ],
           { cancelable: false }
          )
        }
      }.bind(this));
    }
    else{
      Alert.alert(
       'Atención',
       'Hubo un error en la peticion, intentalo de nuevo.',
       [
         {text: 'Borrar Alerta', onPress: () => {this.deleteGroup();}, style: 'destructive'},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'}
       ],
       { cancelable: false }
      )
    }
  }

  sendJoinMessage(){
    let time = new Date().toISOString();

    let Message = "El usuario " + this.props.userState.UserData.alias + " se ha unido al canal como participante.";

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: Message,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isSystemMsg:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isSystemMsg) VALUES (?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, true],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let messageXMPP = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Joined"), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          let response = this.props.clientState.Client.send(messageXMPP);
          this.setState({Loading:false, isParticipant:true, joining:false});
        }
      })
    });
  }

  openSheetOptions(mode, message, url){
    if(mode === "Copy"){
      this.setState({mode:"Copy", chosenMsg:message});
      Options = ['Cancelar', 'Copiar texto'];
      this.ActionSheetMsg.show();
    }
    else if(mode === "Maps"){
      this.setState({mode:"Maps", chosenMsg:message, url:url});
      Options = ['Cancelar', 'Copiar texto', "Abrir Mapa"];
      this.ActionSheetMsg.show();
    }
    else{
      this.setState({mode:"URL", chosenMsg:message, url:url});
      Options = ['Cancelar', 'Copiar texto', "Abrir URL"];
      this.ActionSheetMsg.show();
    }
  }

  //upload content (images/videos)
  fileUploadOptions(){
    if(Platform.OS === 'android'){
      this.ActionSheet.show();
      return false;
    }

    ActionSheetIOS.showActionSheetWithOptions({
     title:"Opciones de Contenido",
        options: ['Cancelar', 'Elegir foto de galería', 'Tomar foto', 'Elegir video', 'Tomar video'],
        cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex === 1) {
        this.loadPictures();
      }
     else if(buttonIndex === 2){
       this.takePicture();
     }
     else if(buttonIndex === 3){
       this.loadVideos();
     }
     else if(buttonIndex === 4){
       this.takeVideo();
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
         this.setState({picture:pic, fileUploadModal:true, padHeight:0});
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

  loadVideos(){
  ImagePicker.openPicker({
    multiple: false,
    width: width/1.5,
    height: height/1.5,
    compressImageMaxWidth: 2000,
    compressImageMaxHeight: 3000,
    mediaType:'video',
  }).then(video => {

    if(video != null){
      let filename = video.path.substring(video.path.lastIndexOf('/')+1);

      var pic = {uri:video.path,width:video.width,source:video.sourceURL != null ? video.sourceURL : video.path,height:video.height,mime:video.mime, isVideo:true, filename:filename};

      createThumbnail({
         url: video.path,
         timeStamp: 10000,
       })
       .then(response => {
         if(response != null && response.path != null){
           this.setState({videoThumbnail:response.path});
         }
       })
       .catch(err => console.log({ err }));

      setTimeout(function(){
        this.setState({picture:pic, fileUploadModal:true});
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

 takeVideo(){
   ImagePicker.openCamera({
     width: width/1.5,
     height: height/1.5,
     mediaType: 'video'
   }).then(video => {
    if(video != null){
      let filename = video.path.substring(video.path.lastIndexOf('/')+1);;

      var pic = {uri:video.path,width:video.width,source:video.path,height:video.height,mime:video.mime, isVideo:true, filename:filename};

      createThumbnail({
         url: video.path,
         timeStamp: 10000,
       })
       .then(response => {
         if(response != null && response.path != null){
           this.setState({videoThumbnail:response.path});
         }
       })
       .catch(err => console.log({ err }));

      setTimeout(function(){
        this.setState({picture:pic, fileUploadModal:true});
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
        this.setState({picture:pic, fileUploadModal:true });
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

 sendFileMessage(url, optionalMessage, fileType, fileName, thumbnail){
   let time = new Date().toISOString();

   let messageBody = {
     id: id(),
     chat_id: this.props.chatState.CurrentChat.id,
     timestamp: time,
     text: optionalMessage,
     time: new Date(time).getTime(),
     message_by: this.props.chatState.CurrentChat.nickname,
     username: this.props.userState.Nickname,
     state: "Pending",
     read_by:[this.props.userState.Nickname],
     read_by_count:0,
     user:this.props.userState.UserData,
     pending:true,
     isImage:fileType === "image",
     isMedia:true,
     isVideo:fileType === "video",
     isFile:fileType === "file",
     url:url,
     fileName:fileName,
     thumbnail:thumbnail != undefined ? thumbnail : ""
   };

   if(optionalMessage == undefined || /\S/.test(optionalMessage) == false){
     if(messageBody.isVideo){
       optionalMessage = "Video";
     }
     else if(messageBody.isImage){
       optionalMessage = "Foto";
     }
     else{
       optionalMessage = ".";
     }
     messageBody.text = optionalMessage;
   }

   this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

   this.props.clientState.DB.transaction((tx) => {
     tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename, thumbnail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
     [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, true, messageBody.isImage, messageBody.isVideo, messageBody.isFile, url, fileName, messageBody.thumbnail],
     (txt, results1) => {
       if (results1.rowsAffected > 0 ) {
         let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, optionalMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "multimedia"), xml("fileType", {}, fileType), xml("url", {}, url), xml("filename", {}, fileName), xml("thumbnail", {}, messageBody.thumbnail), xml("request", {xmlns:"urn:xmpp:receipts"}));
         let response = this.props.clientState.Client.send(message);

         if(this.state.messageTimeout) clearTimeout(this.msgTimeout);
         this.msgTimeout = setTimeout(() => {
           this.props.chatState.CheckPending();
         }, 5000);
       }
     })
   });
 }

 uploadFile(optionalText){
   let { picture, videoThumbnail } = this.state;

   this.setState({loadingUpload:true});

   let url;
   let fileType;
   let preset;
   let fileName;

   if(picture.isVideo){
     url = APP_INFO.UPLOAD_URL + "/video/upload";
     fileType = "video";
     preset = APP_INFO.VIDEO_PRESET;
     let thumbname = picture.filename.substring(picture.filename.lastIndexOf('/')+1);
     let publicid = thumbname.split(".");
     fileName = publicid[0];
   }
   else if(picture.isFile){
     url = "https://api.cloudinary.com/v1_1/testrobinsapp/raw/upload";
     fileType = "file";
     preset = "qsl9mgxs";
   }
   else{
     url = APP_INFO.UPLOAD_URL + "/image/upload";
     fileType = "image";
     preset = APP_INFO.PICTURE_PRESET;
   }

   let pathUrl = picture.uri.replace('file://', '');

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

   if(fileType === 'video'){
     var data = new FormData();

     data.append('file',{
       uri:videoThumbnail,
       type:"image/jpeg",
       name:fileName + ".jpeg"
     });

     data.append('upload_preset', APP_INFO.THUMBNAIL_PRESET);
     data.append('public_id', fileName);

     EndpointRequests.UploadThumbnail(data, function(responseData){
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
             this.setState({loadingUpload:false, progressUpload:0, uploadingThumb:true});
           }.bind(this),200);
         })
         Upload.addListener('cancelled', uploadId, (data) => {
           setTimeout(function(){
             this.setState({loadingUpload:false, progressUpload:0, uploadingThumb:true});
           }.bind(this),200);
         })
         Upload.addListener('completed', uploadId, (data) => {
           let response = JSON.parse(data.responseBody);

           if(response.secure_url != null){
             this.setState({fileUploadModal:false});

             setTimeout(function(){
               this.setState({fileUrl:response.secure_url, picture:null, progressUpload:0, loadingUpload:false, videoThumbnail:null, uploadingThumb:true});
               this.sendFileMessage(response.secure_url, optionalText, fileType, picture.filename, responseData.secure_url)
             }.bind(this),250);
           }
           else{
             if(response.error != undefined){
               Alert.alert(
                'Error',
                response.error,
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
     }.bind(this));
   }
   else{
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
           this.setState({loadingUpload:false, progressUpload:0, uploadingThumb:true});
         }.bind(this),200);
       })
       Upload.addListener('cancelled', uploadId, (data) => {
         setTimeout(function(){
           this.setState({loadingUpload:false, progressUpload:0, uploadingThumb:true});
         }.bind(this),200);
       })
       Upload.addListener('completed', uploadId, (data) => {
         let response = JSON.parse(data.responseBody);

         if(response.secure_url != null){
           this.setState({fileUploadModal:false});

           setTimeout(function(){
             this.setState({fileUrl:response.secure_url, progressUpload:0, picture:null, loadingUpload:false, videoThumbnail:null, uploadingThumb:true});
             this.sendFileMessage(response.secure_url, optionalText, fileType, picture.filename)
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
 }
 showImageModal(image){
   image.source = image.url;
   this.setState({picture:image, showImage:true, fileUploadModal:true, progressUpload:0 });
 }
 //multimedia content end
 moveMap(){
   let { isParticipant, disableMessageSending } = this.state;
   if(isParticipant){
     if(this.mapView != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
       this.setState({movingMap:true});
       let newRegion = null;
       if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates != undefined){
         newRegion = this.getRegionObjectMultiplePoints([this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates, this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates]);
       }
       else{
         newRegion = {
            latitude: Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude),
            longitude:Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude),
            latitudeDelta: this.state.latDelta,
            longitudeDelta: this.state.lonDelta
         };
      }
      this.mapView.animateToRegion(newRegion, 300);
     }
   }
 }

 getInitialRegion(isAlert, isParticipant,disableMessageSending){
   if(isAlert && isParticipant && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
     if(this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates != undefined){
        let newRegion = this.setRegionMultiplePoints([this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates, this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.latestCoordinates]);
        return newRegion;
    }
    else{
       let newRegion = new AnimatedRegion({
          latitude: Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude),
          longitude:Number(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude),
          latitudeDelta: this.state.latDelta,
          longitudeDelta: this.state.lonDelta
       });
       return newRegion;
    }
   }
   else{
     let newRegion = {
       latitude: this.props.userState.Location != null ? this.props.userState.Location.latitude : 20.693918,
       longitude: this.props.userState.Location != null ? this.props.userState.Location.longitude : -100.452809,
       latitudeDelta: this.state.latDelta,
       longitudeDelta: this.state.lonDelta
     };
     return newRegion;
   }
 }

 getParticipateButton(type){
   let { activeAlert, disableMessageSending, isLoading } = this.state;
   //responseType == 1 is medical
   if(type == "Medical" && this.props.userState.UserData.isSupport && this.props.userState.UserData.responseType == 1){
     if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant.assignedTo != this.props.userState.Nickname){
       return <View style={{flex:1,width:width,height:100,top:height-100, position:'absolute', backgroundColor:'transparent'}}>
               <ButtonAlt title={disableMessageSending ? "Borrar" : "Participar"} loading={this.state.joining} disabled={this.state.joining || isLoading} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{width:150, padding:10,backgroundColor: disableMessageSending ? "red" : "#7D9E78", borderRadius:25, alignSelf:'center'}}
                onPress={() => { disableMessageSending ? this.deleteGroup() :  this.joinEmergencyChannel() }}style={{alignSelf:'center'}}/>
               </View>
     }
     else{
       return <View style={{flex:1,width:width,height:100,top:height-100, position:'absolute', backgroundColor:'transparent'}}>
               <ButtonAlt title={disableMessageSending ? "Emergencia terminada" : "Atender Emergencia"} loading={this.state.joining} disabled={this.state.joining || isLoading} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{padding:10,backgroundColor: disableMessageSending ? "red" : "#0C479D", borderRadius:25, alignSelf:'center'}}
                onPress={() => { disableMessageSending ? this.deleteGroup() :  this.attendEmergency() }}style={{alignSelf:'center'}}/>
               </View>
     }
   }
   else{
     return <View style={{flex:1,width:width,height:100,top:height-100, position:'absolute', backgroundColor:'transparent'}}>
             <ButtonAlt title={disableMessageSending ? "Borrar" : "Participar"} loading={this.state.joining} disabled={this.state.joining || isLoading} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{width:150, padding:10,backgroundColor: disableMessageSending ? "red" : "#7D9E78", borderRadius:25, alignSelf:'center'}}
              onPress={() => { disableMessageSending ? this.deleteGroup() :  this.joinEmergencyChannel() }}style={{alignSelf:'center'}}/>
             </View>
   }
 }

 attendEmergency(){
   let { alertId } = this.state;

   this.setState({joining:true});

   let attendModel = {
     Latitude: this.props.userState.Location.latitude,
     Longitude: this.props.userState.Location.longitude,
     AlertId: alertId,
     Neighborhood:this.props.userState.AreaCode
   };

   EndpointRequests.AttendEmergency(attendModel, (response) => {
     if(response.ok){
       Alert.alert(
        'Exito!',
        response.message,
        [
          {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: false }
      )
      this.setState({isParticipant:true, joining:false,contentContainerMap:new Animated.Value(height/2), initialCoords:false});
      AsyncStorage.setItem("AttendingAlert", this.props.chatState.CurrentChat.id, (asyncError) => { console.log(asyncError);})
      let stringCoordinates = "(" + this.props.userState.Location.latitude + "," + this.props.userState.Location.longitude + ") ? " + this.props.chatState.CurrentChat.id;
      let updateMessage = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, "~LocationUpdate." + stringCoordinates), xml("EmergencyId", {}, alertId), xml("EmergencyType", {}, "Medical"), xml("type", {}, "Emergency"), xml("emergencyAction", {}, "AttendEmergency"), xml("request", {xmlns:"urn:xmpp:receipts"}));
      let updateResponse = this.props.clientState.Client.send(updateMessage);
     }
     else if(response.assigned){
       this.setState({joining:false});
       Alert.alert(
        '¡Atención!',
        response.message,
        [
          {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: false }
       )
     }
     else if(response.error){
       this.setState({joining:false});
       Alert.alert(
        '¡Atención!',
        response.message,
        [
          {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: false }
       )
     }
   })
 }

 getMiddleComponent(){
   let { isParticipant, emergencyAttendant, contentEmergencyMargin } = this.state;

   if(isParticipant && emergencyAttendant != undefined && emergencyAttendant.responseElementName != undefined){
     return  <Animated.View style={{position:'absolute', top:contentEmergencyMargin, alignSelf:'center', justifyContent:'center', height:60, width:width/1.75, borderRadius:50, backgroundColor:'white', shadowColor: "#000",shadowOffset: {width: 1,height: 3,},shadowOpacity: 0.2,shadowRadius: 2.65,elevation: 15}}>
               <Image style={{top:-20,alignSelf:'center', height:40,width:40, borderRadius:20, backgroundColor:'white'}} resizeMode="cover" source={{uri:emergencyAttendant.responseElementPic}} />
               <View style={{top:-15, paddingLeft:10,paddingRight:10}}>
                <Text numberOfLines={1} style={{color:'black', textAlign:'center',fontSize:10}}><Text style={{fontWeight:'500'}}>Asiste:</Text> {emergencyAttendant.responseElementName}</Text>
                <Text numberOfLines={1} style={{color:'black', textAlign:'center',fontSize:10, marginTop:2}}><Text style={{fontWeight:'500'}}>Organización:</Text> {emergencyAttendant.organizationName}</Text>
               </View>
             </Animated.View>
   }
   else{
     return null;
   }
 }

 getIconEmergency(type){
   if(type == "Emergency"){
     if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.name != undefined && this.props.chatState.CurrentChat.name.includes("-")){
       return BARRA_VECINAL;
     }
     else{
       return BARRA_PERSONAL;
     }
   }
   else if(type == "Medical"){
     return BARRA_MEDICAL;
   }
   else if(type == "Feminist"){
     return BARRA_FEMINISTA;
   }
   else{
     return BARRA_PERSONAL;
   }
 }

 getTopIconEmergency(type){
    (type == "Medical" ? MEDICA : (type == "Fire" ? INCENDIO : (type == "Feminist" ? FEMINISTA : SEGURIDAD)))
   if(type == "Emergency"){
     if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.name != undefined && this.props.chatState.CurrentChat.name.includes("-")){
       return VECINAL;
     }
     else{
       return SEGURIDAD;
     }
   }
   else if(type == "Medical"){
     return MEDICA;
   }
   else if(type == "Fire"){
     return INCENDIO;
   }
   else if(type == "Feminist"){
     return FEMINISTA;
   }
   else{
     return SEGURIDAD;
   }
 }

 getIconPictureEmergency(){
   let { historyData } = this.state;

   if(historyData != undefined && historyData.creatorPicture != undefined){
     return {uri: historyData.creatorPicture};
   }
   else{
     return empty_thumbnail;
   }
 }

  render(){
    let { movingMap, activeAlert, responseElementCoordinate, emergencyCoordinate, loadingAlert, emergencyAttendant, disableMessageSending, backgroundColor, type, historyData, centerPosition, isParticipant, isLoading, distanceFrom, contentContainerVisible, emergencyTitleText } = this.state;

    return (
      <ScrollView keyboardShouldPersistTaps={'always'} style={{
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'column'}}>
        <StatusBar backgroundColor={backgroundColor} barStyle={'dark-content'} />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: 'white'}}
          enabled={true}>
          <SafeAreaView style={{flex: 1}}>
          <View style={{height:height - 5, width:width, padding:0,borderRadius:0, backgroundColor:"transparent"}}>
          <AnimatedMap userLocationAnnotationTitle="Mi ubicación" showsUserLocation={true} showsMyLocationButton={false}
            mapPadding={{
            top: 0,
            right: 0,
            left: 0,
            bottom:0
            }}
            style={{width: width, height: this.state.contentContainerMap, marginTop:activeAlert ? (!isParticipant ? height/2 : 0) : 0, alignSelf:'center'}} initialRegion={this.getInitialRegion(activeAlert,isParticipant,disableMessageSending)}
            ref={ref => { this.mapView= ref; }}
            onRegionChangeComplete={(values) => { this.setCustomDelta(values.latitudeDelta, values.longitudeDelta, values)} }>
              {
                /*
                isParticipant && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.emergencyInformation != undefined ?
                (this.props.chatState.CurrentChat.emergencyInformation.locationList.length > 0 ?
                  <MapView.Polyline
                    key={"polyline"}
                    strokeWidth={2}
                    coordinates={this.props.chatState.CurrentChat.emergencyInformation.locationList} />
                  :
                  null
                )
                :
                null
                */
              }
              {
                isParticipant && this.props.chatState.CurrentChat != undefined  && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.emergencyInformation != undefined ?
                (this.props.chatState.CurrentChat.emergencyInformation.emergencyAttendant != undefined && responseElementCoordinate != undefined ?
                  <Marker.Animated
                    key={"emergencyAttendant"}
                    ref={marker => {
                      this.responseMarker = marker;
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={responseElementCoordinate}
                    title={"Ultima posición"}>
                    <Image
                      source={ambulance}
                      style={{ width: 35, height: 35 }}
                      />
                  </Marker.Animated>
                  :
                  null
                )
                :
                null
              }
              {
                isParticipant && this.props.chatState.CurrentChat != undefined  && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.emergencyInformation != undefined ?
                (emergencyCoordinate != undefined ?
                  <Marker.Animated
                    tracksViewChanges={true}
                    identifier={"userLatest"}
                    id={"userLatest"}
                    ref={marker => {
                      this.emergencyMarker = marker;
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={emergencyCoordinate}
                    title={"Ultima posición"}>
                    <Image
                      resizeMode={"contain"}
                      source={type === "Emergency" ? (emergencyTitleText == "ALERTA VECINAL" ? vecinalPin : emergencyPin) : (type === "Medical" ? medicalPin :  (type === "Suspicious" ? suspiciousPin : (type === "Feminist" ? feministPin : firePin)))}
                      style={{ width: 50, height: 50 }}
                      />
                  </Marker.Animated>
                  :
                  null
                )
                :
                null
              }
            </AnimatedMap>
            {activeAlert && (this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation == undefined || this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates == undefined) ?
              <Animated.View style={{position:'absolute', backgroundColor:'lightblue',justifyContent:'center', width: width, height: this.state.contentContainerMap, marginTop:!isParticipant ? height/2 : 0}}>
                <ActivityIndicator size="large" color="gray" style={{alignSelf:'center'}}/>
              </Animated.View>
              :
              null
            }
          {isParticipant || !activeAlert ? null :
            <View style={{position:'absolute',height:height/2, width:width, paddingTop:iPhoneX ? HeaderHeight - 20 : HeaderHeight - 10, backgroundColor:"white", paddingBottom:10 }}>
            <Image source={type != null ? this.getIconEmergency(type) : require('../../../assets/image/Empty.png')} style={{height:(width/3.5)/2, width:(width/3.5)/2, alignSelf:'center', top:type == "Medical" ? 0 : -3}} resizeMode="contain" />
            <View style={{justifyContent:iPhoneX ? null : 'space-around',height:(height/2) - ((iPhoneX ? HeaderHeight - 20 : HeaderHeight) + 70), backgroundColor:"transparent", paddingTop:iPhoneX ? 0 : 10}}>
            <View style={{top:height < 600 ? -20: 0}}>
            <Text numberOfLines={1} style={{fontSize:18, color:disableMessageSending ? (type == "Feminist" ? this.state.titleTextColor :  "#7d9f78")  : backgroundColor, textAlign:'center', fontWeight:'bold', marginBottom:height < 600 ? 0 : 5, paddingLeft:10, paddingRight:10}}>{this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.name != undefined ? this.props.chatState.CurrentChat.name.toUpperCase() : "Alerta"}</Text>
            <Text numberOfLines={1} style={{fontSize:16, color:"black", textAlign:'center', fontWeight:'bold', marginBottom:height < 600 ? 0 : 5, paddingLeft:10, paddingRight:10}}>{disableMessageSending ? '"Finalizada"' : '"ACTIVA"'}</Text>
            <View style={{marginTop:height < 600 ? 0 : 10,flexDirection:'row',height:80, width:(width/2.75)*2, backgroundColor:disableMessageSending ? (type == "Feminist" ? this.state.textBackgroundColor :  "#7d9f78") : (type == "Feminist" ? this.state.textBackgroundColor : backgroundColor), borderRadius:10, alignSelf:'center', padding:5}}>
              <View style={{flex:.30, justifyContent:'center'}}>
                <Image source={this.getIconPictureEmergency()} resizeMode="cover" style={{height:60, width:60, borderRadius:30, alignSelf:'center', backgroundColor:"transparent"}} />
              </View>
              <View style={{flex:.70, justifyContent:'center'}}>
              <Text style={{fontSize:13, color:'white', marginBottom:5, fontWeight:'bold'}}>Información del detonador</Text>
              <Text style={{fontSize:11, color:'white', fontWeight:'bold'}}>Usuario: <Text style={{fontSize:11, color:'white',fontWeight:'normal'}}>{historyData != undefined ? historyData.creatorName : ""}</Text></Text>
              <Text style={{fontSize:11, color:'white', fontWeight:'bold'}}>Género: <Text style={{fontSize:11, color:'white',fontWeight:'normal'}}>{historyData != undefined ? historyData.creatorGender : ""}</Text></Text>
              <Text style={{fontSize:11, color:'white', fontWeight:'bold'}}>Edad: <Text style={{fontSize:11, color:'white',fontWeight:'normal'}}>{historyData != undefined ? historyData.creatorAge : ""}</Text></Text>
              </View>
            </View>
            </View>
            <View style={{marginTop:30,width:width, height:(height/2)/4}}>
              <View style={{width:width, height:(height/2)/4, justifyContent:'center', flexDirection:'row', flex:1}}>
                <View style={{flex:.4, alignItems:'center', height:(height/2)/4, backgroundColor:'white', justifyContent:'center'}}>
                  <View style={{width:(width*.4)/2, height:(height/2)/4, backgroundColor:'white', alignSelf:'flex-end', justifyContent:'center'}}>
                  <Image source={PIN_LOCATION_EMERGENCY} resizeMode="contain" style={{height:40, width:(width*.4)/2, alignSelf:'center'}}/>
                  <Text style={{fontWeight:'bold', marginTop:5, textAlign:'center',color: disableMessageSending ? "#A9A9A9" : 'black'}}>{parseInt(distanceFrom)} km</Text>
                  <Text numberOfLines={2} style={{fontSize:10, textAlign:'center', marginLeft:10,marginRight:10,color: disableMessageSending ? "#A9A9A9" : 'black'}}>A distancia de ti</Text>
                  </View>
                </View>
                <View style={{flex:.2, alignItems:'center', height:(height/2)/4, backgroundColor:'white', justifyContent:'center'}}>
                  <Image source={NOTIFIED_EMERGENCY} resizeMode="contain" style={{height:40,alignSelf:'center'}}/>
                  <Text style={{fontWeight:'bold', marginTop:5, textAlign:'right',color: disableMessageSending ? "#A9A9A9" : 'black'}}>{this.props.chatState.CurrentChat != undefined ? this.getMemberCount() : ""}</Text>
                  <Text numberOfLines={2} style={{fontSize:10, textAlign:'center',marginLeft:5,marginRight:5,color: disableMessageSending ? "#A9A9A9" : 'black'}}>Usuarios notificados</Text>
                </View>
                <View style={{flex:.4, alignItems:'center', height:(height/2)/4, backgroundColor:'white', justifyContent:'center'}}>
                  <View style={{width:(width*.4)/2, height:(height/2)/4, backgroundColor:'white', alignSelf:'flex-start', justifyContent:'center'}}>
                  <Image source={PARTICIPANTS_EMERGENCY} resizeMode="contain" style={{height:40,alignSelf:'center'}}/>
                  <Text style={{fontWeight:'bold', marginTop:5, textAlign:'center',color: disableMessageSending ? "#A9A9A9" : 'black'}}>{this.props.chatState.CurrentChat != undefined ? this.state.participantCount : ""}</Text>
                  <Text numberOfLines={2} style={{fontSize:10, textAlign:'center',marginLeft:5,marginRight:5,color: disableMessageSending ? "#A9A9A9" : 'black'}}>Usuarios participando</Text>
                  </View>
                </View>
              </View>
            </View>
            </View>
          </View>
          }
          {this.getTopComponent()}
          {this.getMiddleComponent()}
          {isParticipant ?
          <Animated.View style={{height:isParticipant ? this.state.contentContainerHeight : (height/2.875) * 2, width:width, position:'absolute', flex:1,justifyContent:'flex-end', top:isParticipant ? (this.state.contentContainerMargin) : height/3.25}}>
            {this.getAlertComponent()}
          </Animated.View>
          :
          (activeAlert ?
            this.getParticipateButton(type)
            :
            null
          )
          }
        </View>
        </SafeAreaView>
        </KeyboardAvoidingView>
        <Toast ref="locationToast" positionValue={120} style={{backgroundColor:'black'}}/>
        <AlertModal UserData={this.props.userState.UserData} officialChannel={this.state.channelId != undefined} alertType={this.state.alertType} changeState={() => this.setState({loadingAlert:!this.state.loadingAlert})} inCoverage={this.props.userState.CurrentPoint.length > 0} medicalEnabled={this.props.userState.MedicalEnabled} goBack={() => this.goBack()} loading={this.state.loadingAlert} startAlert={(model) => this.createAlert(model)} confirmAlert={this.state.showAlertModal} closeModal={() => this.setState({showAlertModal:false})} />
        <SuccessModal type={this.state.type} successAlert={this.state.showSuccessModal} closeSuccessModal={() => this.setState({showSuccessModal:false})}/>
        <FileUploadModal showImage={this.state.showImage} progress={this.state.progressUpload} picture={this.state.picture} uploadFile={this.state.fileUploadModal} loading={this.state.loadingUpload} startUpload={(optionalText) => this.uploadFile(optionalText)} closeModal={() => this.setState({fileUploadModal:false, picture:null,showImage:false,progressUpload:0})} />
        <DialogAlert visible={this.state.dialogEnd} cancel={() => this.setState({dialogEnd:false})} endAlert={(reason) => this.endEmergency(reason)} />
        <ActionSheet
        ref={o => this.ActionSheet = o}
        title={'Opciones de contenido'}
        options={['Cancelar', 'Elegir foto de Galeria', 'Tomar Foto', 'Elegir Video', 'Tomar Video']}
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
         else if(index === 3){
           this.loadVideos();
         }
         else if(index === 4){
           this.takeVideo();
         }
        }}
      />
        <ActionSheet
        ref={o => this.ActionSheetMsg = o}
        title={'Opciones de Mensaje'}
        options={Options}
        cancelButtonIndex={0}
        onPress={(index) => {
          if(index === 0){
            this.setState({chosenMsg:null, url:null});
          }
          else if (index === 1) {
            setTimeout(function(){
              this.copyMessage(this.state.chosenMsg);
            }.bind(this),500);
          }
          else if (index === 2){
            setTimeout(function(){
              if(this.state.url != undefined){
                Linking.openURL(this.state.url);
              }
            }.bind(this),500);
          }
        }}
      />
      <SuspiciousReport startDate={this.state.historyData != undefined ? (this.state.historyData.alertMessageObject != undefined ? this.state.historyData.alertMessageObject.time : this.state.historyData.startedOn) : undefined} location={this.state.historyData != undefined ? this.state.historyData.latestCoordinates : null} attachedImage={this.state.alertAttachedPicture} closeReportModal={() => this.setState({suspiciousReportModal:false})} reportModal={this.state.suspiciousReportModal} alertText={this.state.alertInitialMessage}/>
        </ScrollView>
          )
        }
      }

      let PublicAlertNewContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(PublicAlertNew);
      export default PublicAlertNewContainer;
