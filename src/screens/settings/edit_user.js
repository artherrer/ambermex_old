/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { View, Modal, AsyncStorage, TextInput,  WebView, ScrollView, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, TouchableOpacity, Dimensions, Button, Linking, Alert, Image } from 'react-native';
import { Avatar, Input, Button as ButtonAlt, Icon } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'
import DateTimePicker from '@react-native-community/datetimepicker';

import PhoneInput from 'react-native-phone-input';
import { formatNumber } from "libphonenumber-js";
import PhoneInputView from "./cmps/phone_input";
const placeholder = require('../../../assets/image/profile_pholder.png');
import { connect } from 'react-redux';

var { height, width } = Dimensions.get('window');
import moment from "moment";
const cloneDeep = require('lodash/cloneDeep');
import { APP_INFO } from '../../util/constants';

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

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

class EditUser extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Mi Cuenta"
  });

  constructor(props) {
    super(props);

    let a = moment(this.props.userState.UserData.dob);
    let b = moment(new Date());

    let difference = b.diff(a, 'years');

    this.state = {
      username:this.props.userState.UserData.email,
      name:this.props.userState.UserData.name,
      lastName:this.props.userState.UserData.lastName,
      phone:this.props.userState.UserData.phone,
      alias:this.props.userState.UserData.alias,
      address:this.props.userState.UserData.address,
      unit:this.props.userState.UserData.unit,
      pictureExists:this.props.userState.UserData.hasPicture,
      picture:{uri:this.props.userState.UserData.pictureUrl},
      countryCode:this.props.userState.UserData.phone.startsWith("+1") ? "+1" : "+52",
      fullPhone:this.props.userState.UserData.phone,
      showDate:false,
      dob:difference > 3 ? moment(this.props.userState.UserData.dob).format('MM/DD/YYYY') : undefined,
      dobDate:this.props.userState.UserData.dob != undefined ? new Date(this.props.userState.UserData.dob) : new Date(1900,1,1),
      pictureUpdate:false
    }
  }

  componentDidMount(){

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  saveUser(){

    const { username, name, lastName, fullPhone, alias, pictureExists, pictureUpdate, dob, dobDate, picture, pictureUrl, unit, userInfo, address } = this.state;

    let UserObjectModel = {
      jid:this.props.userState.Username,
      name: name,
      lastName: lastName,
      alias:alias,
      email:username,
      address: null,
      unit: null,
      hasPicture: pictureExists,
      pictureUrl: pictureUpdate ? pictureUrl : this.props.userState.UserData.pictureUrl,
      phone: fullPhone.replace(/ /g, ''),
      dob: dobDate,
      completeProfile: true
    };

    let UserObject = cloneDeep(this.props.userState.UserData);

    UserObject.pictureExists = pictureExists;
    UserObject.pictureUrl = UserObjectModel.pictureUrl;
    UserObject.name = name;
    UserObject.lastName = lastName;
    UserObject.address = address;
    UserObject.unit = unit;
    UserObject.phone = UserObjectModel.phone;
    UserObject.dob = dobDate;
    UserObject.completeProfile = true;
    UserObject.alias = UserObjectModel.alias;

    EndpointRequests.UpdateUser(UserObjectModel, function(responseData) {
      if(responseData.error != undefined || responseData.message != "Ok"){
        if(responseData.error == undefined){
          let message = "";
          for (const key of Object.keys(responseData)) {
            message = message + responseData[key] + " ";
          }

          Alert.alert(
           'Atención',
           message,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          this.setState({isLoading:false});
        }
        else{
          Alert.alert(
           'Atención',
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
        if(responseData.message === "Ok"){
          this.props.dispatch({type:"SET_USERDATA", UserData:UserObject});

          this.setState({isLoading:false});

          Alert.alert(
           'Éxito',
           "Tu información ha sido actualizada.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          this.props.navigation.pop();
        }
      }
    }.bind(this));
  }

  loadPictures(){

    ImagePicker.openPicker({
      multiple: false,
      compressImageQuality:0.8,
      width: width/2,
      height: height/2,
      compressImageMaxWidth: width/2,
      compressImageMaxHeight: height/2,
      mediaType:'photo'
    }).then(image => {

      if(image != null){
        var pic = {uri:image.path,width:image.width,source:image.sourceURL,height:image.height,mime:image.mime};

        setTimeout(function(){
          this.setState({picture:pic, pictureUpdate:true });
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

  uploadPicture(){
    var { picture } = this.state;

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

        this.setState({pictureUrl:responseData.secure_url});

        setTimeout(function(){
          this.saveUser();
        }.bind(this),300);
      }
    }.bind(this));
  }

  verifyInfo(){
    const { username, name, lastName, phone, pictureUpdate, alias, picture, pictureUrl, unit, dob } = this.state;

    if(username == null || username.length == 0 || dob == undefined || lastName == null || lastName.length == 0 || name == null || name.length == 0 || phone == null || phone.length < 10 || alias == null || alias.length < 1){
      Alert.alert(
       'Atención',
       "Los datos estan incompletos. Favor de llenar todos los campos e intentar de nuevo.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else if(!this.validateEmail(username)){
      Alert.alert(
       'Atención',
       "Por favor, ingrese una direccion de email valida.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else{
      this.setState({isLoading:true});

      if(pictureUpdate){
        this.uploadPicture();
      }
      else{
        this.saveUser();
      }
    }
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

  changeDOB(dateObj){

    if(dateObj == undefined){
      return false;
    }

    let a = moment(dateObj);
    let b = moment(new Date());

    let difference = b.diff(a, 'years');

    if(difference <= 3){
      this.setState({showDate:false, dobDate:dateObj});
    }
    else{
      let dateString = a.format('MM/DD/YYYY');
      this.setState({dob:dateString, showDate:false, dobDate:dateObj});
    }
  }

  chooseDate(){
    let { dob, dobDate } = this.state;

    let a = moment(dobDate);
    let b = moment(new Date());

    let difference = b.diff(a, 'years');

    if(difference <= 3){
      this.setState({showDate:false});
    }
    else{
      let dateString = moment(dobDate).format('MM/DD/YYYY');
      this.setState({dob:dateString, showDate:false});
    }
  }

  render() {

    const { pictureExists, picture, pictureUpdate, showDate } = this.state;

    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:height}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <TouchableWithoutFeedback style={{ backgroundColor: 'white'}} onPress={Keyboard.dismiss}>
      <ScrollView style={{flex:1,backgroundColor: 'white'}}>
      <View style={{marginTop:20,flex:1, width:width, paddingRight:20, paddingLeft:20, justifyContent:'flex-start'}}>
      <View style={{justifyContent:'center', height:80, padding:10, flexDirection:'row'}}>
      <Avatar
        rounded
        source={ pictureUpdate ? {uri:picture.uri} : (this.props.userState.UserData.pictureUrl != undefined ? { uri:this.props.userState.UserData.pictureUrl } : placeholder)}
        size="large"
        avatarStyle={{height:100,width:100, borderRadius:50}}
        containerStyle={{marginBottom:10, height:100,width:100, borderRadius:50}}
        showAccessory={false}
        onAccessoryPress={() => console.log("loadpictures")}
      />
      </View>
      <Input containerStyle={{marginTop:40,height:40, marginBottom:10, borderBottomColor:'gray'}}
      editable={false}
      disabled={true}
      rightIcon={
        this.state.name == undefined || this.state.name === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={30} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={30} />
      }
       maxFontSizeMultiplier={1.25}
       placeholder="Nombre" autoCapitalize="words" value={this.state.name} onChangeText={(text) => this.setState({name:text})}/>
      <Input containerStyle={{height:40, marginBottom:10}}
      editable={false}
      disabled={true}
      rightIcon={
        this.state.lastName == undefined || this.state.lastName === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={30} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={30} />
      }
      testID='LastName' maxFontSizeMultiplier={1.25} placeholder="Apellido"
      autoCapitalize="words" value={this.state.lastName} onChangeText={(text) => this.setState({lastName:text})}/>
      <TouchableOpacity disabled={true}>
      <Input
      editable={false}
      disabled={true}
      rightIcon={
        this.state.dob == undefined || this.state.dob === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={30} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={30} />
      }
      style={{color:'gray'}}
      containerStyle={{height:40, marginBottom:30,color:'gray'}}
      testID='DOB' maxFontSizeMultiplier={1.25} placeholder="Fecha de Nacimiento" autoCapitalize="words" value={this.state.dob} onChangeText={(text) => this.setState({dob:text})}/>
      </TouchableOpacity>
      <PhoneInputView
        editable={false}
        style={{height:45,marginBottom:0, paddingTop:0,paddingBottom:15,paddingLeft:10,marginLeft:10,marginRight:10, paddingRight:10, borderBottomColor:'gray', borderBottomWidth:1}}
        incorrect={(values) => {
          this.setState({phone:values.phone, fullPhone:values.fullPhone, countryCode:values.countryCode});
        }} phone={this.state.fullPhone} />
      <Input containerStyle={{height:40, marginBottom:10, marginTop:-10}}
      rightIcon={
        (this.state.username == undefined || this.state.username === "") || !this.props.userState.UserData.verifiedEmail ?
        <Icon type="feather" name="alert-circle" color="red" size={30} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={30} />
      }
      maxFontSizeMultiplier={1.25} disabled={true}
      style={{fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold'}} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={this.state.username} onChangeText={(text) => this.setState({username:text})}/>
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
      {showDate ?
        <DateTimePicker
        value={this.state.dobDate}
        display="spinner"
        locale="es-MX"
        minimumDate={new Date(1900,1,1)}
        maximumDate={new Date()}
        onChange={(event, date) => this.changeDOB(date)} />
      :
      null
      }
      </KeyboardAvoidingView>
    );
  }
}

let EditUserContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(EditUser);
export default EditUserContainer;
