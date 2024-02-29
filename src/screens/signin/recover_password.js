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

import ImagePicker from 'react-native-image-crop-picker';
import PhoneInput from 'react-native-phone-input'
import { formatNumber } from "libphonenumber-js";
import { connect } from 'react-redux';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const EndpointRequests = require("../../util/requests.js");
import PhoneInputView from "../settings/cmps/phone_input";

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

class RecoverPassword extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Contraseña',
    headerLeft: <TouchableOpacity
    onPress={() => {
      navigation.pop();}} style={{paddingLeft:10, height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    });

    constructor(props) {
      super(props);

      this.state = {
        phone:null,
        incorrect:true,
        isLoading:false,
        fullPhone:null
      }
    }

    evaluate(){
      let { phone } = this.state;

      if(phone == undefined){
        this.setState({incorrect:true});
      }
      else if(phone.length >= 10){
        this.setState({incorrect:false});
      }
      else{
        this.setState({incorrect:true});
      }
    }

    askPhoneToken(){
      let { phone, fullPhone } = this.state;

      this.setState({isLoading:true});

      let model = {
        Phone: fullPhone,
        Email: ""
      };

      EndpointRequests.GetValidationCode(model, (response) => {
        if(response.message != undefined && response.message != "Ok"){
          this.setState({isLoading:false});
          Alert.alert(
           'Error',
           "El teléfono no esta registrado con una cuenta Ambermex. Verifica tu información e intenta de nuevo.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

        }
        else{
          this.setState({isLoading:false});
          this.props.navigation.navigate("NewPasswordSignin", { UserId: response.userId, ForgotPassword:true, Type:'Phone', Identifier:fullPhone });
        }
      });
    }

      render() {

        return (
          <View style={{backgroundColor:'#F4F4F4', flex:1, height:height,width:width}}>
          <Text style={{backgroundColor:'white', textAlign:'center', fontSize:17, color:'gray', padding:20}}>Para recuperar tu contraseña ingresa el número de teléfono con que te registraste.</Text>
          <View style={{backgroundColor:'white', width:width}}>
          <View style={styles.containerTitle}>
            <Text style={styles.textTitle}>    Información</Text>
          </View>
          <PhoneInputView
            flagStyle={{width: 50, height: 30, marginLeft:13}}
            style={{height:50, top:5}}
            incorrect={(values) => {
              this.setState({phone:values.phone, fullPhone:values.fullPhone});
              setTimeout(function(){
                this.evaluate();
              }.bind(this),200);
            }} phone={this.state.fullPhone} />
          </View>
          <View style={{backgroundColor:'#F4F4F4',margin:30}}>
          <ButtonAlt disabled={this.state.incorrect || this.state.isLoading} loading={this.state.isLoading} testID='SubmitUpdate' title="Continuar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25,alignSelf:'center'}} backgroundColor="black"
          onPress={()=> this.askPhoneToken()}  style={{alignSelf:'center'}} />
           </View>
           <View style={{backgroundColor:'white',width:width}}>
          </View>
          </View>
          );
        }
      }
      const styles = StyleSheet.create({
      	containerTitle: {
      		flex: 0,backgroundColor:'#F4F4F4',height:40, flexDirection: 'row', alignItems: 'center'
      	},
      	textTitle: {
      		fontWeight:'bold',color:'grey', fontSize:20
      	},
      })
let RecoverPasswordContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(RecoverPassword);
export default RecoverPasswordContainer;
