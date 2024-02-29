/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { View, Modal, AsyncStorage, TextInput,  WebView, ScrollView, Platform, Keyboard, KeyboardAvoidingView, Text, TouchableWithoutFeedback, Dimensions, Button, Linking, Alert, Image } from 'react-native';
import { Avatar, Input, Button as ButtonAlt, Icon } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'
import DateTimePicker from '@react-native-community/datetimepicker';

import PhoneInput from 'react-native-phone-input';
import { formatNumber } from "libphonenumber-js";
import { APP_INFO } from '../../util/constants';

const placeholder = require('../../../assets/image/profile_pholder.png');
import { connect } from 'react-redux';

var { height, width } = Dimensions.get('window');
import moment from "moment";
const cloneDeep = require('lodash/cloneDeep');

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

let header = headerHeight;

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

class MedicalData extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Ficha médica",
    headerBackTitle: ' ',
    headerLeftContainerStyle:{
      padding:10,
      paddingLeft:0
    },
    headerTintColor: '#7D9D78',
    headerTitleStyle: {color:'black'},
  });

  constructor(props) {
    super(props);

    this.state = {
      bloodtype:this.props.userState.UserData.medicalData != undefined ? this.props.userState.UserData.medicalData.bloodType : null,
      allergies:this.props.userState.UserData.medicalData != undefined ? this.props.userState.UserData.medicalData.allergies : "Ninguno",
      ailments:this.props.userState.UserData.medicalData != undefined ? this.props.userState.UserData.medicalData.ailments : "Ninguno",
      medications:this.props.userState.UserData.medicalData != undefined ? this.props.userState.UserData.medicalData.medications : "Ninguno",
      weight:this.props.userState.UserData.medicalData != undefined ? String(this.props.userState.UserData.medicalData.weight) : null,
      userHeight:this.props.userState.UserData.medicalData != undefined ? String(this.props.userState.UserData.medicalData.height) : null,
      isLoading:false,
      pictureUpdate:false,
      invalid:true
    }
  }

  componentDidMount(){

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  saveUser(){

    const { bloodtype, allergies, ailments, medications, weight, userHeight } = this.state;

    let MedicalDataModel = {
      bloodType:bloodtype,
      allergies: allergies,
      ailments: ailments,
      medications:medications,
      weight:weight,
      height: userHeight
    };

    EndpointRequests.AddOrUpdateMedical(MedicalDataModel, function(responseData) {
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
          let UserObject = cloneDeep(this.props.userState.UserData);
          UserObject.medicalData = MedicalDataModel;
          UserObject.medicalDataAdded = true;

          this.props.dispatch({type:"SET_USERDATA", UserData:UserObject});

          this.setState({isLoading:false});

          AsyncStorage.setItem("MedicalData", JSON.stringify(MedicalDataModel), (asyncError) => {

          });

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
            {text: 'Ir a Permisos', onPress: () => {
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
    const { bloodtype, allergies, ailments, medications, weight, userHeight } = this.state;

    if(bloodtype == null || bloodtype.length == 0 || allergies == undefined || ailments == null || ailments.length == 0 || medications == null || medications.length == 0 || weight == undefined || userHeight == undefined || userHeight == "" || weight == ""){
      Alert.alert(
       'Atención',
       "Los datos están incompletos. Favor de llenar todos los campos e intentar de nuevo.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else if(!this.validateNumeric(weight)){
      Alert.alert(
       'Atención',
       "El peso esta en formato incorrecto. Solo se aceptan números y un punto.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else if(!this.validateNumeric(userHeight)){
      Alert.alert(
       'Atención',
       "La estatura esta en formato incorrecto. Solo se aceptan números y un punto.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else{
      this.setState({isLoading:true});

      this.saveUser();
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

  validateNumeric(value){
    if(value === "" || value == undefined){
      return true;
    }

    let regex = /^[+-]?\d+(\.\d+)?$/;
    return regex.test(String(value));
  }

  render() {

    const { pictureExists, picture, pictureUpdate } = this.state;

    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: 'white', height:height,justifyContent:'center'}} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <TouchableWithoutFeedback style={{ height:height,backgroundColor: 'white',justifyContent:'center'}} onPress={Keyboard.dismiss}>
      <ScrollView style={{flex:1, backgroundColor: 'white'}}>
      <View style={{marginTop:20,width:width, paddingRight:20, paddingLeft:20, justifyContent:'center'}}>
      <View style={{justifyContent:'center', height:80, padding:10, flexDirection:'row'}}>
      <Avatar
        rounded
        source={ pictureUpdate ? {uri:picture.uri} : (this.props.userState.UserData.pictureUrl != undefined ? { uri:this.props.userState.UserData.pictureUrl } : placeholder)}
        size="large"
        avatarStyle={{height:100,width:100, borderRadius:50}}
        containerStyle={{marginBottom:10, height:100,width:100, borderRadius:50}}
      />
      </View>
      <View style={{marginTop:40}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888', marginBottom:5}}>Grupo sanguíneo</Text>
      <Input containerStyle={{height:30, marginBottom:5, borderBottomColor:'gray'}}
      onSubmitEditing={() => this.alergies.focus()} autoCorrect={false}
      inputContainerStyle={{height:30}} inputStyle={{fontSize:14}}
      rightIcon={
        this.state.bloodtype == undefined || this.state.bloodtype === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
       maxFontSizeMultiplier={1.25}
       placeholder="" autoCapitalize="words" value={this.state.bloodtype} onChangeText={(text) => this.setState({bloodtype:text})}/>
      </View>
      <View style={{marginTop:0}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888',marginBottom:5}}>Alergias</Text>
      <Input containerStyle={{height:30, marginBottom:5}} autoCorrect={false}
      inputContainerStyle={{height:30}} inputStyle={{fontSize:14}}
      ref={(ref) => { this.alergies = ref; }} onSubmitEditing={() => this.ailments.focus()}
      rightIcon={
        this.state.allergies == undefined || this.state.allergies === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
      maxFontSizeMultiplier={1.25} placeholder=""
      onKeyPress={({ nativeEvent }) => {
        if(nativeEvent.key === 'Backspace' && this.state.allergies === 'Ningun'){
          this.setState({allergies:""});
        }
        }}
      autoCapitalize="words" value={this.state.allergies} onChangeText={(text) => {
        if(this.state.allergies === "" && text.startsWith("Ningu")){
          this.setState({allergies:""});
        }
        else{
          this.setState({allergies:text});
        }
        }}/>
      </View>
      <View style={{marginTop:0}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888',marginBottom:5}}>Padecimientos médicos</Text>
      <Input autoCorrect={false} inputContainerStyle={{height:30}}
      ref={(ref) => { this.ailments = ref; }} onSubmitEditing={() => this.medications.focus()}
      rightIcon={
        this.state.ailments == undefined || this.state.ailments === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
      containerStyle={{height:30, marginBottom:5}} inputStyle={{fontSize:14}}
      onKeyPress={({ nativeEvent }) => {
        if(nativeEvent.key === 'Backspace' && this.state.ailments === 'Ningun'){
          this.setState({ailments:""});
        }
        }}
      testID='ailments' maxFontSizeMultiplier={1.25} placeholder="" autoCapitalize="words" value={this.state.ailments} onChangeText={(text) => {
        if(this.state.ailments === "" && text.startsWith("Ningu")){
          this.setState({ailments:""});
        }
        else{
          this.setState({ailments:text});
        }
        }}/>
      </View>

      <View style={{marginTop:0}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888',marginBottom:5}}>Medicamentos</Text>
      <Input containerStyle={{height:30,marginBottom:5}} autoCorrect={false}
      inputContainerStyle={{height:30}}
      ref={(ref) => { this.medications = ref; }} onSubmitEditing={() => this.weight.focus()}
      rightIcon={
        this.state.medications == undefined || this.state.medications === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
      maxFontSizeMultiplier={1.25} inputStyle={{fontSize:14}}
      onKeyPress={({ nativeEvent }) => {
        if(nativeEvent.key === 'Backspace' && this.state.medications === 'Ningun'){
          this.setState({medications:""});
        }
      }}
      style={{fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold'}} placeholder="" value={this.state.medications} onChangeText={(text) => {
        if(this.state.medications === "" && text.startsWith("Ningu")){
          this.setState({medications:""});
        }
        else{
          this.setState({medications:text});
        }
        }}/>
      </View>

      <View style={{marginTop:0}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888',marginBottom:5}}>Peso (kg)</Text>
      <Input containerStyle={{height:30, marginBottom:5}}
      inputContainerStyle={{height:30}} inputStyle={{fontSize:14}}
      ref={(ref) => { this.weight = ref; }} onSubmitEditing={() => this.height.focus()}
      rightIcon={
        this.state.weight == undefined || this.state.weight === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
      maxFontSizeMultiplier={1.25} keyboardType='numeric'
      placeholder="" autoCapitalize="none" value={this.state.weight}
      onChangeText={(text) => this.setState({weight:text})}/>
      </View>
      <View style={{marginTop:0}}>
      <Text style={{fontSize:12,marginLeft:10, top:5, color:'#888888',marginBottom:5}}>Estatura (mts)</Text>
      <Input containerStyle={{height:30, marginBottom:5}}
      inputContainerStyle={{height:30}} inputStyle={{fontSize:14}}
      ref={(ref) => { this.height = ref; }} onSubmitEditing={() => Keyboard.dismiss}
      rightIcon={
        this.state.userHeight == undefined || this.state.userHeight === "" ?
        <Icon type="feather" name="alert-circle" color="red" size={25} />
        :
        <Icon type="feather" name="alert-circle" color="transparent" size={25} />
      }
      maxFontSizeMultiplier={1.25} keyboardType='numeric'
      style={{fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold'}} placeholder="" autoCapitalize="none" value={this.state.userHeight} onChangeText={(text) => this.setState({userHeight:text})}/>
      </View>
      <Text style={{width:width/1.25,alignSelf:'center', color:'red', fontSize:12, textAlign:'center', marginTop:15}}>* Estos datos serán proporcionados a los paramédicos cuando cuentes con cobertura médica y solicites ayuda.</Text>
      <ButtonAlt testID='SubmitUpdate' loading={this.state.isLoading} disabled={this.state.isLoading} title="Guardar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25,alignSelf:'center', marginTop:25}} backgroundColor="black"
      onPress={() => this.verifyInfo()} style={{alignSelf:'center', marginTop:25}} />
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

let MedicalDataContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(MedicalData);
export default MedicalDataContainer;
