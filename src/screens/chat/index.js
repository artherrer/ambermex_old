import React, { PureComponent } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Button,
  Dimensions,
  Alert,
  Linking,
  Modal,
  Keyboard,
  ActionSheetIOS,
  BackHandler,
  ImageBackground
} from 'react-native'
import { Header } from 'react-navigation-stack';
import Geolocation from '@react-native-community/geolocation';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FeatherIcon from 'react-native-vector-icons/Feather'
import Ionicon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AttachmentIcon from 'react-native-vector-icons/Entypo'
import Message from './cmps/message'
import AlertModal from './alert_modal'
import AlertMap from './alert_map'
import SuccessModal from './success_modal'
import FileUploadModal from './file_upload_modal'
import QuoteEditMode from './quote_mode'
import Upload from 'react-native-background-upload'
import DocumentPicker from 'react-native-document-picker';
import { createThumbnail } from "react-native-create-thumbnail";
import ActionSheet from 'react-native-actionsheet'
import Clipboard from '@react-native-clipboard/clipboard';

import ImagePicker from 'react-native-image-crop-picker';
import AudioRecord from 'react-native-audio-record';
const cloneDeep = require('lodash/cloneDeep');
import ActionButton from 'react-native-action-button';
import DialogModalAlert from  '../home/dialog_modal_alerts.js';
const BARRA_MEDICAL_DISABLED = require('../../../assets/image/BARRA_MEDICO_DISABLED.png');
const BARRA_PERSONAL = require('../../../assets/image/BARRA_PERSONAL.png');
const BARRA_PERSONAL_DISABLED = require('../../../assets/image/BARRA_PERSONAL_DISABLED.png');
const BARRA_SOSPECHA = require('../../../assets/image/BARRA_SOSPECHA.png');
const BARRA_SOSPECHA_DISABLED = require('../../../assets/image/BARRA_SOSPECHA_DISABLED.png');
const BARRA_VECINAL = require('../../../assets/image/BARRA_VECINAL.png');
const BARRA_VECINAL_DISABLED = require('../../../assets/image/BARRA_VECINAL_DISABLED.png');
const BARRA_MUJERES = require('../../../assets/image/BARRA_MUJERES.png');
const BARRA_MUJERES_DISABLED = require('../../../assets/image/BARRA_MUJERES_DISABLED.png');
const BACKGROUND = require('../../../assets/image/background_chat.jpg');
const MESSAGE_EMPTY = require('../../../assets/image/MESSAGE_EMPTY.png');
import { MONTHS as months, APP_INFO } from '../../util/constants';

import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
import { connect } from 'react-redux';
var { height, width } = Dimensions.get('window');
import FastImage from 'react-native-fast-image'
var iPhoneX = height >= 812;
const BOTON_AMBERMEX = require('../../../assets/image/BOTON_HOME.png');
const OFFICIAL_CHANNEL = require('../../../assets/image/OFICIAL_CHANNEL.png');

let Loaded = false;
let Options = [];
const EndpointRequests = require("../../util/requests.js");
var headerHeight = iPhoneX ? 91 : 64;

const KEYBOARD_VERTICAL_OFFSET = iPhoneX ? (headerHeight == 64 ? 88 + StatusBar.currentHeight : headerHeight + StatusBar.currentHeight) : headerHeight + StatusBar.currentHeight;

class ChatRoom extends PureComponent {
  static navigationOptions = ({navigation}) => ({
	    headerTitle: navigation.state.params.loading ?
                  () => <TouchableOpacity style={{width:width/1.5, height:40, justifyContent:'center', alignSelf:'center', backgroundColor:'transparent'}}>
                    <ActivityIndicator size="large" color={navigation.state.params.fontColor} style={{alignSelf:'center'}} />
                    </TouchableOpacity>
                    :
                    () => <TouchableOpacity style={{width:width/1.5, height:40, justifyContent:'center', alignSelf:'center'}}
                                  disabled={!navigation.state.params.infoLoaded}
                						      onPress={() => {
                							             navigation.state.params.settings();}}>
                                        <Text numberOfLines={1} ellipsizeMode='tail' style={{textAlign:'center',fontSize:19,fontWeight: 'bold',color:navigation.state.params.fontColor, width:width/1.5, overflow:'hidden'}}>{navigation.state.params.chat_title}</Text>
                     </TouchableOpacity>,
		headerLeft: () => <TouchableOpacity
						      onPress={() => {
                          StatusBar.setBackgroundColor('white');
							             navigation.state.params.goHomescreen();}}  style={{height:50, marginLeft:5, backgroundColor:'transparent', width:40, justifyContent:'center'}}>
						        <Ionicon name="ios-arrow-back" color={'#7D9D78'} size={28} style={{textAlign:'center'}} />
					      </TouchableOpacity>,
    headerStyle:{
      backgroundColor:navigation.state.params.backgroundColor,
      shadowColor: 'transparent',
      elevation:0
    },
    headerTitleStyle: {
            fontWeight: 'bold',
            color:navigation.state.params.fontColor,
            shadowColor: 'transparent',
            justifyContent:'center',
            textAlign:'center',
            alignSelf:'center'
    },
	  });

  constructor(props) {
    super(props)
    this.state = {
      Message: '',
      timeout: 1500,
      NumberMessages:0,
      Loading:true,
      MembersIds:[],
      showAlertModal:false,
      loadingAlert:false,
      showAlertMap:false,
      fileUploadModal:false,
      progressUpload:0,
      showImage:false,
      videoThumbnail:null,
      sendingAudio:false,
      quoteMode:false,
      quotedMessage:null,
      editMode:false,
      editedMessage:null,
      messageTimeout:5000,
      endPermission:false,
      successAlert:false,
      notMember:false,
      CurrentChat:null,
      alertType:"Emergency",
      channel:null,
      alertTypePressed:"",
      noAlertModal:false
    }
    //this.onBackClicked = this.goBackHandler.bind(this);
  }

  componentDidMount(){
    this.runOnEnterChat();
    let permission = this.endEmergencyPermission();
    this.setState({endPermission:permission});

    //BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);
  }

  goBackHandler(){
    this.goBack();
    return true;
  }

  runOnEnterChat(){
    this.props.dispatch({type:'UPDATE_PRESENCE', ChatId: this.props.chatState.CurrentChat.id, User:this.props.userState.Nickname});

    this.props.navigation.setParams({
      settings:this.goChatSettings.bind(this),
      goHomescreen:() => this.goBack(true),
      chat_title:this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.name : "",
      fontColor:this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.fontColor : "black",
      backgroundColor:this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.backgroundColor : "white",
      infoLoaded:this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.membersLoaded : false
    });

    StatusBar.setBackgroundColor(this.props.chatState.CurrentChat.backgroundColor);

    this.props.dispatch({type:"SET_LOAD_MEMBERS", LoadMembersFunction:(cb) => this.getMembersInfo(cb), BackAndroidChat:() => this.goBack()})
    this.setState({CurrentChat:cloneDeep(this.props.chatState.CurrentChat.id)});
    this.getMembersInfo();
    let userData = this.props.userState.UserData;
    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on, last_visit) VALUES (?,?,(SELECT is_admin FROM conversation_member WHERE user_id = ? AND conversation_id = ?), (SELECT is_admin FROM conversation_member WHERE user_id = ? AND conversation_id = ?), ?, (SELECT is_admin FROM conversation_member WHERE user_id = ? AND conversation_id = ?), ?)',
      [userData.nickname, this.props.chatState.CurrentChat.id, userData.nickname, this.props.chatState.CurrentChat.id,  userData.nickname, this.props.chatState.CurrentChat.id, 'true', userData.nickname,  this.props.chatState.CurrentChat.id, new Date().toISOString()],
      (txx, results) => {
        if (results.rowsAffected > 0 ) {
          tx.executeSql('UPDATE conversations SET last_time_read = ? WHERE JID = ?',
          [new Date().toISOString(), this.props.chatState.CurrentChat.id],
          (txt, results1) => {
            if (results1.rowsAffected > 0 ) {}
          })
        }
      })
    });

    this.checkIfLocked();
  }

  checkIfLocked(){
    if(this.props.chatState.CurrentChat.locked){
      Alert.alert(
       'Atención',
       "El grupo esta archivado y no se pueden enviar o recibir mensajes. Borrar la conversación de tu lista?",
       [
         {text: 'Borrar', onPress: () => { this.abandonGroupCall()}, style: 'destructive'},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
    }
  }

  deleteGroupLocal(){
    this.props.dispatch({type:"REMOVE_ROOM", ChatId:this.props.chatState.CurrentChat.id});

    let message = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
    let response = this.props.clientState.Client.send(message);

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('DELETE FROM conversations WHERE JID = ?',
      [this.props.chatState.CurrentChat.id],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          txt.executeSql('DELETE FROM messages WHERE conversation_id = ?',
          [this.props.chatState.CurrentChat.id],
          (txt2, resultsMessages) => {
            this.props.clientState.LoadChatList();
            this.props.navigation.popToTop();
            this.props.dispatch({type:"CLEAR_CURRENT"});
          });
        }
      })
    });
  }

  getMembersInfo(cb){
    if(this.props.chatState.CurrentChat == undefined || this.props.chatState.CurrentChat.id == undefined){
      if(cb != null){
        cb(false);
      }
      return false;
    }
    let conversation_id = this.props.chatState.CurrentChat.id.split("@")[0];
    let members_ids = [];

    if(this.props.chatState.CurrentChat.unauthorized){
      if(!this.state.notMember){
        Alert.alert(
         'Parece que no eres parte de este grupo.',
         "No podras enviar ni recibir nuevos mensajes. Borrar grupo de tu lista?",
         [
           {text: 'Borrar', onPress: () => this.deleteGroupLocal(), style:'destructive'},
           {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
      }

     this.setState({isLoading:false, notMember:true});
     return false;
    }

    EndpointRequests.GetMembersInfo(conversation_id, function(responseData) {
      if(responseData.error != undefined){
        if(responseData.notMember){
          if(this.state.notMember){
            return true;
          }
          Alert.alert(
           'Parece que no eres parte de este grupo.',
           "No podras enviar ni recibir nuevos mensajes. ¿Borrar grupo de tu lista?",
           [
             {text: 'Borrar', onPress: () => this.deleteGroupLocal(), style:'destructive'},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
         this.setState({isLoading:false, notMember:true});
        }
        else if(responseData.notFound){
          Alert.alert(
           'Error',
           "El canal ha vencido o fue borrado. ¿Borrar grupo de tu lista?",
           [
             {text: 'Borrar', onPress: () => this.abandonGroupCall(), style:'destructive'},
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        else{
          Alert.alert(
           'Error',
           responseData.error,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          this.setState({isLoading:false});
        }
      }
      else{
        if(responseData.members != null && this.state.CurrentChat != undefined && this.props.chatState.CurrentChat.id === this.state.CurrentChat && responseData.channelId === this.state.CurrentChat){
          for(let i = 0; i < responseData.members.length;i++){
            let member = responseData.members[i];
            members_ids.push(member.jid);
            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [member.nickname, member.jid, member.name, member.pictureUrl, "", "", member.phone, "", 'true', new Date().toISOString(), member.alias],
              (txx, results) => {
                tx.executeSql('INSERT OR REPLACE INTO conversation_member (user_id, conversation_id, is_admin, is_owner, is_member, added_on, last_visit) VALUES (?,?,?,?,?,?, (SELECT last_visit FROM conversation_member WHERE user_id = ?))',
                [member.nickname, this.state.CurrentChat, member.admin.toString(), member.owner.toString(), 'true', new Date().toISOString(), member.nickname],
                (txt, results1) => {
                  if (results1.rowsAffected > 0 ) {}
                })
              })
            });
          }

          let thumbnail;
          let subject = null;
          if(this.props.chatState.CurrentChat.chatType === 1){
            if(this.state.CurrentChat != undefined && this.props.chatState.CurrentChat.id === this.state.CurrentChat && responseData.channelId === this.state.CurrentChat){
              let otherUser = responseData.members.filter(x => x.jid != this.props.userState.Username);
              thumbnail = otherUser.length >= 1 ? otherUser[0].pictureUrl : null;
              subject = otherUser.length >= 1 ? otherUser[0].alias : null;


              if(thumbnail != undefined && subject != undefined && this.props.chatState.CurrentChat.id === this.state.CurrentChat && responseData.channelId === this.state.CurrentChat){
                this.props.navigation.setParams({
                  chat_title:subject
                });
                this.props.clientState.DB.transaction((tx) => {
                  tx.executeSql('UPDATE conversations SET thumbnail = ?, subject = ? WHERE JID = ?',
                  [thumbnail, subject, this.state.CurrentChat],
                  (txx, results) => {
                  })
                });
              }

            }
          }
          else{
            if(responseData.thumbnail != undefined && this.props.chatState.CurrentChat.id === this.state.CurrentChat){
              thumbnail = responseData.thumbnail;

              this.props.clientState.DB.transaction((tx) => {
                tx.executeSql('UPDATE conversations SET thumbnail = ? WHERE JID = ?',
                [responseData.thumbnail, this.state.CurrentChat],
                (txx, results) => {
                })
              });
            }
          }

          this.props.dispatch({type:"UPDATE_MEMBERS", Subject:subject, Chat:conversation_id, Thumbnail:thumbnail, MemberList: responseData.members, MembersLoaded:true, ChatInfo:{Description:responseData.description, CreatedAt: responseData.createdAt}});
          this.setState({Loading:false, MembersIds:members_ids, notMember:false});

          this.props.navigation.setParams({
            infoLoaded:true,
            loading:false,
          });

          let permission = this.endEmergencyPermission();

          this.setState({endPermission:permission});

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

  goChatSettings(){
    if(this.props.chatState.CurrentChat.locked){
      this.checkIfLocked();
    }

    if(!this.props.clientState.LoginLoading && !this.state.notMember && !this.props.chatState.CurrentChat.locked){
      this.props.navigation.navigate("ChatSettings");
    }
  }

  abandonGroupCall(noAlert){
    let index = this.props.chatState.CurrentChat.members.findIndex(x => x.nickname == this.props.userState.Nickname);
    let Me = this.props.chatState.CurrentChat.members[index];
    let Role;

    if(Me.admin && Me.owner){
      Role = "owner";
    }
    else if(Me.admin){
      Role = "admin";
    }
    else{
      Role = "member";
    }

    let model = {
      Role: Role,
      ChatId: this.props.chatState.CurrentChat.id
    };

    EndpointRequests.AbandonGroup(model, (responseServer) => {
        //remove from local db and list
        this.props.dispatch({type:"REMOVE_ROOM", ChatId:this.props.chatState.CurrentChat.id});

        let message = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
        let response = this.props.clientState.Client.send(message);

        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('DELETE FROM conversations WHERE JID = ?',
          [this.props.chatState.CurrentChat.id],
          (txt, results1) => {
            if (results1.rowsAffected > 0 ) {
              txt.executeSql('DELETE FROM messages WHERE conversation_id = ?',
              [this.props.chatState.CurrentChat.id],
              (txt2, resultsMessages) => {
                this.props.clientState.LoadChatList();
                this.props.navigation.pop();
                this.props.dispatch({type:"CLEAR_CURRENT"});
              });
            }
          })
        });
    });
  }

  async componentDidUpdate(prevProps) {
    let { NumberMessages, successAlert, CurrentChat } = this.state;

    if(prevProps.chatState.CurrentChat.IsLoading == false && this.props.chatState.CurrentChat.IsLoading == true ){
      this.props.navigation.setParams({
        loading:true
      });
    }
    if(this.props.chatState.CurrentChat.id != null && CurrentChat != null && CurrentChat != this.props.chatState.CurrentChat.id){
      try{
        let presence = xml( "presence", { from:this.props.userState.Username, id:id(), to: CurrentChat + '/' + this.props.userState.Nickname }, xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date().toISOString()})), xml("status", { code: '100'}));
        let ResultMessages = await this.props.clientState.Client.send(presence);
      }
      catch(error){
        console.log(error);
      }
      this.setState({CurrentChat:this.props.chatState.CurrentChat.id});
      setTimeout(() => {
        this.runOnEnterChat();
      }, 500);
    }

    if(prevProps.clientState.LoginLoading != this.props.clientState.LoginLoading){
      this.props.navigation.setParams({
        loading:!prevProps.clientState.LoginLoading
      });
    }

    if(this.props.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.last_update != undefined && prevProps.chatState.CurrentChat.last_update != undefined && this.props.chatState.CurrentChat.last_update != prevProps.chatState.CurrentChat.last_update){
      if(!this.props.chatState.CurrentChat.abandoning){
        this.getMembersInfo();
      }
    }

    if(prevProps.chatState.CurrentChat.backgroundColor != this.props.chatState.CurrentChat.backgroundColor){
      this.props.navigation.setParams({
        fontColor:this.props.chatState.CurrentChat.fontColor,
        backgroundColor:this.props.chatState.CurrentChat.backgroundColor
      });

      StatusBar.setBackgroundColor(this.props.chatState.CurrentChat.backgroundColor);

      if(!this.props.chatState.CurrentChat.emergency){
        //this.setState({showAlertMap:false});
      }
      else{
        let permission = this.endEmergencyPermission();

        this.setState({endPermission:permission});
      }
    }

    if(prevProps.chatState.CurrentChat.locked != this.props.chatState.CurrentChat.locked && this.props.chatState.CurrentChat.locked){
      this.checkIfLocked();
      this.textboxDisabled();
    }

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages.length > NumberMessages){
      this.setState({NumberMessages:this.props.chatState.CurrentChat.messages.length});
      let lastMessage = this.props.chatState.CurrentChat.messages[0];
      let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("received", {xmlns:"urn:xmpp:receipts", id:lastMessage.id}));
      let response = this.props.clientState.Client.send(message);
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

  componentWillUnmount(){
    //BackHandler.removeEventListener('hardwareBackPress', this.onBackClicked);
  }

  async goBack(fromHeader){
    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('UPDATE conversations SET last_time_read = ? WHERE JID = ?',
      [new Date().toISOString(), this.props.chatState.CurrentChat.id],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {}
      })
    });
    try{
      let message = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
      let response = this.props.clientState.Client.send(message);
      this.props.navigation.popToTop();
      Loaded = false;
      setTimeout(() => {
        this.props.dispatch({type:"CLEAR_COUNTER", ChatId:this.props.chatState.CurrentChat.id});
        this.props.navigation.state.params.clearCurrent();
      }, 200);
    }
    catch(err){
      if(fromHeader){
        this.props.navigation.popToTop();
      }
     Loaded = false;
     setTimeout(() => {
       this.props.dispatch({type:"CLEAR_COUNTER", ChatId:this.props.chatState.CurrentChat.id});
       this.props.navigation.state.params.clearCurrent();
     }, 200);
    }
  }

  test(){
    this.props.navigation.state.params.clearCurrent();
  }

  showImageModal(image){
    image.source = image.url;
    this.setState({picture:image, showImage:true, fileUploadModal:true, progressUpload:0 });
    StatusBar.setBarStyle("light-content");
  }

  editMessage(message){
    this.setState({editMode:true, quotedMessage:message, Message:String(message.text)});
  }

  quoteMessage(message){
    this.setState({quoteMode:true, quotedMessage:message});
  }

  copyMessage(message){
    if(message.text != undefined && /\S/.test(message.text)){
       Clipboard.setString(message.text);
    }
  }

  memberCount(){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.members != undefined){
      return this.props.chatState.CurrentChat.members.length;
    }
    else{
      return 0;
    }
  }

  lastMessage(){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages != undefined && this.props.chatState.CurrentChat.messages.length > 0){
      return this.props.chatState.CurrentChat.messages[0].id;
    }
  }

  _keyExtractor = (item, index) => index.toString()
  _renderMessageItem(message, index) {
    const { Loading } = this.state;

    const isOtherSender = message.username != this.props.userState.Nickname ? true : false;

    if(message.hidden){
      return null;
    }

    return (
      <Message chatType={this.props.chatState.CurrentChat.chatType} resourceId={this.props.userState.Resource} lastMessage={index == 0 ? this.lastMessage() : null} nickname={this.props.userState.Nickname} memberCount={index == 0 ? this.memberCount() : 0} channelId={this.props.chatState.CurrentChat.id} chatNickname={this.props.chatState.CurrentChat.nickname} copyMessage={(message) => this.copyMessage(message)} system_message={message.isSystemMsg} openSheet={(mode, msg) => this.openSheetOptions(mode,msg)} editMessage={(message) => this.editMessage(message)} quoteMessage={(message) => this.quoteMessage(message)} showImage={(image) => this.showImageModal(image)} messageObject={message} loading={Loading} otherSender={isOtherSender}  message={{pending:message.pending, body:message.text, read_by_count:message.read_by_count, date_sent:new Date(message.timestamp), sent_by:message.username, id:message.id, message_by:message.message_by, read_by:message.read_by, user_data:message.user}} key={message.id} />
    )
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
            message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("url", {}, url), xml("resourceId", {}, this.props.userState.Resource), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          }
          else{
            message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, Message), xml("resourceId", {}, this.props.userState.Resource), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
          }
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

  openMapView(start){
    if(this.props.chatState.CurrentChat.emergency){
      if(start != undefined){
        this.setState({showAlertMap:true});
        setTimeout(async function(){
          this.setState({successAlert:true});
        }.bind(this),300);
      }
      else{
        this.setState({showAlertMap:true});
      }
    }
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
    let { channel, reportText, reportImageUrl, alertImage } = this.state;
    this.setState({loadingAlert:true, alertImage:modelAlert.alertImage, reportText:modelAlert.alertMessage});

    let UserAlias = this.props.userState.UserData.alias;

    Geolocation.getCurrentPosition((get_success) => {
          let addressString = "Coordenadas";
          let coordinatesString = "(" + get_success.coords.latitude + ", " + get_success.coords.longitude + ")";

          //chat type 3 global emergency 4 global medical
          if(channel == undefined && modelAlert.alertType == "Suspicious" && this.props.chatState.CurrentChat.chatType == 2){
            //if on a official channel, we assign the channel to suspicious activity
            channel = this.props.chatState.CurrentChat.id;
          }

          let model = {
            Location:null,
            Message: modelAlert.alertMessage != undefined ? modelAlert.alertMessage : "",
            Type: modelAlert.alertType === "Emergency" ? 0 : (modelAlert.alertType === "Medical" ? 1 : (modelAlert.alertType === "Fire" ? 2 : (modelAlert.alertType === "Suspicious" ? 3 : 4))),
            ChannelType: this.getChannelType(modelAlert.alertType , channel != undefined),
            ExternalChannelId:channel != undefined ? channel : null
          };

          let messageAlert = modelAlert.alertMessage != undefined ? modelAlert.alertMessage : "";
          let locationModel = {
            Latitude: get_success.coords.latitude,
            Longitude: get_success.coords.longitude,
            Neighborhood: this.props.userState.AreaCode,
            BeaconId:null,
            Address: addressString
          };

          model.Location = locationModel;
          model.Message = messageAlert;
          model.ImageUrl = modelAlert.alertImage;

          EndpointRequests.CreateGlobalAlarm(model, (response) => {
            if(response.chatId != undefined){
              this.props.clientState.LoadChatList(false, (finished) => {
                setTimeout(async function(){
                  this.sendAlertMessage(model,response.chatId, response.xmppMessage, function(messageBody, messageXML){
                    this.goBack(true);
                    this.props.dispatch({type:'SET_ADDITIONAL_PROPS', Chat:response.chatId, Props: response.result, User:this.props.userState.UserData, Type:modelAlert.alertType});
                    this.props.navigation.state.params.createEmergency({id:response.chatId}, messageBody, messageXML);
                  }.bind(this));
                }.bind(this),500);
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

  sendAlertMessage(model, chatId, xmppMessage, cb){
    let { alertImage } = this.state;

    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: chatId,
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

    let message = "";

    if(model.Type == 0){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 1){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 2){
      if(model.ExternalChannelId != undefined)
      {
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("officialChannel",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 3){
      if(model.ExternalChannelId != undefined){
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName), xml("officialChannel",{}, "true"), xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
          message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("fileType", {}, "image"), xml("url", {}, messageBody.url), xml("filename", {}, messageBody.fileName), xml("emergencyType", {}, "Suspicious"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }
    else if(model.Type == 4){
      if(model.ExternalChannelId != undefined){
        message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("officialChannel",{}, "true"),  xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
      else{
        message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, xmppMessage), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"),  xml("emergencyType", {}, "Feminist"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
      }
    }

    cb(messageBody, message);
    /*
    //this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent) VALUES (?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let message = "";

          if(model.Type == 0){
            message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, model.Message), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
            //let response = this.props.clientState.Client.send(message);
          }
          else if(model.Type == 1){
            message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, model.Message), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
            //let response = this.props.clientState.Client.send(message);
          }
          else if(model.Type == 2){
            message = xml("message", {to: chatId, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, model.Message), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("globalAlert",{}, "true"), xml("startId", {}, messageBody.id), xml("request", {xmlns:"urn:xmpp:receipts"}));
            //let response = this.props.clientState.Client.send(message);
          }

          cb(message);
        }
      })
    });
    */
  }

  createAlert(model){
      this.setState({loadingAlert:true});

      let UserAlias = this.props.userState.UserData.alias;
      let anonMode = false;

      Geolocation.getCurrentPosition((get_success) => {
        EndpointRequests.GetLocation(get_success.coords.latitude, get_success.coords.longitude, (result) =>{
          if(result.status === "OK"){

            let addressString = result.results[0].formatted_address;
            let coordinatesString = "(" + get_success.coords.latitude + ", " + get_success.coords.longitude + ")";

            let coordinateObject = {
              Latitude: get_success.coords.latitude,
              Longitude: get_success.coords.longitude,
              Query: addressString
            };

            let messageAlert = "";

            if(model.alertType === "Emergency"){
              if(this.props.userState.UserData.age > 0){
                if(this.props.userState.UserData.gender == 0 || this.props.userState.UserData.gender == 3){
                  messageAlert = "Alerta detonada en tu proximidad por persona de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 1){
                  messageAlert = "Alerta detonada en tu proximidad por hombre de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 2){
                  messageAlert = "Alerta detonada en tu proximidad por mujer de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
              }
              else{
                messageAlert = "Alerta detonada en tu proximidad. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
              }
            }
            else if(model.alertType === "Fire"){
              if(this.props.userState.UserData.age > 0){
                if(this.props.userState.UserData.gender == 0 || this.props.userState.UserData.gender == 3){
                  messageAlert = "Alerta de incendio detonada en tu proximidad por persona de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 1){
                  messageAlert = "Alerta de incendio detonada en tu proximidad por hombre de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 2){
                  messageAlert = "Alerta de incendio detonada en tu proximidad por mujer de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
              }
              else{
                messageAlert = "Alerta de incendio detonada en tu proximidad. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
              }
            }
            else{
              if(this.props.userState.UserData.age > 0){
                if(this.props.userState.UserData.gender == 0 || this.props.userState.UserData.gender == 3){
                  messageAlert = "Alerta médica detonada en tu proximidad por persona de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 1){
                  messageAlert = "Alerta médica detonada en tu proximidad por hombre de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
                else if(this.props.userState.UserData.gender == 2){
                  messageAlert = "Alerta médica detonada en tu proximidad por mujer de " + this.props.userState.UserData.age + " años. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
                }
              }
              else{
                messageAlert = "Alerta médica detonada en tu proximidad. Ubicación: " + addressString + " @ " + coordinatesString + ". Tu puedes ayudar.";
              }
            }

            this.setState({showAlertModal:false, loadingAlert:false});

            let time = new Date().toISOString();

            let messageBody = {
              id: id(),
              chat_id: this.props.chatState.CurrentChat.id,
              timestamp: time,
              text: messageAlert,
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
                  if(model.alertType === "Emergency"){
                    let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageAlert), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Emergency"), xml("emergencyAction", {}, "Start"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.props.clientState.Client.send(message);
                  }
                  else if(model.alertType === "Fire"){
                    let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageAlert), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Fire"), xml("emergencyAction", {}, "Start"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.props.clientState.Client.send(message);
                  }
                  else if(model.alertType === "Medical"){
                    let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageAlert), xml("resourceId", {}, this.props.userState.Resource), xml("type", {}, "Emergency"), xml("emergencyType", {}, "Medical"), xml("emergencyAction", {}, "Start"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                    let response = this.props.clientState.Client.send(message);
                  }

                  this.props.chatState.ExistingAlarm(messageBody);

                  if(this.state.messageTimeout) clearTimeout(this.msgTimeout);
                  this.msgTimeout = setTimeout(() => {
                    this.props.chatState.CheckPending();
                  }, 5000);
                }
              })
            });
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

  composingMessage(text){
    const { timeout } = this.state;

    this.setState({Message:text});
    let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("composing", {xmlns:"http://jabber.org/protocol/chatstates"}));
    let response = this.props.clientState.Client.send(message);

    if(this.state.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      let message2 = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("paused", {xmlns:"http://jabber.org/protocol/chatstates"}));
      let response2 = this.props.clientState.Client.send(message2);
    }, 1000);
  }

  startEmergency(type, channel){
    if(type == "Suspicious"){
      this.setState({showAlertModal:true, alertType:type, channel:channel});
    }
    else{
      if(this.props.chatState.OngoingAlert){
        Alert.alert(
         'Atención',
         "Tienes una alerta activa, no puedes crear más de una alerta al mismo tiempo.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
      }
      else{
        this.setState({showAlertModal:true, alertType:type, channel:channel});
      }
    }
  }

  endEmergency(){
    if(this.props.chatState.CurrentChat.emergency){
      let messageId = this.props.chatState.CurrentChat.emergencyInformation.messageId;
      let time = new Date().toISOString();
      let emergencyType = this.props.chatState.CurrentChat.emergencyInformation.type;

      let messageBody = {
        id: id(),
        chat_id: this.props.chatState.CurrentChat.id,
        timestamp: time,
        text: emergencyType === "Emergency" ? "Alerta Desactivada" : "Alerta Medica Desactivada.",
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
            let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageBody.text), xml("resourceId", {}, this.props.userState.Resource), xml("EmergencyId", {}, messageId), xml("type", {}, "Emergency"), xml("emergencyType", {}, emergencyType), xml("emergencyAction", {}, "End"), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(message);

            EndpointRequests.EndAlert({ConversationExternalId:this.props.chatState.CurrentChat.id}, function(responseData) {
              //do something?
              this.setState({loadingAlert:false});
            }.bind(this));
          }
        })
      });
    }

    this.setState({showAlertMap:false});
  }

  fastImageWrap(url){
     let source = {
       uri:url,
       priority:FastImage.priority.high
     };

     return (
       <FastImage
         style={{height:25, width:25, borderRadius:50}}
         source={source}
       />
     )
  }

  getTime(item){
     if(item.hideTimestamp){
       return null;
     }

  	 if(item.createdBy == null || item.createdBy == undefined){
  		 return "";
  	 }

	   var date = new Date(parseInt(item.startedOn));
	   var today = new Date();

	   var hours = date.getHours();
	   var minutes = date.getMinutes();
	   var month = months[date.getMonth()];
	   var day = date.getDate();

	   var ampm = hours >= 12 ? 'pm' : 'am';
	   hours = hours % 12;
	   hours = hours ? hours : 12; // the hour '0' should be '12'
	   minutes = minutes < 10 ? '0'+minutes : minutes;

	   var strTime = null;

	   date.setHours(0, 0, 0, 0);
	   today.setHours(0, 0, 0, 0);

	   if(date.valueOf() === today.valueOf()){
			strTime = hours + ':' + minutes + ' ' + ampm;
	   }
	   else{
  	  strTime = month + " " + day + " " + hours + ':' + minutes + ' ' + ampm;
	   }

	   if(item.createdBy != undefined){
		   if(item.createdBy.unit != undefined && item.createdBy.alias != undefined && item.createdBy.address != undefined && item.ended != undefined){
			   strTime = item.createdBy.alias + " @ ("+ item.createdBy.unit +") " + item.createdBy.address + " - " + "Desde: " + strTime + " Hasta: " + item.ended;
		   }
		   else if(item.createdBy.unit != undefined && item.createdBy.alias != undefined && item.createdBy.address != undefined){
			   strTime = item.createdBy.alias + " @ ("+ item.createdBy.unit +") " + item.createdBy.address + " - " + strTime;
		   }
		   else if(item.createdBy.unit != undefined && item.createdBy.alias != undefined){
			   strTime = item.createdBy.alias + " @ ("+ item.createdBy.unit +")" + " - " + strTime;
		   }
		   else{
		   	 strTime = strTime;
       }
	   }

     if(item.isAlarm){
       strTime = strTime + " (Alerta)";
     }

     if(item.Forwarded){
       strTime = strTime + " (Re-enviado)";
     }

	   return strTime;
 }

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

   async chooseFile(){

     try{
       let file = await DocumentPicker.pick({
         type: [DocumentPicker.types.plainText, DocumentPicker.types.pdf, 'com.microsoft.word.doc', 'com.microsoft.excel.xls', 'docx', 'application/msword', 'org.openxmlformats.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
       });

       if(file != undefined && file.uri != null){
         var pic = {uri:file.uri, source:file.uri, mime:file.type, filename:file.name, isPdf:false, isFile:true};

         if(pic.mime.endsWith("pdf")){
           pic.isPdf = true;
         }

   			setTimeout(function(){
   				this.setState({picture:pic, fileUploadModal:true });
   			}.bind(this),200);
       }
     }
     catch(err){
       if(DocumentPicker.isCancel(err)){
         console.log(err);
       }
     }
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

  getBottomComponent(){
    let { notMember } = this.state;

    if(notMember && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages != undefined && this.props.chatState.CurrentChat.messages.length > 0){
      return (
        <View style={{height:40, width:width/1.5, alignSelf:'center', justifyContent:'center', padding:10, backgroundColor:'lightgray', borderRadius:50}}>
          <Text style={{textAlign:'center', fontStyle:"italic"}}>No eres parte de este grupo</Text>
        </View>
      )
    }
    else if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.active_users.length > 1 && this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages != undefined && this.props.chatState.CurrentChat.messages.length > 0){
      return (
        <View style={{height:30, marginBottom:3, width:width, alignItems:'center', justifyContent:'center', flexDirection:'row', flex:1}}>
          {this.props.chatState.CurrentChat.active_users.map((member, index) => (
            member.alias != this.props.userState.Nickname ?
            <View style={{flexDirection:'row', maxWidth:50, alignSelf:'center', height:30, justifyContent:'center'}}>
              <View style={{flexDirection:'row', height:30, justifyContent:'center'}}>
                <View style={{height:25, width:25, marginLeft:5, borderRadius:50,justifyContent:'center', textAlign:'center', backgroundColor:"gray", flexDirection:'row'}}>
                  {member.user != undefined ?
                    (member.user.pictureUrl != null ?
                      this.fastImageWrap(member.user.pictureUrl)
                      :
                      <Text style={{color:"white", padding:4, fontSize:15, textAlign:'center'}}>{String(member.user.alias.charAt(0)).toUpperCase()}</Text>
                    )
                    :
                    <Text style={{color:"white", padding:4, fontSize:15, textAlign:'center'}}>{"?"}</Text>
                  }
                </View>
              </View>
            {member.composing ?
              <View style={{marginLeft:5, flexDirection:'column', height:30, justifyContent:'center'}}>
                <View style={{height:20, borderRadius:4, padding:2, paddingLeft:4, paddingRight:4, flexDirection:'row', justifyContent:'center', backgroundColor:"transparent"}}>
                  <Text style={{fontSize:13, textAlign:'center', color:'#7CB185', fontWeight:'bold'}}>...</Text>
                </View>
              </View>
               : null }
            </View>
            :
            null
            ))
          }
         </View>
      )
    }
    else{
      return <View style={{height:0}} />
    }
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

  uploadSound(file){
    const options = {
      url: APP_INFO.UPLOAD_URL + "/raw/upload",
      path: file,
      method: 'POST',
      field: "file",
      type: 'multipart',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      parameters: {
        upload_preset: APP_INFO.FILE_PRESET
      },
      notification: {
        enabled: true
      }
    };

    Upload.startUpload(options).then((uploadId) => {
      Upload.addListener('progress', uploadId, (data) => {
        this.setState({progressUpload:data.progress/100, uploadingAudio:true});
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
          this.setState({progressUpload:0, uploadingAudio:true});
        }.bind(this),200);
      })
      Upload.addListener('cancelled', uploadId, (data) => {
        setTimeout(function(){
          this.setState({progressUpload:0, uploadingAudio:true});
        }.bind(this),200);
      })
      Upload.addListener('completed', uploadId, (data) => {
        let response = JSON.parse(data.responseBody);

        if(response.secure_url != null){
          this.setState({audioModalUpload:false});

          setTimeout(function(){
            this.setState({audioUrl:response.secure_url, uploadingAudio:false});
            let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("type", {}, "audio"), xml("resourceId", {}, this.props.userState.Resource), xml("url",{},response.secure_url), xml("paused", {xmlns:"http://jabber.org/protocol/chatstates"}));
            let xmppReq = this.props.clientState.Client.send(message);
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
  }

  getAlertComponent(alertInformation){
    let Component = <View style={{height:100, width:width, justifyContent:'center', padding:10, backgroundColor:alertInformation.type === "Emergency" ? '#d9534f' : (alertInformation.type === "Medical" ? "#0C479D" : "#f05a23")}}>
                      <TouchableOpacity onPress={() => this.openMapView()}>
                      <Text maxFontSizeMultiplier={1} style={{fontWeight:'bold',textAlign:'center', color:'white',fontSize:17}}>Alerta de Emergencia!</Text>
                      <View style={{marginTop:10}} accessible={false}>
                        {alertInformation != undefined ?
                          <View>
                          <Text numberOfLines={1} maxFontSizeMultiplier={1.25} style={{alignSelf:'center',textAlign:'center', color:'white',fontSize:14}}>{alertInformation.text}</Text>
                          <Text numberOfLines={1} maxFontSizeMultiplier={1.25} style={{alignSelf:'center',textAlign:'center', color:'white',fontSize:12, marginTop:5}}>{this.getTime(alertInformation)}</Text>
                          </View>
                          :
                          <ActivityIndicator size="large" color="white" style={{textAlign:'center', marginTop:10}} />
                        }
    									</View>
                      </TouchableOpacity>
                    </View>;

    return Component;
  }

  getMessages(){
    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages != undefined && this.props.chatState.CurrentChat.messages != undefined){
      this.props.chatState.CurrentChat.messages.length > 0 ? this.props.chatState.CurrentChat.messages.sort((a, b) => { return b.time - a.time}) : []
      if(this.props.chatState.CurrentChat.messages.length > 0){
        if(this.props.chatState.CurrentChat.IsLoading){
          return [];
        }
        else{
          return this.props.chatState.CurrentChat.messages.sort((a, b) => { return b.time - a.time});
        }
      }
      else{
        return [];
      }
    }
    else{
      return [];
    }
  }

  recordAudio(){
    this.setState({sendingAudio:true, startTimeAudio:new Date().getTime()});

    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: 'test.wav'
    };

    AudioRecord.init(options);

    AudioRecord.start();

    let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("type", {}, "audio"), xml("composing", {xmlns:"http://jabber.org/protocol/chatstates"}));
    let response = this.props.clientState.Client.send(message);
  }

  async saveAudio(){
    let { sendingAudio, startTimeAudio } = this.state;

    if(sendingAudio){
      let audioFile = await AudioRecord.stop();

      if(audioFile != undefined){
        this.uploadSound(audioFile);
      }
    }
  }

  sendMessageOptions(){
    let { quoteMode, editMode, Message, quotedMessage } = this.state;

    if(quoteMode){
      this.sendQuotedMessage(quotedMessage, Message);
    }
    else if(editMode){
      if(Message != quotedMessage.text && Message.length > 0){
        this.sendEditMessage(quotedMessage, Message);
      }
      else{
        Alert.alert(
         'Error',
         "Cambia el contenido del mensaje para editarlo.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
      }
    }
    else{
      this.sendMessage();
    }
  }

  sendEditMessage(oldmessage, newmessage){
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: newmessage,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isImage:oldmessage.isImage,
      isMedia:oldmessage.isMedia,
      isVideo:oldmessage.isVideo,
      isFile:oldmessage.isFile,
      url:oldmessage.url,
      fileName:oldmessage.fileName,
      thumbnail:oldmessage.thumbnail,
      quoted_id:oldmessage.id,
      quoted_msg:oldmessage.text,
      quote_by:oldmessage.user.alias,
      isQuote:oldmessage.isQuote,
      isEdited:true
    };

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('UPDATE messages SET text = ?, isEdited = 1 WHERE id = ?',
      [newmessage, oldmessage.id],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let messageXMPP = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, newmessage), xml("resourceId", {}, this.props.userState.Resource), xml("replace", {id:oldmessage.id, xmlns:"urn:xmpp:message-correct:0"}), xml("request", {xmlns:"urn:xmpp:receipts"}));
          let response = this.props.clientState.Client.send(messageXMPP);
          this.props.dispatch({type: 'EDIT_MESSAGE', Message:messageBody, EditMessage:oldmessage.id})
          this.setState({quoteMode:false,quotedMessage:null, editMode:false, Message:""})
          if(this.state.messageTimeout) clearTimeout(this.msgTimeout);
          this.msgTimeout = setTimeout(() => {
            this.props.chatState.CheckPending();
          }, 5000);
        }
      })
    });
  }

  sendQuotedMessage(quoted, message){
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: message,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isImage:quoted.isImage,
      isMedia:quoted.isMedia,
      isVideo:quoted.isVideo,
      isFile:quoted.isFile,
      url:quoted.url,
      fileName:quoted.fileName,
      thumbnail:quoted.thumbnail,
      quoted_id:quoted.id,
      quoted_msg:quoted.text,
      quote_by:quoted.user.alias,
      isQuote:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename, thumbnail, isAudio, isEdited, isQuoted, quoted_msg_id, quoted_text) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, true, messageBody.isImage, messageBody.isVideo, messageBody.isFile, messageBody.url, messageBody.fileName, messageBody.thumbnail, false, false, true, messageBody.quoted_id, messageBody.quoted_msg],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          if(messageBody.isMedia){
            let mediaType = messageBody.isImage ? "image" : (messageBody.isVideo ? "video" : "file");

            let messageXMPP = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, message), xml("resourceId", {}, this.props.userState.Resource), xml("messageType", {}, "quote"), xml("quoted_id", {}, messageBody.quoted_id), xml("quoted_msg", {}, messageBody.quoted_msg), xml("mediaType", {}, mediaType), xml("url", {}, messageBody.url), xml("thumbnail", {}, messageBody.thumbnail), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(messageXMPP);
          }
          else{
            let messageXMPP = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, message), xml("resourceId", {}, this.props.userState.Resource), xml("messageType", {}, "quote"), xml("quoted_id", {}, messageBody.quoted_id), xml("quoted_msg", {}, messageBody.quoted_msg), xml("request", {xmlns:"urn:xmpp:receipts"}));
            let response = this.props.clientState.Client.send(messageXMPP);
          }

          this.setState({quoteMode:false,quotedMessage:null, Message:""});
          if(this.state.messageTimeout) clearTimeout(this.msgTimeout);
          this.msgTimeout = setTimeout(() => {
            this.props.chatState.CheckPending();
          }, 5000);
        }
      })
    });
  }

  statusBarReset(){
    /*
    setTimeout(function(){
      StatusBar.setBarStyle("dark-content");
    }.bind(this),550);
    */
  }

  openSheetOptions(mode, message){
    if(mode === "Contestar"){
      this.setState({mode:"Contestar", chosenMsg:message});
      if(message.url != undefined && message.url != ""){
        Options = ['Cancelar', 'Contestar', 'Copiar texto', 'Abrir URL'];
      }
      else{
        Options = ['Cancelar', 'Contestar', 'Copiar texto'];
      }
      this.ActionSheetMsg.show();
    }
    else{
      this.setState({mode:"Editar", chosenMsg:message});
      if(message.url != undefined && message.url != ""){
        Options = ['Cancelar', 'Editar', 'Copiar texto', 'Abrir URL'];
      }
      else{
        Options = ['Cancelar', 'Editar', 'Copiar texto'];
      }
      this.ActionSheetMsg.show();
    }
  }

  textboxDisabled(){
    let { notMember, Message } = this.state;

    if(this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.locked){
      return true;
    }
    else if(notMember){
      return true;
    }
    else if(Message == undefined || Message == "" || Message.length == 0){
      return true;
    }
    else{
      return false;
    }
  }

  openURL(message){
    if(message.url != undefined){
      Linking.openURL(message.url);
    }
  }

  getOfficialActionButtons(){
    let officialChats = [];
    if(this.props.clientState.LoginLoading){
      return <View/>
    }
    if(this.props.chatState.SectionList != undefined && this.props.chatState.SectionList.find(n => n.title === "Detonación remota")){
      let list = this.props.chatState.SectionList.find(n => n.title === "Detonación remota");
      if(list != undefined && list.data.length > 1){
        for(let i = 0; i < list.data.length;i++){
          officialChats.push(
            <ActionButton.Item key={list.data[i].id} buttonColor='green' title={list.data[i].name}  onPress={() => this.startEmergency("Emergency", list.data[i].id)}>
              <Image source={OFFICIAL_CHANNEL} resizeMode={"contain"} style={{height:40,width:40}}/>
            </ActionButton.Item>
          )
        }
        return officialChats;
      }
      return <View/>
    }
    else{
      return <View/>
    }
  }

  channelAlert(){
    if(this.props.chatState.SectionList != undefined && this.props.chatState.SectionList.find(n => n.title === "Detonación remota")){
      let list = this.props.chatState.SectionList.find(n => n.title === "Detonación remota");
      if(list != undefined && list.data.length == 1){
        this.startEmergency("Emergency", list.data[0].id);
        this.refs.officialChannelBtn.reset();
      }
      return false;
    }
    else{
      return false;
    }
  }

  buttonAction(type, inCoverage){
    if(this.props.clientState.LoginLoading){
      this.setState({alertTypePressed:"Internet", noAlertModal:true});
      return false;
    }

    if(type === "Personal"){
      this.startEmergency("Emergency");
    }
    else if(type === "Feminist"){
      if(this.props.userState.UserData.gender != 2){
        this.setState({alertTypePressed:"Vecinal", noAlertModal:true});
        return false;
      }
      else{
        this.startEmergency("Feminist");
      }
    }
    else if(type === "Vecinal"){
      if(this.props.userState.UserData.verifiedIdentity != 2 || this.props.chatState.Chats == undefined || !this.props.chatState.Chats.some(e => e.chatType === 2)){
        this.setState({alertTypePressed:"Vecinal", noAlertModal:true});
        return false;
      }
      else{
        this.channelAlert();
      }
    }
    else if(type === "Suspicious"){
      if(inCoverage){
        this.startEmergency("Suspicious");
      }
      else{
        this.setState({alertTypePressed:"Sospechosa", noAlertModal:true});
      }
    }
    else if(type === "Medical"){
      this.setState({alertTypePressed:"Medical", noAlertModal:true});
    }
  }

  render() {
    let inCoverage = this.props.userState.CurrentPoint.length > 0;

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'white' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={true}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (KEYBOARD_VERTICAL_OFFSET) : 90}>
        <StatusBar backgroundColor={'white'} />
      <SafeAreaView style={{flex: 1,  justifyContent: 'flex-end', backgroundColor:'white'}}>
        <ImageBackground source={BACKGROUND} style={{width: '100%', height: '100%'}} imageStyle={{ opacity: 0.5 }}>
        <FlatList
          inverted={this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.messages != undefined && this.props.chatState.CurrentChat.messages.length == 0 ? false : true}
          data={this.getMessages()}
          keyExtractor={this._keyExtractor}
          renderItem={({ item, index }) => this._renderMessageItem(item, index)}
          ListEmptyComponent={() =>
            this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.IsLoading != undefined ?
            (this.props.chatState.CurrentChat.IsLoading ? null :
              <View style={{height:height - 300, width:width, justifyContent:'center', borderBottomColor:'transparent'}}>
                  <Image source={MESSAGE_EMPTY} resizeMode={"contain"} style={{alignSelf:'center', height:width/3,width:width/3}} />
                  <Text style={{textAlign:'center', padding:40, fontSize:17, paddingTop:20, paddingBottom:0, fontWeight:'bold', color:"#C1D5B1"}}>{"Envia un mensaje para iniciar la conversación."}</Text>
              </View>
            )
            :
            null
          }
          ListHeaderComponent={() =>
            this.getBottomComponent()
          }
          onEndReachedThreshold={5}
          // TODO: implement this -> onEndReached={this.getMoreMessages}
        />
        <QuoteEditMode openView={this.state.quoteMode || this.state.editMode} editMode={this.state.editMode} quoteMode={this.state.quoteMode} closeQuoteMode={() => this.setState({quoteMode:false, quotedMessage:null, Message:"", editMode:false})} quotedMessage={this.state.quotedMessage} />
        <View style={{paddingLeft:5, paddingTop:5, paddingRight:5, flexDirection: 'row', marginTop: wp('1%'), paddingBottom:wp('2%'), alignItems:'center', backgroundColor:'white', borderTopColor:'gray', borderTopWidth:1}}>
          <View>
            <TouchableOpacity disabled={this.state.notMember || (this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.locked)} onPress={() => this.fileUploadOptions()}>
              <FeatherIcon name="plus" size={35} color="#7CB185" />
            </TouchableOpacity>
          </View>
          <View style={{backgroundColor: '#e3e3e3', borderRadius: 25, marginEnd: wp('0%'), marginLeft:5, flexGrow: 1}}>
            <AutoGrowingTextInput
            style={{marginStart: wp('3%'), marginEnd: wp('0%'), paddingTop:5,paddingBottom:5}}
            value={this.state.Message}
            editable={!this.state.notMember && (this.props.chatState.CurrentChat != undefined && !this.props.chatState.CurrentChat.locked)}
            placeholder={this.state.notMember || (this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.locked) ? "El envio de mensajes ha sido deshabilitado" : 'Escribe un mensaje...'}
            onFocus={() => StatusBar.setBarStyle("dark-content")}
            onBlur={() => this.statusBarReset()}
            onChangeText={(text) => this.composingMessage(text)}
            minHeight={40}
            maxHeight={170}
            maxWidth={width - 120} />
          </View>
          <View style={{marginLeft:5, marginRight:10}}>
            {this.props.clientState.LoginLoading ?
              <ActivityIndicator size="small" style={{width:30}} />
              :
              <TouchableOpacity delayPressOut={1000} disabled={this.textboxDisabled()} onPressOut={() => console.log("begin recording")} onLongPress={() => console.log('save recording')} onPress={() => this.state.Message.length > 0 ? this.sendMessageOptions() : null}>
                <SimpleLineIcons name={"arrow-right-circle"} size={30} color={this.state.Message.length > 0 ? "#7CB185" : 'gray'} />
              </TouchableOpacity>
            }
          </View>
        </View>
        <FileUploadModal showImage={this.state.showImage} progress={this.state.progressUpload} picture={this.state.picture} uploadFile={this.state.fileUploadModal} loading={this.state.loadingUpload} startUpload={(optionalText) => this.uploadFile(optionalText)} closeModal={() => this.setState({fileUploadModal:false, picture:null,showImage:false,progressUpload:0})} />
        <AlertModal UserData={this.props.userState.UserData} officialChannel={this.state.channel != undefined} changeState={() => this.setState({loadingAlert:!this.state.loadingAlert})} alertType={this.state.alertType} openMap={(start) => this.openMapView(start)} loading={this.state.loadingAlert} startAlert={(model) => this.createPublicAlarm(model)} confirmAlert={this.state.showAlertModal} closeModal={() => this.setState({showAlertModal:false, channel:null})} />
        <Modal
        animationType="fade"
        transparent={true}
        backdropPressToClose={false}
        backdrop={true}
        visible={this.props.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.IsLoading != undefined ? this.props.chatState.CurrentChat.IsLoading : false}>
        <View style={{
          backgroundColor: '#00000040',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'}}>
          <View style={{height:height, width:width, justifyContent:'center', backgroundColor:"transparent",marginTop:0}}>
          <View style={{backgroundColor:'#FFFFFF',justifyContent:'center', height:100,width:100,borderRadius:10,alignSelf:'center'}}>
          <ActivityIndicator size="large" />
          </View>
          </View>
          </View>
          </Modal>
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
            this.setState({chosenMsg:null});
          }
          else if (index === 1) {
            if(this.state.mode === "Contestar"){
              this.quoteMessage(this.state.chosenMsg);
            }
            else{
              this.editMessage(this.state.chosenMsg)
            }
          }
          else if (index === 2){
            this.copyMessage(this.state.chosenMsg)
          }
          else if(index === 3){
            this.openURL(this.state.chosenMsg);
          }
        }}
      />
      </ImageBackground>
      </SafeAreaView>
      <DialogModalAlert messageType={this.state.alertTypePressed} noAlertModal={this.state.noAlertModal} closeModal={() => this.setState({noAlertModal:false})} />
    </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textInput: {
    borderRadius: 20,
  }
});

let ChatRoomContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(ChatRoom);
export default ChatRoomContainer;
