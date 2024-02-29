import React, { Component } from 'react'
import { View, Text, Button, ActivityIndicator, Dimensions, ScrollView, ActionSheetIOS, Alert, TouchableOpacity, Image, Modal } from 'react-native'
import { ListItem, FormInput, SearchBar, Icon, FormLabel, Input, Avatar as AvatarAlt } from 'react-native-elements';
var { height, width } = Dimensions.get('window');
import Avatar from '../cmps/avatar.js'
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const EndpointRequests = require("../../util/requests.js");
const placeholder = require('../../../assets/image/CREATE_GROUP.png');
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet'
var iPhoneX = height >= 812;
import { APP_INFO } from '../../util/constants';

import { connect } from 'react-redux';

class ChatSettings extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: navigation.state.params != undefined && navigation.state.params.loading ?
                () =>  <ActivityIndicator size="small" color="#0E75FA" style={{alignSelf:'center'}} />
                  :
                  "Información",
    headerLeft: <TouchableOpacity
    onPress={() => {
      navigation.pop();}} style={{height:50, marginLeft:5, backgroundColor:'transparent', width:40, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    });

  constructor(props) {
    super(props)

    this.state={
      Admin:false,
      Owner:false,
      picture:null,
      pictureUrl:null,
      isLoading:false,
      options:[],
      user:null,
      submiting:false
    }
  }

  componentDidMount(){
    let index = this.props.chatState.CurrentChat.members.findIndex(x => x.nickname == this.props.userState.Nickname);
    let Me = this.props.chatState.CurrentChat.members[index];

    if(Me != undefined){
      this.setState({Admin:Me.admin, Owner:Me.owner});
    }
  }

  componentDidUpdate(prevProps, nextProps) {
    if(prevProps.chatState.CurrentChat.members !== this.props.chatState.CurrentChat.members){
      let index = this.props.chatState.CurrentChat.members.findIndex(x => x.username == this.props.userState.Username);
      let Me = this.props.chatState.CurrentChat.members[index];
      if(Me != undefined){
        this.setState({Admin:Me.admin, Owner:Me.owner});
      }
    }

    if(this.props.chatState.CurrentChat != undefined && prevProps.chatState.CurrentChat != undefined && this.props.chatState.CurrentChat.last_update != undefined && prevProps.chatState.CurrentChat.last_update != undefined && this.props.chatState.CurrentChat.last_update != prevProps.chatState.CurrentChat.last_update){
      setTimeout(function(){
        this.getMembersInfo();
      }.bind(this),5000);
    }
  }

  getMembersInfo(cb){
    let { abandoning } = this.state;

    if(abandoning || this.props.chatState.CurrentChat == undefined || this.props.chatState.CurrentChat.id == undefined || this.props.chatState.CurrentChat.ChatType == 1){
      return false;
    }

    let conversation_id = this.props.chatState.CurrentChat.id.split("@")[0];
    let members_ids = [];

    EndpointRequests.GetMembersInfo(conversation_id, function(responseData) {
      if(responseData.error != undefined){
        if(responseData.notMember){
          Alert.alert(
           'Parece que no eres parte de este grupo.',
           "No podras enviar ni recibir nuevos mensajes. Borrar grupo de tu lista?",
           [
             {text: 'Borrar', onPress: () => this.deleteGroupLocal()},
             {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
         this.setState({isLoading:false, notMember:true});
        }
        else if(responseData.notFound){
          this.goBack();
          Alert.alert(
           'Error',
           "El canal ha vencido o fue borrado.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          setTimeout(function(){
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
          }.bind(this),1500);
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
        if(responseData.members != null){
          for(let i = 0; i < responseData.members.length;i++){
            let member = responseData.members[i];
            members_ids.push(member.jid);
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

          let thumbnail;

          if(this.props.chatState.CurrentChat.chatType === 1){
            let otherUser = responseData.members.filter(x => x.jid != this.props.userState.Username);
            thumbnail = otherUser.length > 0 ? otherUser[0].pictureUrl : null;
            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('UPDATE conversations SET thumbnail = ? WHERE JID = ?',
              [thumbnail, this.props.chatState.CurrentChat.id],
              (txx, results) => {
              })
            });
          }
          else{
            if(responseData.thumbnail != undefined){
              thumbnail = responseData.thumbnail;

              this.props.clientState.DB.transaction((tx) => {
                tx.executeSql('UPDATE conversations SET thumbnail = ? WHERE JID = ?',
                [responseData.thumbnail, this.props.chatState.CurrentChat.id],
                (txx, results) => {
                })
              });
            }
          }

          let index = responseData.members.findIndex(x => x.nickname == this.props.userState.Nickname);
          let Me = responseData.members[index];

          this.props.dispatch({type:"UPDATE_MEMBERS", Admin:Me != undefined ? Me.admin : false, Owner:Me != undefined ? Me.owner : false, Chat:conversation_id, Thumbnail:thumbnail, MemberList: responseData.members, MembersLoaded:true, ChatInfo:{Description:responseData.description, CreatedAt: responseData.createdAt}});
          this.setState({Loading:false, MembersIds:members_ids});

          this.props.navigation.setParams({
            infoLoaded:true,
            loading:this.props.clientState.LoginLoading,
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

  getTitle(member){
    if(this.props.chatState.CurrentChat.chatType == 1 ){
      return "Participante";
    };

    if(member.owner){
      return "Administrador";
    }
    else if(member.admin){
      return "Administrador";
    }
    else{
      return "Miembro";
    }
  }

  sendPrivateMessage(participant){
    if(participant != undefined && participant.jid != undefined){
      this.setState({submiting:true});

      let PrivateModel = {
        ExternalId:participant.jid,
        Phone:null
      };

      EndpointRequests.CreatePrivateChat(PrivateModel, function(responseData) {
        if(responseData.error != undefined || responseData.message == undefined){
          Alert.alert(
           'Error',
           "Hubo un error en la creacion del canal.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          this.setState({isLoading:false, submiting:false});
          this.props.navigation.setParams({
            loading:false
          });
        }
        else{
          this.props.clientState.LoadChatList(false, (finished) => {
            let channelId = responseData.groupId + "@" + this.props.clientState.Conference;
            setTimeout(async function(){
              let messageXMPP = xml( "presence", { from:this.props.clientState.From, id:id(), to: channelId + '/' + this.props.userState.Nickname },xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date().toISOString()})), xml("status", { code: '200'}));
              let responseXMPP = this.props.clientState.Client.send(messageXMPP);
            }.bind(this),500);
            setTimeout(async function(){
              this.setState({submiting:false});
              this.props.dispatch({type:"ENTER_CHAT", Chat:channelId, Username:this.props.userState.Nickname});
              this.props.navigation.pop();
            }.bind(this),1000);
          });
        }
      }.bind(this));
    }
  }

  participantOptions(participant){
    const { Admin, Owner } = this.state;

    if(participant.jid == this.props.userState.Username){
      return false;
    }

    if(this.props.chatState.CurrentChat.chatType == 1){
      return false;
    }

    let remove = false;

    if(Owner && !participant.owner){
      options = ['Cancelar', 'Iniciar conversación privada', 'Agregar como Admin', 'Sacar del canal'];
    }
    else if(Owner && participant.owner){
      options = ['Cancelar', 'Iniciar conversación privada', 'Revocar título de Admin', 'Sacar del canal'];
    }
    else{
      options = ['Cancelar', 'Iniciar conversación privada'];
    }

    this.setState({options:options, user:participant});

    setTimeout(function(){
      this.ActionSheet.show();
    }.bind(this),500);
  }

  kickUser(participant){
    this.props.navigation.setParams({
      loading:true
    });

    let model = {
      UserJid:participant.jid,
      ChannelJid: this.props.chatState.CurrentChat.id
    };
    
    this.sendKickMessage(participant);

    EndpointRequests.KickUser(model, function(responseData) {
      if(responseData.message != undefined && responseData.message === "Ok"){
        this.props.navigation.setParams({
          loading:false
        });
      }
      else{
        Alert.alert(
         'Error',
         "Hubo un error en tu peticion.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )

        this.props.navigation.setParams({
          loading:false
        });
      }
    }.bind(this));

  }

  sendKickMessage(participant){
    let messageString = "El usuario " + participant.alias + " fue sacado del canal.";
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: messageString,
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isAlert:false,
      alertStart:false,
      isSystemMsg:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isSystemMsg) VALUES (?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, true],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let messageKick = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageString), xml("type", {}, "Kick"), xml("userJID", {}, participant.nickname), xml("request", {xmlns:"urn:xmpp:receipts"}));
          let response = this.props.clientState.Client.send(messageKick);
        }
      })
    });
  }

  uploadPicture(){
    var { picture } = this.state;

    if(picture == undefined || picture.uri == undefined){
      return false;
    }

    this.setState({isLoading:true});

    var data = new FormData();

    data.append('file',{
      uri:picture.uri,
      type:picture.mime,
      name:'picture.png'
    });

    data.append('upload_preset', APP_INFO.PICTURE_PRESET);

    EndpointRequests.UploadPicCloud(data, function(responseData) {
      if(responseData.error){
        Alert.alert(
         'Error',
         responseData.error.message,
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )

        this.setState({isLoading:false});
      }
      else{

        this.setState({pictureUrl:responseData.secure_url, pictureExists:true});

        setTimeout(function(){
          this.saveChannelData();
        }.bind(this),300);
      }
    }.bind(this));
  }

  saveChannelData(){
    let { pictureUrl } = this.state;

    let data = {
      Description:this.props.chatState.CurrentChat.description,
      Subject:this.props.chatState.CurrentChat.name,
      Thumbnail:pictureUrl,
      ChannelExternalId:this.props.chatState.CurrentChat.id
    };

    EndpointRequests.SaveChannelData(data, function(responseData) {
      if(responseData.error){
        Alert.alert(
         'Error',
         responseData.error.message,
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
        this.setState({isLoading:false});
      }
      else{
        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('UPDATE conversations SET thumbnail = ?, description = ?, subject = ? WHERE JID = ?',
          [pictureUrl, this.props.chatState.CurrentChat.description, this.props.chatState.CurrentChat.name, this.props.chatState.CurrentChat.id],
          (txx, results) => {
            this.setState({isLoading:false});
            this.props.dispatch({type:'UPDATE_CHANNEL_DATA', ChatId:this.props.chatState.CurrentChat.id, ChatData:{description:data.Description, subject:data.Subject, thumbnail:data.Thumbnail}});
            Alert.alert(
             'Éxito',
             "La información del grupo fue actualizada.",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          })
        });
      }
    }.bind(this));
  }

  modifyAdminlist(member, type){
    let index = this.props.chatState.CurrentChat.members.findIndex(x => x.jid == member.jid);
    let user = this.props.chatState.CurrentChat.members[index];

    if(user != undefined){
      let Jid = user.jid;

      if(!user.owner && type === "owner"){
        let AddSuperAdmin = xml("iq", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'set'}, xml("query", {xmlns:"http://jabber.org/protocol/muc#admin"}, xml("item", { affiliation:"owner", jid:Jid},xml("reason", {}, "Added as super admin"))));
        let AddSuperAdminResponse = this.props.clientState.Client.iqCaller.request(AddSuperAdmin);

        this.props.dispatch({type:"UPDATE_AFFILIATION", Chat:this.props.chatState.CurrentChat.id, new_data:{username:user.nickname, admin:true, owner:true}});
      }
      else if(user.owner && type === "owner"){
        let RemoveSuperAdmin = xml("iq", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'set'}, xml("query", {xmlns:"http://jabber.org/protocol/muc#admin"}, xml("item", { affiliation:"member", jid:Jid},xml("reason", {}, "Removed as super admin"))));
        let RemoveSuperAdminAdminResponse = this.props.clientState.Client.iqCaller.request(RemoveSuperAdmin);

        this.props.dispatch({type:"UPDATE_AFFILIATION", Chat:this.props.chatState.CurrentChat.id, new_data:{username:user.nickname, admin:false, owner:false}});
      }
      let model = {
        ChannelJid:this.props.chatState.CurrentChat.id,
        UserJid:Jid
      };
      EndpointRequests.UpdateCache(model, function(responseData) {
        //
      }.bind(this));
    }
  }

  addParticipants(){
    this.props.navigation.navigate("AddUsers")
  }

  abandonGroup(){
    let { Admin } = this.state;

    if(Admin){
      let Count = 0;
      let Role;

      for(let i = 0;i < this.props.chatState.CurrentChat.members.length;i++){
        if(this.props.chatState.CurrentChat.members[i].admin || this.props.chatState.CurrentChat.members[i].owner){
          Count++;

          if(this.props.chatState.CurrentChat.members[i].jid === this.props.userState.Username){
            if(this.props.chatState.CurrentChat.members[i].owner){
              Role = "owner";
            }
            else{
              Role = "admin";
            }
          }
        }
      }

      if(Count > 1 && this.props.chatState.CurrentChat.members.length >= 3){
        Alert.alert(
         '¿Quieres abandonar el grupo?',
         "Al abandonar el grupo, ya no recibirás ni podrás ver los mensajes.",
         [
           {text: 'Salir', onPress: () => this.abandonGroupCall(Role)},
           {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
      }
      else if(this.props.chatState.CurrentChat.members.length < 3){
        Alert.alert(
          '¿Quieres abandonar el grupo?',
          "Al abandonar el grupo, ya no recibirás ni podrás ver los mensajes.",
         [
           {text: 'Salir', onPress: () => this.abandonGroupCall(Role)},
           {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
      }
      else{
        Alert.alert(
         'Eres el único administrador del grupo.',
         "Antes de abandonar el grupo agrega a alguien más como administrador.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
      }
    }
    else{
      Alert.alert(
        '¿Quieres abandonar el grupo?',
        "Al abandonar el grupo, ya no recibirás ni podrás ver los mensajes.",
       [
         {text: 'Confirmar', onPress: () => this.abandonGroupCall("member")},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
     )
    }
  }

  loadPictures(){
    let { Admin } = this.state;

    if(!Admin){
      return false;
    }

    ImagePicker.openPicker({
      multiple: false,
      width: width/1.5,
      height: height/1.5,
      compressImageMaxWidth: width/1.5,
      compressImageMaxHeight: height/1.5,
      compressImageQuality:0.8,
      mediaType:'photo',
    }).then(image => {

      if(image != null){
        var pic = {uri:image.path,width:image.width,source:image.sourceURL,height:image.height,mime:image.mime};
        this.setState({picture:pic, pictureExists:true});

        setTimeout(function(){
          this.uploadPicture();
        }.bind(this),500);
      }
      else{
        console.log('cancelled');
      }
    });
  }

  deleteGroup(){
    let { Admin } = this.state;

    if(Admin){
      let Count = 0;
      let Role;

      for(let i = 0;i < this.props.chatState.CurrentChat.members.length;i++){
        if(this.props.chatState.CurrentChat.members[i].admin || this.props.chatState.CurrentChat.members[i].owner){
          Count++;

          if(this.props.chatState.CurrentChat.members[i].jid === this.props.userState.Username){
            if(this.props.chatState.CurrentChat.members[i].owner){
              Role = "owner";
            }
            else{
              Role = "admin";
            }
          }
        }
      }

      if(Role == "owner"){
        Alert.alert(
         '¿Quieres borrar el grupo?',
         "El grupo se borrará de tu historial y nadie más podrá enviar mensajes.",
         [
           {text: 'Borrar', onPress: () => this.lockGroupMessage(), style: 'destructive'},
           {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
      }
    }
  }

  lockGroupMessage(){
    let time = new Date().toISOString();

    let messageBody = {
      id: id(),
      chat_id: this.props.chatState.CurrentChat.id,
      timestamp: time,
      text: "Este grupo a sido archivado por un administrador; El envio de contenido ha sido deshabilitado.",
      time: new Date(time).getTime(),
      message_by: this.props.chatState.CurrentChat.nickname,
      username: this.props.userState.Nickname,
      state: "Pending",
      read_by:[this.props.userState.Nickname],
      read_by_count:0,
      user:this.props.userState.UserData,
      pending:true,
      isAlert:false,
      alertStart:false,
      isSystemMsg:true
    };

    this.props.dispatch({type:'PENDING_MSG', ChatId:  this.props.chatState.CurrentChat.id, Message:messageBody});

    this.props.clientState.DB.transaction((tx) => {
      tx.executeSql('INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isSystemMsg) VALUES (?,?,?,?,?,?,?,?)',
      [messageBody.id, messageBody.text, time, 'false', messageBody.username, messageBody.chat_id, false, true],
      (txt, results1) => {
        if (results1.rowsAffected > 0 ) {
          let message = xml("message", {to: this.props.chatState.CurrentChat.id, id:messageBody.id, from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, messageBody.text), xml("type", {}, "Lock"), xml("request", {xmlns:"urn:xmpp:receipts"}));
          let response = this.props.clientState.Client.send(message);
          this.props.navigation.popToTop();
          this.props.dispatch({type:"CLEAR_CURRENT"});
          let messagePresence = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
          let responsePresence = this.props.clientState.Client.send(messagePresence);
          Alert.alert(
           'Atención',
           "El grupo ha sido cerrado. El envio de mensajes ha sido deshabilitado.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
      })
    });
  }

  deleteGroupCall(){
    let model = {
      Role: 'owner',
      ChatId: this.props.chatState.CurrentChat.id
    };

    EndpointRequests.DeleteGroup(model, (response) => {
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
              this.props.navigation.popToTop();
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

  abandonGroupCall(Role){
    this.setState({abandoning:true});
    let model = {
      Role: Role,
      ChatId: this.props.chatState.CurrentChat.id
    };

    this.props.dispatch({type:"ABANDONING_ROOM", ChatId:this.props.chatState.CurrentChat.id});

    if(this.props.chatState.CurrentChat.chatType != 1){
      let messageLeave = xml("message", {to: this.props.chatState.CurrentChat.id, id:id(), from: this.props.chatState.CurrentChat.nickname, type:'groupchat'}, xml("body", {}, "El usuario " + this.props.userState.UserData.alias + " ha dejado el canal."), xml("type", {}, "Leave"), xml("request", {xmlns:"urn:xmpp:receipts"}));
      let responseLeave = this.props.clientState.Client.send(messageLeave);
    }
    let message = xml( "presence", { from:this.props.clientState.From, id:id(), to: this.props.chatState.CurrentChat.id}, xml("status", {code: "away"}));
    let response = this.props.clientState.Client.send(message);

    EndpointRequests.AbandonGroup(model, (response) => {
      if(response.message === "Ok"){
        //remove from local db and list

        this.props.dispatch({type:"REMOVE_ROOM", ChatId:this.props.chatState.CurrentChat.id});

        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('DELETE FROM conversations WHERE JID = ?',
          [this.props.chatState.CurrentChat.id],
          (txt, resultsConversation) => {
            if (resultsConversation.rowsAffected > 0 ) {
              txt.executeSql('DELETE FROM messages WHERE conversation_id = ?',
              [this.props.chatState.CurrentChat.id],
              (txt2, resultsMessages) => {
                this.props.clientState.LoadChatList();
                this.props.navigation.popToTop();
                this.props.dispatch({type:"CLEAR_CURRENT"});
              });
            }
          });
        });
      }
      else{
        this.setState({abandoning:false});

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

  render() {
    return (
      <View style={{backgroundColor:'white',flex:1}}>
      <ScrollView contentContainerStyle={{backgroundColor:'white'}} style={{flex:1, height:height - 90, backgroundColor:'white',marginBottom:iPhoneX ? 20 : 0}}>
        {this.props.chatState.CurrentChat.chatType != 1 ?
          <View style={{paddingTop:0,padding:10, height:110, flexDirection:'row',backgroundColor:'white'}}>
          <View style={{flex:.25,height:110,justifyContent:'center'}}>
          <TouchableOpacity style={{height:75,width:75, borderRadius:45, alignSelf:'center', justifyContent:'center', backgroundColor:this.state.isLoading ? 'lightgray' : 'transparent'}}>
            {this.state.isLoading ?
              <ActivityIndicator size="small" color="black" style={{alignSelf:'center'}}/>
              :
              <AvatarAlt
                rounded
                source={ this.props.chatState.CurrentChat.thumbnail != undefined  ? {uri:this.props.chatState.CurrentChat.thumbnail} : placeholder}
                size="large"
                resizeMode={"stretch"}
                avatarStyle={{height:75,width:75}}
                containerStyle={{height:75,width:75}}
                showAccessory={this.state.Admin}
                onAccessoryPress={() => this.loadPictures()}
              />
            }
          </TouchableOpacity>
          </View>
          <View style={{flex:.75,height:110,justifyContent:'center',backgroundColor:'white'}}>
          <View style={{flexDirection:'column', height:80, justifyContent:'center'}}>
          <Input placeholder='Nombre del Canal' placeholderTextColor="gray" testID='GroupName'
          maxFontSizeMultiplier={1.25}
          containerStyle={{height:40,marginTop:10,marginBottom:0, paddingBottom:0}}
          value={this.props.chatState.CurrentChat != undefined ? this.props.chatState.CurrentChat.name : ""}
          inputStyle={{width:width-40,color:'black', fontSize:14, paddingBottom:0, top:5}}
          maxLength={35}
          disabled={true}
          autoCorrect={true}
          blurOnSubmit={true}
          />
          <Input placeholder='Descripcion' placeholderTextColor="gray" testID='GroupDesc'
          maxFontSizeMultiplier={1.25}
          containerStyle={{height:40,marginTop:0,marginBottom:25}}
          inputStyle={{width:width-40, color:'black', fontSize:14, top:5}}
          autoCorrect={true}
          blurOnSubmit={true}
          multiline={false}
          maxLength={35}
          disabled={true}
          value={this.props.chatState.CurrentChat.description != null ? this.props.chatState.CurrentChat.description : ""}
          />
          </View>
          </View>
          </View>
          :
          null
        }
        <View style={{flex:1, flexDirection:'row', width:width, height:40}}>
          <View style={{flex:.5}}>
            <View style={{flexDirection:'column', height:40, justifyContent:'center'}}>
              <Text style={{padding:3, color:'#0E75FA', paddingLeft:10}}>Participantes</Text>
            </View>
          </View>
          {this.state.Admin && this.props.chatState.CurrentChat.chatType != 1 ?
            <View style={{flex:.5, justifyContent:'center'}}>
              <TouchableOpacity style={{height:40, justifyContent:'center', alignSelf:'flex-end', paddingRight:15}} onPress={() => this.addParticipants()}>
                <Icon type="ionicon" name="ios-add" size={40} color="#0E75FA" style={{textAlign:'right'}} />
              </TouchableOpacity>
            </View>
           :
           null
          }
        </View>
          {
  			    this.props.chatState.CurrentChat.members.map((member, index) => (
              member.alias != undefined ?
         	 		  <ListItem
  				  		key={member.alias + index}
    					  roundAvatar
                underlayColor="lightgray"
      					containerStyle={{height:55, justifyContent:'center', backgroundColor:'white', borderBottomColor:'lightgray', borderBottomWidth:1}}
      					leftAvatar={
                  <Avatar showAccessory name={member.alias === undefined ? "?..." : member.alias} photo={member.pictureUrl != null ? member.pictureUrl : null} iconSize="medium" />
  							}
              	title={member.alias}
              	subtitle={this.getTitle(member)}
                subtitleStyle={{fontSize:12, marginTop:3, marginLeft:5}}
                onPress={() => this.participantOptions(member)}
          		  />
              :
              null
  			  ))
				}
        {this.props.chatState.CurrentChat.chatType != 2 ?
          <View>
          <Text style={{padding:3, color:'#0E75FA', paddingLeft:10, marginBottom:10, marginTop:10}}>Opciones</Text>
          <ListItem
            key={"options"}
      			roundAvatar
      			hideChevron
      			key={"ignore"}
            underlayColor="lightgray"
            onPress={() => this.abandonGroup()}
      			containerStyle={{height:50, justifyContent:'center', backgroundColor:'white'}}
      			leftAvatar={
              <View style={{height:40, width:40, borderRadius:20, backgroundColor:"lightgray", justifyContent:'center', flexDirection:'row'}}>
                <Icon type="ionicon" name="ios-exit" size={30} color="red" style={{textAlign:'center', marginTop:5}} />
              </View>
            }
            title={this.props.chatState.CurrentChat.chatType != 1 ? "Abandonar grupo" : "Abandonar conversación"}
      			titleStyle={{color:'red'}}
      		  />
           </View>
            :
            null
          }
          {this.state.Admin && this.props.chatState.CurrentChat.chatType == 0  ?
            <ListItem
        			roundAvatar
        			hideChevron
        			key={"ignore"}
              underlayColor="lightgray"
              onPress={() => this.deleteGroup()}
              style={{marginTop:10}}
        			containerStyle={{height:50, justifyContent:'center', backgroundColor:'white'}}
        			leftAvatar={
                <View style={{height:40, width:40, borderRadius:20, backgroundColor:"lightgray", justifyContent:'center', flexDirection:'row'}}>
                  <Icon type="ionicon" name="ios-trash" size={30} color="red" style={{textAlign:'center', marginTop:5}} />
                </View>
              }
              title={"Eliminar grupo"}
        			titleStyle={{color:'red'}}
        		  />
           :
           null
          }
          <ActionSheet
          ref={o => this.ActionSheet = o}
          title={'Opciones'}
          options={this.state.options}
          cancelButtonIndex={0}
          onPress={(index) => {
            if(index === 0){
              this.ActionSheet.hide();
            }
            else if (index === 1) {
              this.sendPrivateMessage(this.state.user);
            }
        	  else if(index === 2){
              this.modifyAdminlist(this.state.user,"owner");
        	  }
            else if(index == 3){
              this.kickUser(this.state.user);
            }
          }}
        />
      </ScrollView>
      <Modal
      animationType="fade"
      transparent={true}
      backdropPressToClose={false}
      backdrop={true}
      visible={this.state.submiting}>
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
      </View>
    );
  }
}

let ChatSettingsContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(ChatSettings);
export default ChatSettingsContainer;
