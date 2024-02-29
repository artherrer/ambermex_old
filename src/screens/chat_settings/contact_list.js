/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React, { Component } from 'react';
import { View, AsyncStorage, TextInput, Button, Text, ActivityIndicator, FlatList, Dimensions, Linking, Modal, Keyboard, TouchableWithoutFeedback, TouchableOpacity, Image, Alert  } from 'react-native';
import { ListItem, Icon, Input, FormLabel, Avatar, SearchBar, Button as ButtonAlt } from 'react-native-elements';
import PhoneInput from 'react-native-phone-input';
import { formatNumber } from "libphonenumber-js";
import { connect } from 'react-redux';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const EndpointRequests = require("../../util/requests.js");
import { PermissionsAndroid } from 'react-native';
import PhoneInputView from "../settings/cmps/phone_input";

import Contacts from 'react-native-contacts';
const MXFlag = require('../../../assets/image/mexico.png');
const USFlag = require('../../../assets/image/usa.png');

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

const countryList = [
  {
    "name": "Mexico (México)",
    "iso2": "mx",
    "dialCode": "52",
    "priority": 0,
    "areaCodes": null
  },
  {
    "name": "United States",
    "iso2": "us",
    "dialCode": "1",
    "priority": 0,
    "areaCodes": null
  }
];

class AddUsers extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Agregar Miembros',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.pop();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>,
      headerRight:
          navigation.state.params != undefined && navigation.state.params.loading ?
        () =>  <ActivityIndicator size="small" color="#0E75FA" style={{marginRight:20}} />
          :
        () =>  <View style={{marginRight:10}}>
          <Button
          testID='CreateGroup'
          onPress={() => {navigation.state.params.create()}}
          title="Agregar"
          color="#000"
          style={{marginRight:10}}
          disabled={navigation.state.params != undefined ? navigation.state.params.status : true}
          />
          </View>
    });

  constructor(props) {
    super(props);

    this.state = {
      isLoading:true,
      searchList:[],
      selected:[],
      participants:[],
      conversation:this.props.chatState.CurrentChat,
      members:[],
      denied:false,
      chooseCountry:false,
      newContact:false,
      newContactName:null,
      newContactPhone:"+52",
      incorrect:true,
      submiting:false,
      searchText:""
    }}

    componentDidMount(){
      this.props.navigation.setParams({
        loading:false,
        status:true,
        create:this.createChat.bind(this)
      });
      this.loadParticipants();
    }

    changeStatus(){
      const { selected } = this.state;

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
      else{
        this.props.navigation.setParams({
          status:true
        });
      }
    }

    createChat(){
      var { selected, conversation } = this.state;

      this.props.navigation.setParams({
        loading:true
      });

      let memberInfo = [];

      this.setState({submiting:true});

      for(let i = 0; i < selected.length;i++){
        if(selected[i].userInfo != null){
          let member = {
            Phone:selected[i].userInfo.id.replace(/\s/g, ''),
            Name:selected[i].userInfo.givenName
          };

          let alreadyMember = this.props.chatState.CurrentChat.members.find(x => x.phone === member.Phone);
          if(alreadyMember == undefined){
            memberInfo.push(member);
          }
        }
      }

      if(memberInfo.length == 0){
        Alert.alert(
         'Atención.',
         "El/los usuario/s que seleccionaste ya son parte del grupo.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
       )
       this.props.navigation.setParams({
         loading:false
       });
       this.setState({submiting:false});
       return false
      }

      let GroupName = this.props.chatState.CurrentChat.id.split("@")[0];

      let InviteModel = {
        GroupJID:this.props.chatState.CurrentChat.id,
        NewMembers: memberInfo,
        GroupName:GroupName
      };

      EndpointRequests.InviteParticipants(InviteModel, function(responseData) {
        if(responseData.error != undefined){
          this.setState({isLoading:false,submiting:false});

          setTimeout(function(){
            Alert.alert(
             'Error',
             responseData.error,
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            this.props.navigation.setParams({
              loading:false
            });
        	}.bind(this),250);
        }
        else{
          this.props.chatState.LoadMembers(function(response) {
            if(response === "Finished"){
              this.setState({isLoading:false,chatName:"", chatDescription:"",submiting:false});

              setTimeout(function(){
                Alert.alert(
                 'Mensaje',
                 responseData.message,
                 [
                   {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                 ],
                 { cancelable: false }
                )

                this.props.navigation.pop();
                this.props.navigation.setParams({
                  loading:false
                });
            	}.bind(this),250);
            }
            else{}
          }.bind(this));
        }
      }.bind(this));
    }

    loadParticipants(){
      var { selected, members } = this.state;

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

    choosePhone(participant){

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
          'Elige un Número',
          'La conversación sera ligada a este número de teléfono',
          options,
          {cancelable: false},
        );
      }
      else{
        this.checkCountry(participant, 0);
      }
    }

    checkCountry(participant, phoneChosen){
      const { userInfo, participants, selected, searching, searchList } = this.state;

      let phoneNo = participant.phoneNumbers[phoneChosen].number;

      phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

      if(phoneNo.length <= 9){
        Alert.alert(
         'Mensaje',
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
        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
        return true;
      }
      else{
        participants[index].phone = cleanPhone.phone;
        if(itemStatus){
          this.setState({participants:participants,selected:selected, searchList:searchList, chosenContact:""});
          setTimeout(function(){
            this.changeStatus();
          }.bind(this),200);
        }
        else{
          participant.phone = cleanPhone.phone;
          this.setState({chooseCountry:true, chosenContact:participants[index]});

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
      const { userInfo, chosenContact, participants, searchList, selected, searching }  = this.state;

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

      setTimeout(function(){
        this.changeStatus();
      }.bind(this),200);
    }

    selectUser(participant){
      let { participants, searchList, searching, selected } = this.state;

      let phoneNo = participant.phoneNumbers[0].number;

      phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

      if(phoneNo.length <= 9){
        Alert.alert(
         'Mensaje',
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
    }

    selectUser2(participant, index){
      let list = this.state.participants;
      let selectedList = this.state.selected;

      let phoneNo = participant.phoneNumbers[0].number;

      phoneNo = phoneNo.replace(/[^0-9\+]+/g,'');

      if(phoneNo.length <= 9){
        Alert.alert(
         'Mensaje',
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
        this.setState({searching:false, searchText:""});
      }
    }

    updateChat(item){

      Alert.alert(
        'Actualizar Conversación?',
        "Agregar más participantes o actualiza el tema.",
        [
          {text: 'Actualizar', onPress: () => {
            setTimeout(function(){
              this.props.navigation.navigate('UpdateChat', {
                userInfo: this.state.userInfo, conversation:item
              });
            }.bind(this),200);
          }},
          {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: false }
      )

    }

    evaluate(){
      const { newContactPhone, fullPhone, newContactName } = this.state;

      if(newContactPhone == undefined || fullPhone == undefined){
        return false;
      }

      let phoneValid = fullPhone.startsWith("+1") || fullPhone.startsWith("+52");

      if(newContactName == undefined || newContactName == null || newContactName.length < 1){
        this.setState({incorrect:true});
      }
      else if(!phoneValid){
        this.setState({incorrect:true});
      }
      else if(newContactPhone == undefined || newContactPhone == null || newContactPhone.length < 10){
        this.setState({incorrect:true});
      }
      else{
        this.setState({incorrect:false});
        return true;
      }
    }

    newContactAdd(){
      const { newContactPhone, fullPhone, newContactName, participants, selected, searchList } = this.state;

      let phone = {
        label:"mobile",
        number:fullPhone
      };

      let newContact = {
        givenName:newContactName,
        familyName:"",
        phoneNumbers:[phone],
        selected: true,
        recordID:this.genRandomId(),
        userInfo:{
          id: fullPhone,
          givenName: newContactName
        }
      };

      participants.unshift(newContact);
      searchList.unshift(newContact);
      selected.push(newContact);

      this.props.navigation.setParams({
        status:false
      });
      this.setState({participants:participants, fullPhone:"", selected:selected,searchList:searchList, newContactPhone:"+52", newContactName:"", incorrect:true, newContact:false});
    }

    genRandomId(){
      var id = null;
      var first = Math.floor((Math.random() * 1000) + 1);

      if(first == 1000){
        first = Math.floor((Math.random() * 1000) + 1);
      }

      var second = Math.floor((Math.random() * 1000) + 1);

      if(second == 1000){
        second = Math.floor((Math.random() * 1000) + 1);
      }

      id = first.toString() + second.toString();

      return id;
    }

    _keyExtractor = (item, index) => index.toString();

    render() {

      const { userInfo, isLoading, participants, type, denied, searching, searchList } = this.state;

      return (
        <View style={{flex:1,width:width, backgroundColor:'white'}}>
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
        style={{ flex: 1, height:iPhoneX ? (height - 150) : (height - 125), backgroundColor:'white',borderBottomLeftRadius: iPhoneX ? 30 : 0,borderBottomRightRadius: iPhoneX ? 30 : 0 }}
        ListHeaderComponent={() =>
          <TouchableOpacity onPress={() => this.setState({newContact:true})} style={{height:100, justifyContent: 'center', borderBottomWidth:1.5, borderBottomColor:'lightgray'}}>
          <Icon type="ionicon" name="ios-person-add" color="#0E75FA"/><Text style={{textAlign:'center', color:"#0E75FA"}}>Agregar nuevo contacto</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={() =>
          isLoading ?
          <ListItem
          hideChevron
          roundAvatar
          containerStyle={{height:100, marginTop:10, justifyContent: 'center', paddingTop:0}}
          leftAvatar={
            <Avatar size="medium" style={{height:60, width:60, borderRadius:30, backgroundColor:'lightgray'}} rounded title={""} activeOpacity={0.7} />
          }
          title={""}
          titleStyle={{height:25, marginBottom:5, backgroundColor:'lightgray'}}
          />
          :
          (denied ?
            <View style={{height:height - 230, width:width/1.5, alignSelf:'center', justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
            <Icon name="person" type="ionicon" size={100} color="gray" style={{textAlign:'center'}} />
            <Text style={{textAlign:'center', padding:40, fontSize:14, paddingTop:15}}>Para crear una conversación, tienes que autorizar el acceso a tus contactos.</Text>
            <Button
            onPress={() => {Linking.openURL('app-settings:')}}
            title="Ir a Permisos"
            color="#0E75FA"
            style={{marginRight:10}} />
            </View>
            :
            <View style={{height:height - 230, width:width, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
            <Icon name="person" type="ionicon" size={100} color="gray" style={{textAlign:'center'}} />
            <Text style={{textAlign:'center', padding:40, fontSize:14}}>No existen contactos</Text>
            </View>
          )
        }
        renderItem={({item,index}) => (
          item.hidden != true ?
          <ListItem
          roundAvatar
          leftAvatar={
            item.hasThumbnail ? {source:{uri:item.thumbnailPath}} :
            <Avatar size="medium" rounded containerStyle={{backgroundColor:'red'}} title={item.givenName != null ? item.givenName.charAt(0) : "?"} />
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
          setTimeout(function(){
             this.setState({chooseCountry:false});
          }.bind(this),100);
        }}
        visible={this.state.chooseCountry}>
        <View style={{
          backgroundColor: '#00000080',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'}}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{alignSelf: 'center', width:(width/4)*3,paddingTop:5, paddingBottom:10, backgroundColor:"white",marginTop:0,borderRadius:30,padding:20}}>
          <TouchableOpacity onPress={() => this.setState({chooseCountry:false})} style={{height:50,width:50,alignSelf:'flex-end', justifyContent:'center'}}>
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
          onRequestClose={() => {
            setTimeout(function(){
               this.setState({newContact:false,newContactName:"",newContactPhone:"", incorrect:true})
            }.bind(this),100);
          }}
          visible={this.state.newContact}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{alignSelf: 'center', borderRadius:10, width:width - 40,paddingTop:5, paddingBottom:10, backgroundColor:"white",marginTop:0}}>
            <TouchableOpacity onPress={() => this.setState({newContact:false,fullPhone:null,newContactName:"",newContactPhone:"+52", incorrect:true})} style={{height:50,width:50,alignSelf:'flex-end', justifyContent:'center'}}>
            <Icon type="ionicon" name="ios-close" size={40} color="black" />
            </TouchableOpacity>
            <View style={{paddingLeft:20, paddingRight:20}}>
            <Input maxFontSizeMultiplier={1.25}
            placeholder="Nombre" inputStyle={{color:'black', fontSize:20}} autoCapitalize="words" value={this.state.newContactName} onChangeText={(text) => {
              this.setState({newContactName:text});
              setTimeout(function(){
                this.evaluate();
              }.bind(this),200);}}/>
              <View style={{height:15}} />
              <PhoneInputView
                flagStyle={{width: 50, height: 30, marginLeft:13}}
                style={{height:50, top:5,borderBottomWidth:1, borderColor:'grey'}}
                incorrect={(values) => {
                  this.setState({newContactPhone:values.phone, fullPhone:values.fullPhone});
                  setTimeout(function(){
                    this.evaluate();
                  }.bind(this),200);
                }} phone={this.state.fullPhone} />
              <ButtonAlt
              backgroundColor="#1DA1F2"
              onPress={() => this.newContactAdd()}
              disabled={this.state.incorrect}
              buttonStyle={{marginTop:20,alignSelf:'center'}}
              title='Agregar Contacto' style={{marginTop:20, marginBottom:10}} />
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
              onRequestClose={() => {
                console.log('close')
              }}
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

let AddUsersContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(AddUsers);
export default AddUsersContainer;
