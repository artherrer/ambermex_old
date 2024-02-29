import React, { Component } from 'react'
import { View, Text, Button, ActivityIndicator, Dimensions, Linking, ScrollView, Image, Alert } from 'react-native'
import { ListItem, Icon, Avatar as AvatarAlt  } from 'react-native-elements';
var { height, width } = Dimensions.get('window');
import Avatar from '../cmps/avatar.js'
var SQLite = require('react-native-sqlite-storage')
import DeviceInfo from 'react-native-device-info';
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

let ambermex_logo = require("../../../assets/image/AMBERMEX_HORIZONTAL.png");
const EndpointRequests = require("../../util/requests.js");

import { connect } from 'react-redux';

class VerifyEmail extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: navigation.state.params != undefined && navigation.state.params.loading ?
    () => <ActivityIndicator size="small" color="#0E75FA" style={{alignSelf:'center'}} />
    :
    "Verificar Correo"
  });

  constructor(props) {
    super(props);

    this.state = {
      isLoading:false
    }
  }

  componentDidMount(){

  }

  getVerificationMail(){
    this.setState({isLoading:true});

 		EndpointRequests.GetVerificationMail(function(responseData) {
			if(responseData.message && responseData.message != "Ok"){
        Alert.alert(
         'Error',
         responseData.message,
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )

        setTimeout(function(){
          this.setState({isLoading:false});
        }.bind(this), 250);
			}
			else{
        this.setState({isLoading:false});
        this.props.navigation.goBack();
        setTimeout(function(){
          Alert.alert(
           'Éxito',
           "El correo de verificación fue enviado correctamente, revisa tu bandeja y completa el proceso.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

        }.bind(this), 250);
			}
 		}.bind(this));
  }

  render() {
    return (
      <View style={{padding:10,height:"100%", paddingRight:20, paddingLeft:20, marginTop:25, justifyContent:'center'}}>
        <Text style={{textAlign:'center', fontSize:17, color:'gray'}}>Un correo de verificación sera enviado a la siguiente dirección: </Text>
        <Text style={{fontWeight:'bold', marginTop:30, marginBottom:30, textAlign:'center'}}>{this.props.userState.UserData.email}</Text>
				<Button loading={this.state.isLoading} disabled={this.state.isLoading} title="Mandar Correo" borderRadius={5} buttonStyle={{width:200}} backgroundColor="black"
				onPress={() => this.getVerificationMail()} style={{alignSelf:'center'}} />
      </View>
);
}
}

let VerifyEmailContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(VerifyEmail);
export default VerifyEmailContainer;
