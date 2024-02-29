/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { Text, View, AsyncStorage, TextInput, Button, ActivityIndicator, FlatList, Dimensions, Linking, Modal, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Image, Alert  } from 'react-native';
import { createStackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon, FormInput, Input, FormLabel, Avatar, SearchBar } from 'react-native-elements';
import Contacts from 'react-native-contacts';
const MXFlag = require('../../../assets/image/mexico.png');
const USFlag = require('../../../assets/image/usa.png');
var { height, width } = Dimensions.get('window');
import { Header } from 'react-navigation-stack'
import ImagePicker from 'react-native-image-crop-picker';
import { connect } from 'react-redux';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
import { APP_INFO } from '../../util/constants';

var iPhoneX = height >= 812;
import { PermissionsAndroid } from 'react-native';
const EndpointRequests = require("../../util/requests.js");
var headerHeight = iPhoneX ? 91 : 64;

class SelectContacts extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.state.params != undefined ? navigation.state.params.screenTitle : '',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.state.params.back();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={30} style={{marginTop:0}} />
      </TouchableOpacity>,
      headerRight:
      navigation.state.params != undefined && navigation.state.params.loading ?
    () =>  <View style={{marginRight:10}}>
      <ActivityIndicator size="small" color="#0E75FA" style={{marginRight:20}} />
        </View>
      :
    () =>  <View style={{marginRight:10}}>
      <Button
      testID='NextStep'
      onPress={() => {navigation.state.params.create()}}
      title="Crear"
      color="#0E75FA"
      disabled={navigation.state.params != undefined ? navigation.state.params.status : true}
      style={{marginRight:10}}
      />
      </View>
    });

    constructor(props) {
      super(props);

      var channelType = props.navigation.state.params.type;

      this.state = {
        participants:[],
        searchList:[],
        isLoading:true,
        disabled:true,
        selected:[],
        chosenContact:null,
        chooseCountry:false,
        searchText:null,
        chatName:null,
        chatDescription:"",
        channelType:channelType,
        chatThumbnail:null,
        submiting:false
      }}

      componentDidMount(){
        let { channelType } = this.state;

        this.loadParticipants();

        this.props.navigation.setParams({
          status:true,
          create:this.prepareChat.bind(this),
          next:this.nextStep.bind(this),
          back:this.goBack.bind(this),
          loading:false,
          screenTitle: channelType === "Group" ? 'Participantes' : 'Directo'
        });
      }

      goBack(){
        this.props.navigation.goBack();
      }

      nextStep(){
        const { selected, participants } = this.state;

        this.props.navigation.navigate("CreateGroup", {participants:participants, selected:selected, update:(participants, selected) => this.update(participants, selected)});
      }

      update(participants, selected){
        this.setState({participants:participants, selected:selected});
      }

      changeStatus(){
        const { selected, chatName, channelType } = this.state;

        if(channelType === "Group"){
          if(selected.length == 0 || chatName == null || chatName == ""){
            this.props.navigation.setParams({
              status:true
            });
          }
          else if(selected.length > 0 && chatName !== null && chatName != ""){
            this.props.navigation.setParams({
              status:false
            });
          }
          else{
            this.props.navigation.setParams({
              status:true
            });
          }
        }
        else{
          if(selected.length == 0){
            this.props.navigation.setParams({
              status:true
            });
          }
          else if(selected.length > 0){
            this.props.navigation.setParams({
              status:false
            });
          }
        }
      }

      loadPictures(){

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

            setTimeout(function(){
              this.setState({picture:pic, pictureExists:true});
            }.bind(this),200);
          }
          else{
            console.log('cancelled');
          }
        });
      }

      uploadPicture(){
        let { picture } = this.state;

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

            this.setState({chatThumbnail:responseData.secure_url});

            setTimeout(function(){
              this.createChat();
            }.bind(this),300);
          }
        }.bind(this));
      }

      loadParticipants(){
        this.setState({isLoading:true});

        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            'title': 'Permiso para accesar Contactos',
            'message': 'Si quieres iniciar conversaciones, necesitamos accesar tu lista de contactos.',
            'buttonPositive': 'Aceptar'
          }
        ).then((result) => {
          if(result === 'denied' || result === 'never_ask_again'){
            this.setState({denied:true,isLoading:false, participants:[]});
          }
          else{
            Contacts.getAll((err, contacts) => {
              if (err) {
                this.setState({denied:true,isLoading:false, participants:[]});
              }
              else{
                for(let i = 0; i < contacts.length;i++){
                  if(contacts[i].phoneNumbers == undefined || contacts[i].phoneNumbers.length == 0){
                    contacts[i].hidden = true;
                    contacts[i].fullName = "";
                  }
                  else{
                    for(let p = 0; p < contacts[i].phoneNumbers.length;p++){
                      let fullName = null;

                      if(contacts[i].givenName == undefined || contacts[i].givenName == null || contacts[i].givenName == ""){
                        contacts[i].givenName = "Usuario";
                        fullName = "Usuario";
                      }
                      else{
                        fullName = contacts[i].givenName;
                      }

                      if(contacts[i].familyName == undefined || contacts[i].familyName == null || contacts[i].familyName == ""){
                        contacts[i].familyName = "";
                      }
                      else{
                        fullName = fullName + " " + contacts[i].familyName;
                      }

                      contacts[i].fullName = fullName;

                      if(contacts[i].phoneNumbers[p].number != null && contacts[i].phoneNumbers[p].number || undefined){
                        let phoneNo = contacts[i].phoneNumbers[p].number.replace(/[^0-9]+/g,'');
                        if(phoneNo.length >= 10){
                          contacts[i].phoneNumbers[p].filteredNumber = phoneNo.slice(-10);
                        }
                        else{
                          contacts[i].phoneNumbers[p].invalidNumber = true;
                        }
                      }
                      else{
                        contacts[i].phoneNumbers[p].invalidNumber = true;
                      }
                    }
                  }
                  contacts[i].selected = false;
                }
              }

            contacts.sort(function(a, b){
             var nameA=a.fullName.toLowerCase(), nameB=b.fullName.toLowerCase();
             if (nameA < nameB) //sort string ascending
              return -1;
             if (nameA > nameB)
              return 1;
             return 0; //default return value (no sorting)
            });

            this.setState({isLoading:false, participants:contacts});
          });
        }
       });
      }

      prepareChat(){
        let { picture, channelType, chatThumbnail } = this.state;

        this.props.navigation.setParams({
          loading:true
        });

        if(channelType === "Group" && picture != null && chatThumbnail == undefined){
          this.uploadPicture();
        }
        else{
          this.createChat();
        }
      }

      async createChat(){
        const { chatName, chatDescription, chatThumbnail, selected, channelType } = this.state;

        this.props.dispatch({type:"CREATING_CHAT", Data:{ Name:chatName }});

        this.setState({isLoading:true, submiting:true});

        try {
          if(channelType === "Group"){
            let MemberList = [];

            for(let i=0;i < selected.length;i++){
              let MemberObject = {
                Name:selected[i].givenName,
                Phone:selected[i].userInfo.id.replace(/\s/g, '')
              };

              MemberList.push(MemberObject);
            }

            let Description;

            if(chatDescription === ""){
              Description = "Canal de grupo";
            }
            else{
              Description = chatDescription;
            }

            let GroupModel = {
              Name:chatName,
              Description:Description,
              Members:MemberList,
              Type:0,
              Thumbnail:chatThumbnail
            };

            EndpointRequests.CreateChat(GroupModel, function(responseData) {
          		if(responseData.groupId == undefined){
                this.props.navigation.setParams({
                  loading:false
                });
                if(responseData.error != undefined){
                  Alert.alert(
                   'Error',
                   responseData.error,
                   [
                     {text: 'Ok', onPress: () => this.closeModal()},
                   ],
                   { cancelable: false }
                  )
                }
                else{
                  Alert.alert(
                   'Atención',
                   responseData.message,
                   [
                     {text: 'Ok', onPress: () => this.closeModal()},
                   ],
                   { cancelable: false }
                  )
                }
          		}
          		else{
                this.props.clientState.LoadChatList(false, (finished) => {
                  let channelId = responseData.groupId + "@" + this.props.clientState.Conference;
                  setTimeout(async function(){
                    let messageXMPP = xml( "presence", { from:this.props.clientState.From, id:id(), to: channelId + '/' + this.props.userState.Nickname },xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date().toISOString()})), xml("status", { code: '200'}));
                    let responseXMPP = this.props.clientState.Client.send(messageXMPP);
                  }.bind(this),500);
                  setTimeout(async function(){
                    this.setState({isLoading:false, submiting:false});
                    this.props.dispatch({type:"ENTER_CHAT", Chat:channelId, Username:this.props.userState.Nickname});
                    this.props.navigation.navigate('Chat', { Chat:channelId, clearCurrent:() => this.props.dispatch({type:"CLEAR_CURRENT", backHome:true}) });
                  }.bind(this),1000);
                });
          		}
          	}.bind(this));
          }
          else{
            let PrivateModel = {
              ExternalId:null,
              Phone:selected[0].userInfo.id.replace(/\s/g, '')
            };

            EndpointRequests.CreatePrivateChat(PrivateModel, function(responseData) {
          		if(responseData.groupId == undefined){
                this.props.navigation.setParams({
                  loading:false
                });
                if(responseData.error != undefined){
                  Alert.alert(
                   'Error',
                   responseData.error,
                   [
                     {text: 'Ok', onPress: () => this.closeModal()},
                   ],
                   { cancelable: false }
                  )
                }
                else{
                  Alert.alert(
                   'Atención',
                   responseData.message,
                   [
                     {text: 'Ok', onPress: () => this.closeModal()},
                   ],
                   { cancelable: false }
                  )
                }
          		}
          		else{
                this.props.clientState.LoadChatList(false, (finished) => {
                  let channelId = responseData.groupId + "@" + this.props.clientState.Conference;
                  setTimeout(async function(){
                    let messageXMPP = xml( "presence", { from:this.props.clientState.From, id:id(), to: channelId + '/' + this.props.userState.Nickname },xml('x', {xmlns:'http://jabber.org/protocol/muc'}, xml("history",{since:new Date().toISOString()})), xml("status", { code: '200'}));
                    let responseXMPP = this.props.clientState.Client.send(messageXMPP);
                  }.bind(this),500);
                  setTimeout(async function(){
                    this.setState({isLoading:false, submiting:false});
                    this.props.dispatch({type:"ENTER_CHAT", Chat:channelId, Username:this.props.userState.Nickname});
                    this.props.navigation.navigate('Chat', { Chat:channelId, clearCurrent:() => this.props.dispatch({type:"CLEAR_CURRENT", backHome:true}) });
                  }.bind(this),1000);
                });
          		}
          	}.bind(this));
          }
        }
        catch(error){
          Alert.alert(
           'Error',
           "Hubo un error en la creacion del canal.",
           [
             {text: 'Ok', onPress: () => this.closeModal()},
           ],
           { cancelable: false }
          )
        }
      }

      closeModal(){
        this.setState({isLoading:false, submiting:false});
        this.props.navigation.setParams({
          loading:false
        });
      }

      chat1v1(newParticipant){
        let { selected, participants } = this.state;

        for(let i = 0; i < selected.length;i++){
          if(selected[i].recordID != newParticipant.recordID){
            let index = participants.findIndex(x => x.recordID === selected[i].recordID);

            participants[index].selected = false;
          }
        }

        this.setState({selected:[newParticipant], participants:participants});

        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
      }

      choosePhone(participant){
        let { selected, channelType, participants } = this.state;

        if(participant.phoneNumbers != null && participant.phoneNumbers.length > 1){
          if(participant.selected){
            this.checkCountry(participant, 0);
            return false;
          }

          let options = [];

          for(let i = 0; participant.phoneNumbers.length > i;i++){
            if(participant.phoneNumbers[i].number != null && participant.phoneNumbers[i].number != undefined && participant.phoneNumbers[i].number != ""){
              let option = {
                text:participant.phoneNumbers[i].number,
                onPress:() => this.checkCountry(participant, i)
              };

              options.push(option);
            }
          }

          let cancelar = {
            text: 'Cancelar',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          };

          options.push(cancelar);

          Alert.alert(
            'Elige un número',
            'La conversación será ligada a este número de teléfono',
            options,
            {cancelable: false},
          );
        }
        else{
          this.checkCountry(participant, 0);
        }
      }

      checkCountry(participant, phoneChosen){
        const { participants, selected, searching, searchList, channelType } = this.state;

        let phoneNo = participant.phoneNumbers[phoneChosen].number;

        phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

        if(phoneNo.length <= 9){
          Alert.alert(
           'Error',
           "El teléfono no tiene el formato adecuado, por favor agréguelo en la siguiente pantalla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          return false;
        }

        let index = participants.findIndex(x => x.recordID === participant.recordID);
        let index2;
        let itemStatus = participants[index].selected;

        participants[index].participantIndex = index;

        if(searching){
          index2 = searchList.findIndex(x => x.recordID === participant.recordID);

          participants[index].participantSearch = index2;
        }

        if(itemStatus){
          let delSelected = selected.findIndex(x => x.recordID === participant.recordID);
          participants[index].selected = false;
          selected.splice(delSelected, 1);

          if(searching){
            searchList[index2].selected = false;
          }

          this.setState({participants:participants,selected:selected, searchList:searchList, chosenContact:""});
          setTimeout(function(){
            this.changeStatus();
          }.bind(this),200);
          return false;
        }

        let cleanPhone = this.getCleanPhone(phoneNo);

        if(cleanPhone.valid){
          let otherUser = {
            id:"",
            givenName:""
          };

          otherUser.id = cleanPhone.phone;
          otherUser.givenName = participant.givenName;
          participants[index].phone = cleanPhone.phone;
          participants[index].selected = !itemStatus;
          participants[index].userInfo = otherUser;

          if(searching){
            searchList[index2].phone = cleanPhone.phone;
            searchList[index2].selected = !itemStatus;
          }

          if(!itemStatus){
            selected.push(participants[index]);
          }

          this.setState({participants:participants,selected:selected, searchList:searchList});

          if(channelType === "1v1" && selected.length > 1){
            this.chat1v1(participant);
          }

          setTimeout(function(){
            this.changeStatus();
          }.bind(this),200);

          return true;
        }
        else{
          participants[index].phone = cleanPhone.phone;
          if(itemStatus){
            this.setState({participants:participants,selected:selected, searchList:searchList, chosenContact:""});

            if(channelType === "1v1" && selected.length > 1){
              this.chat1v1(participant);
            }

            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
          }
          else{
            participant.phone = cleanPhone.phone;
            this.setState({chooseCountry:true, chosenContact:participants[index]});
            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
            return false;
          }
        }
      }

      getCleanPhone(phone){
        let result = {
          phone:"",
          valid:true
        };

        if(phone.startsWith("+52") || phone.startsWith("+1")){
          result.phone = phone;
          return result;
        }
        else if(phone.startsWith("52") && phone.length == 12){
          result.phone = "+" + phone;
          return result;
        }
        else if(phone.startsWith("1") && phone.length == 11){
          result.phone = "+" + phone;
          return result;
        }
        else if(phone.startsWith("001") && phone.length == 13){
          result.phone = "+" + phone.substring(2);
          return result;
        }
        else if(phone.startsWith("011521") && phone.length >= 15){
          result.phone = "+52" + phone.substring(6);
          return result;
        }
        else if(phone.startsWith("+011521") && phone.length >= 16){
          result.phone = "+52" + phone.substring(7);
          return result;
        }
        else if(phone.startsWith("01152") && phone.length >= 14){
          result.phone = "+" + phone.substring(3);
          return result;
        }
        else if(phone.startsWith("+01152") && phone.length >= 15){
          result.phone = "+" + phone.substring(4);
          return result;
        }
        else if(phone.length >= 10){
          result.phone = phone.slice(-10);
          result.valid = false;

          return result;
        }

        result.phone = phone;
        result.valid = false;

        return result;
      }

      countryPick(country){
        const { chosenContact, participants, searchList, selected, searching, channelType }  = this.state;

        let otherUser = {
          id:"",
          givenName:""
        };

        if(country == 0){
          otherUser.id = "+52" + chosenContact.phone;
          otherUser.givenName = chosenContact.givenName;
        }
        else{
          otherUser.id = "+1" + chosenContact.phone;
          otherUser.givenName = chosenContact.givenName;
        }

        chosenContact.userInfo = otherUser;
        participants[chosenContact.participantIndex].selected = true;

        if(searching && chosenContact.participantSearch != null){
          searchList[chosenContact.participantSearch].selected = true;
        }

        selected.push(participants[chosenContact.participantIndex]);

        this.setState({chooseCountry:false, participants:participants,selected:selected, searchList:searchList});

        if(channelType === "1v1" && selected.length > 1){
          this.chat1v1(participants[chosenContact.participantIndex]);
        }

        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
      }

      selectUser(participant){
        let { participants, searchList, searching, selected, channelType } = this.state;

        let phoneNo = participant.phoneNumbers[0].number;

        phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

        if(phoneNo.length <= 9){
          Alert.alert(
           'Error',
           "El teléfono no tiene el formato adecuado, por favor agréguelo en la siguiente pantalla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
          return false;
        }

        let index = participants.findIndex(x => x.recordID === participant.recordID);

        let itemStatus = participants[index].selected;

        participants[index].selected = !itemStatus;

        if(itemStatus){
          let delSelected = selected.findIndex(x => x.recordID === participant.recordID);

          selected.splice(delSelected, 1);
        }
        else{
          selected.push(participants[index]);
        }

        if(searching){

          let index2 = searchList.findIndex(x => x.recordID === participant.recordID);

          searchList[index2].selected = !itemStatus;
        }

        this.setState({participants:participants,selected:selected, searchList:searchList});

        if(channelType === "1v1" && selected.length > 1){
          this.chat1v1(participant);
        }

        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
      }

      selectUser2(participant, index){
        let list = this.state.participants;
        let selectedList = this.state.selected;

        let phoneNo = participant.phoneNumbers[0].number;

        phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

        if(phoneNo.length <= 9){
          Alert.alert(
           'Error',
           "El teléfono no tiene el formato adecuado, por favor agréguelo en la siguiente pantalla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
          return false;
        }

        let itemStatus = list[index].selected;

        list[index].selected = !itemStatus;

        if(list[index].selected == false){
          selectedList = selectedList.filter(function(el) {
            return el !== participant;
          });
        }
        else{
          selectedList.push(list[index]);
        }

        this.setState({participants:list,selected:selectedList});
      }

      getIcon(user){
        var icon = null;

        if(user.selected){
          icon = <Icon name="ios-checkbox" size={30} color={primaryColor}></Icon>;
        }
        else{
          icon = <Icon name="ios-square-outline" size={30} color={darkGrey}></Icon>;
        }

        return icon;
      }

      getPhone(item){
        if(item.phoneNumbers.length > 0){
          let mobileExists = false;
          for(let i = 0; i < item.phoneNumbers.length; i++){
            if(item.phoneNumbers[i].label === "mobile"){
              mobileExists = true;
              return item.phoneNumbers[i].number;
            }
          }

          if(!mobileExists){
            return item.phoneNumbers[0].number;
          }
        }
        else{
          return "Sin Información de teléfono";
        }
      }

      searchContact(text){
        let { participants } = this.state;

        let contactsAlt = JSON.stringify(participants);

        contactsAlt = JSON.parse(contactsAlt);

        var re = new RegExp(text, 'i');

        contactsAlt = contactsAlt.filter(function(e, i, a){
          if(e.fullName != undefined){
            return e.fullName.search(re) != -1;
          }
        });

        if(text != null && text.length > 0){
          this.setState({searchList:contactsAlt, searching:true, searchText:text});
        }
        else{
          this.setState({searching:false, searchText:text});
        }
      }

      _keyExtractor = (item, index) => index.toString();

      render() {

        const { isLoading, participants, type, denied, searching, searchList, pictureExists, picture, selected, channelType } = this.state;

        return (
          <View style={{flex:1, height:height - headerHeight, width:width,backgroundColor:'white'}} scrollEnabled={false}>
          {channelType === "Group" ?
          <View style={{paddingTop:0,padding:10, height:110, flexDirection:'row',backgroundColor:'white'}}>
          <View style={{flex:.25,height:110,justifyContent:'center'}}>
          <TouchableOpacity style={{height:75,width:75, borderRadius:45, alignSelf:'center'}} onPress={() => this.loadPictures()}>
          {pictureExists ?
            <Image source={{uri:picture.uri}} resizeMode="cover" style={{height:75,width:75,borderRadius:38,justifyContent:'center', alignSelf:'center'}} />
            :
            <View style={{height:75,width:75,borderRadius:45,backgroundColor:'lightgray', justifyContent:'center', alignSelf:'center'}}>
            <Icon type="material" name="add-a-photo" color="#000" reversed />
            </View>
          }
          </TouchableOpacity>
          </View>
          <View style={{flex:.75,height:110,justifyContent:'center',backgroundColor:'white'}}>
          <View style={{flexDirection:'column', height:80, justifyContent:'center'}}>
          <Input placeholder='Nombre del canal' placeholderTextColor="gray" testID='GroupName'
          maxFontSizeMultiplier={1.25}
          containerStyle={{height:40,marginTop:10,marginBottom:0, paddingBottom:0}}
          value={this.state.chatName}
          inputStyle={{width:width-40,color:'black', fontSize:12, paddingBottom:0, top:5}}
          maxLength={35}
          autoCorrect={true}
          blurOnSubmit={true}
          onChangeText={(text) => {
            this.setState({chatName:text});
            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
          }}
          />
          <Input placeholder='Descripción opcional' placeholderTextColor="gray" testID='GroupDesc'
          maxFontSizeMultiplier={1.25}
          containerStyle={{height:40,marginTop:0,marginBottom:25}}
          inputStyle={{width:width-40, color:'black', fontSize:12, top:5}}
          autoCorrect={true}
          blurOnSubmit={true}
          multiline={false}
          maxLength={35}
          value={this.state.chatDescription}
          onChangeText={(text) => {
            this.setState({chatDescription:text});
            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
          }}
          />
          </View>
          </View>
          </View>
            :
            null
          }
          {
            selected.length > 0 && channelType === "Group" ?
            <View style={{height:110}}>
            <FlatList
            horizontal={true}
            key={selected.length == 0 ? "empty" : "list"}
            keyExtractor={this._keyExtractor}
            refreshing={this.state.isLoading}
            contentContainerStyle={{paddingLeft:5,paddingRight:5, height:110}}
            data={selected}
            style={{paddingLeft:5,paddingRight:5, height:110,backgroundColor:'white'}}
            renderItem={({item,index}) => (
              item.hidden ? null :
              <View style={{width:(width - 10)/5, height:110, backgroundColor:'white', justifyContent:'center'}}>
              <Avatar size="medium" rounded onPress={() => this.setState({incorrect:false,name:item.userInfo.givenName, phone:item.userInfo.id, newContact:true, edit:true, editIndex:index})} containerStyle={{alignSelf:'center', marginBottom:10, backgroundColor:'#cd2a2a' }} title={String(item.userInfo.givenName.charAt(0))} />
              <Text style={{textAlign:'center'}}>{item.userInfo.givenName}</Text>
              <TouchableOpacity onPress={() => this.selectUser(item, index)} style={{position:'absolute', height:25,width:25,borderRadius:20, alignSelf:'flex-end', top:5, right:7}}>
              <View style={{position:'absolute', height:25,width:25,borderRadius:20, backgroundColor:'white', top:10, right:-5,justifyContent:'center', alignSelf:'flex-end'}}>
                <Icon reversed type="material" name="cancel" color="gray" style={{textAlign:'center'}} />
              </View>
              </TouchableOpacity>
              </View>
            )}
            />
            </View>
            :
            null
          }
          {!denied || participants.length > 0 ?
            <Input containerStyle={{alignSelf:'center',height:40,width:width-30, marginBottom:5,marginTop:5,backgroundColor:'#EEEEEE', borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'white', borderRadius: 15}}
              value={this.state.searchText} returnKeyType={"search"} onChangeText={(text) => this.searchContact(text)} onClearText={() => console.log('hi')}
              placeholder='Buscar contacto' inputStyle={{fontSize:14}} inputContainerStyle={{borderColor:'transparent', marginBottom:0, top:-5}}
                   leftIcon={
                              <Icon color='grey' name='search'size={24} /> } />
            :
            null
          }
          <FlatList
          keyExtractor={this._keyExtractor}
          refreshing={isLoading}
          contentContainerStyle={{ width:width }}
          data={searching ? searchList : participants}
          style={{ flex:1, backgroundColor:'white',borderBottomLeftRadius: iPhoneX ? 30 : 0,borderBottomRightRadius: iPhoneX ? 30 : 0 }}
          ListEmptyComponent={() =>
            isLoading ?
            <ListItem
            hideChevron
            roundAvatar
            containerStyle={{height:100, marginTop:10, justifyContent: 'center', paddingTop:0}}
            leftAvatar={
              <Avatar size="medium" style={{height:60, width:60, borderRadius:30, backgroundColor:'lightgray'}} rounded title={""} activeOpacity={0.7} />
            }
            titleStyle={{height:25, marginBottom:5, backgroundColor:'lightgray'}}
            title={""}
            />
            :
            (denied ?
              <View style={{height:height - 130, width:width/1.5, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
              <Icon name="person" type="ionicon" size={100} color="gray" style={{textAlign:'center'}} />
              <Text style={{textAlign:'center', padding:40, fontSize:14, paddingTop:15}}>Para crear una conversación, tienes que autorizar el acceso a tus contactos.</Text>
              <Button
              onPress={() => {Linking.openURL('app-settings:')}}
              title="Ir a Permisos"
              color="#0E75FA"
              style={{marginRight:10}} />
              </View>
              :
              <View style={{height:channelType === "Group" && selected.length > 0 ? height - 350 : height - 250, width:width, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
              <Icon name="person" type="ionicon" size={100} color="gray" style={{textAlign:'center'}} />
              <Text style={{textAlign:'center', padding:40, fontSize:14}}>No Existen Contactos</Text>
              </View>
            )
          }
          renderItem={({item,index}) => (
            item.hidden != true ?
            <ListItem
            roundAvatar
            leftAvatar={
              <Avatar size="medium" rounded containerStyle={{backgroundColor:'#cd2a2a'}} title={item.givenName != null ? item.givenName.charAt(0) : "?"} />
            }
            title={item.givenName + " " + item.familyName}
            subtitle={this.getPhone(item)}
            rightIcon={item.selected ? <Icon name="check-circle" type="material" color="#1DA1F2" /> : <Icon name="radio-button-unchecked" type="material"/>}
            onPress={() => {
              this.choosePhone(item);
            }}
            />
            :
            null
          )}
          />
          <Modal
          animationType="fade"
          transparent={true}
          backdropPressToClose={false}
          backdrop={true}
          onRequestClose={() => {
            this.setState({chooseCountry:false})
          }}
          visible={this.state.chooseCountry}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius:30,
            alignItems: 'center'}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{alignSelf: 'center', width:(width/4)*3,paddingTop:5, paddingBottom:10, backgroundColor:"white",marginTop:0,borderRadius:30,padding:20}}>
            <TouchableOpacity onPress={() => this.setState({chooseCountry:false})} style={{height:50,width:50,alignSelf:'flex-end', justifyContent:'center', left:10}}>
            <Icon type="ionicon" name="ios-close" size={40} color="black" />
            </TouchableOpacity>
            <View style={{paddingLeft:20, paddingRight:20}}>
            <Text style={{color:'black', textAlign:'center', fontWeight:'bold',fontSize:17}}>Seleccione el país de origen del teléfono de su contacto</Text>
            <View style={{flexDirection:'row', width:(width/4)*3, height:100, justifyContent:'center', marginTop:15, alignSelf:'center'}}>
            <TouchableOpacity onPress={() => this.countryPick(0)} style={{flex:.5, height:70, justifyContent:'center'}}>
            <Image source={MXFlag} resizeMode="contain" style={{height:70, width:100, alignSelf:'center'}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.countryPick(1)} style={{flex:.5, height:70, justifyContent:'center'}}>
            <Image source={USFlag} resizeMode="contain" style={{height:70, width:100, alignSelf:'center'}} />
            </TouchableOpacity>
            </View>
            </View>
            </View>
            </TouchableWithoutFeedback>
            </View>
            </Modal>
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

      let SelectContactsContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(SelectContacts);
      export default SelectContactsContainer;
