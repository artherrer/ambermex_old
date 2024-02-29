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

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;


class Password extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Contraseña',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.pop();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    });

    constructor(props) {
      super(props);

      this.state = {
        Password:null,
        incorrect:true,
        isLoading:false
      }
    }

    recoverPassword(){
      Alert.alert(
       "Elige cómo prefieres restablecer tu contraseña",
       "",
       [
         {text: 'Teléfono', onPress: () => this.askPhoneToken()},
         {text: 'Email', onPress: () => this.askEmailToken()},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
     )
    }

    askPhoneToken(){
      this.setState({isLoading:true});

      let model = {
        IdentificationString: this.props.userState.UserData.phone,
        Type: 0
      };

      EndpointRequests.RecoverAccount(model, (response) => {
        if(response.message != undefined && response.message != "Ok"){
          this.setState({isLoading:false});
          Alert.alert(
           'Error',
           "Tu contraseña es incorrecta, por favor, ingresa tu contraseña para poder actualizarla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        else{
          this.setState({isLoading:false});
          this.props.navigation.navigate("NewPassword", { UserId: response.userId, ForgotPassword:true, Type:"Phone" });
        }
      });
    }

    askEmailToken(){
      this.setState({isLoading:true});

      let model = {
        IdentificationString: this.props.userState.UserData.email,
        Type: 1
      };

      EndpointRequests.RecoverAccount(model, (response) => {
        if(response.message != undefined && response.message != "Ok"){
          this.setState({isLoading:false});
          Alert.alert(
           'Error',
           "Tu contraseña es incorrecta, por favor, ingresa tu contraseña para poder actualizarla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        else{
          this.setState({isLoading:false});
          this.props.navigation.navigate("NewPassword", { UserId: response.userId, ForgotPassword:true, Type:"Email" });
        }
      });
    }

    checkPassword(){
      let { Password } = this.state;

      this.setState({isLoading:true});

      EndpointRequests.CheckPassword({Password:Password}, (response) => {
        if(response.message != undefined && response.message != "Ok"){
          this.setState({isLoading:false});
          Alert.alert(
           'Error',
           "Tu contraseña es incorrecta, por favor, ingresa tu contraseña para poder actualizarla.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )
        }
        else{
          this.setState({isLoading:false});
          this.props.navigation.navigate("NewPassword", {PasswordProvided: true, Password:Password});
        }
      });
    }

      render() {

        return (
          <View style={{backgroundColor:'#F4F4F4', flex:1, height:height,width:width}}>
          <Text style={{backgroundColor:'white', textAlign:'center', fontSize:17, color:'gray', padding:20}}>Para crear una nueva contraseña escribe primero tu contraseña actual.</Text>
          <View style={{backgroundColor:'white', width:width}}>
          <View style={styles.containerTitle}>
            <Text style={styles.textTitle}>    Nueva contraseña</Text>
          </View>
          <Input secureTextEntry={true}
          onChangeText={text => {
            if(text != undefined && text.length >= 4){
              this.setState({ Password: text, incorrect:false });
            }
            else{
              this.setState({ Password: text, incorrect:true });
            }
          }}
          inputContainerStyle={{borderColor:'transparent', marginBottom:0}} placeholder="Contraseña" value={this.state.Password} containerStyle={{height:50,marginLeft:10, marginTop:10}}/>
          </View>
          <View style={{backgroundColor:'#F4F4F4',margin:30}}>
          <Text onPress={()=> {this.recoverPassword()}} style={{fontSize:18,marginBottom:50,alignSelf:'center',color:'#2AA9E0'}}>¿Olvidaste tu contraseña?</Text>
          <ButtonAlt disabled={this.state.incorrect || this.state.isLoading} loading={this.state.isLoading} testID='SubmitUpdate' title="Continuar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{width:150, backgroundColor:'#7CB185', borderRadius:25,alignSelf:'center'}} backgroundColor="black"
          onPress={()=> this.checkPassword()}  style={{alignSelf:'center'}} />
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
let PasswordContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(Password);
export default PasswordContainer;
