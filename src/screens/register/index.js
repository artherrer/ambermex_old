/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { StyleSheet,TouchableOpacity, Text,View, AsyncStorage, TextInput, WebView , ScrollView, Dimensions, Platform, Button, TouchableWithoutFeedback, Linking, Alert, Image, SafeAreaView, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Avatar, Input, Button as ButtonAlt } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'
import SigninLogo from '../signin/SigninLogo';
import PhoneInput from 'react-native-phone-input';
import PhoneInputView from "../settings/cmps/phone_input";
import EntitiesPicker from "./entities_picker.js";
const placeholder = require('../../../assets/image/profile_pholder.png');
import { connect } from 'react-redux';

var { height, width } = Dimensions.get('window');
import { APP_INFO } from '../../util/constants';

import ImagePicker from 'react-native-image-crop-picker';
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

let header = headerHeight;
let copomexStateList = [
            {name: "Aguascalientes", value:1},
            {name:"Baja California", value:2},
            {name:"Baja California Sur", value:3},
            {name:"Campeche", value:4},
            {name:"Coahuila de Zaragoza", value:5},
            {name:"Colima", value:6},
            {name:"Chiapas", value:7},
            {name:"Chihuahua", value:8},
            {name: "Ciudad de México", value:9},
            {name:"Durango", value:10},
            {name:"Guanajuato", value:11},
            {name:"Guerrero", value:12},
            {name:"Hidalgo", value:13},
            {name:"Jalisco", value:14},
            {name:"México", value:15},
            {name:"Michoacán de Ocampo", value:16},
            {name:"Morelos", value:17},
            {name:"Nayarit", value:18},
            {name:"Nuevo León", value:19},
            {name:"Oaxaca", value:20},
            {name:"Puebla", value:21},
            {name:"Querétaro", value:22},
            {name:"Quintana Roo", value:23},
            {name:"San Luis Potosí", value:24},
            {name:"Sinaloa", value:25},
            {name:"Sonora", value:26},
            {name:"Tabasco", value:27},
            {name:"Tamaulipas", value:28},
            {name:"Tlaxcala", value:29},
            {name:"Veracruz de Ignacio de la Llave", value:30},
            {name:"Yucatán", value:31},
            {name:"Zacatecas", value:32}
]
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

class RegisterUser extends React.Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:"Nuevo Registro"
  });

  constructor(props) {
    super(props);

    this.state = {
      username:null,
      name:null,
      lastName:null,
      phone:"+52",
      password:null,
      confirmPassword:null,
      errorMessage:null,
      fullPhone:null,
      postalCode:null,
      entity:null,
      address1:null,
      city:null,
      state:null,
      unit:null,
      showAddress:false,
      entityList:[],
      entitiesLoaded:false,
      showEntityList:false,
      stateValue:0
    }
  }

  componentDidMount(){

  }

  validateEmail(email) {
    var re = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/;
    return re.test(String(email));
  }

  saveUser(){

    const { username, name, lastName, fullPhone, password, address1, state, entity, unit, city, postalCode, stateValue } = this.state;

    let UserObject = {
      firstName: name,
      lastName: lastName,
      email:username,
      phone: fullPhone,
      externalId: fullPhone,
      password:password,
      address:{
        address1: address1,
        address2: unit,
        city: city,
        state: stateValue,
        entity: entity,
        postalCode: postalCode
      }
    };

    EndpointRequests.Register(UserObject, function(responseData) {
      if(responseData.message != "Ok" || responseData.message === undefined){
        if(responseData.message === undefined){
          let error;

          for (var key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              error = responseData[key];
            }
          }

          if(Array.isArray(error)){
            Alert.alert(
             'Atención',
             error[0],
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }

          this.setState({isLoading:false});
        }
        else{
          this.setState({isLoading:false, errorMessage:responseData.message});
        }
      }
      else{
        EndpointRequests.setUserCreds(responseData.token, responseData.refresh, responseData.exp, responseData.username, responseData.key, "not_verified", responseData.locationToken, responseData.locTokenExpiration);
        this.props.dispatch({type:"SET_USERDATA", UserData:responseData.user_data});
        this.props.dispatch({type:"ADD_USERNAME", Username:responseData.username, Password:responseData.key});
        this.props.clientState.DB.transaction((tx) => {
          tx.executeSql('INSERT OR REPLACE INTO users (username, JID, name, picture, address, unit, phone, last_name, is_member_loaded, info_updated_at, alias) VALUES (?, ?, ?, ?, ?, ?, ? ,?, ?, ?, ?)',
          [responseData.user_data.nickname, responseData.username, responseData.user_data.name, responseData.user_data.pictureUrl, "", "", responseData.user_data.phone, responseData.user_data.lastName, 'true', new Date().toISOString(), responseData.user_data.alias],
          (txx, results) => {
            if (results.rowsAffected > 0 ) {
              this.props.navigation.navigate("VerifyCode", {Creds:{Username:responseData.username, Password:responseData.key}});
            }
          })
        });

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
          this.setState({picture:pic, pictureExists:true });
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
         'Atención',
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
          this.saveUser();
        }.bind(this),300);
      }
    }.bind(this));
  }

  verifyInfo(){
    const { username, name, lastName, phone, password, confirmPassword, address1, postalCode, unit, city, entity, state } = this.state;

    if(username == null || username.length == 0 || lastName == null || lastName.length == 0 || name == null || name.length == 0 || phone == null || phone.length < 10){
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
    else if(password == null || password.length < 5){
      Alert.alert(
       'Atención',
       "Por favor, ingresa una contraseña de al menos 5 caracteres",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else if(password != confirmPassword){
      Alert.alert(
       'Atención',
       "Las contraseñas no coinciden. Favor de ingresarla de nuevo.",
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
       "Por favor, ingrese una dirección de correo valida y en letras minúsculas.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else if(address1 == undefined || address1.length <= 2 || unit == undefined || unit.length <= 1 || postalCode == undefined || postalCode.length <= 2 || entity == undefined || entity.length <= 2  ){
      Alert.alert(
       'Atención',
       "Por favor, ingrese una dirección valida.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      return false;
    }
    else{
      this.setState({isLoading:true, errorMessage:null});
      this.saveUser();
    }
  }

  gotoTerms(){
    Linking.openURL("https://www.botonambermex.com/terminos-de-uso").catch((err) => console.error('An error occurred', err));
  }

  gotoPrivacy(){
    Linking.openURL("https://www.botonambermex.com/politicas-de-privacidad").catch((err) => console.error('An error occurred', err));
  }

  postalCodeLookup(){
    let { postalCode } = this.state;
    if(postalCode == undefined || postalCode == null){
      alert("Por favor, ingresa un código postal válido para seguir con el proceso de registro.");
      return false;
    }
    let isnum = /^\d+$/.test(postalCode);
    if(postalCode.length <= 4 || !isnum){
      alert("Por favor, ingresa un código postal de México válido.");
      return false;
    }
    else{
      EndpointRequests.FetchbyPostalCode(postalCode, function(responseData) {
        if(responseData.error){
          Alert.alert(
           'Atención',
           responseData.error.message,
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

          this.setState({isLoading:false});
        }
        else{
          if(responseData.entities == undefined || responseData.entities.length == 0){
            alert("Hubo un error al llenar la lista de colonias, por favor ingresa un código postal válido para continuar.");
            return false;
          }
          let entityList = [];
          for(let i = 0; i < responseData.entities.length;i++){
            entityList.push({name:responseData.entities[i], selected:false});
          }
          let stateValue = 0;
          let stateIndex = copomexStateList.findIndex(x => x.name == responseData.state);
          if(stateIndex >= 0){
            stateValue = copomexStateList[stateIndex].value;
          }
          this.setState({entitiesLoaded:true, state:responseData.state, city:responseData.city, entityList: entityList, stateValue:stateValue});
        }
      }.bind(this));
    }
  }

  selectEntity(entity){
    let { entityList } = this.state;
    let index = entityList.findIndex(x => x.name == entity.name);
    if(index >= 0){
      for(let i = 0; i < entityList.length;i++){
        if(i != index){
          entityList[i].selected = false;
        }
        else{
          entityList[i].selected = true;
        }
      }
    }
    this.setState({entity:entity.name, showEntityList:false});
  }

  render() {
    let { showAddress } = this.state;
    return (
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={Platform.OS === 'ios' ? header : 0}>
      <TouchableWithoutFeedback style={{height: height  - header, backgroundColor: 'white'}} onPress={Keyboard.dismiss}>
      <ScrollView style={{backgroundColor: 'white', flex:1}}>
      <View style={{ justifyContent:'space-around',height: height  - header}}>
      <View style={styles.container}>
        <Image style={{height:height*.15, width:height*.15}} resizeMode="contain" source={require('../../../assets/image/logo_with_text.png')} />
      </View>
      <View style={{width:width, paddingRight:20, paddingLeft:20, justifyContent:'center'}}>
      {!showAddress ?
        <View>
      <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25 }} maxFontSizeMultiplier={1.25} onSubmitEditing={() => this.lastNameInput.focus()} returnKeyType="next" placeholder="Nombre" autoCapitalize="words" value={this.state.name} onChangeText={(text) => this.setState({name:text})}/>
      <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.lastNameInput = ref; }} onSubmitEditing={() => this.emailInput.focus()} returnKeyType="next" testID='LastName' maxFontSizeMultiplier={1.25} placeholder="Apellido" autoCapitalize="words" value={this.state.lastName} onChangeText={(text) => this.setState({lastName:text})}/>
      <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.emailInput = ref; }} onSubmitEditing={() => this.passwordInput.focus()} returnKeyType="next" maxFontSizeMultiplier={1.25} disabled={false} style={{fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold'}} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={this.state.username} onChangeText={(text) => this.setState({username:text.trim()})}/>
      <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.passwordInput = ref; }} onSubmitEditing={() => {this.confirmpasswordInput.focus()}} returnKeyType="next" testID='Password1' maxFontSizeMultiplier={1.25} blurOnSubmit={false} placeholder="Contraseña" autoCapitalize="none" secureTextEntry={true} value={this.state.password} onChangeText={(text) => this.setState({password:text})}/>
      <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.confirmpasswordInput = ref; }} testID='Password2' maxFontSizeMultiplier={1.25} blurOnSubmit={false} onSubmitEditing={()=> Keyboard.dismiss()} placeholder="Confirmar Contraseña" autoCapitalize="none" secureTextEntry={true} value={this.state.confirmPassword} onChangeText={(text) => this.setState({confirmPassword:text})}/>
      <PhoneInputView
        flagStyle={{width: 50, height: 30, marginLeft:13}}
        style={{height:40, marginBottom:10, borderStyle: 'solid', borderWidth: 1, borderColor: 'grey', borderRadius: 25, top:0}}
        incorrect={(values) => {
          this.setState({phone:values.phone, fullPhone:values.fullPhone});
        }} phone={this.state.fullPhone} />
        <View style={{flexDirection:'row',marginTop:15,marginBottom:10, alignSelf:'center'}}>
          <Text style={{fontWeight:'400',fontSize:12.5, color:'grey', textAlign:'center', justifyContent:'center'}}>
          Te enviaremos un código por SMS para verificar tu número de teléfono.
          Selecciona tu país y escribe tu número de teléfono.
          </Text>
        </View>
        </View>
        :
        <View>
        <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25 }} maxFontSizeMultiplier={1.25} onSubmitEditing={() => this.unitInput.focus()} returnKeyType="next" placeholder="Calle" autoCapitalize="words" value={this.state.address1} onChangeText={(text) => this.setState({address1:text})}/>
        <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.unitInput = ref; }}  onSubmitEditing={() => this.postalCodeInput.focus()} returnKeyType="next" maxFontSizeMultiplier={1.25} placeholder="No. exterior" value={this.state.unit} onChangeText={(text) => this.setState({unit:text})}/>
        <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} ref={(ref) => { this.postalCodeInput = ref; }} onSubmitEditing={() => this.postalCodeLookup()} onBlur={() => this.postalCodeLookup() } returnKeyType="next" maxFontSizeMultiplier={1.25} placeholder="Código postal" value={this.state.postalCode} keyboardType={"number-pad"} onChangeText={(text) => this.setState({postalCode:text})}/>
        <TouchableOpacity disabled={!this.state.entitiesLoaded} onPress={() => this.setState({showEntityList:true})} style={{justifyContent:'center',height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}}>
        <Text style={{fontSize:19, color:this.state.entity != undefined ? 'black' : 'lightgray',marginLeft:10}}>
        {this.state.entity != undefined ? this.state.entity : "Colonia"}
        </Text>
        </TouchableOpacity>
        <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} returnKeyType="next" maxFontSizeMultiplier={1.25} style={{fontSize:16, color:'black'}} disabled={true} placeholder="Ciudad" autoCapitalize="none" value={this.state.city} onChangeText={(text) => this.setState({city:text})}/>
        <Input containerStyle={{height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} returnKeyType="next" maxFontSizeMultiplier={1.25} style={{fontSize:16, color:'black'}} blurOnSubmit={false} placeholder="Estado" autoCapitalize="none" disabled={true} value={this.state.state} onChangeText={(text) => this.setState({state:text})}/>
        </View>
      }
      </View>
      {this.state.errorMessage != undefined ?
        <Text numberOfLines={2} style={{marginBottom:5,alignSelf:'center',color:'red', textAlign:'center', width:width/1.25, padding:5}}>{this.state.errorMessage}</Text>
        :
        null
      }
      {!showAddress ?
        <View>
        <ButtonAlt testID='SubmitUpdate' loading={this.state.isLoading} disabled={this.state.isLoading} title="Siguiente" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
        onPress={() => this.setState({showAddress:true})} style={{alignSelf:'center'}} />
        </View>
        :
        <View>
        <ButtonAlt loading={this.state.isLoading} disabled={this.state.isLoading} title="Atras" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'lightblue', borderRadius:25, alignSelf:'center'}} backgroundColor="black"
        onPress={() => this.setState({showAddress:false})} style={{alignSelf:'center',marginBottom:5}} />
        <ButtonAlt testID='SubmitUpdate' loading={this.state.isLoading} disabled={this.state.isLoading} title="Registrate" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25, alignSelf:'center', marginTop:10}} backgroundColor="black"
        onPress={() => this.verifyInfo()} style={{alignSelf:'center'}} />
        <View style={{flexDirection:'row',marginTop:10,marginBottom:15, paddingLeft:20, paddingRight:20}}>
          <Text style={{fontWeight:'400',fontSize:12.5, color:'grey', textAlign:'center', justifyContent:'center'}}>
          Al tocar "Registrarse", confirmas que leíste los <Text onPress={() => this.gotoTerms()} style={{color:'#97B297'}}>Términos de servicio</Text> y la <Text  onPress={() => this.gotoPrivacy()} style={{color:'#97B297'}}>Política de privacidad.</Text>
          </Text>
        </View>
        </View>
      }
      </View>
      </ScrollView>
      </TouchableWithoutFeedback>
      <EntitiesPicker selectEntity={(entity) => this.selectEntity(entity)} entityList={this.state.entityList} closeEntityPicker={() => this.setState({showEntityList:false})} showEntityList={this.state.showEntityList} />
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
    padding:15
	},
	imageSize: {
		width: width*.25,
		height: height*.25
	},
})
let RegisterUserContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(RegisterUser);
export default RegisterUserContainer;
