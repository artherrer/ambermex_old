/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { StyleSheet,View, AsyncStorage, TextInput, Text, Button, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Image, Modal,Keyboard, TouchableWithoutFeedback, Alert, ActionSheetIOS } from 'react-native';
import { createStackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon, Input, FormLabel, Avatar, Button as ButtonAlt } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';

import PhoneInputView from "./cmps/phone_input";
import ImagePicker from 'react-native-image-crop-picker';
import PhoneInput from 'react-native-phone-input'
import { formatNumber } from "libphonenumber-js";
import { connect } from 'react-redux';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const EndpointRequests = require("../../util/requests.js");

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

class EmergencyUsers extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Contacto de emergencia',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.state.params.goback();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    });

    constructor(props) {
      super(props);

      let existingContact = props.navigation.state.params != undefined && props.navigation.state.params.existingContact != undefined ? props.navigation.state.params.existingContact : null;

      this.state = {
        users:[],
        isLoading:false,
        disabled:true,
        selected:[],
        newContact: existingContact != undefined ? true : false,
        incorrect:true,
        modalLoading:false,
        contactName:existingContact != undefined ? existingContact.name : null,
        contactLastName:existingContact != undefined ? existingContact.lastName : null,
        contactPhone:existingContact != undefined ? formatNumber(existingContact.phone, "National").replace(/[^0-9]/g, '') : null,
        existingContact: existingContact,
        countryCode:existingContact != undefined ? (existingContact.phone.startsWith("+1") ? "+1" : "+52") : "+52",
        country:existingContact != undefined ? (existingContact.phone.startsWith("+1") ? "us" : "mx") : "mx",
        fullPhone:existingContact != undefined ? existingContact.phone : null,
        genderOption:false,
        genderSelected:existingContact != undefined ? existingContact.gender : 0
      }}

      componentDidMount(){
        this.props.navigation.setParams({
          goback:this.goback.bind(this),
          loading:false
        });

        this.loadUsers();
      }

      async loadUsers(){
        let users = [];
        await this.props.clientState.DB.transaction(async (tx) => {
          tx.executeSql("SELECT * FROM emergency_contacts LEFT JOIN users ON emergency_contacts.contact = users.JID WHERE user = ?",
          [this.props.userState.Username],
            async (txt, results) => {
              var len = results.rows.length;
              if(len > 0){
                for(let i = 0; i < len;i++){
                  let row = results.rows.item(i);

                  if(row.picture != null){
                    row.hasPicture = true;
                  }

                  users.push(row);
                }

                this.setState({selected:users});
                this.updateList();
              }
              else{
                this.setState({selected:users});
                this.updateList();
              }
            }
          )
        });
      }

      addEmergencyUsers(){
        const { contactPhone, contactName, contactLastName, country, fullPhone, genderSelected } = this.state;

        let newContact = {
          phone: fullPhone,
          name: contactName,
          gender: genderSelected
        };

        this.setState({isLoading:true});

        let usersList = [];

        usersList.push(newContact);

        EndpointRequests.AddEmergencyContacts(usersList, function(response){
          if(response.message === "Ok" && response.contactsAdded.length > 0){

            for(let k = 0;k < response.contactsAdded.length;k++){
              let userinformation = response.contactsAdded[k];

              this.props.dispatch({type:"UPDATE_EMERGENCY_CONTACTS", Type:"Add", newContact:response.contactsAdded[k]});

              this.props.clientState.DB.transaction((tx) => {
                tx.executeSql('SELECT * FROM users WHERE JID = ?',
                [userinformation.jid],
                (txx, results) => {
                  if (results.rows.length > 0 ) {
                    let rowMsg = results1.rows.item(0);
                    txx.executeSql('INSERT OR REPLACE INTO emergency_contacts (user, contact) VALUES (?, ?)',
                    [rowMsg.nickname, userinformation.jid],
                    (txxx, results1) => {
                      if (results1.rowsAffected > 0 ) {
                        console.log('emergency contact added');
                      }
                    })
                  }
                  else{
                    txx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, phone) VALUES (?, ?, ?, ?, ?)',
                    [userinformation.nickname, userinformation.jid, userinformation.name, userinformation.picture, userinformation.phone],
                    (txxx, results1) => {
                      if (results1.rowsAffected > 0 ) {
                        txxx.executeSql('INSERT OR REPLACE INTO emergency_contacts (user, contact) VALUES (?, ?)',
                        [this.props.userState.Username, userinformation.jid],
                        (tr, results2) => {
                          if (results2.rowsAffected > 0 ) {
                            console.log('emergency contact added');
                          }
                        })
                      }
                    })
                  }
                })
              });
            }

            this.setState({isLoading:false});

            Alert.alert(
             'Éxito',
             "Tu contacto fue agregado correctamente.",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            setTimeout(async function(){
              this.props.navigation.pop();
            }.bind(this),200);
          }
          else if(response.message === "Ok" && response.contactsAdded.length === 0){
            this.setState({isLoading:false});

            Alert.alert(
             'Éxito',
             "Tus contactos ya estaban en tu lista, o aun no se registran, les hemos enviado una invitación para que puedas agregarlos a tus contactos de emergencia.",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            setTimeout(async function(){
              this.props.navigation.pop();
            }.bind(this),200);
          }
          else{
            Alert.alert(
             'Atención',
             response.message,
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            this.setState({isLoading:false});

            setTimeout(async function(){
              this.props.navigation.pop();
            }.bind(this),200);
          }
        }.bind(this));
      }

      updateList(){
        EndpointRequests.GetEmergencyContacts(function(response){
          if(response.message === "Ok" && response.contacts.length > 0){
            for(let k = 0;k < response.contacts.length;k++){
              let userinformation = response.contacts[k];

              this.props.clientState.DB.transaction((tx) => {
                tx.executeSql('SELECT * FROM users WHERE JID = ?',
                [userinformation.jid],
                (txx, results) => {
                  if (results.rows.length > 0 ) {
                    txx.executeSql('INSERT OR REPLACE INTO emergency_contacts (user, contact) VALUES (?, ?)',
                    [this.props.userState.Username, userinformation.jid],
                    (txxx, results1) => {
                      if (results1.rowsAffected > 0 ) {
                        console.log('emergency contact added');
                      }
                    })
                  }
                  else{
                    txx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, phone) VALUES (?, ?, ?, ?, ?)',
                    [userinformation.nickname, userinformation.jid, userinformation.name, userinformation.picture, userinformation.phone],
                    (txxx, results1) => {
                      if (results1.rowsAffected > 0 ) {
                        txxx.executeSql('INSERT OR REPLACE INTO emergency_contacts (user, contact) VALUES (?, ?)',
                        [this.props.userState.Username, userinformation.jid],
                        (tr, results2) => {
                          if (results2.rowsAffected > 0 ) {
                            console.log('emergency contact added');
                          }
                        })
                      }
                    })
                  }
                })
              });
            }

            this.setState({selected:response.contacts});
          }
        }.bind(this));
      }

      goback(){
        const { participants, selected } = this.state;

        this.props.navigation.goBack();
      }


      onError(index){
        var { participants } = this.state;

        participants[index].userData.photoUrl = null;

        this.setState({participants:participants});
      }

      getPhone(item){
        let formatedPhone;
        if(item.phone != null){
          if(String(item.phone).startsWith("+")){
            formatedPhone = formatNumber(item.phone, "International");

            return formatedPhone;
          }
          else{
            formatedPhone = formatNumber("+" + item.phone, "International");

            return formatedPhone;
          }
        }
        else{
          return "Sin teléfono";
        }
      }

      evaluate(){
        const { contactPhone, contactName, contactLastName, genderSelected } = this.state;

        if(contactPhone == undefined){
          return false;
        }

        if(contactName == undefined || contactName == null || contactName.length < 1){
          this.setState({incorrect:true});
        }
        else if(contactPhone == undefined || contactPhone == null || contactPhone.length < 10){
          this.setState({incorrect:true});
        }
        else if(genderSelected == 0){
          this.setState({incorrect:true});
        }
        else{
          this.setState({incorrect:false});
          return true;
        }
      }

      deleteEmergencyContact(){
        let { existingContact } = this.state;

        this.setState({isLoading:true});

        EndpointRequests.RemoveEmergencyContact(existingContact, function(response){
          if(response.message === "Ok"){
            this.setState({isLoading:false});
              this.props.dispatch({type:"UPDATE_EMERGENCY_CONTACTS", Type:"Remove", contact:existingContact});

            this.props.clientState.DB.transaction((tx) => {
              tx.executeSql('DELETE FROM emergency_contacts WHERE user = ? AND contact = ?',
              [this.props.userState.Username, existingContact.jid],
              (txx, results) => {
                if (results.rowsAffected > 0) {
                  setTimeout(function(){
                    Alert.alert(
                     'Atención',
                     "El contacto de emergencia fue borrado con éxito.",
                     [
                       {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                     ],
                     { cancelable: false }
                    )

                    this.props.navigation.pop();
                  }.bind(this),200);
                }
                else{
                  setTimeout(function(){
                    Alert.alert(
                     'Atención',
                     "El contacto de emergencia fue borrado con éxito.",
                     [
                       {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                     ],
                     { cancelable: false }
                    )
                    this.props.navigation.pop();
                  }.bind(this),200);
                }
              })
            });
          }
          else{
            this.setState({isLoading:false});

            setTimeout(function(){
              Alert.alert(
               'Atención',
               response.message,
               [
                 {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
               ],
               { cancelable: false }
              )
            }.bind(this),200);
          }
        }.bind(this));
      }

      phoneInput(text){
        if(text == undefined || text == ""){
          return true;
        }
        let onlyDigits = /^[0-9]+$/;
        return onlyDigits.test(text);
      }

      chooseExistingContact(contactModel){
        this.setState({contactName:contactModel.name, contactPhone:contactModel.phone, fullPhone:contactModel.fullPhone });
        setTimeout(function(){
          this.evaluate();
        }.bind(this),200);
      }

      goToContactsList(){
        this.props.navigation.navigate("EmergencyContactsList", { chooseContact:(contactModel) => this.chooseExistingContact(contactModel)});
        this.setState({contactName:null, contactPhone:null, fullPhone:null, incorrect:true });
      }

      setValue(callback) {
        setTimeout(function(){
          this.evaluate();
        }.bind(this),200);
        this.setState(state => ({
          genderSelected: callback(state.value)
        }));
      }

      setOpen(open) {
        this.setState({
          genderOption: open
        });
      }

      _keyExtractor = (item, index) => index;

      render() {

        const { isLoading, selected, newContact, incorrect } = this.state;

        return (
          <TouchableWithoutFeedback style={{flex:1, height:height,width:width}} onPress={Keyboard.dismiss}>
          <View style={{backgroundColor:'#F4F4F4', flex:1, height:height,width:width}}>
          <Text style={{backgroundColor:'white', textAlign:'center', fontSize:14, color:'darkgray', padding:20}}>Los contactos en esta lista serán notificados siempre que detones una alerta, sin importar el grupo en que lo hagas.</Text>
          <View style={{backgroundColor:'white', height:160}}>
          <View style={styles.containerTitle}>
            <View style={{flex:.5}}>
            <Text style={styles.textTitle}>    Contacto</Text>
            </View>
            {!newContact ?
            <View style={{flex:.5}}>
              <TouchableOpacity onPress={() => this.goToContactsList()} style={{alignSelf:'flex-end', marginRight:20, height:45, justifyContent:'center'}}>
                <Icon type="antdesign" name="contacts" size={30} color="#0E75FA"/>
              </TouchableOpacity>
            </View>
            :
            null
            }
          </View>
          <View style={{paddingLeft:10, paddingRight:10}}>
          <Input value={this.state.contactName}
          onChangeText={(text) => {
            this.setState({contactName:text});
            setTimeout(function(){
              this.evaluate();
            }.bind(this),200);
            }} placeholder="Nombre" containerStyle={{ borderColor: 'grey', marginTop:10}}/>
          <PhoneInputView
            flagStyle={{width: 50, height: 30, marginLeft:13, marginRight:0,paddingRight:0, backgroundColor:'gray'}}
            incorrect={(values) => {
              this.setState({contactPhone:values.phone, fullPhone:values.fullPhone});
              setTimeout(function(){
                this.evaluate();
              }.bind(this),200);
            }} phone={this.state.fullPhone} />
          </View>
          </View>
          <View style={{zIndex:999999, height:120}}>
          <DropDownPicker
            placeholder="Selecciona género."
            open={this.state.genderOption}
            value={this.state.genderSelected}
            items={[{label: 'Masculino', value: 1},{label: 'Femenino', value: 2}]}
            setValue={(value) => this.setValue(value)}
            setOpen={(value) => this.setOpen(value)}
            dropDownContainerStyle={{
              backgroundColor: "white", width:width - 40, alignSelf:'center',borderColor:'transparent',borderRadius:0
            }}
            style={{backgroundColor: "white",borderColor:'black', paddingLeft:30, paddingRight:30,alignSelf:'center', borderTopWidth:.3,borderLeftWidth:0,borderRightWidth:0,borderBottomColor:'transparent',borderRightColor:'transparent', borderLeftColor:'transparent', borderRadius:0}}
            textStyle={{ fontSize:17,left:-7,borderColor:'transparent' }}
            placeholderStyle={{
              color: "darkgray",
              left:-7,
              borderColor:'transparent',
            }}
          />
          </View>
          {!newContact ?
            <View style={{backgroundColor:'#F4F4F4',margin:50}}>
            <ButtonAlt disabled={incorrect || newContact} loading={this.state.isLoading} onPress={() => this.addEmergencyUsers()} testID='SubmitUpdate' title="Guardar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:incorrect ? 'gray' : '#7CB185', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
             style={{alignSelf:'center'}} />
             </View>
             :
             null
           }

           {newContact ?
             <View style={{backgroundColor:'white',width:width/1.5, alignSelf:'center', marginTop:50}}>
             <Button
             title='Eliminar contacto'
            color='red'
            onPress={() => this.deleteEmergencyContact()}
            style={{backgroundColor:'white', alignSelf:'center'}}
            />
            </View>
            :
            null
          }
          </View>
          </TouchableWithoutFeedback>
          );
        }
      }

      const styles = StyleSheet.create({
      	containerTitle: {
      		flex: 0,backgroundColor:'#F4F4F4',height:45, flexDirection: 'row', alignItems: 'center'
      	},
      	textTitle: {
      		fontWeight:'bold',color:'grey', fontSize:20
      	},
      })
let EmergencyUsersContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(EmergencyUsers);
export default EmergencyUsersContainer;
