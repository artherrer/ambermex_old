import React, { Component } from 'react'
import { TouchableWithoutFeedback,Keyboard,Dimensions,ScrollView,KeyboardAvoidingView, View,StatusBar, Alert, ActivityIndicator, Platform } from 'react-native'
import SigninLogo from '../signin/SigninLogo'
import { Input, Button as ButtonAlt } from 'react-native-elements';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
import PhoneInput from 'react-native-phone-input';

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

export default class Signin extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: navigation.state.params != undefined && navigation.state.params.loading ?
                  () => <ActivityIndicator size="small" color="#0E75FA" style={{alignSelf:'center'}} />
                  :
                  "Aplicar Registro"
    });

    constructor(props) {
      super(props);

      this.state = {
        email:null,
        name:null,
        lastName:null,
        phone:null
      }
    }

    sendApplication(){
      const { email, name, lastName, phone } = this.state;

      let applyModel = {
        email:email,
        firstName:name,
        lastName:lastName,
        phone:phone
      };

      Alert.alert(
       'Éxito',
       "Tus datos fueron enviados a nuestro personal, estaremos en contacto contigo para dar seguimiento a tu aplicación.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )

      this.props.navigation.pop();
    }

    validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    validatePhone(phone){
      var re = /^[0-9]+$/;
      return re.test(String(phone));
    }

    wrongPhoneMessage(){
      Alert.alert(
       'Atención',
       "Tu número de teléfono es incorrecto, verifica que solo tenga números y que sean 10 dígitos despues del código del país.",
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
    }

    verifyInfo(){
      const { email, name, lastName, phone } = this.state;

      if(phone != undefined){
        if(phone.startsWith("+52")){
          let checkPhone = phone.split("+52")[1];

          if(checkPhone.length < 10 || !this.validatePhone(checkPhone)){
            this.wrongPhoneMessage();
            return false;
          }
        }
        else if(phone.startsWith("+1")){
          let checkPhone = phone.split("+1")[1];

          if(checkPhone.length < 10 || !this.validatePhone(checkPhone)){
            this.wrongPhoneMessage();
            return false;
          }
        }
        else{
          this.wrongPhoneMessage();
          return false;
        }
      }
      else{
        this.wrongPhoneMessage();
        return false;
      }

      if(email == null || email.length == 0 || lastName == null || lastName.length == 0 || name == null || name.length == 0){
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
      else if(!this.validateEmail(email)){
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
        this.sendApplication();
      }
    }

    render() {
        const { navigation } = this.props

        return (
            <TouchableWithoutFeedback style={{backgroundColor: 'white', flex:1}} onPress={Keyboard.dismiss}>
            <View style={{backgroundColor:'white',flex:1, padding:20}}>
            <StatusBar barStyle={'dark-content'} />
            <SigninLogo />
            <View style={{backgroundColor:'white', width:width/1.3,alignSelf:'center'}}>
              <Input containerStyle={{height:40, marginBottom:10, overflow: 'hidden', borderBottomWidth:1, borderColor:'grey'}} maxFontSizeMultiplier={1.25} onSubmitEditing={() => this.lastNameInput.focus()} returnKeyType="next" placeholder="Nombre" autoCapitalize="words" value={this.state.name} onChangeText={(text) => this.setState({name:text})}/>
              <Input containerStyle={{height:40, marginBottom:10, overflow: 'hidden', borderBottomWidth:1, borderColor:'grey'}} ref={(ref) => { this.lastNameInput = ref; }} onSubmitEditing={() => this.emailInput.focus()} returnKeyType="next" testID='LastName' maxFontSizeMultiplier={1.25} placeholder="Apellido" autoCapitalize="words" value={this.state.lastName} onChangeText={(text) => this.setState({lastName:text})}/>
              <Input containerStyle={{height:40, marginBottom:10, overflow: 'hidden', borderBottomWidth:1, borderColor:'grey'}} ref={(ref) => { this.emailInput = ref; }} onSubmitEditing={() => this.phone.focus()} returnKeyType="next" maxFontSizeMultiplier={1.25} disabled={false} style={{fontSize:16, color:'gray',fontStyle: 'italic',fontWeight: 'bold'}} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={this.state.username} onChangeText={(text) => this.setState({email:text})}/>
              <PhoneInput
              maxFontSizeMultiplier={1.25}
              ref={(ref) => { this.phone = ref; }}
              initialCountry={"mx"}
              countriesList={countryList}
              returnKey="next"
              value={this.state.phone}
              keyboardType="number-pad"
              placeholder="Teléfono (10 dígitos)"
              flagStyle={{width: 50, height: 30, marginLeft:13}}
              textStyle={{fontSize:16, color:'black',fontWeight: 'bold'}}
              style={{height:40, marginBottom:10, overflow: 'hidden', borderBottomWidth:1, borderColor:'grey'}}
              onChangePhoneNumber={(text) => this.setState({phone:text}) }
              />
              <ButtonAlt testID='SubmitApplication' loading={this.state.isLoading} disabled={this.state.isLoading} title="Aplicar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25}} backgroundColor="black"
              onPress={() => this.verifyInfo()} style={{alignSelf:'center', marginTop:50}} />
            </View>
            </View>
            </TouchableWithoutFeedback>

        )
      }

}
