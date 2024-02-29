import React, { Component } from 'react'
import { TouchableWithoutFeedback, Linking, Keyboard,Dimensions, TouchableOpacity, ScrollView,KeyboardAvoidingView, View,StatusBar, Platform, Image,Text,StyleSheet } from 'react-native'
import SigninLogo from './SigninLogo'
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'
import SigninLinks from './SigninLinks'
import SigninForm from './SigninForm'
let LANDING_BACKGROUND = require('../../../assets/image/LandingBackground2.png')
let LANDING_BACKGROUND_ALT = require('../../../assets/image/LandingBackground.png')
let LOGO_VERTICAL = require('../../../assets/image/splash.png')
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
const EndpointRequests = require("../../util/requests.js");

export default class LandingScreen extends Component {
  gotoRegisterWeb(){
    if(EndpointRequests.IsProduction){
      Linking.openURL("https://almxwebcentralus.azurewebsites.net/AccountWeb/UserRegister").catch((err) => console.error('An error occurred', err));
    }
    else{
      Linking.openURL("https://almxwebdev.azurewebsites.net/AccountWeb/UserRegister").catch((err) => console.error('An error occurred', err));
    }
  }
    render() {
        return (
            <View style={{flex:1,justifyContent:'center'}}>
            <View style={{width:width, height:height/1.25, backgroundColor:'transparent', paddingLeft:40, paddingRight:40}}>
              <Image source={LOGO_VERTICAL} style={{height:100, width:100, alignSelf:'center'}} resizeMode="contain" />
              <View style={{height:iPhoneX ? (height/1.5)/1.55 : (height/1.5)/1.75, justifyContent:'center', backgroundColor:'transparent'}}>
              <Text style={{fontSize:iPhoneX ? 30 : 24, fontWeight:'700', textAlign:'center', color:'#7d9f78', fontFamily:'Kohinoor Bangla', marginBottom:iPhoneX ? 25 : 20}}>¡Bienvenido a Botón Ambermex!</Text>
              <Text style={{fontSize:iPhoneX ? 17 : 13, fontWeight:'400', textAlign:'center', fontFamily:'Helvetica'}}>Inicia sesión para ser parte de la Red de Comunidad Ambermex. Si aún no tienes cuenta, regístrate.</Text>
              </View>
            </View>
            <Image source={iPhoneX ? LANDING_BACKGROUND : LANDING_BACKGROUND_ALT} style={{height:height, width:width, zIndex:1, position:'absolute'}} resizeMode="cover" />
            <TouchableOpacity style={{alignSelf:'center', zIndex:200, position:'absolute', bottom:(height/3.8)}} onPress={() => this.props.navigation.navigate("Signin")}>
              <View style={[{backgroundColor:"#7d9f78"}, styles.buttonContainer]}>
                  <Text style={styles.buttonLabel}>Iniciar sesión</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop:10, alignSelf:'center', zIndex:200, position:'absolute', bottom:iPhoneX ? (height/5.75) : (height/6)}} onPress={() => this.gotoRegisterWeb()}>
              <View style={[{backgroundColor:"#7d9f78"}, styles.buttonContainer]}>
                  <Text style={styles.buttonLabel}>Regístrate</Text>
              </View>
            </TouchableOpacity>
            </View>
        )
      }
}

const styles = StyleSheet.create({
	buttonContainer: {
		height: 50,
    width:200,
		borderRadius: 25,
		marginHorizontal: 20,
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonLabel: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: '700'
	},
})
