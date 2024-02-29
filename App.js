/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  AsyncStorage,
  Alert,
  AppState,
  Linking,
  Platform,
  BackHandler,
  NativeModules
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Analytics from 'appcenter-analytics';
import RNExitApp from 'react-native-exit-app';
import { WebView } from 'react-native-webview';
import {check, PERMISSIONS, RESULTS, checkNotifications, request, requestNotifications} from 'react-native-permissions';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import Navigator from './src/routes/NavigationStack';
import { NavigationContainer } from '@react-navigation/native';
import NavigationService from './NavigationService';
import { URL_SERVER, APP_INFO } from './src/util/constants';
import { createAppContainer } from 'react-navigation';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const cloneDeep = require('lodash/cloneDeep');
import Toast, {DURATION} from 'react-native-easy-toast';
import Notification from 'react-native-android-local-notification';

import setupVcard from "@xmpp-plugins/vcard"
var SQLite = require('react-native-sqlite-storage')
import NetInfo from "@react-native-community/netinfo";
import Geolocation from '@react-native-community/geolocation';
var Sound = require('react-native-sound');
import LocationModal from './LocationModal';
import OneSignal from 'react-native-onesignal';
const EndpointRequests = require("./src/util/requests.js");
import moment from "moment";
import 'moment/locale/es';
import LocalNotification from './LocalNotification.js';
import BackgroundGeolocation from "react-native-background-geolocation";
import DefaultPreference from 'react-native-default-preference';

var haversine = require('haversine');
/**
 * Store      - holds our state - THERE IS ONLY ONE STATE
 * Action     - State can be modified using actions - SIMPLE OBJECTS
 * Dispatcher - Action needs to be sent by someone - known as dispatching an action
 * Reducer    - Receives the action and modifies the state to give us a new state
*/

//XMPP CLIENT STATE
let clientInitialState = {
  Client:null,
  ClientListeners:[],
  From:null,
  Status:null,
  Conference:null,
  Login:null,
  LoginXMPP:null,
  LoginLoading:false,
  LoadChatList:null,
  Domain:"alertamxdev.net",
  Vcard:null,
  DB:null,
  LoadChatRoom:null,
  LoadChannel:null,
  ConfigurePush:null,
  ShowLocalNotification:null,
  PermissionsEnabled:false,
  InternetLost:false,
  SetSigninData:null
}

function clientState(state, action){
  if(typeof state === 'undefined'){
    return clientInitialState;
  }

   let Listeners = [...state.ClientListeners];

  switch (action.type){
    case 'SET_LOGIN':
      return Object.assign({}, state, {
        Login: action.Function, LoginXMPP:action.LoginXMPP, ConfigurePush:action.ConfigurePush, SetSigninData: action.SetSigninData
      })
    case 'LOGIN_LOADING':
      return Object.assign({}, state, {
        LoginLoading: action.Loading
      })
    case 'SET_LOCAL_NOTIFICATION':
      return Object.assign({}, state, {
        ShowLocalNotification: action.ShowLocalNotification
      })
    case 'SHOW_LOCAL_NOTIFICATION':
      state.ShowLocalNotification(action.Notification)
      return Object.assign({}, state, {})
    case 'SET_LOAD_CHATLIST':
      return Object.assign({}, state, {
        LoadChatList: action.LoadChatList, LoadChatRoom:action.LoadChatRoom, LoadChannel:action.LoadChannel
      })
    case 'LOAD_CHANNEL':
      setTimeout(function(){
        if(state.LoadChannel != undefined){
          state.LoadChannel(action.LoadChat.id);
        }
      }.bind(this),500);

      return Object.assign({}, state, {})
    case 'LOAD_CHATROOM':
      if(action.Global){
        setTimeout(function(){
          state.LoadChatRoom(action.Chat, true);
        }.bind(this),500);
      }
      else{
        setTimeout(function(){
          state.LoadChatRoom(action.Chat);
        }.bind(this),500);
      }

      return Object.assign({}, state, {})
    case 'LOAD_CHATLIST':
      setTimeout(function(){
        state.LoadChatList();
      }.bind(this),500);
      return Object.assign({}, state, {})
    case 'LOGIN_XMPP':
      return Object.assign({}, state, {
        Client: action.Client
      })
    case 'UPDATE_CLIENT':
      return Object.assign({}, state, {
        Client: action.Client, From: action.From, Conference: action.Conference, Vcard: action.Vcard
      })
    case 'UPDATE_STATUS':
      let LoginLoading = false;

      if(action.Status === "CONNECTING"){
        LoginLoading = true;
      }
      else{
        LoginLoading = false;
      }

      if(action.Internet){
        return Object.assign({}, state, {
          Status: action.Status, LoginLoading:LoginLoading, InternetLost:LoginLoading
        })
      }

      if(state.InternetLost){
        return Object.assign({}, state, {
          Status: action.Status, LoginLoading:LoginLoading, InternetLost:LoginLoading
        })
      }

      return Object.assign({}, state, {
        Status: action.Status, LoginLoading:LoginLoading
      })
    case 'RECONNECTING':
      return Object.assign({}, state, {
        LoginLoading: true
      })
    case 'LOGOUT':
      return Object.assign({}, state, {
        Client:null, LoginLoading:false, From:null
      })
    case 'SET_DB':
      return Object.assign({}, state, {
        DB: action.DB
      })
    case 'PERMISSIONS_ENABLED':
      return Object.assign({}, state, {
        PermissionsEnabled: action.Permissions
      })
    default:
      return state;
  }
}
//USER DATA STATE
let userInitialState = {
  Username:null,
  Password:null,
  UserData:null,
  Nickname:null,
  Resource:null,
  Location:null,
  Radius:100,
  GeofencePoints:[],
  CurrentArea:null,
  CurrentPoint:[],
  AreaName:null,
  AreaCode:null,
  MedicalEnabled:false,
  TotalUsers:0,
  NearbyUsers:0,
  UserDataLoaded:false,
  OfficialSchedule:null,
  DeviceData:null,
  LoginInfo:null,
  WelcomeScreen:false
}

function userState(state, action){
  if(typeof state === 'undefined'){
    return userInitialState;
  }

  switch (action.type){
    case 'SET_TEMP_LOGIN_INFO':
      return Object.assign({}, state, {
        LoginInfo: action.LoginInfo
      })
    case 'SET_DEVICE_INFO':
      return Object.assign({}, state, {
        DeviceData: action.DeviceData
      })
    case 'ADD_USERNAME':

      AsyncStorage.setItem("LoginCreds", JSON.stringify({Username:action.Username, Password: action.Password, Resource:action.Resource}), (asyncError) => {
        if(asyncError != null){}
      });

      return Object.assign({}, state, {
        Username: action.Username, Password: action.Password, Nickname: action.Nickname, Resource: action.Resource
      })
    case 'SET_USERDATA':
      let MedicalValue = false;
      let TotalUsers = state.TotalUsers;
      let DataLoaded = state.UserDataLoaded;
      let WelcomeScreenFlag = state.WelcomeScreen;
      if(action.UserData.emergencyContacts == undefined){
        action.UserData.emergencyContacts = [];
      }

      if(action.UserData.medicalDataEnabled != undefined){
        MedicalValue = action.UserData.medicalDataEnabled;
      }

      if(action.UserData.totalUsers != undefined){
        TotalUsers = action.UserData.totalUsers;
      }

      if(action.DataLoaded){
        DataLoaded = true;
      }

      if(action.WelcomeScreen){
        WelcomeScreenFlag = true;
      }

      AsyncStorage.setItem("UserData", JSON.stringify(action.UserData), (asyncError) => {
        if(asyncError != null){}
      });

      if(action.DeviceData != undefined){
        return Object.assign({}, state, {
          UserData: action.UserData, MedicalEnabled: MedicalValue, TotalUsers: TotalUsers, UserDataLoaded:DataLoaded, DeviceData:action.DeviceData, WelcomeScreen: WelcomeScreenFlag
        })
      }

      return Object.assign({}, state, {
        UserData: action.UserData, MedicalEnabled: MedicalValue, TotalUsers: TotalUsers, UserDataLoaded:DataLoaded, WelcomeScreen: WelcomeScreenFlag
      })
    case 'USER_DATA_LOADED':
      return Object.assign({}, state, {
        UserDataLoaded: true
      })
    case 'CHANGE_MEDICAL_STATUS':
      action.UserData.medicalDataEnabled = action.Value;

      return Object.assign({}, state, {
        UserData: action.UserData, MedicalEnabled: action.Value
      })
    case 'UPDATE_NEARBY_USERS':
      if(state.UserData != undefined){
        state.UserData.nearbyUsers = action.TotalNearby;

        return Object.assign({}, state, {
          UserData: state.UserData, NearbyUsers:action.TotalNearby
        })
      }
      return Object.assign({}, state, {})
    case 'LOGOUT_USER':
      AsyncStorage.multiRemove(["GeoAreas","SelfiePicture", "MedicalData", "OfficialSchedule", "IdPicture", "LoginCreds", "UserData", "Status", "CurrentArea", "NearbyUsers", "CurrentBeacons", "location_token", "location_expires_in", "push_token" + APP_INFO.PINPOINT_ID], (asyncError) => {
        if(asyncError != null){}
        NavigationService.navigate('LandingScreen');
      });

      return Object.assign({}, state, {
        Username:null, Password:null, UserData:null, Nickname:null, Location:null, AreaCode:null, AreaName:null, CurrentArea:null, CurrentPoint:[], GeofencePoints:[], Resource:null, MedicalEnabled:false, NearbyUsers:"0"
      })
    case 'UPDATE_ACCOUNT_STATUS':
      if(state.UserData.verifiedEmail != action.Data.verifiedEmail || state.UserData.verifiedIdentity != action.Data.verifiedIdentity){
        if(state.UserData.verifiedEmail != undefined && state.UserData.verifiedIdentity != undefined){
          state.UserData.verifiedEmail = action.Data.verifiedEmail;
          state.UserData.verifiedIdentity = action.Data.verifiedIdentity;

          AsyncStorage.setItem("UserData", JSON.stringify(state.UserData), (asyncError) => {
            return Object.assign({}, state, {
              UserData:state.UserData
            })
          });
        }
      }

      return Object.assign({}, state, {})
    case 'UPDATE_LOCATION':
      return Object.assign({}, state, {
        Location:action.Location, Radius:action.Radius
      })
    case 'UPDATE_ADDRESS_LOCATION_STATUS':
      state.UserData.primaryAddress.hasLocation = true;
      return Object.assign({}, state, {
        UserData:state.UserData
      })
    case 'ADD_GEOFENCE_SCREEN':
      let indexGeofence = state.GeofencePoints.findIndex(n => n.identifier === action.Point.identifier);

      if(indexGeofence < 0){
        CurrentPoints = cloneDeep(state.GeofencePoints);

        CurrentPoints.push(action.Point);

        return Object.assign({}, state, {
          GeofencePoints:CurrentPoints
        })
      }
      return Object.assign({}, state, {})
    case 'REMOVE_GEOFENCE_SCREEN':
      indexGeofence = state.GeofencePoints.findIndex(n => n.identifier === action.id);

      if(indexGeofence >= 0){
        CurrentPoints = cloneDeep(state.GeofencePoints);

        CurrentPoints.splice(indexGeofence, 1);

        return Object.assign({}, state, {
          GeofencePoints:CurrentPoints
        })
      }
      return Object.assign({}, state, {})
    case 'UPDATE_GEOFENCE':
      return Object.assign({}, state, {
        GeofencePoints:action.Points
      })
    case 'UPDATE_CURRENT_GEOAREA':
      return Object.assign({}, state, {
        CurrentArea:action.Point
      })
    case 'UPDATE_AREA_NAME':
      return Object.assign({}, state, {
        AreaName:action.AreaName, AreaCode: action.AreaCode
      })
    case 'UPDATE_CURRENT_GEOFENCE':
      indexGeofence = state.CurrentPoint.findIndex(n => n.id === action.Point.id);

      CurrentPoints = cloneDeep(state.CurrentPoint);

      if(action.Type === "ADD"){
        if(indexGeofence === -1){
          CurrentPoints.push(action.Point);
        }
        else{
          CurrentPoints.splice(indexGeofence, 1);
          CurrentPoints.push(action.Point);
        }
      }
      else{
        if(indexGeofence > -1){
          CurrentPoints.splice(indexGeofence, 1);
        }
      }

      return Object.assign({}, state, {
        CurrentPoint:CurrentPoints
      })
    case 'ACCEPT_TERMS':
      state.UserData.termsAccepted = true;
      return Object.assign({}, state, {
        UserData:state.UserData
      })
    case 'UPDATE_GEOFENCES_INITIAL':
      return Object.assign({}, state, {
        AreaName:action.AreaName, AreaCode: action.AreaCode, CurrentPoint:action.Points
      })
    case 'UPDATE_EMERGENCY_CONTACTS':
      if(action.Type == "Fill"){
        state.UserData.emergencyContacts = action.emergencyContacts;

        return Object.assign({}, state, {
          UserData:state.UserData
        })
      }
      else if(action.Type == "Add"){
        state.UserData.emergencyContacts.push(action.newContact);

        return Object.assign({}, state, {
          UserData:state.UserData
        })
      }
      else if(action.Type == "Remove"){
        let indexContact = state.UserData.emergencyContacts.findIndex(n => n.phone == action.contact.phone);

        if(indexContact > -1){
          state.UserData.emergencyContacts.splice(indexContact,1);

          return Object.assign({}, state, {
            UserData:state.UserData
          })
        }
      }
    case 'SET_SCHEDULE':
      if(state.UserData != undefined){
        let today = new Date();
        let dayNo = today.getDay();
        let daySchedule = action.Schedule.find(n => n.dayNumber == dayNo);
        if(daySchedule != undefined){
          if(today >= daySchedule.start && today < daySchedule.end){
            let UserData = cloneDeep(state.UserData);
            UserData.isOnDuty = true;
            return Object.assign({}, state, {
              UserData:UserData
            })
          }
        }
      }
      return Object.assign({}, state, {})
    case 'START_OFFICIAL_SCHEDULE':
      if(state.UserData != undefined && !state.UserData.isOnDuty){
        let UserData = cloneDeep(state.UserData);
        UserData.isOnDuty = true;
        AsyncStorage.setItem("UserData", JSON.stringify(UserData), (asyncError) => {
          if(asyncError != null){}
        });
        return Object.assign({}, state, {
          UserData:UserData
        })
      }
      return Object.assign({}, state, {})
    case 'END_OFFICIAL_SCHEDULE':
      if(state.UserData != undefined && state.UserData.isOnDuty){
        let UserData = cloneDeep(state.UserData);
        UserData.isOnDuty = false;
        AsyncStorage.setItem("UserData", JSON.stringify(UserData), (asyncError) => {
          if(asyncError != null){}
        });
        return Object.assign({}, state, {
          UserData:UserData
        })
      }
      return Object.assign({}, state, {})
    default:
      return state;
  }
}
//CHATS FUNCTIONS AND STATE
let chatInitialState = {
  Chats:[],
  SectionList:[],
  CurrentChat:null,
  CreatingRoom:false,
  CreatingRoomData:null,
  LoadMembers:null,
  LoadedData:null,
  SetDBAfterLogout:null,
  OnEnterChat:null,
  CheckPending:null,
  GetCachedGeo:null,
  PlayAudio:null,
  ExistingAlarm:null,
  OngoingAlert:false,
  Nickname:null,
  Username:null,
  ReloadChatList:null,
  ReloadChatRoom:null,
  BackAndroidChat:null,
  BackAndroidPublicAlert:null,
  CurrentEmergency:null,
  ScheduleNotifications:null
}

function chatState(state, action){
  if(typeof state === 'undefined'){
    return chatInitialState;
  }

  let CurrentChats = state.Chats;
  let OngoingAlert = state.OngoingAlert;

  switch (action.type){
    case 'ENTER_CHAT':
      let index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      let Chat = state.Chats[index];
      Chat.nickname = Chat.id + "/" + action.Username;
      Chat.last_time_read = new Date().getTime();
      Chat.IsLoading = false;
      Chat.unread_messages_count = 0;

      if(action.Props != undefined){
        Chat.additionalProps = action.Props;
      }

      if(action.Emergency != undefined){
        Chat.emergencyInformation = action.Emergency;
      }

      return Object.assign({}, state, {
        CurrentChat: Chat
      })
    case 'SET_ADDITIONAL_PROPS':
        index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));
        Chat = state.Chats[index];
        if(action.Props != undefined){
          Chat.additionalProps = action.Props;
          Chat.emergencyInformation = {
            createdBy:action.User,
            latestCoordinates:action.Props.location,
            locationList:[action.Props.location],
            ended:false,
            endedOn:new Date().getTime(),
            startedOn:new Date().getTime(),
            text:action.Props.text,
            type:action.Type
          }
        }
        return Object.assign({}, state, {
          Chats: state.Chats
        })
    case 'ADD_USERNAME_CHAT':
      return Object.assign({}, state, {
        Nickname: action.Nickname, Username: action.Username
      })
    case 'SET_ONGOING':
      return Object.assign({}, state, {
        OngoingAlert:true
      })
    case 'SET_LOADED_DATA':
      return Object.assign({}, state, {
        ScheduleNotifications:action.ScheduleNotifications, GetCachedGeo:action.GetCachedGeo, LoadedData: action.LoadedData, SetDBAfterLogout:action.SetDBAfterLogout, CheckPending:action.CheckPending, PlayAudio:action.PlayAudio, ExistingAlarm:action.ExistingAlarm
      })
    case 'ADD_CURRENT_ALARM':
      if(state.ExistingAlarm != undefined){
        state.ExistingAlarm(action.alarmInfo);
      }
      return Object.assign({}, state, {})
    case 'CREATING_CHAT':
      return Object.assign({}, state, {
        CreatingRoom: true, CreatingRoomData:action.Data
      })
    case 'SET_LOAD_CHATLIST_CHATS':
      return Object.assign({}, state, {
        LoadChatList: action.LoadChatList
      })
    case 'SET_LOAD_MEMBERS':
      return Object.assign({}, state, {
        LoadMembers: (cb) => action.LoadMembersFunction(cb), BackAndroidChat:() => action.BackAndroidChat()
      })
    case 'BACK_ANDROID_CHAT':
      if(state.BackAndroidChat != undefined){
        if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
          index = state.Chats.findIndex(item => item.id.startsWith(state.CurrentChat.id));

          Chat = state.Chats[index];
          Chat.unread_messages_count = 0;
          Chat.last_time_read = new Date().getTime();
          state.Chats[index] = Chat;
        }

        state.BackAndroidChat();
      }
      return Object.assign({}, state, {
        BackAndroidPublicAlert:() => action.BackAndroidPublicAlert(), Chats: state.Chats
      })
    case 'SET_ANDROID_PUBLICALERT':
      return Object.assign({}, state, {
        BackAndroidPublicAlert:() => action.BackAndroidPublicAlert()
        })
    case 'BACK_ANDROID_PUBLICALERT':
      if(state.BackAndroidPublicAlert != undefined){
        if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
          index = state.Chats.findIndex(item => item.id.startsWith(state.CurrentChat.id));

          Chat = state.Chats[index];

          Chat.last_time_read = new Date().getTime();
          state.Chats[index] = Chat;
        }

        state.BackAndroidPublicAlert();
      }
      return Object.assign({}, state, {BackAndroidPublicAlert:() => action.BackAndroidPublicAlert(), Chats: state.Chats})
    case 'SET_LOAD_FUNCTIONS':
      return Object.assign({}, state, {
        ReloadChatList: action.ReloadChatList, ReloadChatRoom: action.ReloadChatRoom
      })
    case 'SET_SEND_INVITE':
      return Object.assign({}, state, {
        SendInvite: action.SendInvite
      })
    case 'UPDATE_CHANNEL_DATA':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      if(index > -1){
          Chat = cloneDeep(state.Chats[index]);
          Chat.description = action.ChatData.description;
          Chat.subject = action.ChatData.subject;
          Chat.thumbnail = action.ChatData.thumbnail;
          state.Chats[index] = Chat;

          if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
            return Object.assign({}, state, {
              CurrentChat: Chat, Chats:state.Chats
            })
          }

          return Object.assign({}, state, {
            Chats:state.Chats
          })
      }

      return Object.assign({}, state, {})
    case 'MARK_RESENDING':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      if(index > -1){
        Chat = cloneDeep(state.Chats[index]);
        let message = Chat.messages.findIndex(item => item.id === action.MessageId);

        if(message > -1){
          Chat.messages[message].resending = true;

          if(state.CurrentChat != null && state.CurrentChat.id === action.ChatId){
            return Object.assign({}, state, {
              CurrentChat:Chat
            })
          }
        }
      }

      return Object.assign({}, state, {})
    case "UPDATE_EMERGENCY":
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      if(index === -1){
        return Object.assign({}, state, {});
      }

      Chat = cloneDeep(state.Chats[index]);
      state.Chats[index] = Chat;
      if(Chat.emergencyInformation != undefined){
        if(Chat.emergencyInformation.latestCoordinates == undefined){
          Chat.emergencyInformation.latestCoordinates = action.Data.coordinates;
          Chat.emergencyInformation.locationList = [action.Data.coordinates];
        }
        let userIndex = state.Chats[index].members.findIndex(x => x.nickname === action.Data.createdBy);
        Chat.emergencyInformation.createdBy = state.Chats[index].members[userIndex];
      }
      //Chat.last_update = new Date().getTime();

      if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
        return Object.assign({}, state, {
          Chats: CurrentChats, CurrentChat:Chat, OngoingAlert:OngoingAlert
        })
      }

      return Object.assign({}, state, {
        Chats: CurrentChats, OngoingAlert:OngoingAlert
      })
    case 'START_ALERT_STATUS':
      let CurrentEmergency = null;
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      if(index === -1){
        return Object.assign({}, state, {});
      }

      Chat = cloneDeep(state.Chats[index]);
      state.Chats[index] = Chat;
      Chat.emergency = true;

      let userIndex = state.Chats[index].members.findIndex(x => x.nickname === action.User);

      Chat.emergencyInformation = {
        startedOn:new Date().getTime(),
        createdBy:state.Chats[index].members[userIndex],
        text: action.AlertText,
        type:action.EmergencyType,
        latestCoordinates: action.Coordinates,
        locationList:[action.Coordinates],
        emergencyAttendant:null
      };

      if(state.Chats[index].members[userIndex] != undefined && state.Chats[index].members[userIndex].nickname === state.Nickname){
        OngoingAlert = true;
        CurrentEmergency = action.Chat;
      }

      if(action.EmergencyType === "Emergency"){
        Chat.backgroundColor = "#d9534f";
        Chat.fontColor = "white";
      }
      else if(action.EmergencyType === "Fire"){
        Chat.backgroundColor = "#f05a23";
        Chat.fontColor = "white";
      }
      else if(action.EmergencyType === "Suspicious"){
        OngoingAlert = false;
        Chat.backgroundColor = "#fcaf00";
        Chat.fontColor = "white";
        Chat.emergencyInformation.ended = true;
      }
      else if(action.EmergencyType === "Feminist"){
        Chat.backgroundColor = "#635592";
        Chat.fontColor = "white";
      }
      else{
        Chat.backgroundColor = "#0C479D";
        Chat.fontColor = "white";
      }

      if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
        return Object.assign({}, state, {
          Chats: CurrentChats, CurrentChat:Chat, OngoingAlert:OngoingAlert, CurrentEmergency:CurrentEmergency
        })
      }

      return Object.assign({}, state, {
        Chats: CurrentChats, OngoingAlert:OngoingAlert, CurrentEmergency:CurrentEmergency
      })
    case 'END_ALERT_STATUS':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      if(index === -1){
        return Object.assign({}, state, {});
      }

      Chat = cloneDeep(state.Chats[index]);
      state.Chats[index] = Chat;
      Chat.emergency = false;

      if(OngoingAlert){
        OngoingAlert = false;
        CurrentEmergency = null;
      }

      if(!Chat.temporal){
        Chat.emergencyInformation = {};
      }
      else{
        if(Chat.emergencyInformation != undefined){
          let emergencyInformacion = cloneDeep(Chat.emergencyInformation);
          emergencyInformacion.ended = true;
          emergencyInformacion.endedOn = action.EndDate;
          Chat.emergencyInformation = emergencyInformacion;
          var expDate = new Date(action.EndDate);
          expDate.setDate(expDate.getDate() + 1);
          Chat.lastAlarmDate = expDate;
          if(Chat.lastAlarmDate < new Date()){
            Chat.hidden = true;
          }
        }
      }

      Chat.backgroundColor = "white";
      Chat.fontColor = "#0E75FA";

      if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
        return Object.assign({}, state, {
          Chats: CurrentChats, CurrentChat:Chat, OngoingAlert:OngoingAlert, CurrentEmergency: CurrentEmergency
        })
      }

      return Object.assign({}, state, {
        Chats: CurrentChats, OngoingAlert:OngoingAlert, CurrentEmergency: CurrentEmergency
      })
    case 'ADD_LOCATION_ALERT':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      if(index === -1){
        return Object.assign({}, state, {});
      }

      Chat = cloneDeep(state.Chats[index]);
      state.Chats[index] = Chat;

      if(Chat.emergency && Chat.emergencyInformation != undefined){
        Chat.emergencyInformation.locationList.push(action.Coordinates);
        Chat.emergencyInformation.latestCoordinates = action.Coordinates;
        Chat.emergencyInformation.updatedAt = new Date().getTime();
      }

      if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
        return Object.assign({}, state, {
          Chats: CurrentChats, CurrentChat:Chat
        })
      }

      return Object.assign({}, state, {
        Chats: CurrentChats
      })
    case 'ADD_OFFICIAL_LOCATION_ALERT':
        index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

        if(index === -1){
          return Object.assign({}, state, {});
        }

        Chat = cloneDeep(state.Chats[index]);
        state.Chats[index] = Chat;

        if(Chat.emergencyInformation != undefined){
          if(Chat.emergencyInformation.emergencyAttendant == undefined){
            if(action.AssignedTo != undefined){
              Chat.emergencyInformation.emergencyAttendant = {
                latestCoordinates: action.Coordinates,
                latestUpdate: new Date().getTime(),
                assignedTo: action.AssignedTo
              };
            }
            else{
              Chat.emergencyInformation.emergencyAttendant = {
                latestCoordinates: action.Coordinates,
                latestUpdate: new Date().getTime()
              };
            }
          }
          else{
            Chat.emergencyInformation.emergencyAttendant.latestCoordinates = action.Coordinates;
            Chat.emergencyInformation.emergencyAttendant.latestUpdate = new Date().getTime();
            if(action.AssignedTo != undefined){
              Chat.emergencyInformation.emergencyAttendant.assignedTo = action.AssignedTo;
            }
          }
          Chat.emergencyInformation.updatedAt = new Date().getTime();
        }

        if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
          return Object.assign({}, state, {
            Chats: CurrentChats, CurrentChat:Chat
          })
        }

        return Object.assign({}, state, {
          Chats: CurrentChats
        })
    case 'UPDATE_LAST_READ':
      if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
        index = state.Chats.findIndex(item => item.id.startsWith(state.CurrentChat.id));

        Chat = state.Chats[index];

        Chat.last_time_read = new Date().getTime();
        state.Chats[index] = Chat;
      }

      return Object.assign({}, state, {
        Chats: CurrentChats
      })
    case 'UPDATE_MEMBERS':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      Chat = state.Chats[index];
      Chat.members = action.MemberList;
      state.Chats[index].members = action.MemberList;

      if(action.Thumbnail != undefined){
        Chat.thumbnail = action.Thumbnail;
      }

      if(action.Subject != undefined){
        Chat.name = action.Subject
      }

      if(state.CurrentChat != null && Chat.id === state.CurrentChat.id){
        if(state.CurrentChat.active_users.length > 0){
          for(let i = 0; i < state.CurrentChat.active_users.length;i++){
            let memberIndex = action.MemberList.findIndex(x => x.nickname === state.CurrentChat.active_users[i].alias);

            if(memberIndex > -1){
              state.CurrentChat.active_users[i].user = action.MemberList[memberIndex];
            }
          }
          state.CurrentChat.members = action.MemberList;
          Chat = state.CurrentChat;
        }
      }

      if(action.MembersLoaded){
        Chat.membersLoaded = true;
      }

      if(action.ChatInfo != null){
        Chat.description = action.ChatInfo.Description;
        Chat.createdAt = new Date(action.ChatInfo.CreatedAt).toDateString();
      }

      if(action.Props != undefined){
        Chat.additionalProps = action.Props;
      }

      state.Chats[index] = Chat;

      return Object.assign({}, state, {
        CurrentChat: Chat, Chats:state.Chats
      })
    case 'ADD_USERDATA_MESSAGE':
      if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
        for(let k = 0; k < state.CurrentChat.messages.length;k++){
          if(state.CurrentChat.messages[k].user === undefined){
            let memberIndex = state.CurrentChat.members.findIndex(x => x.nickname === state.CurrentChat.messages[k].username);
            if(memberIndex != -1){
              state.CurrentChat.messages[k].user = state.CurrentChat.members[memberIndex];
            }
          }

          if(state.CurrentChat.messages[k].isQuote){
            let memberIndex = state.CurrentChat.messages.findIndex(n => n.id === state.CurrentChat.messages[k].quoted_id);

            if(memberIndex >= 0){
              let indexMsg = state.CurrentChat.members.findIndex(n => n.nickname === state.CurrentChat.messages[memberIndex].username);

              if(indexMsg >= 0){
                state.CurrentChat.messages[k].quote_by = state.CurrentChat.members[indexMsg].alias != undefined ? state.CurrentChat.members[indexMsg].alias : null;
              }
            }
          }
        }

        return Object.assign({}, state, {
          CurrentChat: state.CurrentChat, Chats:state.Chats
        })
      }
      else{
        return Object.assign({}, state, { })
      }
    case 'UPDATE_AFFILIATION':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      if(index === -1 && state.CreatingRoom){
        Chat = {
          id: action.Chat,
          name: state.CreatingRoomData.Name,
          messages: [],
          loading:true,
          active_users:[],
          members:[],
          last_message: '',
          last_message_date_sent: new Date().getTime(),
          updated_date: new Date().getTime(),
          unread_messages_count: 0,
          nickname:"",
          emergency:false
        };

        CurrentChats = [].concat(state.Chats);
        CurrentChats.push(Chat);
        index = CurrentChats.length - 1;
        state.SendInvite(action.Chat);
      }
      else if(index === -1){
        state.LoadChatList();
        return Object.assign({}, state, {})
      }
      else if(index >= 0){
        CurrentChats = [].concat(state.Chats);
        Chat = cloneDeep(CurrentChats[index]);
      }
      else{
        return Object.assign({}, state, {
          CurrentChat:  state.CurrentChat, Chats:state.Chats
        })
      }

      let indexMember = Chat.members.findIndex(x => x.nickname == action.new_data.username);

      Chat.members = [].concat(Chat.members);

      if(indexMember < 0){
        Chat.members.push(action.new_data);
        CurrentChats[index].members.push(action.new_data);
      }
      else{
        let currentData = Chat.members[indexMember];
        Chat.members.splice(indexMember, 1);
        currentData.owner = action.new_data.owner;
        currentData.admin = action.new_data.admin;
        Chat.members.push(currentData);
        CurrentChats[index].members.splice(indexMember, 1);
        CurrentChats[index].members.push(currentData);
      }

      if(action.Me){
        if(action.new_data.member && Chat.unauthorized){
           Chat.unauthorized = false;
           CurrentChats[index].unauthorized = false;
        }
      }

      if(state.CurrentChat != undefined && state.CurrentChat.id == Chat.id){
        return Object.assign({}, state, {
          CurrentChat:  Chat, Chats:CurrentChats, CreatingRoom:false, CreatingRoomData:null
        });
      }

      return Object.assign({}, state, {
        CurrentChat:  state.CurrentChat, Chats:CurrentChats, CreatingRoom:false, CreatingRoomData:null
      })
    case 'PENDING_MSG':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      Chat = state.Chats[index];

      if(Chat != null){
        Chat.messages.push(action.Message);
        Chat.messages.sort((a, b) => { return b.time - a.time});
        Chat.last_message = action.Message.text;
        Chat.last_message_date_sent = action.Message.time;
        Chat.updated_date = action.Message.time;

        state.Chats[index] = Chat;
      }

      return Object.assign({}, state, {
        CurrentChat: state.CurrentChat, Chats:state.Chats
      })
    case 'EDIT_MESSAGE':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Message.chat_id));

      Chat = state.Chats[index];

      if(Chat != null){
        let messageIndex = Chat.messages.findIndex(x => x.id === action.EditMessage);
        if(messageIndex >= 0){
          Chat.messages[messageIndex].text = action.Message.text;
          Chat.messages[messageIndex].isEdited = true;
          Chat.updated_date = action.Message.time;
        }
      }

      return Object.assign({}, state, {
        CurrentChat: state.CurrentChat, Chats:state.Chats
      })
    case 'UPDATE_MESSAGES':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Message.chat_id));

      Chat = state.Chats[index];
      let todayDate = new Date().toDateString();
      if(Chat != null){
        if(action.StanzaId != null){
          let messageIndex = Chat.messages.findIndex(x => x.id === action.StanzaId);
          if(messageIndex != -1){
            let categoryIndex = Chat.messages.findIndex(x => x.dateCategory && x.stringDate == todayDate);
            let messageDateString = new Date(action.Message.timestamp).toDateString();
            if(categoryIndex < 0 && messageDateString == todayDate){
              //this only should happen if user enters chat before new day and a new message is sent, we need to reorder the categories if they exist
              let todayCategory = Chat.messages.findIndex(x => x.dateCategory && x.text === "Hoy");
              if(todayCategory >= 0){
                let yesterdayCategory = Chat.messages.findIndex(x => x.dateCategory && x.text === "Ayer");
                if(yesterdayCategory >= 0){
                  if(Platform.OS == "ios"){
                    Chat.messages[yesterdayCategory].text = new Date(Chat.messages[yesterdayCategory].timestamp).toDateString();
                  }
                  else{
                    Chat.messages[yesterdayCategory].text = moment(Chat.messages[yesterdayCategory].timestamp).lang("es").format('ddd, ll');
                  }
                }
                Chat.messages[todayCategory].text = "Ayer";
              }
              //
              Chat.messages.push({isSystemMsg:true,timestamp:new Date(todayDate), time:new Date(todayDate).getTime(), stringDate:todayDate, text:"Hoy", dateCategory:true});
            }
            Chat.messages[messageIndex] = action.Message;
            Chat.messages.sort((a, b) => { return b.time - a.time});
            if(!action.Message.hidden){
              Chat.last_message = action.Message.text;
              Chat.last_message_date_sent = action.Message.time;
            }
            Chat.updated_date = action.Message.time;
          }
        }
        else{
          let messageIndex = Chat.messages.findIndex(x => x.id === action.Message.id);
          if(messageIndex === -1){
            let categoryIndex = Chat.messages.findIndex(x => x.dateCategory && x.stringDate == todayDate);
            let messageDateString = new Date(action.Message.timestamp).toDateString();
            if(categoryIndex < 0 && messageDateString == todayDate){
              //this only should happen if user enters chat before new day and a new message is sent, we need to reorder the categories if they exist
              let todayCategory = Chat.messages.findIndex(x => x.dateCategory && x.text === "Hoy");
              if(todayCategory >= 0){
                let yesterdayCategory = Chat.messages.findIndex(x => x.dateCategory && x.text === "Ayer");
                if(yesterdayCategory >= 0){
                  if(Platform.OS == "ios"){
                    Chat.messages[yesterdayCategory].text = new Date(Chat.messages[yesterdayCategory].timestamp).toDateString();
                  }
                  else{
                    Chat.messages[yesterdayCategory].text = moment(Chat.messages[yesterdayCategory].timestamp).lang("es").format('ddd, ll');
                  }
                }
                Chat.messages[todayCategory].text = "Ayer";
              }
              //
              Chat.messages.push({isSystemMsg:true,timestamp:new Date(todayDate), time:new Date(todayDate).getTime(), stringDate:todayDate, text:"Hoy", dateCategory:true});
            }
            Chat.messages.push(action.Message);
            Chat.messages.sort((a, b) => { return b.time - a.time});
            if(!action.Message.hidden){
              Chat.last_message = action.Message.text;
              Chat.last_message_date_sent = action.Message.time;
            }
            Chat.updated_date = action.Message.time;
          }
        }

        state.Chats[index] = Chat;

        if(state.CurrentChat != undefined && state.CurrentChat.id != null && Chat.id === state.CurrentChat.id){
          state.CurrentChat.messages = Chat.messages;
          Chat = state.CurrentChat;

          let findMember = state.CurrentChat.members.findIndex(x => x.alias != undefined && x.nickname === action.Message.username);
          if(findMember === -1){
            state.LoadMembers();
          }
          else if(findMember >= 0){
            Chat.messages[0].user = state.CurrentChat.members[findMember];
          }
          else{ }

          if(action.Message.isQuote){
            let messageIndex = state.CurrentChat.messages.findIndex(x => x.id === action.Message.quoted_id);

            if(messageIndex >= 0){
              Chat.messages[0].quote_by = state.CurrentChat.messages[messageIndex].user != undefined ? state.CurrentChat.messages[messageIndex].user.alias : "";
            }
          }
        }
        else{
          if(state.Chats[index].messages.length > 0){
            if(state.Chats[index].last_time_read < action.Message.time){
              state.Chats[index].unread_messages_count = state.Chats[index].unread_messages_count + 1;
            }
          }
        }
      }

      GlobalAlerts = state.Chats.filter(x => x.temporal);
      NormalChats = state.Chats.filter(x => !x.temporal && x.chatType != 2);
      OficialChats = state.Chats.filter(x => x.chatType == 2);

      if(GlobalAlerts.length > 0 && OficialChats.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(GlobalAlerts.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(OficialChats.length > 0){
        SectionList = [{title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else{
        SectionList = [{title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }

      return Object.assign({}, state, {
        CurrentChat: state.CurrentChat, Chats:state.Chats, SectionList: SectionList
      })
    case 'UPDATE_TITLE':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      Chat = cloneDeep(state.Chats[index]);

      if(Chat != null){
        Chat.last_update = new Date().getTime();
        if(action.Subject != undefined){
          Chat.name = action.Subject;
        }
      }
      state.Chats[index] = Chat;
      GlobalAlerts = state.Chats.filter(x => x.temporal);
      NormalChats = state.Chats.filter(x => !x.temporal && x.chatType != 2);
      OficialChats = state.Chats.filter(x => x.chatType == 2);

      if(GlobalAlerts.length > 0 && OficialChats.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(GlobalAlerts.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(OficialChats.length > 0){
        SectionList = [{title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else{
        SectionList = [{title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }

      return Object.assign({}, state, {
        Chats:state.Chats, SectionList: SectionList
      })
    case 'UPDATE_CONVERSATION':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));
      if(index < 0){
        return Object.assign({}, state, {});
      }
      Chat = cloneDeep(state.Chats[index]);
      if(Chat != null){
        Chat.last_update = new Date().getTime();
      }
      state.Chats[index] = Chat;
      if(state.CurrentChat != undefined && state.CurrentChat.id == Chat.id){
        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:state.Chats
        })
      }
      return Object.assign({}, state, {
        Chats:state.Chats
      })
    case 'LOCK_CONVERSATION':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      Chat = cloneDeep(state.Chats[index]);

      if(Chat != null){
        Chat.locked = true;
      }

      state.Chats[index] = Chat;

      if(state.CurrentChat != undefined && state.CurrentChat.id == Chat.id){
        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:state.Chats
        })
      }

      return Object.assign({}, state, {
        Chats:state.Chats
      })
    case 'UPDATE_PRESENCE':
        index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

        CurrentChats = [].concat(state.Chats);

        Chat = CurrentChats[index];

        if(Chat != null){
          let memberIndex = Chat.members.findIndex(z => z.nickname === action.User && z.name != undefined);
          let memberData = null;

          if(memberIndex >= 0){
            memberData = Chat.members[memberIndex]
          }
          else{
            memberData = {
              nickname: action.User,
              alias:"?",
              pictureUrl:null
            }
          }

          if(Chat.active_users.findIndex(x => x.alias === action.User) === -1){
            Chat.active_users.push({user: memberData, alias:action.User, composing:false, present:true});
          }

          CurrentChats[index] = Chat;

          if(state.CurrentChat != undefined && Chat.id != state.CurrentChat.id){
            Chat = state.CurrentChat;
          }
        }

        if(state.CurrentChat == null){
          Chat = null;
        }

        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:CurrentChats
        })
    case 'USER_COMPOSING':

        if(state.CurrentChat != null && state.CurrentChat.id == action.ChatId){
          index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

          Chat = state.Chats[index];

          if(Chat != null){
            let updateIndex = Chat.active_users.findIndex(x => x.alias === action.User);

            if(updateIndex > -1){
              Chat.active_users[updateIndex].composing = true;
            }

            state.Chats[index] = Chat;

            if(state.CurrentChat != undefined && Chat.id != state.CurrentChat.id){
              Chat = state.CurrentChat;
            }
          }
        }
        else{
          Chat = state.CurrentChat;
        }

        return Object.assign({}, state, {
          CurrentChat: Chat
        })
    case 'USER_PAUSED':
      if(state.CurrentChat != null && state.CurrentChat.id == action.ChatId){
          index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

          Chat = state.Chats[index];

          if(Chat != null){
            let updateIndex = Chat.active_users.findIndex(x => x.alias === action.User);

            if(updateIndex > -1){
              Chat.active_users[updateIndex].composing = false;
            }

            state.Chats[index] = Chat;

            if(state.CurrentChat != undefined && Chat.id != state.CurrentChat.id){
              Chat = state.CurrentChat;
            }
          }
        }
        else{
          Chat = state.CurrentChat;
        }

        return Object.assign({}, state, {
          CurrentChat: Chat
        })
    case 'MESSAGE_READ':
        index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

        Chat = state.Chats[index];

        if(Chat != null){
          let updateIndex = Chat.messages.findIndex(x => x.id === action.MessageId);

          if(updateIndex > -1){
            if(!Chat.messages[updateIndex].read_by.includes(action.User)){
              if(Chat.messages[updateIndex].read_by.length + 1 > action.ReadBy){
                Chat.messages[updateIndex].read_by_count = Chat.messages[updateIndex].read_by.length + 1;
              }
              else{
                Chat.messages[updateIndex].read_by_count = action.ReadBy;
              }
              Chat.messages[updateIndex].read_by.push(action.User);
            }
          }

          state.Chats[index] = Chat;

          if(state.CurrentChat != undefined && Chat.id != state.CurrentChat.id){
            Chat = state.CurrentChat;
          }
        }

        if(state.CurrentChat == null){
          Chat = null;
        }

        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:state.Chats
        })
    case 'UNAUTHORIZED_CHANNEL':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      Chat = cloneDeep(state.Chats[index]);

      if(Chat != null){
        Chat.unauthorized = true;
        Chat.last_update = new Date().getTime();
      }

      state.Chats[index] = Chat;

      if(state.CurrentChat != undefined && state.CurrentChat.id == Chat.id){
        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:state.Chats
        })
      }

      return Object.assign({}, state, {
        Chats:state.Chats
      })
    case 'AUTHORIZE_EXISTING':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      Chat = cloneDeep(state.Chats[index]);

      if(Chat != null){
        Chat.unauthorized = false;
        Chat.last_update = new Date().getTime();
      }

      state.Chats[index] = Chat;

      if(state.CurrentChat != undefined && state.CurrentChat.id == Chat.id){
        let message = xml( "presence", { from:action.User, id:id(), to: state.CurrentChat.nickname },  xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date(state.CurrentChat.updated_date).toISOString()})), xml("status", { code: '200'}) );
        let response = action.xmppClient.send(message);
        return Object.assign({}, state, {
          CurrentChat: Chat, Chats:state.Chats
        })
      }

      return Object.assign({}, state, {
        Chats:state.Chats
      })
    case 'LEAVE_ROOM':
        index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

        Chat = state.Chats[index];

        if(Chat != undefined){
          let removeIndex = Chat.active_users.findIndex(x => x.alias === action.User);

          if(removeIndex > -1){
            Chat.active_users.splice(removeIndex, 1);
          }

          CurrentChats[index] = Chat;

          if(state.CurrentChat != undefined && Chat.id != state.CurrentChat.id){
            Chat = state.CurrentChat;
          }

          return Object.assign({}, state, {
            CurrentChat: Chat, Chats:CurrentChats
          })
        }

        return Object.assign({}, state, {})
    case 'ABANDONING_ROOM':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      if(index >= 0){
        Chat = state.Chats[index];

        if(state.CurrentChat != undefined && state.CurrentChat.id === Chat.id){
          Chat.abandoning = true;
          return Object.assign({}, state, { CurrentChat: Chat });
        }
      }
      return Object.assign({}, state, { });
    case 'REMOVE_ROOM':
        index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

        Chat = state.Chats[index];

        if(Chat != null){
          state.Chats.splice(index);

          GlobalAlerts = state.Chats.filter(x => x.temporal);
          NormalChats = state.Chats.filter(x => !x.temporal && x.chatType != 2);
          OficialChats = state.Chats.filter(x => x.chatType == 2);

          if(GlobalAlerts.length > 0 && OficialChats.length > 0){
            SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
          }
          else if(GlobalAlerts.length > 0){
            SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
          }
          else if(OficialChats.length > 0){
            SectionList = [{title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
          }
          else{
            SectionList = [{title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
          }

          return Object.assign({}, state, { Chats: state.Chats, SectionList: SectionList });
        }

        return Object.assign({}, state, { })
    case 'ACTIVE':
      if(state.CurrentChat != null && state.CurrentChat.id != undefined){
        let message = xml( "presence", { from:action.User, id:id(), to: state.CurrentChat.id },  xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date(state.CurrentChat.updated_date).toISOString()})), xml("status", { code: '200'}) );
        let response = action.xmppClient.send(message);
      }
      return Object.assign({}, state, { })
    case 'INACTIVE':
      if(state.CurrentChat != null && state.CurrentChat.id != undefined){
        let message = xml( "presence", { from:action.User, id:id(), to: state.CurrentChat.id}, xml("status", {code: "away"}));
        let response = action.xmppClient.send(message);
      }
      return Object.assign({}, state, { })
    case 'CLEAR_CURRENT':
      if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
        return Object.assign({}, state, {
          CurrentChat: {id:null, messages:[], active_users:[], members:[], backgroundColor:'white', fontColor:"#0E75FA", emergency:false, IsLoading:action.backHome != undefined ? false : true}
        })
      }
      return Object.assign({}, state, {})
    case 'LOAD_MESSAGES':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat));

      Chat = state.Chats[index];

      let messagesTags = cloneDeep(action.Messages);
      let lastDate = null;
      let today = new Date().toDateString();
      let yesterday = new Date(today);
      yesterday = new Date(yesterday.setDate(yesterday.getDate() - 1)).toDateString();
      let message;
      const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
      for(let i = 0;i < action.Messages.length;i++){
        if(action.Messages[i].timestamp != undefined){
          if(lastDate != new Date(action.Messages[i].timestamp).toDateString()){
            lastDate = new Date(action.Messages[i].timestamp).toDateString();
            if(lastDate == today){
              message = "Hoy";
            }
            else if(lastDate == yesterday){
              message = "Ayer";
            }
            else{
              if(Platform.OS == "ios"){
                message = new Date(lastDate).toLocaleDateString('es-MX', dateOptions);
              }
              else{
                message = moment(lastDate).lang("es").format('ddd, ll');
              }
            }

            let newDate = new Date(lastDate);
            messagesTags.splice(i,0,{isSystemMsg:true,timestamp:newDate, time:newDate.getTime(), text:message, stringDate:lastDate, dateCategory:true});
          }
        }
      }
      Chat.messages = messagesTags;

      if(action.AlertExists && action.AlertObject != null){
        if(action.AlertObject.ended){
          Chat.emergency = false;
        }
        else{
          Chat.emergency = true;
        }

        Chat.emergencyInformation = action.AlertObject;

        if(action.AlertObject.type === "Emergency"){
          Chat.backgroundColor = "#d9534f";
          Chat.fontColor = "white";
        }
        else if(action.AlertObject.type === "Fire"){
          Chat.backgroundColor = "#f05a23";
          Chat.fontColor = "white";
        }
        else if(action.AlertObject.type === "Suspicious"){
          Chat.emergencyInformation.ended = true;
          Chat.backgroundColor = "#fcaf00";
          Chat.fontColor = "white";
        }
        else{
          Chat.backgroundColor = "#0C479D";
          Chat.fontColor = "white";
        }
      }

      return Object.assign({}, state, {
        CurrentChat: state.CurrentChat, Chats: state.Chats
      })
    case 'CLEAR_COUNTER':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));
      if(index >= 0){
        state.Chats[index].unread_messages_count = 0;

        return Object.assign({}, state, {
          Chats: state.Chats
        })
      }
      return Object.assign({}, state, {})
    case 'END_LOADING':
      index = state.Chats.findIndex(item => item.id.startsWith(action.ChatId));

      Chat = state.Chats[index];

      if(Chat != null){
        Chat.loading = false;

        if(Chat.messages.length > 0){
          Chat.last_message = Chat.messages[0].text;
          Chat.last_message_date_sent = Chat.messages[0].time;
          Chat.updated_date = Chat.messages[0].time;
          state.Chats[index] = Chat;
        }
      }

      return Object.assign({}, state, {
        Chats:state.Chats
      })
    case 'RECONNECT_RELOAD':
        if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
          if(state.ReloadChatRoom != undefined){
            state.ReloadChatRoom(state.CurrentChat)
          }
        }
        else{
          if(state.ReloadChatList != undefined){
            state.ReloadChatList()
          }
        }

        return Object.assign({}, state, {})
    case 'UPDATE_DATA':

      let GlobalAlerts = action.Chats.filter(x => x.temporal);
      let NormalChats = action.Chats.filter(x => !x.temporal && x.chatType != 2);
      let OficialChats = action.Chats.filter(x => x.chatType == 2);

      let SectionList = [];

      if(GlobalAlerts.length > 0 && OficialChats.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(GlobalAlerts.length > 0){
        SectionList = [{title:"Detonación", data:GlobalAlerts.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else if(OficialChats.length > 0){
        SectionList = [{title:"Detonación remota", data:OficialChats.sort((a, b) => { return b.updated_date - a.updated_date})}, {title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }
      else{
        SectionList = [{title:"Conversaciones", data:NormalChats.sort((a, b) => { return b.updated_date - a.updated_date})}];
      }

      if(state.CurrentChat != undefined && state.CurrentChat.id != undefined){
        index = action.Chats.findIndex(x => x.id === state.CurrentChat.id);

        if(index >= 0){
          action.Chats[index] = state.CurrentChat;
        }

        return Object.assign({}, state, {
          Chats: action.Chats, SectionList:SectionList
        })
      }

      return Object.assign({}, state, {
        Chats: action.Chats, SectionList:SectionList
      })
    case 'ADD_SINGLE_CHAT':
      index = state.Chats.findIndex(item => item.id.startsWith(action.Chat.id));
      if(index != -1){
        return Object.assign({}, state, {});
      }
      let Chats = cloneDeep(state.Chats);
      SectionList = cloneDeep(state.SectionList);

      if(action.Chat.temporal){
        //alerts
        let DetonationsIndex = SectionList.findIndex(n => n.title === "Detonación");
        if(DetonationsIndex >= 0){
          let Detonations = cloneDeep(SectionList[DetonationsIndex]);
          Detonations.data.unshift(action.Chat);
          SectionList[DetonationsIndex].data = Detonations.data.sort((a, b) => { return b.updated_date - a.updated_date});
        }
        else{
          SectionList.unshift({title:"Detonación", data:[action.Chat]});
        }
      }
      else if(action.Chat.chatType == 2){
        //oficial
        let OfficialsIndex = SectionList.findIndex(n => n.title === "Detonación remota");
        if(OfficialsIndex >= 0){
          let Officials = cloneDeep(SectionList[OfficialsIndex]);
          Officials.data.unshift(action.Chat);
          SectionList[OfficialsIndex].data = Officials.data.sort((a, b) => { return b.updated_date - a.updated_date});
        }
        else{
          SectionList.push({title:"Detonación remota", data:[action.Chat]});
        }
      }
      else{
        //normal chat
        let NormalIndex = SectionList.findIndex(n => n.title === "Conversaciones");
        if(NormalIndex >= 0){
          let Normal = cloneDeep(SectionList[NormalIndex]);
          Normal.data.unshift(action.Chat);
          SectionList[NormalIndex].data = Normal.data.sort((a, b) => { return b.updated_date - a.updated_date});
        }
        else{
          SectionList.push({title:"Conversaciones", data:[action.Chat]});
        }
      }

      Chats.push(action.Chat);

      return Object.assign({}, state, {
        Chats: Chats, SectionList:SectionList
      })
    case 'FLUSH_DATA':
      return Object.assign({}, state, {
        Client:null,
        Chats:[],
        CurrentChat:null,
        Messages:[],
        Participants:[],
        OngoingAlert:false,
        SectionList:[],
        Nickname:null,
        Username:null
      })
    default:
      return state;
  }
}

const AppContainer = createAppContainer(Navigator);
var AlertaSound = null;
var SuspiciousSound = null;
let ReconnectFlag = false;
let LastReconnect = new Date().getTime();
let CurrentRoute = null;
let apiLevelAndroid = "";
let updateNearby;

export default class App extends React.Component {
  constructor(properties) {
      super(properties);

      this.store = createStore(combineReducers({ chatState:chatState, clientState:clientState, userState:userState }));
      this.LogoutFlag = false;

      console.disableYellowBox = true;

      this.state = {
        Username:null,
        Password:null,
        Nickname:null,
        From:null,
        isLoggedIn:false,
        Resource:null,
        OldState:null,
        DataLoaded:false,
        PendingChat:null,
        NotificationsPermissions:false,
        Logout:false,
        Reconnecting:false,
        AlertMode:false,
        ConversationAlert:null,
        AlertId:null,
        OngoingAlerts:[],
        CurrentBeacons:[],
        AttendingAlert:null,
        CurrentArea:null,
        AudioURL:"",
        isOffline:false,
        Disconnected:false,
        Moving:false,
        LastReconnect:new Date().getTime(),
        LastUpdate:null,
        IsGlobal:false,
        timeout: 1500,
        locationModal:false,
        locationEntry:false,
        geofenceConfigured:false,
        TrackLocationUpdates:false,
        User:null,
        OfficialSchedule:null,
        BadgeCount:0
      };
  }

  componentWillUnmount(){
    this.db.close();
    BackgroundGeolocation.removeListeners();
    BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked.bind(this));
    AppState.removeEventListener("change", this._handleAppStateChange.bind(this));
    this.xmppClientListeners.forEach(function(listener){
      this.xmppClient.removeListener(listener.name,
                                     listener.callback);
    }.bind(this));
    this.xmppClient.stop();
    clearInterval(updateNearby);
  }

  getLastSaved(){
    AsyncStorage.multiGet(["CurrentArea", "CurrentBeacons", "LocationModal", "AttendingAlert"], async (asyncError, Store) => {
      if(asyncError != null){}
      else{
        let CurrentArea = null;
        let CurrentBeacons = [];
        let locationEntry = false;
        let AttendingAlert = null;
        for(let m = 0; m < Store.length;m++){
          if(Store[m][0] === 'CurrentArea'){
            if(Store[m][1] != null){
              CurrentArea = Store[m][1];
              CurrentArea = JSON.parse(CurrentArea);
            }
          }
          else if(Store[m][0] === 'CurrentBeacons'){
            if(Store[m][1] != null){
              CurrentBeacons = Store[m][1];
              CurrentBeacons = JSON.parse(CurrentBeacons);
            }
          }
          else if(Store[m][0] === 'LocationModal'){
            if(Store[m][1] != null){
              locationEntry = true;
            }
          }
          else if(Store[m][0] === 'AttendingAlert'){
            if(Store[m][1] != null){
              AttendingAlert = Store[m][1];
            }
          }
        }

        this.setState({CurrentBeacons: CurrentBeacons != undefined ? CurrentBeacons : [], CurrentArea:CurrentArea, locationEntry:locationEntry, AttendingAlert:AttendingAlert});
      }
    });
  }

  configureGeofencing(){
    let circleRadius = 200;
    let startUpLocation = true;
    this.getStartPosition();
    let LastBeaconUpdate = null;

    BackgroundGeolocation.onLocation((location) => {
      let { AlertMode, ConversationAlert, Nickname, AlertId, CurrentBeacons, TrackLocationUpdates, AttendingAlert } = this.state;
      if(location.sample == true){
        return false;
      }
      if(!EndpointRequests.IsProduction){
        if(this.refs.toast != undefined){
          this.refs.toast.show('location update ' + "(" + location.coords.latitude + "," + location.coords.longitude + ")" , 1000);
        }
      }
      if(AlertMode){
        if(circleRadius != 50){
          BackgroundGeolocation.start(() => {
            BackgroundGeolocation.setConfig({
              distanceFilter: 50,
              stopOnTerminate: false,
              stopOnStationary:false,
              startOnBoot: true,
              url:null,
              batchSync: false,
              autoSync: false,
              autoSyncThreshold: 1,
              disableElasticity: false
            }).then((state) => {});
          });
          circleRadius = 50;
        }
      }
        /*
        if(location.coords.speed != null && location.coords.speed >= 10 && location.coords.speed < 25){
          if(circleRadius != 100){
            BackgroundGeolocation.setConfig({
              distanceFilter: 50,
              stopOnTerminate: false,
              stopOnStationary:false,
              startOnBoot: true,
              url:null,
              batchSync: false,
              autoSync: false,
              autoSyncThreshold: 1,
              disableElasticity: true,
              elasticityMultiplier:0,
            }).then((state) => {});
          }
          circleRadius = 100;
        }
        else if(location.coords.speed != null && location.coords.speed >= 25){
          if(circleRadius != 150){
            BackgroundGeolocation.setConfig({
              distanceFilter: 150,
              stopOnTerminate: false,
              stopOnStationary:false,
              startOnBoot: true,
              url:null,
              batchSync: false,
              autoSync: false,
              autoSyncThreshold: 1,
              disableElasticity: true,
              elasticityMultiplier:0,
            }).then((state) => {});
          }
          circleRadius = 150;
        }
        else if(location.coords.speed != null && location.coords.speed < 10){
          if(circleRadius != 50){
            BackgroundGeolocation.setConfig({
              distanceFilter: 50,
              stopOnTerminate: false,
              stopOnStationary:false,
              startOnBoot: true,
              url:null,
              batchSync: false,
              autoSync: false,
              autoSyncThreshold: 1,
              disableElasticity: true,
              elasticityMultiplier:0,
            }).then((state) => {});
          }
          circleRadius = 50;
        }
      }
      */
      this.db.transaction((tx) => {
        tx.executeSql('INSERT INTO location (latitude, longitude, date) VALUES (?, ?, ?)',
        [String(location.coords.latitude), String(location.coords.longitude), new Date().toISOString()],
        (txx, results) => {
          this.setState({coordinate: location.coords});
          this.store.dispatch({type:'UPDATE_LOCATION', Location:location.coords, Radius:circleRadius});

          if(AlertMode && !TrackLocationUpdates){
            if(this.xmmpClient != undefined && this.xmppClient.status != "online"){
              return false;
            }
            if(AttendingAlert != undefined && ConversationAlert === AttendingAlert){
              /*
              let stringCoordinates = "(" + location.coords.latitude + "," + location.coords.longitude + ") ? " + ConversationAlert;
              let updateMessage = xml("message", {to: ConversationAlert, id:id(), from: ConversationAlert + "/" + Nickname, type:'groupchat'}, xml("body", {}, "~LocationUpdate." + stringCoordinates), xml("EmergencyId", {}, AlertId), xml("EmergencyType", {}, "Medical"), xml("type", {}, "Emergency"), xml("emergencyAction", {}, "AttendingUpdate"), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let updateResponse = this.xmppClient.send(updateMessage);
              */
            }
            else{
              let stringCoordinates = "(" + location.coords.latitude + "," + location.coords.longitude + ") ? " + ConversationAlert;
              let updateMessage = xml("message", {to: ConversationAlert, id:id(), from: ConversationAlert + "/" + Nickname, type:'groupchat'}, xml("body", {}, "~LocationUpdate." + stringCoordinates), xml("EmergencyId", {}, AlertId), xml("EmergencyType", {}, "Emergency"), xml("type", {}, "Emergency"), xml("emergencyAction", {}, "Update"), xml("request", {xmlns:"urn:xmpp:receipts"}));
              let updateResponse = this.xmppClient.send(updateMessage);
            }
          }
          else if(AttendingAlert != null){
            /*
            let stringCoordinates = "(" + location.coords.latitude + "," + location.coords.longitude + ") ? " + AttendingAlert;
            let updateMessage = xml("message", {to: AttendingAlert, id:id(), from: AttendingAlert + "/" + Nickname, type:'groupchat'}, xml("body", {}, "~LocationUpdate." + stringCoordinates), xml("EmergencyId", {}, AlertId), xml("EmergencyType", {}, "Medical"), xml("type", {}, "Emergency"), xml("emergencyAction", {}, "AttendingUpdate"), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let updateResponse = this.xmppClient.send(updateMessage);
            */
          }
        })
      });
    }, (error, err1) => {
      console.log("[location] ERROR: ", error);
    });

    BackgroundGeolocation.onProviderChange((event) => {
      let authorizationStatus = event.authorizationStatus;
      if (event.status != 3) {
        this.store.dispatch({type:'PERMISSIONS_ENABLED', Permissions:false});
      }
      else{
        this.store.dispatch({type:'PERMISSIONS_ENABLED', Permissions:true});
      }
    });

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.onMotionChange(location => {
      let { AlertMode, TrackLocationUpdates, AttendingAlert } = this.state;
      if(!EndpointRequests.IsProduction){
        if(location.isMoving){
          if(this.refs.toast != undefined){
            this.refs.toast.show('moving', 1000);
          }
        }
        else{
          if(this.refs.toast != undefined){
            this.refs.toast.show('stopped', 1000);
          }
        }
      }
      if(location.isMoving && AlertMode && !TrackLocationUpdates){
        BackgroundGeolocation.start(() => {
          BackgroundGeolocation.setConfig({
            distanceFilter: 50,
            stopOnTerminate: false,
            stopOnStationary:false,
            startOnBoot: true,
            url:null,
            batchSync: false,
            autoSync: false,
            autoSyncThreshold: 1,
            disableElasticity: false
          }).then((state) => {});
        });
      }
    });

    BackgroundGeolocation.onGeofencesChange((event) => {
      let on = event.on;     //<-- new geofences activated.
      let off = event.off;

      if(on.length > 0){
        for(let k = 0; k < on.length;k++){
          this.store.dispatch({type:'ADD_GEOFENCE_SCREEN', Point:on[k]});
        }
      }

      if(off.length > 0){
        for(let i = 0; i < off.length;i++){
          this.store.dispatch({type:'REMOVE_GEOFENCE_SCREEN', id:off[i]});
        }
      }
    });

    BackgroundGeolocation.onGeofence((event) => {
      let { CurrentBeacons, CurrentArea, AlertMode, User } = this.state;

      if(event.action === "ENTER"){
        if(event.identifier === "area"){
          this.store.dispatch({type:'UPDATE_CURRENT_GEOAREA', Point:{id:event.identifier, coords:event.location.coords}});
        }
        else if(event.extras.type != undefined && event.extras.type === 0){
          if(CurrentArea != event.extras.displayName){
            /*
            Notification.create({
              subject: 'Entraste en área de cobertura',
              message: event.extras.displayName,
              smallIcon: 'ic_launcher',
              payload: { sound:"default" }
            });
            */
            this.store.dispatch({type:'UPDATE_AREA_NAME', AreaName:event.extras.displayName, AreaCode:event.identifier});
            this.setState({CurrentArea:event.extras.displayName});
            AsyncStorage.setItem("CurrentArea", JSON.stringify(event.extras.displayName), (asyncError) => {})
          }
          else{
            this.store.dispatch({type:'UPDATE_AREA_NAME', AreaName:event.extras.displayName, AreaCode:event.identifier});
          }
        }
        else if(event.extras.type != undefined && event.extras.type === 1){
          if(CurrentBeacons.length > 0){
            let exists = CurrentBeacons.findIndex(n => n.id === event.identifier);
            if(exists < 0){
              this.store.dispatch({type:'UPDATE_CURRENT_GEOFENCE', Point:{id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName}, Type:"ADD"});
              EndpointRequests.EnterBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
                if(response.error != undefined && response.error === "NotFound"){
                  BackgroundGeolocation.removeGeofence(event.identifier);
                }

                if(response.nearby != undefined){
                  this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:response.nearby});
                  AsyncStorage.setItem("NearbyUsers", response.nearby, (asyncError) => {});
                }
              });
              CurrentBeacons.push({id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName});
              this.setState({CurrentBeacons:CurrentBeacons, LastUpdate:new Date().getTime()});
              AsyncStorage.setItem("CurrentBeacons", JSON.stringify(CurrentBeacons), (asyncError) => {});
                if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && User.primaryAddress.beaconId.toUpperCase() === event.identifier){
                  Notification.create({
                    subject: "Bienvenido a casa",
                    message: " ",
                    payload: { sound:"default" }
                  });
                }
            }
            else{
              this.store.dispatch({type:'UPDATE_CURRENT_GEOFENCE', Point:{id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName}, Type:"ADD"});
              EndpointRequests.EnterBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
                if(response.error != undefined && response.error === "NotFound"){
                  BackgroundGeolocation.removeGeofence(event.identifier);
                }

                if(response.nearby != undefined){
                  this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:response.nearby});
                  AsyncStorage.setItem("NearbyUsers", response.nearby, (asyncError) => {})
                  this.setState({LastUpdate:new Date().getTime()});
                }
              });
            }
            try{
              let NewCurrentBeacons = [];
              //remove all beacons that are not the same as the one entering
              for(let i = 0; i < CurrentBeacons.length;i++){
                let beaconId = null;
                let beaconZone = null;
                if(CurrentBeacons[i].identifier != undefined){
                  beaconId = CurrentBeacons[i].identifier;
                }
                else if(CurrentBeacons[i].id != undefined){
                  beaconId = CurrentBeacons[i].id;
                }

                if(CurrentBeacons[i].zoneName != undefined){
                  beaconZone = CurrentBeacons[i].zoneName;
                }
                else if(CurrentBeacons[i].extras != undefined && CurrentBeacons[i].extras.codeName != undefined){
                  beaconZone = CurrentBeacons[i].extras.codeName;
                }
                if(CurrentBeacons[i].id != event.identifier && beaconId != undefined && beaconZone != undefined){
                  EndpointRequests.ExitBeacon({BeaconId:beaconId, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:beaconZone}, (response) => {
                    console.log('removed from previous beacons');
                  });
                }
                else{
                  NewCurrentBeacons.push({id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName});
                }
              }
              this.setState({CurrentBeacons:NewCurrentBeacons, LastUpdate:new Date().getTime()});
              AsyncStorage.setItem("CurrentBeacons", JSON.stringify(NewCurrentBeacons), (asyncError) => {})
            }catch(error){
              console.log(error);
            }
          }
          else{
            let pylonName = event.extras != undefined && event.extras.displayName != undefined ? event.extras.displayName : "Nombre no disponible";
            if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && User.primaryAddress.beaconId.toUpperCase() === event.identifier){
              Notification.create({
                subject: "Bienvenido a casa",
                message: " ",
                payload: { sound:"default" }
              });
            }
            this.store.dispatch({type:'UPDATE_CURRENT_GEOFENCE', Point:{id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName}, Type:"ADD"});
            EndpointRequests.EnterBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
              if(response.nearby != undefined){
                this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:response.nearby});
                AsyncStorage.setItem("NearbyUsers", response.nearby, (asyncError) => {})
              }
            });
            CurrentBeacons.push({id:event.identifier, coords:event.location.coords, zoneName: event.extras.codeName});
            this.setState({CurrentBeacons:CurrentBeacons,LastUpdate:new Date().getTime()});
            AsyncStorage.setItem("CurrentBeacons", JSON.stringify(CurrentBeacons), (asyncError) => {})
          }
        }
      }
      else{
        if(event.identifier === "area" && !AlertMode){
          BackgroundGeolocation.removeGeofence("area").then(success => {
            let geoArea = {
              identifier:"area",
              latitude:event.location.coords.latitude,
              longitude:event.location.coords.longitude,
              radius:1500,
              notifyOnEntry:true,
              notifyOnExit: true,
              notifyOnDwell: false,
              url:null,
              extras: {
                imaginary: true,
                color:'rgba(255,255,153,0.5)',
                type:3
              }
            };

            BackgroundGeolocation.addGeofence(geoArea).then((success) => {
              //request backend for alarms near inside this radius
              let coordinateObject = {
                latitude:event.location.coords.latitude,
                longitude:event.location.coords.longitude,
                getAlarms: true
              };

              EndpointRequests.UpdateLocation(coordinateObject, (response) => {
                if(response.devices != null){
                  AsyncStorage.setItem("GeoAreas", JSON.stringify(response.devices), (asyncError) => {});
                  this.setState({coordinate: coordinateObject});
                  this.store.dispatch({type:'UPDATE_GEOFENCE', Points:response.devices.sort((a, b) => { return b.radius - a.radius})});
                  this.store.dispatch({type:'UPDATE_LOCATION', Location:coordinateObject, Radius:200});
                  startUpLocation = false;
                  this.store.dispatch({type:'UPDATE_ACCOUNT_STATUS', Data:{verifiedEmail:response.emailStatus, verifiedIdentity:response.accountStatus}});
                  if(response.devices.length > 0){
                    BackgroundGeolocation.addGeofences(response.devices).then((success) => {
                      console.log("[addGeofences] success");
                    }).catch((error) => {
                      console.log("[addGeofences] FAILURE: ", error);
                    });
                  }
                }
                else{
                  this.setState({coordinate: coordinateObject});
                  this.store.dispatch({type:'UPDATE_LOCATION', Location:coordinateObject, Radius:200});
                  startUpLocation = false;
                  if(response.emailStatus != undefined && response.accountStatus != undefined){
                    this.store.dispatch({type:'UPDATE_ACCOUNT_STATUS', Data:{verifiedEmail:response.emailStatus, verifiedIdentity:response.accountStatus}});
                  }
                }
              });
            }).catch((error) => {
              console.log("[addGeofence] FAILURE: ", error);
            });
          });
        }
        else if(event.extras.type != undefined && event.extras.type === 0){
          if(CurrentArea != null){
            /*
            Notification.create({
              subject: "Saliste del área de cobertura.",
              message: event.extras.displayName,
              smallIcon: 'ic_launcher',
              payload: { sound:"default" }
            });
            */
            this.store.dispatch({type:'UPDATE_AREA_NAME', AreaName:null, AreaCode:null});
            this.setState({CurrentArea:null});
            AsyncStorage.setItem("CurrentArea", JSON.stringify(null), (asyncError) => {})
          }
        }
        else if(event.extras.type != undefined && event.extras.type === 1){
          let exists = CurrentBeacons.findIndex(n => n.id === event.identifier);

          if(exists >= 0){
            this.store.dispatch({type:'UPDATE_CURRENT_GEOFENCE', Point:{id:event.identifier}, Type:"REMOVE"});
            CurrentBeacons = CurrentBeacons.filter(element => element.id != event.identifier);
            this.setState({CurrentBeacons:CurrentBeacons,LastUpdate:new Date().getTime()});
            AsyncStorage.setItem("CurrentBeacons", JSON.stringify(CurrentBeacons), (asyncError) => {})
            EndpointRequests.ExitBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
              this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:"0"});
              AsyncStorage.setItem("NearbyUsers", "0", (asyncError) => {})
            });
            if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && User.primaryAddress.beaconId.toUpperCase() === event.identifier){
              Notification.create({
                subject: "Ambermex viaja contigo",
                message: " ",
                payload: { sound:"default" }
              });
            }
            if(CurrentBeacons.length === 0){
              let pylonName = event.extras != undefined && event.extras.displayName != undefined ? event.extras.displayName : "Nombre no disponible";
              if(LastBeaconUpdate == null || this.getMinutesBetweenDates(LastBeaconUpdate, new Date()) > 1){
                LastBeaconUpdate = new Date();
                // if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && User.primaryAddress.beaconId.toUpperCase() === event.identifier){
                //   Notification.create({
                //     subject: "Ambermex viaja contigo",
                //     message: " ",
                //     payload: { sound:"default" }
                //   });
                // }
              }
            }
          }
          else{
            if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && User.primaryAddress.beaconId.toUpperCase() === event.identifier){
              Notification.create({
                subject: "Ambermex viaja contigo",
                message: " ",
                payload: { sound:"default" }
              });
            }
            this.store.dispatch({type:'UPDATE_CURRENT_GEOFENCE', Point:{id:event.identifier}, Type:"REMOVE"});
            this.setState({LastUpdate:new Date().getTime()});
            try{
              EndpointRequests.ExitBeacon({BeaconId:event.identifier, Latitude:event.location.coords.latitude, Longitude:event.location.coords.longitude, ZoneName:event.extras.codeName}, (response) => {
                this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:"0"});
                AsyncStorage.setItem("NearbyUsers", "0", (asyncError) => {})
              });
            }
            catch(error){
              console.log(error);
            }
          }
        }
      }
    });

    BackgroundGeolocation.ready({
      enableHeadless: true,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 50, //200
      debug: false,              // <-- enable this hear debug sounds.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      stopOnStationary:false,
      startOnBoot: true,
      url:null,
      batchSync: false,
      autoSync: false,
      autoSyncThreshold: 1,
      disableElasticity: true,
      elasticityMultiplier:0,
      allowIdenticalLocations:true,
      geofenceModeHighAccuracy: true,
      maxRecordsToPersist:250,
      disableLocationAuthorizationAlert:true,
      geofenceInitialTriggerEntry:true,
      disableLocationAuthorizationAlert:true,
      notification: {
        smallIcon: "mipmap/ic_launcher"
      },
      locationAuthorizationRequest:"Always",
      backgroundPermissionRationale: {
        title: "Permitir acceso a tu ubicacion.",
        message: "Necesitas habilitar la opcion 'Siempre' en ubicacion, para poder detectar si estas en un area de cobertura.",
        positiveAction: "Cambiar a Todo el tiempo",
        negativeAction: "Cancelar"
      },
      locationAuthorizationAlert: {
        titleWhenNotEnabled: "No se tienen los permisos necesarios.",
        titleWhenOff: "No se tienen permisos de Ubicación.",
        instructions: "Necesitas habilitar la opcion 'Siempre' en ubicación, para poder detectar si estas en un area de cobertura.",
        cancelButton: "Cancelar",
        settingsButton: "Ajustes"
      }
    },  state => {
      this.setState({geofenceConfigured:true});
      setTimeout(function(){
        BackgroundGeolocation.startGeofences(function() {
          startUpLocation = false;
        }.bind(this));
      }.bind(this),5000);
    })
  }

  getMinutesBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    var diffMinutes = (diff / 60000);
    return diffMinutes;
  }

  getStartPosition(){
    Geolocation.getCurrentPosition((get_success) => {
      let coordinateObject = {
        latitude: get_success.coords.latitude,
        longitude: get_success.coords.longitude,
        getAlarms:true
      };

      let initialGeofences = [
        {
          identifier:"area",
          latitude:get_success.coords.latitude,
          longitude:get_success.coords.longitude,
          radius:1500,
          notifyOnEntry:true,
          notifyOnExit: true,
          notifyOnDwell: false,
          extras: {
            imaginary: true,
            color:'rgba(255,255,153,0.5)',
            type:3
          }
        }
      ]

      BackgroundGeolocation.addGeofences(initialGeofences).then((success) => {
        this.store.dispatch({type:'UPDATE_GEOFENCE', Points:initialGeofences});
        this.store.dispatch({type:'UPDATE_CURRENT_GEOAREA', Points:[{identifier:"area",latitude:get_success.coords.latitude,longitude:get_success.coords.longitude, radius:1500, notifyOnEntry:true, notifyOnExit: true}]});
      }).catch((error) => {
        console.log("[addGeofence] FAILURE: ", error);
      });

      this.db.transaction((tx) => {
        tx.executeSql('INSERT INTO location (latitude, longitude, date) VALUES (?, ?, ?)',
        [String(coordinateObject.latitude), String(coordinateObject.longitude), new Date().toISOString()],
        (txx, results) => {
          EndpointRequests.UpdateLocation(coordinateObject, (response) => {
            if(response.devices != null){
              this.setState({coordinate: coordinateObject});
              this.store.dispatch({type:'UPDATE_GEOFENCE', Points:response.devices.sort((a, b) => { return b.radius - a.radius})});
              this.store.dispatch({type:'UPDATE_LOCATION', Location:coordinateObject, Radius:200});
              this.store.dispatch({type:'UPDATE_ACCOUNT_STATUS', Data:{verifiedEmail:response.emailStatus, verifiedIdentity:response.accountStatus}});
              startUpLocation = false;
              if(response.devices.length > 0){
                AsyncStorage.setItem("GeoAreas", JSON.stringify(response.devices), (asyncError) => {}); //save to asyncstorage
                this.geofenceCheckLocal(response.devices, coordinateObject);
                BackgroundGeolocation.addGeofences(response.devices).then((success) => {
                  console.log("[addGeofences] success");
                }).catch((error) => {
                  console.log("[addGeofences] FAILURE: ", error);
                });
              }
            }
            else{
              this.setState({coordinate: coordinateObject});
              this.store.dispatch({type:'UPDATE_LOCATION', Location:coordinateObject, Radius:200});
              startUpLocation = false;
              this.getAllCachedGeofences((responseLocal) => {
                this.store.dispatch({type:'UPDATE_GEOFENCE', Points:responseLocal.sort((a, b) => { return b.radius - a.radius})});
              })
            }
          })
        })
      });
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
          alert("No se pudo adquirir tu ubicación. Intentalo de nuevo");
        }
      },{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  removeGeofencingPoints(){
    BackgroundGeolocation.removeGeofences().then(success => {
      console.log("[removeGeofences] all geofences have been destroyed");
    });
  }

  geofenceCheckLocal(zones,coordinateObject){
    let { CurrentBeacons, User } = this.state;
    let inCoverageAreas = [];
    let areaData = null;

    for(let i = 0;i < zones.length;i++){
      if(zones[i].identifier != "area" && zones[i].identifier != undefined){
        let geofenceCenter = {
          latitude: zones[i].latitude,
          longitude:zones[i].longitude,
          radius:zones[i].radius
        };

        let inCoverage = haversine(coordinateObject, geofenceCenter, {threshold: geofenceCenter.radius, unit: 'meter'});

        if(inCoverage){
          if(zones[i].extras.type == 0){
            areaData = zones[i];
          }
          else{
            let beaconArea = cloneDeep(zones[i]);
            beaconArea.id = beaconArea.identifier;
            beaconArea.coords = {
              latitude:beaconArea.latitude,
              longitude:beaconArea.longitude
            };
            beaconArea.zoneName = beaconArea.extras.displayName;
            inCoverageAreas.push(beaconArea);
            if(CurrentBeacons.length == 0 && inCoverageAreas.length == 1){
              if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && beaconArea.identifier.toUpperCase() === User.primaryAddress.beaconId.toUpperCase()){
                Notification.create({
                  subject: "Bienvenido a casa",
                  message: " ",
                  payload: { sound:"default" }
                });
              }
            }
          }
        }
      }
    }

    for(let i = 0; i < inCoverageAreas.length;i++){
      let id = null;
      if(inCoverageAreas[i].id != undefined){
        id = inCoverageAreas[i].id;
      }
      else if(inCoverageAreas[i].identifier != undefined){
        id = inCoverageAreas[i].identifier;
      }

      if(id != undefined){
        let index = CurrentBeacons.findIndex(x => x.id == id || x.identifier == id);
        if(index < 0){
          CurrentBeacons.push(inCoverageAreas[i]);
          if(User != undefined && User.primaryAddress != undefined && User.primaryAddress.beaconId != undefined && id.toUpperCase() === User.primaryAddress.beaconId.toUpperCase()){
            Notification.create({
              subject: "Bienvenido a casa",
              message: " ",
              payload: { sound:"default" }
            });
          }
        }
      }
    }

    if(areaData != undefined){
      this.setState({CurrentBeacons:CurrentBeacons, LastUpdate:new Date().getTime(), CurrentArea:areaData.extras.displayName});
      this.store.dispatch({type:'UPDATE_GEOFENCES_INITIAL', AreaName:areaData.extras.displayName,AreaCode:areaData.extras.codeName,Points:inCoverageAreas});
    }
  }

  async getAllCachedGeofences(cb){
    let geofences = await BackgroundGeolocation.getGeofences();
    cb(geofences);
  }

  playSound(soundUrl){
    this.setState({AudioURL:soundUrl});

    setTimeout(function(){
      this.webview.injectJavaScript('document.getElementById("audio").play();');
    }.bind(this),500);
    /*
    let Audio = new Sound(soundUrl, encodeURIComponent(Sound.MAIN_BUNDLE), (error) => {
      if(error){
        this.setState({errorSound:true});
        return;
      }
      else{
        Audio.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }
    });
    */
  }

  onReceived(notification) {
    const { Username, DataLoaded, OldState } = this.state;
    if(notification.additionalData != undefined && notification.additionalData.type === "Message"){
      if(notification.additionalData.refresh != undefined){
        this.store.dispatch({type:"UPDATE_CONVERSATION", Chat:notification.additionalData.conversationId});
      }
      if(OldState === 'active'){
        this.store.dispatch({type:"SHOW_LOCAL_NOTIFICATION", Notification:{title:notification.title, message:notification.body, conversationId:notification.additionalData.conversationId, additionalData:notification.additionalData}});
        if(notification.sound != undefined && notification.sound.startsWith("alarma")){
          if(AlertaSound != undefined){
            AlertaSound.setCurrentTime(3);
            AlertaSound.play((success) => {
              if(success){
                if(Platform.OS === 'android'){
                  AlertaSound.reset();
                }
              }
            });
          }
        }
        else if(notification.sound != undefined && notification.sound.startsWith("suspicious")){
          if(SuspiciousSound != undefined){
            SuspiciousSound.play((success) => {
              if(success){
                if(Platform.OS === 'android'){
                  SuspiciousSound.reset();
                }
              }
            });
          }
        }
        if(Platform.OS === "ios"){
          this.resetBadgeCount()
        }
      }
      else{
        if(notification.foreground){
          if(notificationData.globalalert){
            if(DataLoaded){
              this.store.dispatch({type:"LOAD_CHATLIST"});
            }
            if(AlertaSound != undefined){
              AlertaSound.setCurrentTime(3);
              AlertaSound.play((success) => {
                if(success){
                  if(Platform.OS === 'android'){
                    AlertaSound.reset();
                  }
                }
              });
            }
          }
          else{
            return true;
          }
        }
        else{
          if(notificationData.globalalert){
            if(DataLoaded){
              //this.store.dispatch({type:"LOAD_CHATLIST"});
            }
            else{
              this.setState({PendingChat:notificationData.conversationId, IsGlobal:true});
            }
          }
          else{
            return true;
          }
        }
      }
    }
    else if(notification.additionalData != undefined && notification.additionalData.category != undefined){
      if(notification.additionalData.category === "Officials"){
        if(notification.additionalData.type === "Start"){
          this.store.dispatch({type:'START_OFFICIAL_SCHEDULE'});
          //alert("Your activity is starting now");
        }
        else if(notification.additionalData.type === "End"){
          this.store.dispatch({type:'END_OFFICIAL_SCHEDULE'});
          //alert("Your activity is ending now");
        }
      }
    }
    else{
      //
    }
  }

  onOpened(notification) {
    const { Nickname, DataLoaded } = this.state;
    //verify if chat exists locally, if not, wait for it to be created, then load
    if(notification.additionalData != null && notification.additionalData.type === "Message"){
      if(notification.additionalData.conversationId != undefined){
        if(DataLoaded){
          this.store.dispatch({type:'CLEAR_CURRENT'});
          this.store.dispatch({type:"LOAD_CHANNEL", LoadChat:{id:notification.additionalData.conversationId}});
        }
        else{
          this.setState({PendingChat:notification.additionalData.conversationId});
        }
      }
    }
  }

  componentDidMount(){
    if(Platform.OS === "ios"){
      DefaultPreference.setName(APP_INFO.GROUP_NAME);
    }

    AsyncStorage.multiGet(["GeoAreas", "NearbyUsers"], async (asyncError, Store) => {
      if(asyncError != null){}
      else{
        let NearbyUsers = "0";
        let GeoAreas = null;

        for(let m = 0; m < Store.length;m++){
          if(Store[m][0] === 'GeoAreas'){
            if(Store[m][1] != null){
              GeoAreas = Store[m][1];
              GeoAreas = JSON.parse(GeoAreas);
            }
          }
          else if(Store[m][0] === 'NearbyUsers'){
            if(Store[m][1] != null){
              NearbyUsers = Store[m][1];
              NearbyUsers = JSON.parse(NearbyUsers);
            }
          }
        }

        if(GeoAreas != undefined){
          Geolocation.getCurrentPosition((get_success) => {
            let coordinateObject = {
              latitude: get_success.coords.latitude,
              longitude: get_success.coords.longitude,
              getAlarms:true
            };

            this.geofenceCheckLocal(GeoAreas, coordinateObject);

            this.store.dispatch({type:"UPDATE_NEARBY_USERS", TotalNearby:NearbyUsers});
          }, (geo_error) => {},{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
        }
      }
    });

    console.disableYellowBox = true;

    DeviceInfo.getApiLevel().then((apiLevel) => {
      apiLevelAndroid = apiLevel;
    });

    /*PushNotificationIOS.getInitialNotification().then((notification) => {
      if (notification != null) {
        let notificationData = notification.getData();

        if(notificationData.data.jsonBody != null && notificationData.data.jsonBody.type === "Message"){
          this.setState({PendingChat:notificationData.data.jsonBody.conversationId});
        }
      }
    });
    */
    //OneSignal Init Code
    //The following options are available with increasingly more information:
    //0 = NONE, 1 = FATAL, 2 = ERROR, 3 = WARN, 4 = INFO, 5 = DEBUG, 6 = VERBOSE
    OneSignal.setLogLevel(0, 0);
    OneSignal.setAppId(APP_INFO.ONE_SIGNAL_APP_ID);
    //END OneSignal Init Code

    this.getLastSaved();
    this.store.dispatch({type:"SET_LOGIN", ConfigurePush:(userId) => this.configurePushNotifications(userId), Function:async (Username, Password, DeviceInfo, cb) => this.loginNET(Username, Password, DeviceInfo, cb), LoginXMPP: async (Username, Password, Resource) => this.loginToServer(Username, Password, Resource), SetSigninData:(responseData) => this.setSigninData(responseData)});
    this.store.dispatch({type:"SET_LOADED_DATA", ScheduleNotifications:(schedule) => this.scheduleOfficialNotifications(schedule), LoadedData: (UserData) => this.loadedData(UserData), SetDBAfterLogout: () => this.setDBAfterLogout(), CheckPending: () => this.checkPendingMessage(), GetCachedGeo: (cb) =>  this.getAllCachedGeofences(cb), PlayAudio:(audio) => this.playSound(audio), ExistingAlarm:(alarm) => this.enableAlertMode(alarm), DisableTracking:() => this.disableTracking()});

    const unsubscribe = NetInfo.addEventListener(state => {
      EndpointRequests.changeInternetStatus(state.isConnected);
      if(!state.isConnected){
        if(this.xmppClient != undefined){
          ReconnectFlag = true;
          this.store.dispatch({type:"UPDATE_STATUS", Status:'CONNECTING', Internet:true});
          this.setState({Disconnected:true});
        }
        if(this.refs.toast != undefined){
          this.refs.toast.show('Parece que no tienes conexión a internet; Por favor verifica tu conexión.', 5000);
        }
      }
      else{
        this.store.dispatch({type:"RECONNECT_RELOAD"});
      }
    })

    this.db = SQLite.openDatabase("AlertaMXDB.sqlite", "1.0", "Alerta DB", 200000, (result) => this.openCB(result), (error) => this.errorCB(error));
    this.createDB();

    this.store.dispatch({type:"SET_DB", DB: this.db});

    AppState.addEventListener("change", this._handleAppStateChange.bind(this));

    EndpointRequests.setToken(() => this.logout());
    Sound.setCategory('Playback');
    AlertaSound = new Sound(require('./assets/image/alarma.mp3'),  (e) => {
      if(e) {
        this.setState({errorSound:true});
        return;
      }
    });
    SuspiciousSound = new Sound('suspicious.wav', encodeURIComponent(Sound.MAIN_BUNDLE), (error) => {
      if(error){
        this.setState({errorSound:true});
        return;
      }
    });
    let currentState = AppState.currentState;

    this.setState({OldState:currentState});
    BackHandler.addEventListener('hardwareBackPress', this.onBackClicked.bind(this));
  }

  onBackClicked(){
    if(CurrentRoute === "Convos"){
      RNExitApp.exitApp();
      return true;
    }
    else if(CurrentRoute === "Chat"){
      this.store.dispatch({type:'BACK_ANDROID_CHAT'});
      return true;
    }
    else if(CurrentRoute === "PublicAlert"){
      this.store.dispatch({type:'BACK_ANDROID_PUBLICALERT'});
      return true;
    }
    else{
      return false;
    }
  }

  async tryToReconnect(){
    if(this.xmppClient != undefined){
      await this.xmppClient.reconnect.stop();
      await this.xmppClient.stop();
      setTimeout(async function(){
        await this.xmppClient.reconnect.start();
        await this.xmppClient.start();
      }.bind(this),200);
    }
  }

  scheduleOfficialNotifications(schedule){
    this.removeScheduleOfficialNotifications();
    if(schedule == undefined){
      return false;
    }
    let weekDay = new Date();
    let weekSchedule = [];
    for(let i = 0; i <= 6;i++){
      let startDate;
      let endDate;
      let dayString;
      let dayNumber;
      let day = weekDay.getDay();
      let notificationId;
      if(day == 0 && schedule.sunday != null){
        schedule.sunday.start = new Date(schedule.sunday.start);
        schedule.sunday.end = new Date(schedule.sunday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.sunday.start.getUTCHours(), schedule.sunday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.sunday.end.getUTCHours(), schedule.sunday.end.getUTCMinutes(),0,0));
        dayString = "Sunday";
        dayNumber = 0;
        notificationId = dayString + dayNumber;
      }
      else if(day == 1 && schedule.monday != null){
        schedule.monday.start = new Date(schedule.monday.start);
        schedule.monday.end = new Date(schedule.monday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.monday.start.getUTCHours(), schedule.monday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.monday.end.getUTCHours(), schedule.monday.end.getUTCMinutes(),0,0));
        dayString = "Monday";
        dayNumber = 1;
        notificationId = dayString + dayNumber;
      }
      else if(day == 2 && schedule.tuesday != null){
        schedule.tuesday.start = new Date(schedule.tuesday.start);
        schedule.tuesday.end = new Date(schedule.tuesday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.tuesday.start.getUTCHours(), schedule.tuesday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.tuesday.end.getUTCHours(), schedule.tuesday.end.getUTCMinutes(),0,0));
        dayString = "Tuesday";
        dayNumber = 2;
        notificationId = dayString + dayNumber;
      }
      else if(day == 3 && schedule.wednesday != null){
        schedule.wednesday.start = new Date(schedule.wednesday.start);
        schedule.wednesday.end = new Date(schedule.wednesday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.wednesday.start.getUTCHours(), schedule.wednesday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.wednesday.end.getUTCHours(), schedule.wednesday.end.getUTCMinutes(),0,0));
        dayString = "Wednesday";
        dayNumber = 3;
        notificationId = dayString + dayNumber;
      }
      else if(day == 4 && schedule.thursday != null){
        schedule.thursday.start = new Date(schedule.thursday.start);
        schedule.thursday.end = new Date(schedule.thursday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.thursday.start.getUTCHours(), schedule.thursday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.thursday.end.getUTCHours(), schedule.thursday.end.getUTCMinutes(),0,0));
        dayString = "Thursday";
        dayNumber = 4;
        notificationId = dayString + dayNumber;
      }
      else if(day == 5 && schedule.friday != null){
        schedule.friday.start = new Date(schedule.friday.start);
        schedule.friday.end = new Date(schedule.friday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.friday.start.getUTCHours(), schedule.friday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.friday.end.getUTCHours(), schedule.friday.end.getUTCMinutes(),0,0));
        dayString = "Friday";
        dayNumber = 5;
        notificationId = dayString + dayNumber;
      }
      else if(day == 6 && schedule.saturday != null){
        schedule.saturday.start = new Date(schedule.saturday.start);
        schedule.saturday.end = new Date(schedule.saturday.end);
        startDate = new Date(new Date(weekDay).setHours(schedule.saturday.start.getUTCHours(), schedule.saturday.start.getUTCMinutes(),0,0));
        endDate = new Date(new Date(weekDay).setHours(schedule.saturday.end.getUTCHours(), schedule.saturday.end.getUTCMinutes(),0,0));
        dayString = "Saturday";
        dayNumber = 6;
        notificationId = dayString + dayNumber;
      }

      if(startDate != undefined && endDate != undefined){
        weekSchedule.push({start:startDate,end:endDate, dayName:dayString, dayNumber: dayNumber});
        let now = new Date();
        if(now >= startDate && now < endDate){
          this.store.dispatch({type:'START_OFFICIAL_SCHEDULE'});
        }
        if(startDate > now){
          if(Platform.OS === "ios"){
            if(startDate.getHours() != 0 && startDate.getMinutes() != 0){
              PushNotificationIOS.addNotificationRequest({id: String(dayNumber) + "-start", fireDate:startDate, title:"Tu horario como miembro oficial a empezado", body:"Recibiras alertas creadas en tu area de cobertura.", category:"Officials", userInfo:{type:"Start", date:startDate, category:"Officials"} });
            }
          }
          else{
            if(startDate.getHours() != 0 && startDate.getMinutes() != 0){
              Notification.create({
                subject: "Tu horario como miembro oficial a empezado",
                message: "Recibiras alertas creadas en tu area de cobertura.",
                sendAt: startDate,
                payload: { category: "officials_notifications",
                type:"Start", date:startDate,
                sound:"default" }
              });
            }
          }
        }

        if(endDate > now){
          if(Platform.OS === "ios"){
            if(endDate.getHours() != 23 && endDate.getMinutes() != 59){
              PushNotificationIOS.addNotificationRequest({id: String(dayNumber) + "-end", fireDate:endDate, title:"Tu horario como miembro oficial a terminado", body:"Gracias por apoyar a tu comunidad.", category:"Officials", userInfo:{type:"End", date:endDate, category:"Officials"} });
            }
          }
          else{
            if(endDate.getHours() != 23 && endDate.getMinutes() != 59){
              Notification.create({
                subject: "Tu horario como miembro oficial a terminado",
                message: "Gracias por apoyar a tu comunidad.",
                sendAt: endDate,
                payload: { category: "officials_notifications",
                type:"End", date:endDate,
                sound:"default" }
              });
            }
          }
        }
      }
      weekDay.setDate(weekDay.getDate() + 1);
    }
    //alert(JSON.stringify(weekSchedule));
    this.setState({OfficialSchedule:weekSchedule});
    AsyncStorage.setItem("OfficialSchedule", JSON.stringify(weekSchedule), (asyncError) => {});
  }

  removeScheduleOfficialNotifications(){
    if(Platform.OS === "ios"){
      PushNotificationIOS.cancelAllLocalNotifications();
    }
    else{
      Notification.deleteAll();
    }
  }

  checkLocationPermission(){
    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          this.requestLocationPermission();
          break;
        case RESULTS.DENIED:
          this.requestLocationPermission();
          break;
        case RESULTS.GRANTED:
          AsyncStorage.setItem("Location", "true", (asyncError) => {
            this.configureGeofencing();
          });
          break;
        case RESULTS.BLOCKED:
          this.requestLocationPermission();
          break;
      }
    })
    .catch((error) => {
      // …
    });
  }

  requestLocationPermission(){
    let { locationEntry, geofenceConfigured } = this.state;

    if(apiLevelAndroid < 29 && !locationEntry){
      AsyncStorage.setItem("LocationModal", "true", (asyncError) => {
        this.setState({locationModal:true, locationEntry:true});
      });
    }
    else{
      request(Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_ALWAYS : (apiLevelAndroid >= 29 ? PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)).then((result) => {
        if(result === "granted"){
          this.store.dispatch({type:'PERMISSIONS_ENABLED', Permissions:true});
          this.configureGeofencing();
        }
        else if(result === 'blocked'){
          if(!locationEntry){
            AsyncStorage.setItem("LocationModal", "true", (asyncError) => {
              this.setState({locationModal:true, locationEntry:true});
            });
          }
          else{
            this.configureGeofencing();
          }
        }
        else{
          if(!locationEntry){
            AsyncStorage.setItem("LocationModal", "true", (asyncError) => {
              this.setState({locationModal:true, locationEntry:true});
            });
          }
          else{
            this.store.dispatch({type:'PERMISSIONS_ENABLED', Permissions:false});
            this.refs.toast.show("El permiso de ubicación debe ser 'Todo el Tiempo' para acceder a todas las funciones. Habilita la opción en Ajustes.", 5000);
            this.configureGeofencing();
          }
        }
      });
    }
  }

  configurePushNotifications(userId, retry){
    const { NotificationsPermissions } = this.state;

    requestNotifications(['alert', 'sound']).then(({status, settings}) => {
      switch(status){
        case "denied":
          if(!retry){
            Alert.alert(
             'La aplicación no cuenta con los permisos adecuados.',
             "Las notificaciones son necesarias para el buen funcionamiento de la aplicación.",
             [
               {text: 'Ir a Ajustes', onPress: () => Linking.openURL('app-settings:')},
               {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }
          this.setState({NotificationsPermissions:false});
          break;
        case "granted":
          if(!NotificationsPermissions){
            if(Platform.OS === "ios"){
              //Prompt for push on iOS. Unnecessary for this case, but maybe onesignal sets internal values when you use this call
              OneSignal.promptForPushNotificationsWithUserResponse(response => {
                console.log("Prompt response:", response);
              });
            }
            OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
              let notification = notificationReceivedEvent.getNotification();
              const data = notification.additionalData;
              this.onReceived(notification);
              // Complete with null means don't show a notification.
              notificationReceivedEvent.complete(notification);
            });

            //Method for handling notifications opened
            OneSignal.setNotificationOpenedHandler(notification => {
              this.onOpened(notification.notification);
            });

            OneSignal.setExternalUserId(userId);
            //add update nearby users check every 5 minutes when in foreground
            updateNearby = setInterval(function() {
              this.updateData();
            }.bind(this), 60000)
            this.setState({NotificationsPermissions:true});
          }
          break;
        default:
          if(!retry){
            Alert.alert(
             'La aplicación no cuenta con los permisos adecuados.',
             "Las notificaciones son necesarias para el buen funcionamiento de la aplicación.",
             [
               {text: 'Ir a Ajustes', onPress: () => Linking.openURL('app-settings:')},
               {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }
          this.setState({NotificationsPermissions:false});
          break;
      }
    })
    .catch((error) => {
        console.log('error getting permissions');
    })
  }

  async deleteAWSToken(){
    this.setState({Username:null, Nickname:null, From:null, Password:null});
  }

  createDB(){
    this.db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (username STRING PRIMARY KEY UNIQUE,JID STRING UNIQUE, name STRING, picture STRING, address STRING, unit STRING, phone STRING, last_name STRING, is_member_loaded BOOLEAN, info_updated_at DATETIME, alias STRING );', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS conversations ( JID STRING CONSTRAINT Name PRIMARY KEY NOT NULL, created_at DATETIME NOT NULL, subject STRING, description STRING, type STRING, last_time_read DATETIME, temporal BOOLEAN DEFAULT (0), thumbnail STRING, locked BOOLEAN DEFAULT (0), additionalProps STRING); ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS messages ( id STRING PRIMARY KEY UNIQUE NOT NULL, text STRING, sent_at DATETIME NOT NULL, read_by_all BOOLEAN, sent_by STRING REFERENCES users (JID) NOT NULL, conversation_id STRING REFERENCES conversations (JID) NOT NULL, sent BOOLEAN DEFAULT (0), isMedia BOOLEAN DEFAULT (0), isImage BOOLEAN DEFAULT (0), isVideo BOOLEAN DEFAULT (0), isFile BOOLEAN DEFAULT (0), url STRING, filename STRING, thumbnail STRING, isAudio BOOLEAN DEFAULT (0), isEdited BOOLEAN DEFAULT (0), isQuoted BOOLEAN DEFAULT (0), quoted_msg_id STRING, quoted_text STRING, isSystemMsg BOOLEAN DEFAULT (0), isHidden BOOLEAN DEFAULT (0) ); ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS conversation_member ( id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_id STRING REFERENCES users (JID) ON DELETE CASCADE NOT NULL, conversation_id STRING REFERENCES conversations (JID) ON DELETE CASCADE NOT NULL, is_admin BOOLEAN, is_owner BOOLEAN, is_member BOOLEAN, added_on DATETIME, last_visit DATETIME, is_emcontact BOOLEAN, is_response BOOLEAN, response_type INTEGER, UNIQUE ( user_id, conversation_id ) ON CONFLICT IGNORE );', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS message_member ( id INTEGER PRIMARY KEY AUTOINCREMENT, user_id STRING REFERENCES users (username) ON DELETE CASCADE NOT NULL, message_id STRING REFERENCES messages (id) ON DELETE CASCADE NOT NULL, read_at DATETIME, conversation STRING REFERENCES conversations (JID) ON DELETE CASCADE NOT NULL, UNIQUE ( user_id, conversation ) ON CONFLICT REPLACE ); ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS alert_message ( id INTEGER PRIMARY KEY AUTOINCREMENT, message_end_id STRING REFERENCES messages (id) ON DELETE CASCADE, started_on DATETIME, ended_on DATETIME, started_by STRING, ended_by STRING REFERENCES users (JID) ON DELETE CASCADE, is_medical BOOLEAN DEFAULT false, is_fire BOOLEAN DEFAULT false, conversationid STRING REFERENCES conversations (JID) ON DELETE CASCADE, additionalProps STRING, expiration_date DATETIME, is_suspicious BOOLEAN DEFAULT false, is_feminist BOOLEAN DEFAULT false, alert_type INTEGER ); ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS alert_coords ( id INTEGER PRIMARY KEY AUTOINCREMENT, latitude TEXT NOT NULL, longitude TEXT NOT NULL, date DATETIME, alertid STRING REFERENCES alert_message (conversationid) ON DELETE CASCADE ); ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS location ( latitude TEXT, longitude TEXT, date DATETIME);', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TABLE IF NOT EXISTS emergency_contacts ( user STRING REFERENCES users (JID) ON DELETE CASCADE NOT NULL, contact STRING REFERENCES users (JID) ON DELETE CASCADE NOT NULL, CONSTRAINT norepetition_emergency UNIQUE ( user, contact ) ON CONFLICT REPLACE );', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TRIGGER IF NOT EXISTS delete_max AFTER INSERT ON location BEGIN DELETE FROM location WHERE ROWID NOT IN ( SELECT ROWID FROM location ORDER BY date DESC LIMIT 20 ); END; ', [], this.successCB, this.errorCB);

      tx.executeSql('CREATE TRIGGER IF NOT EXISTS delete_excess AFTER INSERT ON alert_coords FOR EACH ROW BEGIN DELETE FROM alert_coords WHERE id NOT IN (SELECT id FROM alert_coords WHERE alertid = (SELECT alertid FROM alert_coords ORDER BY date DESC LIMIT 1) ORDER BY date DESC LIMIT 100) AND alertid = (SELECT alertid FROM alert_coords ORDER BY date DESC LIMIT 1); END;', [], this.successCB, this.errorCB);

      this.migration();
      console.log("all config SQL done");
    });
  }

  migration(){
    this.db.transaction((tx) => {
      try{
        tx.executeSql("ALTER TABLE alert_message ADD COLUMN is_feminist BOOLEAN DEFAULT false;");
        tx.executeSql("ALTER TABLE alert_message ADD COLUMN alert_type;");
        //tx.executeSql("ALTER TABLE alert_message ADD COLUMN is_suspicious BOOLEAN DEFAULT false;");
        //FOR PROD, the 3 COMMANDS SHOULD RUN
      } catch(ex){
        return false;
      }
    });
  }

  async logout(){
    if(this.xmppClient != undefined){
      this.xmppClient.stop();
    }

    NavigationService.navigate('LandingScreen');

    this.store.dispatch({type:"LOGOUT_USER"});
    this.store.dispatch({type:"LOGOUT"});

    setTimeout(async function(){
      this.store.dispatch({type:"FLUSH_DATA"});
      this.setDBAfterLogout();
    }.bind(this),500);
  }

  setDBAfterLogout(){
    this.setState({Logout:true, DataLoaded:false, NotificationsPermissions:false, CurrentBeacons:[], CurrentArea:null});

    this.xmppClient.stop();
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();

    this.db.transaction((tx) => {
      tx.executeSql('DELETE FROM users;', []);
      tx.executeSql('DELETE FROM conversations;', []);
      tx.executeSql('DELETE FROM messages;', []);
      tx.executeSql('DELETE FROM message_member;', []);
      tx.executeSql('DELETE FROM conversation_member;', []);
      tx.executeSql('DELETE FROM alert_message;', []);
      tx.executeSql('DELETE FROM alert_coords;', []);
      tx.executeSql('DELETE FROM emergency_contacts;', []);
      tx.executeSql('DROP TRIGGER delete_max;', []);
      tx.executeSql('DROP TRIGGER delete_excess;', []);
      tx.executeSql('DELETE FROM location;', []);
      tx.executeSql('DROP TABLE users;', []);
      tx.executeSql('DROP TABLE conversations;', []);
      tx.executeSql('DROP TABLE messages;', []);
      tx.executeSql('DROP TABLE message_member;', []);
      tx.executeSql('DROP TABLE conversation_member;', []);
      tx.executeSql('DROP TABLE alert_message;', []);
      tx.executeSql('DROP TABLE alert_coords;', []);
      tx.executeSql('DROP TABLE location;', []);
      tx.executeSql('DROP TABLE emergency_contacts;', []);
    });

    OneSignal.removeExternalUserId();

    this.store.dispatch({type:"FLUSH_DATA"});
    this.removeGeofencingPoints();
    EndpointRequests.deleteToken();
    this.deleteAWSToken();
    this.removeScheduleOfficialNotifications();
    setTimeout(function(){
      this.createDB();
    }.bind(this),5000);
    clearInterval(updateNearby);
  }

  async _handleAppStateChange(nextAppState){
    let { OldState, Username, Resource, NotificationsPermissions, DataLoaded } = this.state;

    if (OldState.match(/inactive|background/) && nextAppState === "active") {
      this.store.dispatch({type:"ACTIVE", User:Username + "/" + Resource, xmppClient:this.xmppClient});

      if(!NotificationsPermissions && Username != undefined){
        this.configurePushNotifications(Username, true);
      }

      if(DataLoaded){
        this.updateData();
        updateNearby = setInterval(function (){
          this.updateData();
        }.bind(this),60000);
        this.store.dispatch({type:"RECONNECT_RELOAD"});
      }
      if(Platform.OS === "ios"){
        this.resetBadgeCount();
      }
    }

    if(nextAppState === 'inactive' || nextAppState === 'background'){
      clearInterval(updateNearby);
      this.store.dispatch({type:"INACTIVE", User:Username + "/" + Resource, xmppClient:this.xmppClient});
    }

    this.setState({OldState:nextAppState});
  }

  resetBadgeCount(){
      DefaultPreference.set('BADGE', "0").then(function() {console.log('badge count reset')});
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
  }

  setSigninData(responseData, cb){
    //verifiedIdentity = 2 (verified), 1 = (pending), 0 = (not verified)
    if(responseData.user_data.verifiedPhone){
      EndpointRequests.setUserCreds(responseData.token, responseData.refresh, responseData.exp, responseData.username, responseData.key, responseData.user_data.verifiedIdentity ? "verified" : "phoneverified", responseData.locationToken, responseData.locTokenExpiration);
      this.setState({Username:responseData.username, User:responseData.user_data});

      if(responseData.user_data.medicalData != undefined){
        AsyncStorage.setItem("MedicalData", JSON.stringify(responseData.user_data.medicalData), (asyncError) => {});
      }

      this.store.dispatch({type:"SET_USERDATA", UserData:responseData.user_data, DataLoaded:true, WelcomeScreen: true});

      if(responseData.user_data.verifiedIdentity != 0){
        if(responseData.user_data.verifiedIdentity == 2){
          this.loginToServer(responseData.username, responseData.key);
          if(responseData.user_data.isOfficial){
            this.scheduleOfficialNotifications(responseData.user_data.responseElementSchedule);
          }
        }

        this.configurePushNotifications(responseData.username);
        this.db.transaction((tx) => {
          tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)',
          [responseData.user_data.nickname, responseData.username, responseData.user_data.name, responseData.user_data.pictureUrl, "", "", responseData.user_data.phone, responseData.user_data.lastName, 'true', new Date().toISOString(), responseData.user_data.alias],
          (txx, results) => {
            if (results.rowsAffected > 0 ) {
              cb({status:responseData.user_data.verifiedIdentity == 1 ? "profile" : "homescreen", Creds:{Username:responseData.username, Password:responseData.key}});
            }
          })
        });
      }
      else{
        this.store.dispatch({type:'ADD_USERNAME', Password:responseData.key, Username:responseData.username, Resource:id()});
        this.db.transaction((tx) => {
          tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)',
          [responseData.user_data.nickname, responseData.username, responseData.user_data.name, responseData.user_data.pictureUrl, "", "", responseData.user_data.phone, responseData.user_data.lastName, 'true', new Date().toISOString(), responseData.user_data.alias],
          (txx, results) => {
            if (results.rowsAffected > 0 ) {
              cb({status:"verify_identity", Creds:{Username:responseData.username, Password:responseData.key}});
            }
          })
        });
      }
    }
    else if(!responseData.user_data.verifiedPhone){
      this.store.dispatch({type:'ADD_USERNAME', Password:responseData.key, Username:responseData.username, Resource:id()});
      EndpointRequests.setUserCreds(responseData.token, responseData.refresh, responseData.exp, responseData.username, responseData.key, "not_verified", responseData.locationToken, responseData.locTokenExpiration);
      this.store.dispatch({type:"SET_USERDATA", UserData:responseData.user_data, WelcomeScreen: true});
      this.db.transaction((tx) => {
        tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)',
        [responseData.user_data.nickname, responseData.username, responseData.user_data.name, responseData.user_data.pictureUrl, "", "", responseData.user_data.phone, responseData.user_data.lastName, 'true', new Date().toISOString(), responseData.user_data.alias],
        (txx, results) => {
          if (results.rowsAffected > 0 ) {
            this.store.dispatch({type:"LOGIN_LOADING", Loading:false});
            cb({status:"not_verified", Creds:{Username:responseData.username, Password:responseData.key}});
          }
        })
      });
    }
    else{
      this.store.dispatch({type:"LOGIN_LOADING", Loading:false});
      cb({status:"not_found"});
    }
  }

  loginNET(Email, Password, DeviceInfo, cb){
    this.store.dispatch({type:"LOGIN_LOADING", Loading:true});

    let LoginModel = {
      Username: Email,
      Password: Password,
      UserDevice: DeviceInfo
    };

    this.store.dispatch({type:"SET_TEMP_LOGIN_INFO", LoginInfo:LoginModel});

    EndpointRequests.Login(LoginModel, function(responseData) {
      if(responseData.error != undefined){
        if(responseData.error === "Not Found"){
          Alert.alert(
           'Atención',
            "Tu usuario/contraseña son incorrectos; Intenta de nuevo.",
            [
              {text: 'Ok', onPress: () => console.log('no'), style: 'cancel'},
            ],
            { cancelable: false }
          )
          this.store.dispatch({type:"LOGIN_LOADING", Loading:false});
          cb({status:"not_found"});
        }
        else{
          Alert.alert(
           'Error',
            responseData.error,
            [
              {text: 'Ok', onPress: () => console.log('no'), style: 'cancel'},
            ],
            { cancelable: false }
          )
          this.store.dispatch({type:"LOGIN_LOADING", Loading:false});
          cb({status:"error"});
        }
      }
      else{
        //verifiedIdentity = 2 (verified), 1 = (pending), 0 = (not verified)
        if(responseData.challenge){
          cb({status:"challenge_device"});
          return false;
        }

        this.setSigninData(responseData, cb);
      }
    }.bind(this));
  }

  updateData(){
    let { LastUpdate, CurrentBeacons, CurrentArea, OfficialSchedule, AlertMode } = this.state;

    if(LastUpdate != null){
      let Difference = Math.round((((new Date().getTime() - LastUpdate) % 86400000) % 3600000) / 60000);
      if(Difference >= 1){
        this.loadedData();
        /*
        BackgroundGeolocation.startGeofences(() => {
          console.log('update nearby users');
        });
        */
        if(CurrentBeacons != undefined && CurrentBeacons.length > 0){
          let beaconObject = CurrentBeacons[0];
          let beaconId = null;
          let beaconZone = null;
          if(beaconObject.identifier != undefined){
            beaconId = beaconObject.identifier;
          }
          else if(beaconObject.id != undefined){
            beaconId = beaconObject.id;
          }

          if(beaconObject.zoneName != undefined){
            beaconZone = beaconObject.zoneName;
          }
          else if(beaconObject.extras != undefined && beaconObject.extras.codeName != undefined){
            beaconZone = beaconObject.extras.codeName;
          }
          else{
            beaconZone = CurrentArea;
          }

          let nearbyMembersModel = {
            BeaconId: beaconId,
            Neighborhood: beaconZone,
            MultipleBeacons:true
          };

          EndpointRequests.GetNearbyUsersCount(nearbyMembersModel, function(responseData) {
            let Count = 0;
            if(responseData.nearby != undefined && !isNaN(responseData.nearby)){
              Count = Number(responseData.nearby);
            }

            this.store.dispatch({type: 'UPDATE_NEARBY_USERS', TotalNearby:Count});
            AsyncStorage.setItem("NearbyUsers", String(Count), (asyncError) => {});
          }.bind(this));
        }
      }
    }

    if(OfficialSchedule != undefined){
      let today = new Date();
      let dayNo = today.getDay();
      let daySchedule = OfficialSchedule.find(n => n.dayNumber == dayNo);
      if(daySchedule != undefined){
        if(today >= daySchedule.start && today < daySchedule.end){
          this.store.dispatch({type:'START_OFFICIAL_SCHEDULE'})
        }
        else{
          this.store.dispatch({type:'END_OFFICIAL_SCHEDULE'})
        }
      }
    }
  }

  async loginToServer(Username, PasswordNew, Resource){
    let { Password } = this.state;
    this.xmppClientListeners = [];

    let ResourceUser = Resource != undefined ? Resource : id();

    this.xmppClient = client({
      service: "wss://" + URL_SERVER.URL + "/ws",
      username: Username,
      password: PasswordNew,
      resource: ResourceUser
    });

    this.setVcard = setupVcard(this.xmppClient);

    this.XMPPUserCredentials = {
      username: Username,
      password: PasswordNew,
      jidLocalPart:null
    };

    this.setState({Username:Username, Password:PasswordNew, Resource:ResourceUser});

    this.store.dispatch({type:'LOGIN_XMPP', Client:this.xmppClient});

    await this.addListeners();
    this.xmppClient.start();
    this.xmppClient.reconnect.delay = 2000;
    return;
  }

  async addListeners() {
    try{
      var self = this;
      var removeAllListeners = function(){
          self.xmppClientListeners.forEach(function(listener){
            self.xmppClient.removeListener(listener.name,
                                           listener.callback);
          });
          self.xmppClientListeners = [];
      }

      removeAllListeners();

      this.xmppClient.on('online', (jid) => this.callBackOnline(jid));
      this.xmppClientListeners.push({name: 'online',
                                 callback: (jid) => this.callBackOnline(jid)});

      this.xmppClient.on('offline', () => this.callBackOffline());
      this.xmppClientListeners.push({name: 'offline',
                                callback: () => this.callBackOffline()});

      this.xmppClient.on('status', (status, value) => this.callBackStatus(status, value));
      this.xmppClientListeners.push({name: 'status',
                                 callback:  (status, value) => this.callBackStatus(status, value)});

      this.xmppClient.on('stanza', (stanza) => this.callBackStanza(stanza));
      this.xmppClientListeners.push({name: 'stanza',
                                 callback: (stanza) => this.callBackStanza(stanza)});

      this.xmppClient.on('error', (error) => this.callBackError(error));
      this.xmppClientListeners.push({name: 'error',
                                 callback: (error) => this.callBackError(error)});

      this.xmppClient.on('output', (output) => this.callBackOutput(output));
      this.xmppClientListeners.push({name: 'output',
                                 callback: (output) => this.callBackOutput(output)});

      this.xmppClient.on('input', (input) => this.callBackInput(input));
      this.xmppClientListeners.push({name: 'input',
                                 callback:  (input) => this.callBackInput(input)});

      this.xmppClient.reconnect.on('reconnecting', () => this.callbackReconnecting());
      this.xmppClientListeners.push({name: 'reconnecting',
                                  callback:  () => this.callbackReconnecting()});

      this.store.dispatch({type:'UPDATE_CLIENT', Client:this.xmppClient});
      return;
    }
    catch(err){
      console.log("error setting listeners");
      return;
    }
  }

  callbackReconnecting(){
    let difference = new Date().getTime() - LastReconnect;

    if(difference <= 5000){
      setTimeout(function(){
        this.store.dispatch({type:"UPDATE_STATUS", Status:"CONNECTING"});
      }.bind(this),200);
    }
    else{
      ReconnectFlag = true;
      this.store.dispatch({type:"UPDATE_STATUS", Status:"CONNECTING"});
    }
  }

  callBackOffline(){
    console.log('offline');
    this.store.dispatch({type:"UPDATE_STATUS", Status:"OFFLINE", Disconnected:ReconnectFlag});
    this.setState({isOffline:true});
  }

  async callBackOnline(jid){
    const { Username, Password, Reconnecting } = this.state;
    Keyboard.dismiss();

    this.store.dispatch({type:"UPDATE_STATUS", Status:"ONLINE"});

    this.XMPPUserCredentials.jidLocalPart = jid._resource;
    this.xmppClient.send(xml("presence"), { type: 'online'});

    let string = jid._local + "@" + jid._domain + "/" + jid._resource;

    this.store.dispatch({type: 'ADD_USERNAME', Username:Username, Password:Password, Nickname:jid._local, Resource:jid._resource });
    this.store.dispatch({type: 'ADD_USERNAME_CHAT', Username:Username, Nickname:jid._local });
    this.store.dispatch({type: 'UPDATE_CLIENT', Client:this.xmppClient, Vcard:this.setVcard, From: string, Conference:URL_SERVER.CONFERENCE});

    LastReconnect = new Date().getTime();
    this.setState({From:string, isLoggedIn:true, Nickname:jid._local, Reconnecting:false,isOffline:false, Disconnected:false});

    this.store.dispatch({type:"LOGIN_LOADING", Loading:false});
    NavigationService.navigate('Dashboard');

    if(ReconnectFlag){
      this.store.dispatch({type:"RECONNECT_RELOAD"});
      ReconnectFlag = false;
    }
  }

  callBackStatus(status, value){
    const { LastInternetState, Logout } = this.state;

    if(!Logout){
      if(LastInternetState === "disconnect" && status === "connecting" && !ReconnectFlag){
        ReconnectFlag = true;
        setTimeout(function(){
          //this.tryToReconnect();
        }.bind(this),200);
      }
    }
    else{
      this.xmppClient.stop();
      this.setState({Logout:false});
    }

    this.setState({LastInternetState:status});
  }

  callBackStanza(stanza){
    let { Username, From, OngoingAlerts, isOffline, Disconnected, DataLoaded, OldState, Nickname, AttendingAlert } = this.state;

    if(Disconnected){
      this.store.dispatch({type:"UPDATE_STATUS", Status:"ONLINE"});
      this.setState({isOffline:false, Disconnected:false});
    }

     if (stanza.is('presence')) {
       if(stanza.attrs.from != null){
         if(stanza.attrs.from.includes("/")){
           let PresenceData = stanza.attrs.from.split("/");
           let ChatData = PresenceData[0];
           let PresenceUser = PresenceData[1];
           let PresenceNickname = PresenceUser.split("@")[0];
           let Type = stanza.attrs.type;
           let affiliation;
           let status = stanza.getChild('status');
           let x = stanza.getChild('x');
           let statusCode;

           if(status == undefined && x != undefined){
             status = x.getChild('status');
           }

           if(x != null && x.children.length > 0){
             affiliation = x.children[0].attrs.affiliation;
             let new_data = null;

             if(affiliation == "owner"){
               new_data = {username:PresenceUser, nickname:PresenceNickname, admin:true, owner:true, member:true};
               this.store.dispatch({type:"UPDATE_AFFILIATION", Chat:ChatData, new_data:new_data, Me:PresenceNickname === Nickname ? true : false});
             }
             else if(affiliation == "admin"){
               new_data = {username:PresenceUser, nickname:PresenceNickname, admin:true, owner:false, member:true};
               this.store.dispatch({type:"UPDATE_AFFILIATION", Chat:ChatData, new_data:new_data, Me:PresenceNickname === Nickname ? true : false});
             }
             else if(affiliation == "member"){
               new_data = {username:PresenceUser, nickname:PresenceNickname, admin:false, owner:false, member:true};
               this.store.dispatch({type:"UPDATE_AFFILIATION", Chat:ChatData, new_data:new_data, Me:PresenceNickname === Nickname ? true : false});
             }
             else if(affiliation == "none"){
               new_data = {username:PresenceUser, nickname:PresenceNickname, admin:false, owner:false, member:false};
               this.store.dispatch({type:"UPDATE_AFFILIATION", Chat:ChatData, new_data:new_data, Me:PresenceNickname === Nickname ? true : false});
             }
           }

           if(status != undefined && Type == undefined){
             statusCode = status.attrs.code;

             if(statusCode === "200"){
               this.store.dispatch({type:'UPDATE_PRESENCE', User:PresenceUser, ChatId:ChatData, Me:PresenceNickname === Nickname ? true : false});
             }
             else if(statusCode === "away"){
               if(PresenceNickname != undefined && PresenceNickname !== Nickname){
                 this.store.dispatch({type:'LEAVE_ROOM', User:PresenceUser, ChatId:ChatData});
               }
             }
             else if(statusCode === "100"){
               if(PresenceNickname != undefined && PresenceNickname !== Nickname){
                 this.store.dispatch({type:'LEAVE_ROOM', User:PresenceUser, ChatId:ChatData});
               }
             }
             else if(statusCode === "321"){
               //if affiliation == none, user is not part of channel
               if(PresenceNickname === Nickname && affiliation === "none"){
                 //lock chat
                 this.store.dispatch({type:'UNAUTHORIZED_CHANNEL', ChatId:ChatData})
               }
               else{
                 this.store.dispatch({type:'LEAVE_ROOM', User:PresenceUser, ChatId:ChatData});
               }
             }
             else{
             }
           }
           else if(status != undefined && Type === "unavailable"){
             statusCode = status.attrs.code;

             if(statusCode === "321"){
               //if affiliation == none, user is not part of channel
               if(PresenceNickname === Nickname && affiliation === "none"){
                 //lock chat
                 this.store.dispatch({type:'UNAUTHORIZED_CHANNEL', ChatId:ChatData})
               }
               else{
                 this.store.dispatch({type:'LEAVE_ROOM', User:PresenceUser, ChatId:ChatData});
               }
             }
           }
           else if(Type === "unavailable"){
             if(PresenceNickname != undefined && PresenceNickname !== Nickname){
               this.store.dispatch({type:'LEAVE_ROOM', User:PresenceUser, ChatId:ChatData});
             }
           }
           else if(Type === "error"){
             status = stanza.getChild("error");
             if(status != undefined){
               if(status.attrs.code != undefined && status.attrs.code === "407"){
                 //user is not a member of chat, code 407 means not a member of chat
                 this.store.dispatch({type:'UNAUTHORIZED_CHANNEL', ChatId:ChatData})
               }
             }
           }
         }
       }
    } else if (stanza.is('iq')) {
      if(stanza.attrs.type === "result"){
        let iqType = stanza.getChild("query");

        if(iqType != null && iqType.attrs.xmlns === "http://jabber.org/protocol/muc#admin" && stanza.children.length > 0){
          let Members = [];

          for(let i = 0; i < iqType.children.length;i++){
            let memberObject = iqType.children[i].attrs;
            let PresenceUser = memberObject.jid;
            let PresenceNickname = PresenceUser.split("@")[0];

            let new_data = null;

            if(memberObject.affiliation == "owner"){
              new_data = {username:PresenceUser, nickname:PresenceNickname, admin:true, owner:true}
              Members.push(new_data);
            }
            else if(memberObject.affiliation == "admin"){
              new_data = {username:PresenceUser, nickname:PresenceNickname, admin:true, owner:false};
              Members.push(new_data);
            }
            else{
              new_data = {username:PresenceUser, nickname:PresenceNickname, admin:false, owner:false};
              Members.push(new_data);
            }

            this.db.transaction((tx) => {
              tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name) VALUES (?, ?, (SELECT name FROM users WHERE username = ?), (SELECT picture FROM users WHERE username = ?), (SELECT address FROM users WHERE username = ?), (SELECT unit FROM users WHERE username = ?), (SELECT phone FROM users WHERE username = ?), (SELECT last_name FROM users WHERE username = ?))',
              [PresenceNickname, PresenceUser, PresenceNickname, PresenceNickname, PresenceNickname, PresenceNickname, PresenceNickname, PresenceNickname],
              (txx, results) => {
                tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on) VALUES (?,?,?,?,?,?)',
                [PresenceNickname, stanza.attrs.from, new_data.admin, new_data.owner, 'true', new Date().toISOString()],
                (txt, results1) => {
                  if (results1.rowsAffected > 0 ) {}
                })
              })
            });
          }

          this.store.dispatch({type:"UPDATE_MEMBERS", Chat:stanza.attrs.from, MemberList: Members});
        }
      }
    } else if(stanza.is('message')) {
      if(stanza.getChild("body") != null){
        let stanzaId = stanza.attrs.id;
        let fromChat = stanza.attrs.from;
        let messageData = stanza.getChild('stanza-id');
        let sessionId = stanza.getChild("resourceId");
        if(sessionId != undefined){
          sessionId = sessionId.text();
        }

        let message = stanza.getChild("body").text();
        let time = stanza.getChild('delay') == undefined ? new Date().toISOString() : stanza.getChild('delay').attrs.stamp;

        if(messageData == undefined || message.attrs != undefined || messageData.attrs == undefined){
          return false;
        }

        let PresenceUser;

        if(fromChat.includes("/")){
          PresenceUser = fromChat.split("/")[1];

          if(PresenceUser.includes("@")){
            PresenceUser = PresenceUser.split("@")[0];
          }
        }
        else{
          PresenceUser = fromChat;
        }

        let isMultimedia = false;
        let isImage = false;
        let isVideo = false;
        let isFile = false;
        let isQuote = false;
        let isEdit = false;
        let quoteId = "";
        let quoteMsg = "";
        let fileName = "";
        let url = "";
        let thumbnail = "";
        let idMsgEdited = null;

        if(stanza.getChild("fileType") != null){
          let fileType = stanza.getChild("fileType").text();

          if(fileType === "image"){
            isMultimedia = true;
            isImage = true;
            url = stanza.getChild("url") != undefined ? stanza.getChild("url").text() : "";
            fileName = stanza.getChild("filename") != undefined ? stanza.getChild("filename").text() : "";
          }
          else if(fileType === "video"){
            isMultimedia = true;
            isVideo = true;
            url = stanza.getChild("url") != undefined ? stanza.getChild("url").text() : "";
            fileName = stanza.getChild("filename") != undefined ? stanza.getChild("filename").text() : "";
            thumbnail = stanza.getChild("thumbnail") != undefined ? stanza.getChild("thumbnail").text() : "";
          }
          else if(fileType === "file"){
            isMultimedia = true;
            isFile = true;
            url = stanza.getChild("url") != undefined ? stanza.getChild("url").text() : "";
            fileName = stanza.getChild("filename") != undefined ? stanza.getChild("filename").text() : "";
          }
        }
        else if(stanza.getChild("messageType") != null){
          let typeMsg = stanza.getChild("messageType").text();

          if(typeMsg === "quote"){
            isQuote = true;
            quoteId = stanza.getChild("quoted_id").text();
            quoteMsg = stanza.getChild("quoted_msg").text();

            if(stanza.getChild("mediaType") != null){
              let mediaType = stanza.getChild("mediaType").text();

              isMultimedia = true;
              isVideo = mediaType === "video";
              isImage = mediaType === "image";
              isFile = mediaType === "file";
              url = stanza.getChild("url") != undefined ? stanza.getChild("url").text() : null;
              thumbnail = stanza.getChild("thumbnail") != undefined ? stanza.getChild("thumbnail").text() : '';
            }
          }
        }
        else if(stanza.getChild("replace") != null){
          isEdit = true;
          let replaceInfo = stanza.getChild("replace");
          idMsgEdited = replaceInfo.attrs.id;
        }
        else if(stanza.getChild("url") != undefined){
          url = stanza.getChild("url").text();
        }

        let messageBody = {
          id: messageData.attrs.id,
          chat_id: messageData.attrs.by,
          timestamp: time,
          text: message,
          time: new Date(time).getTime(),
          message_by: fromChat,
          username: PresenceUser,
          state: "Sent",
          read_by:[PresenceUser],
          read_by_count:1,
          isImage:isImage,
          isMedia:isMultimedia,
          isVideo:isVideo,
          isFile:isFile,
          fileName:fileName,
          url:url,
          thumbnail:thumbnail,
          isQuote:isQuote,
          quoted_id:quoteId,
          quoted_msg:quoteMsg,
          isEdited: isEdit,
          isSystemMsg:false,
          hidden:false,
          notify:true
        };

        let AlarmStart = false;
        let IsAlarm = false;
        let IsMedical = false;
        let IsFireAlarm = false;
        let IsSuspiciousActivity = false;
        let IsFeministActivity = false;
        let AlertUpdate = false;
        let GlobalAlert = false;
        let AlertId;
        let Coordinates;
        let Lock = false;
        let EndDate = null;
        let isOfficial = false;
        let FromAttendant = false;
        let AlertTypeEnum = 0; //0 = emergency, 1 = medical, 2 = fire, 3 = suspicious, 4 = feminist
        if(stanza.getChild("type") != undefined){
          let messageType = stanza.getChild("type").text();
          GlobalAlert = stanza.getChild("globalAlert") != undefined ? true : false;

          if(messageType === "Emergency"){
            let emergencyType = stanza.getChild("emergencyType") != undefined ? stanza.getChild("emergencyType").text() : "Other";
            let emergencyAction = stanza.getChild("emergencyAction").text();

            if(emergencyAction === "Start" && emergencyType === "Emergency"){
              isOfficial = stanza.getChild("officialChannel") != undefined ? true : false;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };

              let CurrentAlert = {
                id:messageBody.id,
                locations:[Coordinates],
                conversation:messageData.attrs.by,
                startedBy:messageBody.username,
                isOfficial:isOfficial
              };
              AlarmStart = true;
              IsAlarm = true;
              OngoingAlerts.push(CurrentAlert);

              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: Coordinates, MessageId:messageBody.id, EmergencyType:"Emergency", Chat:messageData.attrs.by, AlertText:message, User:messageBody.username, OngoingAlert: Username.startsWith(messageBody.username)});

            }
            else if(emergencyAction === "Start" && emergencyType === "Medical"){
              AlertTypeEnum = 1;
              isOfficial = stanza.getChild("officialChannel") != undefined ? true : false;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };

              let CurrentAlert = {
                id:messageBody.id,
                locations:[Coordinates],
                conversation:messageData.attrs.by,
                startedBy:messageBody.username,
                isOfficial:isOfficial,
                emergencyAttendant:null
              };
              AlarmStart = true;
              IsAlarm = true;
              IsMedical = true;
              OngoingAlerts.push(CurrentAlert);
              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: Coordinates, MessageId:messageBody.id, EmergencyType:"Medical", Chat:messageData.attrs.by, AlertText:message, User:messageBody.username, OngoingAlert: Username.startsWith(messageBody.username)});

            }
            else if(emergencyAction === "Start" && emergencyType === "Fire"){
              AlertTypeEnum = 2;
              isOfficial = stanza.getChild("officialChannel") != undefined ? true : false;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };

              let CurrentAlert = {
                id:messageBody.id,
                locations:[Coordinates],
                conversation:messageData.attrs.by,
                startedBy:messageBody.username,
                isOfficial:isOfficial
              };
              AlarmStart = true;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = true;
              OngoingAlerts.push(CurrentAlert);
              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: Coordinates, MessageId:messageBody.id, EmergencyType:"Fire", Chat:messageData.attrs.by, AlertText:message, User:messageBody.username, OngoingAlert: Username.startsWith(messageBody.username)});

            }
            else if(emergencyAction === "Start" && emergencyType === "Suspicious"){
              AlertTypeEnum = 3;
              isOfficial = true;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };

              let CurrentAlert = {
                id:messageBody.id,
                locations:[Coordinates],
                conversation:messageData.attrs.by,
                startedBy:messageBody.username,
                isOfficial:isOfficial,
                ended:true
              };
              AlarmStart = true;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = false;
              IsSuspiciousActivity = true;

              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: Coordinates, MessageId:messageBody.id, EmergencyType:"Suspicious", Chat:messageData.attrs.by, AlertText:message, User:messageBody.username, OngoingAlert: Username.startsWith(messageBody.username)});
            }
            else if(emergencyAction === "Start" && emergencyType === "Feminist"){
              AlertTypeEnum = 4;
              isOfficial = stanza.getChild("officialChannel") != undefined ? true : false;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };

              let CurrentAlert = {
                id:messageBody.id,
                locations:[Coordinates],
                conversation:messageData.attrs.by,
                startedBy:messageBody.username,
                isOfficial:isOfficial
              };
              OngoingAlerts.push(CurrentAlert);
              AlarmStart = true;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = false;
              IsSuspiciousActivity = false;
              IsFeministActivity = true;
              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: Coordinates, MessageId:messageBody.id, EmergencyType:"Feminist", Chat:messageData.attrs.by, AlertText:message, User:messageBody.username, OngoingAlert: Username.startsWith(messageBody.username)});
            }
            else if(emergencyAction === "End" && emergencyType === "Emergency"){
              AlertId = messageBody.chat_id;
              AlarmStart = false;
              IsAlarm = true;
              messageBody.text = "Alerta Desactivada.";
              messageBody.hidden = false;
              let AlertIndex = OngoingAlerts.findIndex(n => n.conversation === AlertId);
              if(AlertIndex > -1){
                let isMe = OngoingAlerts[AlertIndex].startedBy == Nickname ? true : false;
                OngoingAlerts.splice(AlertIndex, 1);

                if(OngoingAlerts.length == 0){
                  BackgroundGeolocation.startGeofences(() => {
                    BackgroundGeolocation.setConfig({
                      distanceFilter: 50,
                      stopOnTerminate: false,
                      stopOnStationary:false,
                      startOnBoot: true,
                      url:null,
                      batchSync: false,
                      autoSync: false,
                      autoSyncThreshold: 1,
                      disableElasticity: false
                    }).then((state) => {});
                  });
                }
              }

              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"END_ALERT_STATUS", Chat:messageData.attrs.by, EndDate:EndDate});
            }
            else if(emergencyAction === "End" && emergencyType === "Medical"){
              AlertId = messageBody.chat_id;
              AlarmStart = false;
              IsAlarm = true;
              IsMedical = true;
              messageBody.text = "Alerta Médica Desactivada.";
              messageBody.hidden = false;
              let AlertIndex = OngoingAlerts.findIndex(n => n.conversation === AlertId);
              if(AlertIndex > -1){
                let isMe = OngoingAlerts[AlertIndex].startedBy == Nickname ? true : false;
                OngoingAlerts.splice(AlertIndex, 1);

                if(OngoingAlerts.length == 0){
                  BackgroundGeolocation.startGeofences(() => {
                    BackgroundGeolocation.setConfig({
                      distanceFilter: 50,
                      stopOnTerminate: false,
                      stopOnStationary:false,
                      startOnBoot: true,
                      url:null,
                      batchSync: false,
                      autoSync: false,
                      autoSyncThreshold: 1,
                      disableElasticity: false
                    }).then((state) => {});
                  });
                }
              }
              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              if(AttendingAlert == messageBody.chat_id){
                //remove AttendingAlert from response element that agreed to attend emergency to stop sending location to channel
                this.setState({AttendingAlert:null});
                AsyncStorage.removeItem("AttendingAlert",(error) => {
                  if(error != null){
                    console.log("error removing attendingalert");
                  }
                })
              }
              this.store.dispatch({type:"END_ALERT_STATUS", Chat:messageData.attrs.by, EndDate:EndDate});
            }
            else if(emergencyAction === "End" && emergencyType === "Fire"){
              AlertId = messageBody.chat_id;
              AlarmStart = false;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = true;
              messageBody.text = "Alerta de Incendio Desactivada.";
              messageBody.hidden = false;
              let AlertIndex = OngoingAlerts.findIndex(n => n.conversation === AlertId);
              if(AlertIndex > -1){
                let isMe = OngoingAlerts[AlertIndex].startedBy == Nickname ? true : false;
                OngoingAlerts.splice(AlertIndex, 1);

                if(OngoingAlerts.length == 0){
                  BackgroundGeolocation.startGeofences(() => {
                    BackgroundGeolocation.setConfig({
                      distanceFilter: 50,
                      stopOnTerminate: false,
                      stopOnStationary:false,
                      startOnBoot: true,
                      url:null,
                      batchSync: false,
                      autoSync: false,
                      autoSyncThreshold: 1,
                      disableElasticity: false
                    }).then((state) => {});
                  });
                }
              }
              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"END_ALERT_STATUS", Chat:messageData.attrs.by, EndDate:EndDate});
            }
            else if(emergencyAction === "End" && emergencyType === "Suspicious"){
              AlertId = messageBody.chat_id;
              AlarmStart = false;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = false;
              IsSuspiciousActivity = true;
              messageBody.text = "Actividad sospechosa a terminado.";
              messageBody.hidden = false;
              let AlertIndex = OngoingAlerts.findIndex(n => n.conversation === AlertId);
              if(AlertIndex > -1){
                OngoingAlerts.splice(AlertIndex, 1);

                if(OngoingAlerts.length == 0){
                  BackgroundGeolocation.startGeofences(() => {
                    BackgroundGeolocation.setConfig({
                      distanceFilter: 50,
                      stopOnTerminate: false,
                      stopOnStationary:false,
                      startOnBoot: true,
                      url:null,
                      batchSync: false,
                      autoSync: false,
                      autoSyncThreshold: 1,
                      disableElasticity: false
                    }).then((state) => {});
                  });
                }
              }
              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"END_ALERT_STATUS", Chat:messageData.attrs.by, EndDate:EndDate});
            }
            else if(emergencyAction === "End" && emergencyType === "Feminist"){
              AlertId = messageBody.chat_id;
              AlarmStart = false;
              IsAlarm = true;
              IsMedical = false;
              IsFireAlarm = false;
              IsFeministActivity = true;
              messageBody.text = "Alerta Mujeres Desactivada.";
              messageBody.hidden = false;
              let AlertIndex = OngoingAlerts.findIndex(n => n.conversation === AlertId);
              if(AlertIndex > -1){
                OngoingAlerts.splice(AlertIndex, 1);

                if(OngoingAlerts.length == 0){
                  BackgroundGeolocation.startGeofences(() => {
                    BackgroundGeolocation.setConfig({
                      distanceFilter: 50,
                      stopOnTerminate: false,
                      stopOnStationary:false,
                      startOnBoot: true,
                      url:null,
                      batchSync: false,
                      autoSync: false,
                      autoSyncThreshold: 1,
                      disableElasticity: false
                    }).then((state) => {});
                  });
                }
              }
              EndDate = stanza.getChild("delay");
              if(EndDate == undefined){
                EndDate = new Date();
              }
              else{
                EndDate = EndDate.attrs.stamp;
              }
              this.store.dispatch({type:"END_ALERT_STATUS", Chat:messageData.attrs.by, EndDate:EndDate});
            }
            else if(emergencyAction === "Update"){
              AlertId = messageBody.chat_id;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };
              IsAlarm = true;
              AlertUpdate = true;
              messageBody.text = "Location Update";
              messageBody.hidden = true;
              this.store.dispatch({type:"ADD_LOCATION_ALERT", Chat:messageData.attrs.by, Coordinates:Coordinates});
            }
            else if(emergencyAction === "AttendEmergency"){
              AlertId = messageBody.chat_id;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };
              if(messageBody.username == Nickname){
                AttendingAlert = messageBody.chat_id; //when response element accepts to attend emergency, this starts sending location to alert channel BackgroundGeolocation.onLocation
              }
              IsAlarm = true;
              messageBody.notify = false;
              FromAttendant = true;
              AlertUpdate = true;
              messageBody.text = String(Coordinates.latitude) + "," + String(Coordinates.longitude);
              messageBody.hidden = true;
              this.store.dispatch({type:"ADD_OFFICIAL_LOCATION_ALERT", Chat:messageData.attrs.by, Coordinates:Coordinates, AssignedTo:PresenceUser});
              this.setState({AlertMode:true, ConversationAlert:messageBody.chat_id, AlertId:messageBody.chat_id, TrackLocationUpdates:true,AttendingAlert:AttendingAlert});
            }
            else if(emergencyAction === "AttendingUpdate"){
              AlertId = messageBody.chat_id;
              let StringCoords = message.match(/\(([^)]+)\)/)[1];
              StringCoords = StringCoords.split(",");
              Coordinates = {
                latitude:parseFloat(StringCoords[0]),
                longitude:parseFloat(StringCoords[1])
              };
              AlertUpdate = true;
              FromAttendant = true;
              IsAlarm = true;
              messageBody.notify = false;
              messageBody.text = String(Coordinates.latitude) + "," + String(Coordinates.longitude);
              messageBody.hidden = true;
              this.store.dispatch({type:"ADD_OFFICIAL_LOCATION_ALERT", Chat:messageData.attrs.by, Coordinates:Coordinates}); //attending response element coordinates are being saved as hidden messages
            }
          }
          else if(messageType === "Lock"){
            Lock = true;
            messageBody.isSystemMsg = true;
            this.store.dispatch({type:"LOCK_CONVERSATION", Chat:messageData.attrs.by});
          }
          else if(messageType === "Joined"){
            messageBody.isSystemMsg = true;
            this.store.dispatch({type:"UPDATE_CONVERSATION", Chat:messageData.attrs.by});
          }
          else if(messageType === "Leave"){
            messageBody.isSystemMsg = true;
            messageBody.notify = false;
            if(this.state.Nickname != PresenceUser){
              this.store.dispatch({type:"UPDATE_CONVERSATION", Chat:messageData.attrs.by});
            }
          }
          else if(messageType === "Kick"){
            messageBody.isSystemMsg = true;
            messageBody.notify = false;
            setTimeout(function(){
              this.store.dispatch({type:"UPDATE_CONVERSATION", Chat:messageData.attrs.by});
            }.bind(this),1500);
            let userKicked = stanza.getChild("userJID").text();
            if(userKicked == this.state.Nickname){
              messageBody.hidden = true;
            }
          }
          else if(messageType === "TitleUpdate"){
            messageBody.isSystemMsg = true;
            messageBody.notify = false;
            let updatedTitle =  stanza.getChild("NewTitle").text();
            this.db.transaction((tx) => {
              tx.executeSql('UPDATE conversations SET subject = ? WHERE id = ?', [updatedTitle, messageBody.chat_id],
              (tx2, results) => {
                if(results.rows.length == 0){
                  setTimeout(function(){
                    this.store.dispatch({type:"UPDATE_TITLE", Chat:messageData.attrs.by, Subject:updatedTitle});
                  }.bind(this),1500);
                }
              })
            });
          }
        }

        this.setState({OngoingAlerts:OngoingAlerts});

        if(IsAlarm){
          if(AlarmStart){
            if(GlobalAlert && IsSuspiciousActivity){
              var expDate = new Date(EndDate);
              expDate.setDate(expDate.getDate() + 1);
              this.db.transaction((tx) => {
                tx.executeSql('UPDATE alert_message SET message_end_id = ?, ended_on = ?, ended_by = ?, expiration_date = ? WHERE conversationid = ?',
                [messageBody.id, new Date(EndDate).toISOString(), messageBody.username, new Date(expDate).toISOString(), messageBody.chat_id],
                (txx, results) => {
                  //
                })
              })
            }
            else{
              this.db.transaction((tx) => {
                tx.executeSql('INSERT INTO alert_message (started_on, started_by, is_medical, is_fire, conversationid, is_suspicious, message_end_id, ended_on, ended_by, is_feminist, alert_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [new Date(time).toISOString(), messageBody.username, IsMedical, IsFireAlarm, messageBody.chat_id, IsSuspiciousActivity, IsSuspiciousActivity ? messageBody.id : null, IsSuspiciousActivity ? new Date(time).toISOString() : null, IsSuspiciousActivity ? messageBody.username : null, IsFeministActivity, AlertTypeEnum],
                (txx, results) => {
                  if(results.rowsAffected > 0){
                    tx.executeSql('INSERT INTO alert_coords (latitude, longitude, date, alertid) VALUES (?, ?, ?, ?)',
                    [String(Coordinates.latitude), String(Coordinates.longitude), new Date(time).toISOString(), messageBody.chat_id],
                    (tx2, results2) => {
                      if(results2.rowsAffected > 0){}
                      let timeAlert = new Date().getTime() - new Date(time).getTime();
                      if(timeAlert <= 60000){
                        setTimeout(function(){
                          this.store.dispatch({type:'LOAD_CHANNEL', LoadChat:{id:messageBody.chat_id, temporal:1}, Global:true});
                        }.bind(this),1000);
                      }
                    })
                  }
                })
              });
            }
          }
          else if(AlertUpdate && !FromAttendant){
            this.db.transaction((tx) => {
              tx.executeSql('INSERT INTO alert_coords (latitude, longitude, date, alertid) VALUES (?, ?, ?, ?)',
              [String(Coordinates.latitude), String(Coordinates.longitude), new Date(time).toISOString(), messageBody.chat_id],
              (tx2, results2) => {
                if(results2.rowsAffected > 0){}
              })
            });
          }
          else if(AlertUpdate && FromAttendant){
            console.log("alert update attendant");
            this.db.transaction((tx) => {
              tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename, thumbnail, isAudio, isEdited, isQuoted, quoted_msg_id, quoted_text, isSystemMsg, isHidden) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, true, isMultimedia, isImage, isVideo, isFile, url, fileName, thumbnail, false, false, isQuote, quoteId, quoteMsg, false, true],
              (txt, results1) => {
                this.store.dispatch({type: 'UPDATE_MESSAGES', Message:messageBody, FromAttendant:true});
              })
            });
          }
          else{
            var expDate = new Date(EndDate);
            expDate.setDate(expDate.getDate() + 1);
            this.db.transaction((tx) => {
              tx.executeSql('UPDATE alert_message SET message_end_id = ?, ended_on = ?, ended_by = ?, expiration_date = ? WHERE conversationid = ?',
              [messageBody.id, new Date(EndDate).toISOString(), messageBody.username, new Date(expDate).toISOString(), messageBody.chat_id],
              (txx, results) => {
                if(results.rowsAffected > 0){
                  this.setState({AlertMode:false, ConversationAlert:null, isOfficial:false});
                }
              })
            });
          }
        }

        this.db.transaction((tx) => {
          tx.executeSql('INSERT OR IGNORE INTO users (username) VALUES (?)',
          [messageBody.username],
          (txx, results) => {
            let timeminus = new Date().getTime() - messageBody.time;
            //1000
            if(!AlertUpdate && sessionId === this.state.Resource && PresenceUser === this.state.Nickname &&  timeminus <= 5000){

              if(AlarmStart){
                this.setState({AlertMode:true, ConversationAlert:messageBody.chat_id, AlertId:messageBody.chat_id, TrackLocationUpdates:isOfficial});
                if(!isOfficial){
                  BackgroundGeolocation.start(() => {
                    BackgroundGeolocation.setConfig({
                     distanceFilter: 50,
                     stopOnTerminate: false,
                     stopOnStationary:false,
                     startOnBoot: true,
                     url:null,
                     batchSync: false,
                     autoSync: false,
                     autoSyncThreshold: 1,
                     disableElasticity: false
                    }).then((state) => {
                      console.log("[setConfig] success: ", state);
                    });
                  });
                }
              }
              else if(GlobalAlert){
                //console.log('global alert');
              }
              else{
                this.sendNotification(messageBody);
              }

              tx.executeSql('UPDATE messages SET id = ?, text = ?, sent_at = ?, read_by_all = ?, sent_by = ?, conversation_id = ?, sent = ? WHERE id = ?',
              [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, true, stanzaId],
              (txt, results1) => {
                if (results1.rowsAffected > 0 ) {
                  this.store.dispatch({type: 'UPDATE_MESSAGES', Message:messageBody, StanzaId: stanzaId});
                }

                if(Lock){
                  txt.executeSql('UPDATE conversations SET locked = 1 WHERE JID = ?',
                  [messageBody.chat_id],
                  (txt1, results2) => {
                    if(results2.rowsAffected > 0){}
                  })
                }
              })
            }
            else{
              if(!AlertUpdate && !isEdit){
                tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename, thumbnail, isAudio, isEdited, isQuoted, quoted_msg_id, quoted_text, isSystemMsg, isHidden) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, true, isMultimedia, isImage, isVideo, isFile, url, fileName, thumbnail, false, isEdit, isQuote, quoteId, quoteMsg, messageBody.isSystemMsg, messageBody.hidden ? 1 : 0],
                (txt, results1) => {
                  this.store.dispatch({type: 'UPDATE_MESSAGES', Message:messageBody});
                  if(Lock){
                    txt.executeSql('UPDATE conversations SET locked = 1 WHERE JID = ?',
                    [messageBody.chat_id],
                    (txt1, results2) => {
                      if(results2.rowsAffected > 0){}
                    })
                  }
                })
              }
              else if(!AlertUpdate && isEdit){
                tx.executeSql('UPDATE messages SET text = ?, isEdited = 1 WHERE id = ?',
                [messageBody.text, idMsgEdited],
                (txt, results1) => {
                  if (results1.rowsAffected > 0 ) {
                    this.store.dispatch({type: 'EDIT_MESSAGE', Message:messageBody, EditMessage:idMsgEdited})
                  }
                })
              }
            }
          })
        });
      }
      else if(stanza.getChild("composing") != null){
        if(stanza.getChild("type") != undefined && stanza.getChild("type").text() === "audio"){
          //console.log("other using recording message");
        }
        else{
          let error = stanza.getChild("error");
          if(stanza.attrs == undefined || stanza.attrs.from == undefined){
            return false;
          }
          let composingInfo = stanza.attrs.from.split("/");
          let chatId = composingInfo[0];
          let userId = composingInfo[1];

          if(error != undefined){
            let statusCode = error.attrs.code;
            if(statusCode === "406"){
              this.store.dispatch({type:'UNAUTHORIZED_CHANNEL', ChatId: chatId});
            }
          }
          else{
            this.store.dispatch({type:'USER_COMPOSING', ChatId: chatId, User:userId});
          }
        }
      }
      else if(stanza.getChild("paused") != null){
        if(stanza.getChild("type") != undefined && stanza.getChild("type").text() === "audio"){
          //console.log("other user ended recording message");
          let urlAudio = stanza.getChild("url") != undefined ? stanza.getChild("url").text() : null;

          if(urlAudio != undefined){
            this.playSound(urlAudio);
          }
        }
        else{
          let composingInfo = stanza.attrs.from.split("/");
          let chatId = composingInfo[0];
          let userId = composingInfo[1];

          this.store.dispatch({type:'USER_PAUSED', ChatId: chatId, User:userId});
        }
      }
      else if(stanza.getChild("received") != null){
        if(stanza.attrs == undefined || stanza.attrs.from == undefined){
          return false;
        }

        let composingInfo = stanza.attrs.from.split("/");
        let chatId = composingInfo[0];
        let userId = composingInfo[1];
        let receivedObj = stanza.getChild("received");

        this.db.transaction((tx) => {
          tx.executeSql('INSERT OR REPLACE INTO message_member (user_id, message_id, read_at, conversation) VALUES (?, ?, ?, ?)',
          [userId, receivedObj.attrs.id, new Date().toISOString(), chatId],
          (txx, results) => {
            if (results.rowsAffected > 0 ) {
              tx.executeSql('SELECT COUNT(*) AS read_by FROM message_member WHERE conversation = ? AND message_id = ?',
              [chatId, receivedObj.attrs.id],
              (txt, results1) => {
                let resultRow = results1.rows.item(0);
                this.store.dispatch({type:'MESSAGE_READ', ChatId: chatId, User:userId, MessageId: receivedObj.attrs.id, ReadBy:resultRow.read_by});
              })
            }
          })
        });
      }
      else if(stanza.getChild("x") != null){
        if(stanza.children.length > 0){
          if(!DataLoaded){
            return false;
          }
          let children = stanza.children[0];
          let inviteData = stanza.getChild("delay");
          let inviteMessage = children.getChild("invite");
          if(inviteMessage != undefined){
            let newChat = stanza.attrs.from;

            let ChannelData;
            let ChannelSubject = "";
            let Temporal = 0;
            let LastDate = new Date().getTime() - 10000;
            let Description = "Description";
            let Participant = false;
            let EmergencyData;
            LastDate = new Date(LastDate).toISOString();
            ChannelData = inviteMessage.getChild("reason").children[0]; //invite time and subject are included in reason, as is the only parameter I can send in a invitation
            if(ChannelData == undefined){ return false; }
            ChannelData = ChannelData.split("~");
            if(ChannelData.length < 2){ return false;}
            ChannelSubject = ChannelData[0];
            LastDate = new Date(ChannelData[1]).toISOString();

            let ChatType = 0;
            if(newChat.startsWith("chat1v1")){
              ChatType = 1;
            }
            else if(newChat.startsWith("ambermexoficial")){
              ChatType = 2;
            }
            else if(newChat.startsWith("alertaglobal")){
              Temporal = 1;
              if(ChannelData.length >= 3){
                EmergencyData = JSON.parse(ChannelData[2]);
                Description = EmergencyData.Text;
                Participant = ChannelData[3] === 'True';
              }
            }

            this.db.transaction((tx) => {
              tx.executeSql("SELECT * FROM conversations WHERE JID = ?", [newChat],
              (tx, resultExist) => {
                var len = resultExist.rows.length;

                if(len > 0){
                  this.store.dispatch({type:"AUTHORIZE_EXISTING", ChatId:newChat, User:Username, xmppClient:this.xmppClient});
                }
                else{
                  tx.executeSql('INSERT INTO conversations (JID, created_at, subject, description, type, last_time_read, temporal, thumbnail, additionalProps) VALUES (?,?,?,?,?,?,?,?,?)',
                  [newChat, LastDate, ChannelSubject, Description, String(ChatType), LastDate, Temporal, null, JSON.stringify(EmergencyData)],
                  (tx, results) => {
                    if (Temporal == 1) {
                      tx.executeSql('INSERT INTO alert_message (started_on, started_by, is_medical, is_fire, conversationid, is_suspicious, is_feminist, alert_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                      [LastDate, EmergencyData.CreatedBy, EmergencyData.AlertType == 1 ? 1 : 0, EmergencyData.AlertType == 2 ? 1 : 0, newChat, EmergencyData.AlertType == 3 ? 1 : 0, EmergencyData.AlertType == 4 ? 1 : 0, EmergencyData.AlertType],
                      (tx, results2) => {
                        if(results2.rowsAffected > 0){
                          tx.executeSql('INSERT INTO alert_coords (latitude, longitude, date, alertid) VALUES (?, ?, ?, ?)',
                          [String(EmergencyData.Location.Latitude), String(EmergencyData.Location.Longitude), LastDate, newChat],
                          (tx2, results2) => {
                            tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on, last_visit, is_emcontact, is_response, response_type) VALUES (?,?,?,?,?,?, (SELECT last_visit FROM conversation_member WHERE user_id = ?), ?,?,?)',
                            [this.state.Nickname, newChat, Participant.toString(), 'false', 'true', new Date().toISOString(), new Date().toISOString(), 0, 0, 4],
                            (txt, results1) => {
                              let Chat = {
                                id: newChat,
                                name: ChannelSubject,
                                messages: [],
                                loading:true,
                                active_users:[],
                                members:[],
                                description:Description,
                                last_message: '',
                                last_time_read:new Date(LastDate).getTime(),
                                last_message_date_sent: new Date(LastDate).getTime(),
                                updated_date: new Date().getTime(),
                                unread_messages_count: 1,
                                nickname:"",
                                emergency:true,
                                backgroundColor:"white",
                                fontColor:"#0E75FA",
                                membersLoaded:false,
                                temporal:true,
                                chatType:ChatType,
                                locked:false,
                                last_update:new Date().getTime(),
                                additionalProps:EmergencyData.Message
                              };

                              this.store.dispatch({type:"ADD_SINGLE_CHAT", Chat:Chat});
                              this.store.dispatch({type:"START_ALERT_STATUS", Coordinates: EmergencyData.Location, EmergencyType:EmergencyData.AlertType == 0 ? "Emergency" : (EmergencyData.AlertType == 1 ? "Medical" : (EmergencyData.AlertType == 2 ? "Fire" : (EmergencyData.AlertType == 3 ? "Suspicious" : "Feminist"))), Chat:Chat.id, AlertText:EmergencyData.Text, User:null, OngoingAlert: false});

                              if(this.state.timeout) clearTimeout(this.timeout);
                              this.timeout = setTimeout(() => {
                                this.store.dispatch({type:"LOAD_CHATLIST"});
                              }, 1000);
                            })
                          })
                        }
                      })
                    }
                    else{
                      let Chat = {
                        id: newChat,
                        name: ChannelSubject,
                        messages: [],
                        loading:true,
                        active_users:[],
                        members:[],
                        description:Description,
                        last_message: '',
                        last_time_read:new Date(LastDate).getTime(),
                        last_message_date_sent: new Date(LastDate).getTime(),
                        updated_date: new Date().getTime(),
                        unread_messages_count: 1,
                        nickname:"",
                        emergency:false,
                        backgroundColor:"white",
                        fontColor:"#0E75FA",
                        membersLoaded:false,
                        temporal:false,
                        chatType:ChatType,
                        locked:false,
                        last_update:new Date().getTime()
                      };
                      this.store.dispatch({type:"ADD_SINGLE_CHAT", Chat:Chat});

                      if(this.state.timeout) clearTimeout(this.timeout);
                      this.timeout = setTimeout(() => {
                        this.store.dispatch({type:"LOAD_CHATLIST"});
                      }, 1000);
                    }
                  });
                }

              });
            });
          }
        }
      }
      else{
        this.store.dispatch({type:'END_LOADING', ChatId:stanza.attrs.from, UserId:Username});
      }
    }
  }

  enableAlertMode(alertInfo){
    this.setState({AlertMode:true, AlertId:alertInfo.id, ConversationAlert:alertInfo.chat_id, TrackLocationUpdates:alertInfo.chat_name.includes("-")});
    BackgroundGeolocation.start(() => {
      BackgroundGeolocation.setConfig({
        distanceFilter: 50,
        stopOnTerminate: false,
        stopOnStationary:false,
        startOnBoot: true,
        url:null,
        batchSync: false,
        autoSync: false,
        autoSyncThreshold: 1,
        disableElasticity: false
      }).then((state) => {});
    });
  }

  sendNotification(message){
    if(!message.notify){
      return false;
    }

    let messageContent = "";

    if(message.isMedia){
      if(message.isVideo && message.text === "Video"){
        messageContent = "Mando un video.";
      }
      else if(message.isImage && message.text === "Foto"){
        messageContent = "Mando una foto.";
      }
      else{
        messageContent = message.text;
      }
    }
    else{
      messageContent = message.text
    }

    let Model = {
      GroupJID: message.chat_id.split("@")[0],
      Message: messageContent,
      Url: message.isImage ? message.url : null
    };

    EndpointRequests.SendNotification(Model, function(responseData) {
      console.log(responseData);
      //do something?
    }.bind(this));
  }

  createAlertNotification(message, coordinates, type){
    //chat_type = 0 ambermex? 1 home security, 2 fire, 3 global security, 4 global medical, 5 user ?

    let ChatType;

    if(type == 0){
      ChatType = 1;
    }
    else if(type == 1){
      //no se puede crear medico desde aqui???
    }
    else if(type == 2){
      ChatType = 2;
    }

    let model = {
		  Message:message.text,
		  Type:type,
      ChannelType:ChatType,
		  ExternalChannelId:message.chat_id,
      Location: coordinates
	  };

    EndpointRequests.CreateAlert(model, function(responseData) {
      this.setState({AlertMode:true, ConversationAlert:message.chat_id, AlertId:message.id});
      BackgroundGeolocation.start(() => {
        BackgroundGeolocation.setConfig({
          distanceFilter: 50,
          stopOnTerminate: false,
          stopOnStationary:false,
          startOnBoot: true,
          url:null,
          batchSync: false,
          autoSync: false,
          autoSyncThreshold: 1,
          disableElasticity: false
        }).then((state) => {
          //console.log("[setConfig] success: ", state);
        });
      });
    }.bind(this));
  }

  callBackError(error){
    let { Username, Password } = this.state;
    console.log("error " + error);
    if(error != undefined && error.condition === "conflict"){
      let newResource = id();
      this.xmppClient.stop();
      this.loginToServer(Username, Password, newResource);
    }
    try{
      Analytics.trackEvent('XMPP CallbackError: ' + error);
    }
    catch(analyticsError){
      console.log(analyticsError);
    }
    //this.store.dispatch({type:"UPDATE_STATUS", Status:"CONNECTION ERROR: " + error});
  }

  callBackOutput(output){
    //console.log(output);
  }

  callBackInput(input){
    if(input.includes("failure") && input.includes("not-authorized")){
      Alert.alert(
       'Error',
       'Tu Usuario y/o Contraseña son incorrectos.',
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      this.store.dispatch({type:"LOGIN_LOADING", Loading:false});

      setTimeout(function(){
        this.store.dispatch({type:"LOGOUT_USER"});
    	}.bind(this),100);

      setTimeout(function(){
        this.store.dispatch({type:"FLUSH_DATA"});
    	}.bind(this),200);
    }
  }

  errorCB(err) {
    console.log("SQL Error: " + err);
  }

  successCB() {
    console.log("SQL executed fine");
  }

  openCB() {
    console.log("Database OPENED");
  }

  loadedData(UserData){
    let { PendingChat, Nickname, DataLoaded, IsGlobal, geofenceConfigured } = this.state;

    if(PendingChat != null){
      this.store.dispatch({type:'CLEAR_CURRENT'});
      this.store.dispatch({type:"LOAD_CHANNEL", LoadChat:{id:PendingChat}});
    }

    if(!geofenceConfigured){
      this.requestLocationPermission();
    }

    if(UserData != undefined){
      this.setState({DataLoaded:true, PendingChat:null, User:UserData});
    }
    else{
      this.setState({DataLoaded:true, PendingChat:null});
    }
  }



  checkPendingMessage(){
    let { Nickname, isOffline } = this.state;

    let startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 1);
    startDate = startDate.toISOString();
    return true;
    /*
    this.db.transaction((tx) => {
      tx.executeSql('SELECT * FROM messages WHERE sent_by = ? AND sent = 0 AND sent_at >= ? ORDER BY sent_at ASC',
      [Nickname, startDate],
      (txt, results) => {
        var len = results.rows.length;
        if(len > 0){
          for(let k = 0;k < len;k++){
            if(!isOffline){
              let row = results.rows.item(k);

              if(Nickname === row.sent_by){
                if(row.isMedia && !row.isQuoted){
                  if(row.isImage){
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("type", {}, "multimedia"), xml("fileType", {}, "image"), xml("url", {}, row.url), xml("filename", {}, "image.jpeg"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.xmppClient.send(message);
                  }
                  else if(row.isVideo){
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("type", {}, "multimedia"), xml("fileType", {}, "video"), xml("url", {}, row.url), xml("filename", {}, "video.mp4"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.xmppClient.send(message);
                  }
                  else if(row.isFile){
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("type", {}, "multimedia"), xml("fileType", {}, "file"), xml("url", {}, row.url), xml("filename", {}, "doc"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.xmppClient.send(message);
                  }
                }
                else if(row.isQuoted){
                  if(row.isMedia){
                    let mediaType = row.isVideo ? "video" : (row.isImage ? "image" : "file");

                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("messageType", {}, "quote"), xml("quoted_id", {}, row.quoted_msg_id), xml("quoted_msg", {}, row.quoted_text), xml("mediaType", {}, mediaType), xml("url", {}, row.url), xml("thumbnail", {}, row.thumbnail), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.xmppClient.send(message);
                  }
                  else{
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("messageType", {}, "quote"), xml("quoted_id", {}, row.quoted_msg_id), xml("quoted_msg", {}, row.quoted_text), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.xmppClient.send(message);
                  }
                }
                else{
                  if(row.text != undefined && row.text.startsWith("Alerta detonada")){
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
                    let response = this.xmppClient.send(message);
                  }
                  else if(row.text != undefined && row.text.startsWith("Alerta medica emitida")){
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("EmergencyId", {}, row.id), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
                    let response = this.xmppClient.send(message);
                  }
                  else if(row.text != undefined && (row.text.startsWith("Alerta Desactivada") || row.text.startsWith("Alerta Medica Desactivada"))){
                    tx.executeSql('SELECT * FROM alert_message WHERE conversationid = ? AND message_end_id IS null ORDER BY started_on ASC LIMIT 1',
                    [row.conversation_id],
                    (txt2, results2) => {
                      var len2 = results2.rows.length;
                      if(len2 > 0){
                        let currentAlarm = results2.rows.item(0);

                        let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, row.text), xml("EmergencyId", {}, currentAlarm.message_start_id), xml("type", {}, currentAlarm.is_medical ? "Medical" : "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "End"), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
                        let response = this.xmppClient.send(message);
                      }
                    });
                  }
                  else{
                    let message = xml("message", {to: row.conversation_id, id:row.id, from: row.conversation_id + "/" + row.sent_by, type:'groupchat'}, xml("body", {}, String(row.text)), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
                    let response = this.xmppClient.send(message);
                  }
                }
              }
            }
          }

          if(this.xmppClient.status != 'online'){
            setTimeout(function(){
              //this.tryToReconnect();
            }.bind(this),5000);
          }

          setTimeout(function(){
            this.checkPendingMessage();
          }.bind(this),5000);
        }
      })
    });
    */
  }

  getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return this.getActiveRouteName(route);
  }

  CurrentRoute = route.routeName;
  return route.routeName;
}

acceptLocation(){
  this.setState({locationModal:false});
  this.loadedData();
}

  render() {
    const { isLoggedIn, AudioURL } = this.state;

    return (
      <Provider store={this.store}>
        <AppContainer mode="card" ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }} onNavigationStateChange={(prevState, currentState) => {
              const currentScreen = this.getActiveRouteName(currentState);
              }} />
        <Toast ref="toast" positionValue={120} useNativeAnimation={true} textStyle={{ textAlign:'center', color:'white' }} style={{backgroundColor:'#cc4e4e'}}/>
        <LocalNotification openNotification={(notification) => this.onOpened(notification)} />
        <LocationModal locationModal={this.state.locationModal} acceptLocation={() => this.acceptLocation()} closeModal={() => this.setState({locationModal:false,DataLoaded:true, PendingChat:null})} />
        <View style={{height:0}}>
          <WebView
           ref={(ref) => (this.webview = ref)}
           originWhitelist={["*"]}
           mediaPlaybackRequiresUserAction={false}
           useWebKit={true}
           style={{height:1, flex:0}}
           source={{
             html:
               "<audio id='audio'> <source src="+ AudioURL +" type='audio/mp3' /> </audio>",
           }}
         />
       </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
