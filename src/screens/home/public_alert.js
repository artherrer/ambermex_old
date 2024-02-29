import React, { Component } from 'react'
import { View, Text, StyleSheet, Linking, KeyboardAvoidingView, Platform, StatusBar, Animated, Image, FlatList, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button as ButtonAlt, ListItem } from 'react-native-elements';
import Avatar from '../cmps/avatar.js'
import { connect } from 'react-redux';
import MapView, { AnimatedRegion, Animated as AnimatedMap } from 'react-native-maps';
import Toast, {DURATION} from 'react-native-easy-toast';
const EndpointRequests = require("../../util/requests.js");
const textAMBER = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
const newIconAlert = require('../../../assets/image/alert1.png');
const userPositionIcon = null;
import Message from '../chat/cmps/message'
import SuccessModal from '../chat/success_modal'
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Header } from 'react-navigation-stack';
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

const KEYBOARD_VERTICAL_OFFSET = headerHeight + StatusBar.currentHeight;
import Geolocation from '@react-native-community/geolocation';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
var ScrollableTabView = require('react-native-scrollable-tab-view');

class PublicAlert extends Component{
  static navigationOptions = {
    header:() => null,
    headerStyle:{
      backgroundColor:"white",
      shadowColor: 'transparent'
    },
    cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  }

  constructor(props) {
    super(props)

    let activeAlert = props.navigation.state.params != undefined && props.navigation.state.params.Chat != undefined ? true : false;

    this.state = {
      openModal:false,
      latDelta:0.07,
      lonDelta:0.07,
      inCoverage:false,
      activeAlert:activeAlert,
      createAlertConfirmation:false,
      alertType:null,
      alertMessage:null,
      alertComponentHeight:new Animated.Value((height/2) - 90),
      mapViewHeight:new Animated.Value(height/2),
      messagePosition:new Animated.Value((height/2) - 10),
      messages:[],
      Message:"",
      NumberMessages:0,
      disableMessageSending:false,
      endPermission:false,
      showSuccessModal:false
    }
  }

  componentDidMount(){
    const { activeAlert } = this.state;
    this.props.dispatch({type:"SET_LOAD_MEMBERS", LoadMembersFunction:(cb) => this.getMembersInfo()})

    this.setState({openModal:true, inCoverage: this.props.userState.CurrentPoint.length > 0 ? true : false});

    if(activeAlert){
      this.getMembersInfo();
      let disableAlert = this.props.chatState.CurrentChat.emergencyInformation != undefined ? this.props.chatState.CurrentChat.emergencyInformation.ended : false;

      let permission = this.endEmergencyPermission();
      this.setState({endPermission:permission, loadingAlert:false,activeAlert:true, createAlertConfirmation:true,disableMessageSending:disableAlert});

      this.animateChatComponentUp();

      this.props.clientState.DB.transaction((tx) => {
        tx.executeSql('UPDATE conversations SET last_time_read = ? WHERE JID = ?',
        [new Date().toISOString(), this.props.chatState.CurrentChat.id],
        (txt, results1) => {
          if (results1.rowsAffected > 0 ) {}
        });
      });
    }
  }

  setCustomDelta(nextlatDelta, nextlonDelta){
    let { latDelta, lonDelta } = this.state;

    if(nextlatDelta != latDelta || nextlonDelta != lonDelta){
      this.setState({latDelta:nextlatDelta, lonDelta:nextlonDelta});
    }
  }

  componentDidUpdate(prevProps, nextProps) {
    let { NumberMessages, activeAlert } = this.state;

    if(prevProps.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat.emergencyInformation === undefined && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined){
      setTimeout(function(){
        this.saveAdditionalProps();
        console.log('saved additionalProps');
      }.bind(this),500);
    }

    if(prevProps.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && prevProps.chatState.CurrentChat.emergencyInformation.ended != this.props.chatState.CurrentChat.emergencyInformation.ended && this.props.chatState.CurrentChat.emergencyInformation.ended == true)
    {
      this.setState({disableMessageSending:true});
    }

    if(prevProps.userState.CurrentPoint.length === 0 && this.props.userState.CurrentPoint.length > 0){
      this.setState({inCoverage:true});
    }

    if(prevProps.userState.CurrentPoint.length > 0 && this.props.userState.CurrentPoint.length === 0){
      this.refs.locationToast.show('Saliste de cobertura', 2500);
      this.setState({inCoverage:false});
    }

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages.length > NumberMessages){
      this.setState({NumberMessages:this.props.chatState.CurrentChat.messages.length});
    }
  }

  endEmergencyPermission(){
    let adminIndex = this.props.chatState.CurrentChat.members.findIndex(n => n.jid === this.props.userState.Username);

    if(adminIndex >= 0){
      if(this.props.chatState.CurrentChat.members[adminIndex].owner || this.props.chatState.CurrentChat.members[adminIndex].admin){
        return true;
      }
      else if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
        return true;
      }
      else{
        return false;
      }
    }
    else{
      if(this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy != undefined && this.props.chatState.CurrentChat.emergencyInformation.createdBy.jid === this.props.userState.Username){
        return true;
      }
      else{
        return false;
      }
    }
  }

  animateChatComponentUp(){
    Animated.parallel([
      Animated.timing(this.state.mapViewHeight, {
          toValue: height/3,
          duration: 300,
          useNativeDriver: true
      }),
      Animated.timing(this.state.messagePosition, {
          toValue: (height/3) - 10,
          duration: 300,
          useNativeDriver: true
      })
    ]).start(() => {
        // callback
    });
  }

  animateChatComponentDown(){
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
        alert("Se notifico a " + response.usersNotified + " usuarios cerca");
      }
      else{
        alert("No hay ningun usuario cerca");
      }

      this.setState({uploading:false});
    }.bind(this));
  }

  _keyExtractor = (item, index) => index.toString()
  _renderMessageItem(message) {
    const { Loading } = this.state;

    const isOtherSender = message.username != this.props.userState.Nickname ? true : false;

    if(message === undefined || message.id === undefined){
      return null;
    }

    return (
      <Message disableOptions={true} editMessage={(message) => this.editMessage(message)} quoteMessage={(message) => this.quoteMessage(message)} showImage={(image) => this.showImageModal(image)} messageObject={message} loading={Loading} otherSender={isOtherSender}  message={{pending:message.pending, body:message.text, read_by_count:message.read_by_count, date_sent:new Date(message.timestamp), sent_by:message.username, id:message.id, message_by:message.message_by, read_by:message.read_by, user_data:message.user}} key={message.id} />
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
    let conversation_id = this.props.chatState.CurrentChat.id.split("@")[0];
    let members_ids = [];

    EndpointRequests.GetMembersInfo(conversation_id, function(responseData) {
      if(responseData.error != undefined){
        alert(responseData.error);
        this.setState({isLoading:false});
      }
      else{
        if(responseData.members != null){
          let additionalProps = this.props.chatState.CurrentChat.additionalProps;

          for(let i = 0; i < responseData.members.length;i++){
            let member = responseData.members[i];
            members_ids.push(member.jid);

            if(additionalProps != null){
              let adIndex = additionalProps.users.findIndex(n => n.identifier == member.jid);

              if(adIndex >= 0){
                additionalProps.users[adIndex].alias = member.alias;
              }
            }
            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [member.nickname, member.jid, member.name, member.pictureUrl, "", "", member.phone, "", 'true', new Date().toISOString(), member.alias],
              (txx, results) => {
                tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on, last_visit) VALUES (?,?,?,?,?,?, (SELECT last_visit FROM conversation_member WHERE user_id = ?))',
                [member.nickname, this.props.chatState.CurrentChat.id, member.admin.toString(), member.owner.toString(), 'true', new Date().toISOString(), member.nickname],
                (txt, results1) => {
                  if (results1.rowsAffected > 0 ) {}
                })
              })
            });
          }

          this.props.dispatch({type:"UPDATE_MEMBERS", Props:additionalProps, Chat:conversation_id, MemberList: responseData.members, MembersLoaded:true, ChatInfo:{Description:responseData.description, CreatedAt: responseData.createdAt}});

          this.props.navigation.setParams({
            infoLoaded:true,
            loading:this.props.clientState.LoginLoading,
          });

          let permission = this.endEmergencyPermission();
          this.setState({Loading:false, MembersIds:members_ids, endPermission:permission});

          setTimeout(function(){
            this.props.dispatch({type:"ADD_USERDATA_MESSAGE"});
            if(cb != null){
              cb("Finished");
            }
          }.bind(this),200);
        }
      }
    }.bind(this));
  }

  createPublicAlarm(){
    let { alertType } = this.state;

    this.setState({loadingAlert:true});

    let UserAlias = this.props.userState.UserData.alias;

    Geolocation.getCurrentPosition((get_success) => {
      EndpointRequests.GetLocation(get_success.coords.latitude, get_success.coords.longitude, (result) =>{
        if(result.status === "OK"){

          let addressString = result.results[0].formatted_address;
          let coordinatesString = "(" + get_success.coords.latitude + ", " + get_success.coords.longitude + ")";

          let model = {
            Location:null,
            Message: "",
            Type: alertType === "Emergency" ? 0 : 1
          };

          let messageAlert = "";

          if(model.Type == 0){
            messageAlert = "Alerta detonada en tu proximidad por " + UserAlias + ". Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
          }
          else{
            messageAlert = "Alerta médica detonada en tu proximidad por " + UserAlias + ". Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
          }

          let locationModel;

          if(this.props.userState.AreaName != undefined && this.props.userState.CurrentPoint.length > 0){
             locationModel = {
               Latitude: get_success.coords.latitude,
               Longitude: get_success.coords.longitude,
               Neighborhood: this.props.userState.AreaName,
               BeaconId:null
             }
          }
          else if(this.props.userState.AreaName != undefined && this.props.userState.CurrentPoint.length == 0){
            locationModel = {
              Latitude: get_success.coords.latitude,
              Longitude: get_success.coords.longitude,
              Neighborhood: this.props.userState.AreaName,
              BeaconId:null
            }
          }
          else{
            alert("No estas en una zona geografica con covertura.");
            this.setState({loadingAlert:false});
            return false;
          }

          model.Location = locationModel;
          model.Message = messageAlert;

          EndpointRequests.CreateGlobalAlarm(model, (response) => {
            if(response.chatId != undefined){
              this.props.clientState.LoadChatList(false, (finished) => {
                setTimeout(async function(){
                  let messageXMPP = xml( "presence", { from:this.props.clientState.From, id:id(), to: response.chatId + '/' + this.props.userState.Nickname }, xml('x', 'http://jabber.org/protocol/muc'), xml("status", { code: '200'}) );
                  let responseXMPP = this.props.clientState.Client.send(messageXMPP);

                  this.props.dispatch({type:"ENTER_CHAT", Chat:response.chatId, Username:this.props.userState.Nickname, Props:response.result});
                  this.setState({loadingAlert:false,activeAlert:true});
                  this.sendAlertMessage(model);
                }.bind(this),500);
              });
            }
            else{
              alert("Hubo un error al crear el grupo de alerta.");
              this.setState({loadingAlert:false,activeAlert:false});
            }
          })
        }
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

  sendAlertMessage(model){
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: model.Message,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isAlert:true,
      alertStart:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent) VALUES (?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          if(model.Type == 0){
            let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, model.Message), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(message);
          }
          else if(model.Type == 1){
            let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, model.Message), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(message);
          }

          this.animateChatComponentUp();
        }
      })
    });
  }

  saveAdditionalProps(){
    let emergencyId = this.props.chatState.CurrentChat.emergencyInformation.messageId;
    let additionalProps = this.props.chatState.CurrentChat.additionalProps;

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('UPDATE alert_message SET additionalProps = ? WHERE message_start_id = ?',
      [JSON.stringify(additionalProps), emergencyId],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          this.setState({showSuccessModal:true});
          //saved additionalProps
        }
      })
    });
  }

  endEmergency(){
    if(this.props.chatState.CurrentChat.emergency && this.props.chatState.CurrentChat.emergencyInformation != undefined){
      let messageId = this.props.chatState.CurrentChat.emergencyInformation.messageId;
      let time = new Date().toISOString();
      let emergencyType = this.props.chatState.CurrentChat.emergencyInformation.type;

      let messageBody = {
        id: id(),
        chat_id: this.props.chatState.CurrentChat.id,
        timestamp: time,
        text: emergencyType === "Emergency" ? "Alerta desactivada" : "Alerta médica desactivada.",
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

      this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

      this.props.clientState.DB.transaction((tx) => {
        tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent) VALUES (?,?,?,?,?,?,?)',
        [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false],
        (txt, results1) => {
          if (results1.rowsAffected > 0 ) {
            let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageBody.text), xml("EmergencyId", {}, messageId), xml("type", {}, "Emergency"), xml("emergencyType", {}, emergencyType), xml("emergencyAction", {}, "End"), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(message);

            EndpointRequests.EndAlert({ConversationExternalId:this.props.chatState.CurrentChat.id}, function(responseData) {
              this.setState({loadingAlert:false, disableMessageSending:true, Message:""});
            }.bind(this));
          }
        })
      });
    }

    this.setState({showAlertMap:false});
  }

  renderContacts(item, index){
    if(item.alias != undefined){
      return <ListItem
                key={item.alias + index}
                roundAvatar
                underlayColor="lightgray"
                containerStyle={{height:55, justifyContent:'center', backgroundColor:'white', borderBottomColor:'white', borderBottomWidth:1}}
                leftAvatar={
                  <Avatar name={item.alias === undefined ? "?..." : item.alias} photo={item.pictureUrl != null ? item.pictureUrl : null} iconSize="small" />
                }
                rightIcon={item.admin && !item.owner ? {type:"font-awesome", name:"support", color:'blue'} : (item.admin && item.owner ? {type:"font-awesome-5", name:"crown", color:'blue'} : null)}
                title={item.alias}
                subtitleStyle={{fontSize:12, marginTop:3, marginLeft:5}}
                />
    }
    else{
      return null;
    }
  }

  deleteGroup(){
    let Role = "member";

    let memberIndex = this.props.chatState.CurrentChat.members.findIndex(n => n.jid === this.props.userState.Username);

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

      EndpointRequests.AbandonGroup(model, (response) => {
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
              }
            })
          });
      });
    }
  }

  getAlertComponent(){
    let { createAlertConfirmation, activeAlert, alertType, alertMessage, disableMessageSending } = this.state;

    if(!createAlertConfirmation && !activeAlert){
      return <View style={{flex:1}}>
               <Text style={{textAlign:'center', fontWeight:'bold'}}>Opciones de Alerta</Text>
                <View style={{flexDirection:'row', flex:1, top:-15}}>
                <View style={{flexDirection:'column', flex:.50, justifyContent:'center'}}>
                  <TouchableOpacity testID='LocationAlert' disabled={false} style={{zIndex:2,height:(width/3.5), backgroundColor:this.state.loading ? 'gray' : "#0C479D", borderRadius:(width/3.5)/2, width:width/3.5, borderColor:'black', borderWidth:0, alignSelf:'center', justifyContent:'center'}}
                  onPress={() => {
                    this.setState({alertType:"Medical", alertMessage:"Alerta médica activada", createAlertConfirmation:true});
                  }}>
                    <View style={{height:'70%', width:'70%', paddingTop:2, borderRadius:100, backgroundColor:'white', alignSelf:'center', justifyContent:'center', shadowOffset:{width:1, height:1}, shadowRadius:5, shadowColor:'#000', shadowOpacity:0.5}}>
                    <Image source={star} style={{height:(width/3.5)/2, width:(width/3.5)/2, alignSelf:'center'}} resizeMode="contain" />
                    </View>
                  </TouchableOpacity>
                    <Text style={{textAlign:'center', fontSize:19, marginTop:15,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>Alerta</Text>
                    <Text style={{textAlign:'center', fontSize:19,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>médica</Text>
                </View>
                <View style={{flexDirection:'column', flex:.50, justifyContent:'center'}}>
                  <TouchableOpacity testID='CreateAlert' disabled={this.state.loading} style={{zIndex:2,height:(width/3.5),backgroundColor:this.state.loading ? 'gray' : "red", borderRadius:(width/3.5)/2, width:(width/3.5), borderColor:'black', borderWidth:0, alignSelf:'center', justifyContent:'center'}}
                  onPress={() =>
                    {
                      Keyboard.dismiss;
                      this.setState({alertType:"Emergency",alertMessage:"Alerta Activada", createAlertConfirmation:true});
                    }}>
                      <View style={{height:'70%', width:'70%', borderRadius:100, backgroundColor:'white', alignSelf:'center', justifyContent:'center', shadowOffset:{width:1, height:1}, shadowRadius:15, shadowColor:'#000', shadowOpacity:0.8}}>
                      <Icon type="foundation" name="alert" size={(width/3)/2} color={this.state.loading ? 'gray' : "red"} style={{textAlign:'center'}} />
                      </View>
                  </TouchableOpacity>
                  <Text style={{textAlign:'center', fontSize:19, marginTop:15,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>Alerta</Text>
                  <Text style={{textAlign:'center', fontSize:19,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>Seguridad</Text>
                </View>
              </View>
            </View>
    }
    else if(createAlertConfirmation && !activeAlert){
      if(alertType === "Medical"){
        return <View style={{flexDirection:'row', flex:1, justifyContent:'center'}}>
                <View style={{flexDirection:'column', flex:1, justifyContent:'center', height:height/3}}>
                <TouchableOpacity testID='LocationAlert' disabled={this.state.loadingAlert} style={{height:(width/3.5), backgroundColor:this.state.loading ? 'gray' : "#0C479D", borderRadius:(width/3.5)/2, width:width/3.5, borderColor:'black', borderWidth:0, alignSelf:'center', justifyContent:'center'}}
                onPress={() => {
                  this.setState({alertType:"Medical", uploading:true, alertMessage:"Alerta médica activada"});
                  setTimeout(function(){
                    this.createPublicAlarm();
                  }.bind(this),200);
                }}>
                <View style={{height:'70%', width:'70%', textAlign:'center', borderRadius:100, backgroundColor:'white', alignSelf:'center', justifyContent:'center', shadowOffset:{width:1, height:1}, shadowRadius:5, shadowColor:'#000', shadowOpacity:0.5}}>
                {this.state.loadingAlert ?
                  <ActivityIndicator size="large" color="gray" style={{alignSelf:'center'}}/>
                  :
                  <Image source={star} style={{height:(width/3.5)/2, paddingTop:2, width:(width/3.5)/2, alignSelf:'center'}} resizeMode="contain" />
                }
                </View>
                </TouchableOpacity>
                <Text style={{textAlign:'center', marginTop:15, fontSize:19,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>Emergencia médica</Text>
                <View style={{marginTop:30, alignSelf:'center', justifyContent:'center'}}>
                <TouchableOpacity
                style={{height:60, width:250, borderRadius:50, backgroundColor:'red', alignSelf:'center'}}
                onPress={() => {
                  this.setState({createAlertConfirmation:false, alertType:null,alertMessage:null});
                  this.animateChatComponentDown();
                }}>
                <View style={{height:60, width:250,borderRadius:30, flexDirection:'row'}}>
                <View style={{height:60,flex:.20, textAlign:'center', justifyContent:'center', marginTop:2}}>
                <Icon name="ios-close" type="ionicon" color={'white'} size={40} />
                </View>
                <View style={{height:60,flex:.80, justifyContent:'center', textAlign:'center'}}>
                <Text style={{color:'white', fontSize:18, fontWeight:'bold'}}> Emergencia</Text>
                </View>
                </View>
                </TouchableOpacity>
                </View>
                </View>
              </View>
      }
      else{
        return <View style={{flexDirection:'row', flex:1, justifyContent:'center'}}>
                  <View style={{flexDirection:'column', flex:1, justifyContent:'center', height:height/3}}>
                  <TouchableOpacity testID='CreateAlert' disabled={this.state.loadingAlert} style={{height:(width/3.5),backgroundColor:this.props.loading ? 'gray' : "red", borderRadius:(width/3.5)/2, width:(width/3.5), borderColor:'black', borderWidth:0, alignSelf:'center', justifyContent:'center'}}
                  onPress={() =>
                    {
                      this.setState({alertType:"Emergency", uploading:true, alertMessage:"Alerta Activada"});
                      setTimeout(function(){
                        this.createPublicAlarm();
                      }.bind(this),200);
                    }}>
                    <View style={{height:'70%', width:'70%', textAlign:'center', borderRadius:100, backgroundColor:'white', alignSelf:'center', justifyContent:'center', shadowOffset:{width:1, height:1}, shadowRadius:15, shadowColor:'#000', shadowOpacity:0.8}}>
                    {this.state.loadingAlert ?
                      <ActivityIndicator size="large" color="gray" style={{alignSelf:'center'}}/>
                      :
                      <Icon type="foundation" name="alert" size={(width/3)/2} color={this.props.loading ? 'gray' : "red"} style={{textAlign:'center'}} />
                    }
                    </View>
                    </TouchableOpacity>
                    <Text style={{textAlign:'center', marginTop:15, fontSize:19,fontFamily:'HelveticaNeue', color:'gray', letterSpacing:1.5, fontWeight:'700'}}>Alerta de Seguridad</Text>
                    <View style={{marginTop:25, alignSelf:'center', justifyContent:'center'}}>
                    <TouchableOpacity
                    style={{height:60, width:250, borderRadius:50, backgroundColor:'red', alignSelf:'center'}}
                    onPress={() => {
                      this.setState({createAlertConfirmation:false, alertType:null,alertMessage:null});
                      this.animateChatComponentDown();
                    }}>
                    <View style={{height:60, width:250,borderRadius:30, flexDirection:'row'}}>
                    <View style={{height:60,flex:.20, textAlign:'center', justifyContent:'center', marginTop:2}}>
                    <Icon name="ios-close" type="ionicon" color={'white'} size={40} />
                    </View>
                    <View style={{height:60,flex:.80, justifyContent:'center', textAlign:'center'}}>
                    <Text style={{color:'white', fontSize:18, fontWeight:'bold'}}>Cancelar Emergencia</Text>
                    </View>
                    </View>
                    </TouchableOpacity>
                    </View>
                  </View>
                </View>
      }
    }
    else{
      return <View style={{flex:1}}>
             <ScrollableTabView locked={true} tabBarPosition={"top"} style={{height:((height/3) * 2) - 155}}>
              <View tabLabel="Mensajes" style={{height:((height/3) * 2) - 155}}>
                <FlatList
                  style={{backgroundColor:'white',flex: 1,height:((height/3) * 2) - 160}}
                  inverted={this.props.chatState.CurrentChat != undefined ? (this.props.chatState.CurrentChat.messages.length == 0 ? false : true) : false}
                  data={this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.messages.sort((a, b) => { return b.time - a.time}) : []}
                  keyExtractor={this._keyExtractor}
                  renderItem={({ item }) => this._renderMessageItem(item)}
                  ListEmptyComponent={() =>
                      <View style={{top:((height/3) * 2) - 270,width:width - 50, justifyContent:'center', alignSelf:'center', borderRadius:10, padding:15, backgroundColor:'lightgray', borderBottomColor:'transparent'}}>
                          <Text style={{textAlign:'center', fontSize:13, fontStyle:'italic'}}>Envia un mensaje a personas cercanas a tu posicion.</Text>
                      </View>
                  }
                  ListHeaderComponent={() =>
                    this.state.disableMessageSending ?
                      <TouchableOpacity onPress={() => this.deleteGroup()} style={{marginBottom:10, marginTop:10, borderRadius:50, paddingLeft:20, paddingRight:20, alignSelf:'center', padding:10, backgroundColor:'red'}}>
                        <Text style={{color:'white', textAlign:'center'}}>Borrar Alerta</Text>
                      </TouchableOpacity>
                      :
                      null
                  }
                  onEndReachedThreshold={5}
                />
                <View style={{paddingLeft:5, paddingRight:5, flexDirection: 'row', marginTop: wp('1%'), marginEnd: wp('2%'), alignItems:'center', marginBottom:iPhoneX ? 5 : 0}}>
                  <View style={{backgroundColor: '#e3e3e3', borderRadius: 6, marginEnd: wp('1%'), marginLeft:5, flexGrow: 1}}>
                    <AutoGrowingTextInput
                    style={{marginStart: wp('1%'), marginEnd: wp('10%')}}
                    value={this.state.Message}
                    editable={!this.state.disableMessageSending}
                    placeholder={this.state.disableMessageSending ? "La alerta a terminado" : 'Escribe un mensaje...'}
                    onBlur={() => this.statusBarReset()}
                    onChangeText={(text) => this.composingMessage(text)}
                    minHeight={40}
                    maxHeight={40}
                    maxWidth={width - 140} />
                  </View>
                  <View style={{marginLeft:5}}>
                    <TouchableOpacity delayPressOut={1000} disabled={!this.state.disableMessageSending && this.state.Message.length > 0 ? false : true}  onPress={() => this.state.Message.length > 0 ? this.sendMessage() : null}>
                      <Icon name={"send"} size={30} color={this.state.Message.length > 0 ? "#7CB185" : 'gray'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View tabLabel="Participantes" style={{flex: 1,height:iPhoneX ? ((height/3) * 2) - 160 : ((height/3) * 2) - 130}}>
                <FlatList
                  style={{backgroundColor:'white',flex:1, marginBottom:10}}
                  data={this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.members : []}
                  keyExtractor={this._keyExtractor}
                  renderItem={({ item, index }) => this.renderContacts(item, index)}
                  ListEmptyComponent={() =>
                      <View style={{top:((height/3) * 2) - 270,width:width - 50, justifyContent:'center', alignSelf:'center', borderRadius:10, padding:15, backgroundColor:'lightgray', borderBottomColor:'transparent'}}>
                          <Text style={{textAlign:'center', fontSize:13, fontStyle:'italic'}}>Cargando Lista.</Text>
                      </View>
                  }
                  onEndReachedThreshold={5}
                />
              </View>
            </ScrollableTabView>
            </View>
    }
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
      pending:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent) VALUES (?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let MessageNotif = Message;
          let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          let response = this.props.clientState.Client.send(message);

          this.setState({Loading:false, Message: ""});
          this.props.dispatch({type:'END_LOADING', ChatId:  this.props.chatState.CurrentChat.id});

          if(this.state.messageTimeout) clearTimeout(this.msgTimeout);
          this.msgTimeout = setTimeout(() => {
            this.props.chatState.CheckPending();
          }, 5000);
        }
      })
    });
  }

  getLocationMapObject(){
    let { latDelta, lonDelta } = this.state;

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.emergencyInformation != undefined && this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined){
      return {
        latitude: this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude,
        longitude:this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude,
        latitudeDelta: this.state.latDelta,
        longitudeDelta: this.state.lonDelta
      }
    }
    else{
      return {
          latitude: this.props.userState.Location != null ? this.props.userState.Location.latitude : 0,
          longitude:this.props.userState.Location != null ? this.props.userState.Location.longitude : 0,
          latitudeDelta: this.state.latDelta,
          longitudeDelta: this.state.lonDelta
      }
    }
  }

  getOptionalComponent(){
    let { disableMessageSending, activeAlert, endPermission } = this.state;

    if(this.props.clientState.PermissionsEnabled){
      if(!disableMessageSending && activeAlert){
        return <Animated.View style={{position:'absolute', top:this.state.messagePosition, backgroundColor:'transparent', alignSelf:'center', padding:10}}>
                  <TouchableOpacity disabled={!endPermission} onPress={() => this.endEmergency()} style={{borderRadius:50, paddingLeft:20, paddingRight:20, alignSelf:'center', padding:10, backgroundColor:endPermission ? 'black' : 'gray'}}>
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

  render(){
    return (
      <View style={{
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: 'white'}}
          behavior={'position'}
          keyboardVerticalOffset={20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{height:height, width:width, padding:0,borderRadius:0, backgroundColor:"white",marginTop:0}}>
          <View style={{height:55,width:width, backgroundColor:"white", flexDirection:'row',justifyContent: 'center', marginBottom:0}}>
          <View style={{flex:.5, height:55, justifyContent:'center', flexDirection:'column', backgroundColor:'transparent'}}>
          <Image source={textAMBER} style={{height:50, width:150, alignSelf:'center'}} resizeMode="contain" />
          </View>
          <View style={{flex:.5, height:55, justifyContent:'center', marginTop:3}}>
          <TouchableOpacity style={{backgroundColor:'white', height:55,width:60,justifyContent:'center', alignSelf:'flex-end'}}
          onPress={() => {
            Keyboard.dismiss;
            this.props.navigation.pop();

            setTimeout(function(){
              this.setState({openModal:false, alertMessage:"", alertValid:true});
              if(this.state.activeAlert){
                this.props.navigation.state.params.clearCurrent();
              }
            }.bind(this),500);
          }}>
          <Icon name="ios-close" type="ionicon" color={'black'} size={35} style={{marginBottom:0}} />
          </TouchableOpacity>
          </View>
          </View>
          <AnimatedMap userLocationAnnotationTitle="Mi ubicación" showsUserLocation={true} style={{width: width, height: this.state.mapViewHeight, alignSelf:'center'}} initialRegion={{
            latitude: this.props.userState.Location != null ? parseFloat(this.props.userState.Location.latitude) : 20.693918,
            longitude: this.props.userState.Location != null ? parseFloat(this.props.userState.Location.longitude) : -100.452809,
            latitudeDelta: this.state.latDelta,
            longitudeDelta: this.state.lonDelta
            }}
            onRegionChangeComplete={(values) => { this.setCustomDelta(parseFloat(values.latitudeDelta), parseFloat(values.longitudeDelta))} }
            region={this.getLocationMapObject()}
            >
              {
                this.props.userState.GeofencePoints.map((point, index) => (
                  <MapView.Circle
                    key={point.identifier + "circle" + index}
                    strokeColor={'rgba(255, 0, 0, 0.5)'}
                    fillColor={point.extras != undefined && point.extras.color != undefined ? point.extras.color : 'transparent'}
                    zIndex={point.extras != undefined && point.extras.imaginary ? 0 : 1}
                    strokeWidth={2}
                    radius={point.radius}
                    center={{latitude:point != null ? parseFloat(point.latitude) : 0,longitude:point != null ? parseFloat(point.longitude) : 0}}
                    />
                ))
              }
              {
                this.props.userState.GeofencePoints.map((point, index) => (
                    <MapView.Marker
                      pinColor={"yellow"}
                      key={point.identifier + " marker" + index}
                      coordinate={{latitude:point != null ? parseFloat(point.latitude) : 0,longitude:point != null ? parseFloat(point.longitude) : 0}}
                      title={point.identifier === 'area' ? "Cuadrante" : "Alarma " + point.identifier}>
                        {point.extras != undefined && point.extras.imaginary ?
                          <Image
                            source={require('../../../assets/image/Empty.png')}
                            style={{ width: iPhoneX ? 35 : 5, height: iPhoneX ? 35 : 5, resizeMode: "contain" }}
                            />
                            :
                          <Image
                            source={require('../../../assets/image/alert_pin.png')}
                            style={{ width: iPhoneX ? 35 : 35, height: iPhoneX ? 35 : 35, resizeMode: "contain" }}
                            />
                        }
                    </MapView.Marker>
                ))
              }
              {
                this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.emergencyInformation != undefined ?
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
              }
              {
                this.props.chatState.CurrentChat != undefined  && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.emergencyInformation != undefined ?
                (this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates != undefined ?
                  <MapView.Marker
                    key={"userLatest"}
                    coordinate={{latitude:parseFloat(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.latitude),longitude:parseFloat(this.props.chatState.CurrentChat.emergencyInformation.latestCoordinates.longitude)}}
                    title={"Ultima posicion"}>
                    <Image
                      source={userPositionIcon}
                      style={{ width: iPhoneX ? 35 : 25, height: iPhoneX ? 35 : 25, resizeMode: "contain" }}
                      />
                  </MapView.Marker>
                  :
                  null
                )
                :
                null
              }
              {
                this.props.chatState.CurrentChat != undefined  && this.props.chatState.CurrentChat.temporal && this.props.chatState.CurrentChat.additionalProps != undefined ?
                (this.props.chatState.CurrentChat.additionalProps.users != undefined ?
                  this.props.chatState.CurrentChat.additionalProps.users.map((point, index) => (
                    <MapView.Marker
                      key={"userLatest" + index}
                      coordinate={{latitude:parseFloat(point.latitude),longitude:parseFloat(point.longitude)}}
                      title={point.alias != undefined ? point.alias : "Usuario Cercano"}>
                      <Image
                        source={userPositionIcon}
                        style={{ width: iPhoneX ? 35 : 25, height: iPhoneX ? 35 : 25, resizeMode: "contain" }}
                        />
                    </MapView.Marker>
                  ))
                  :
                  null
                )
                :
                null
              }
          </AnimatedMap>
          <Animated.View style={{height:this.state.alertComponentHeight, flex:1, padding:15,justifyContent:'flex-start'}}>
            {this.getAlertComponent()}
          </Animated.View>
          {this.getOptionalComponent()}
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        <Toast ref="locationToast" positionValue={120} style={{backgroundColor:'black'}}/>
        <SuccessModal successAlert={this.state.showSuccessModal} closeSuccessModal={() => this.setState({showSuccessModal:false})}/>
        </View>
          )
        }
      }

      let PublicAlertContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(PublicAlert);
      export default PublicAlertContainer;
