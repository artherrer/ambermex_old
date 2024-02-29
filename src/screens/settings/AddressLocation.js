/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { StyleSheet,View, AsyncStorage, Text, Linking, Button, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Image, Modal,Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { createStackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon, Input, FormLabel, Avatar, Button as ButtonAlt } from 'react-native-elements';
import { connect } from 'react-redux';
const EndpointRequests = require("../../util/requests.js");
const locationImage = require('../../../assets/image/UBICACION.png');
import MapView, { AnimatedRegion, Animated as AnimatedMap } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;


class AddressLocation extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Ubicación',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.pop();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    });

    constructor(props) {
      super(props);

      this.state = {
        isLoading:false,
        latDelta:0.0004,
        lonDelta:0.0047,
        latitude:0,
        longitude:0
      }
    }

    componentDidMount(){
      this.getCurrentPosition();
    }

    getCurrentPosition(cb){
      Geolocation.getCurrentPosition((get_success) => {
        let coordinateObject = {
          latitude: get_success.coords.latitude,
          longitude: get_success.coords.longitude,
          getAlarms:true
        };

        this.setState({latitude:coordinateObject.latitude, longitude:coordinateObject.longitude});
        if(cb != undefined){
          cb(coordinateObject);
        }
      }, (geo_error) => {
          if(geo_error.code === 1){
            this.setState({loadingAlert:false});
            Alert.alert(
             'La aplicación no cuenta con los permisos adecuados.',
             "Para compartir tu ubicación, necesitas habilitar permisos de ubicación.",
             [
               {text: 'Ir a ajustes', onPress: () => Linking.openURL('app-settings:')},
               {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
           )
          }
          else if(geo_error.code === 2){
            this.setState({loadingAlert:false});
            alert("No se pudo adquirir tu ubicación. Intentalo de nuevo");
          }
        },{ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }

    getAddressString(){
      if(this.props.userState.UserData != undefined && this.props.userState.UserData.primaryAddress != undefined){
        let address1 = this.props.userState.UserData.primaryAddress.address1;
        let address2 = this.props.userState.UserData.primaryAddress.address2;
        let cp = this.props.userState.UserData.primaryAddress.postalCode;
        let city = this.props.userState.UserData.primaryAddress.city;
        let entity = this.props.userState.UserData.primaryAddress.entity;

        return address1 + " " + address2 + ", " + entity  + " C.P " + cp + ", " + city;
      }

      return "";
    }

    addAddressPrompt(){
      Alert.alert(
       '¿Estás seguro?',
       "Verifica que la ubicación es correcta con la dirección que proporcionaste en el registro. A partir de este momento será la dirección a la que podrás solicitar ayuda remota cuando pertenezcas a una red de seguridad.",
       [
         {text: 'Estoy de acuerdo', onPress: () => this.addAddressLocation()},
         {text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
    }

    addAddressLocation(){
      this.setState({isLoading:true});

      this.getCurrentPosition((response) => {
        EndpointRequests.AddAddressLocation(response, (responseBackend) => {
          if(responseBackend.message != undefined && responseBackend.message != "Ok"){
            this.setState({isLoading:false});
            Alert.alert(
             'Error',
             "Hubo un error al agregar la ubicación de tu dirección.",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }
          else{
            this.props.dispatch({type:"UPDATE_ADDRESS_LOCATION_STATUS"});
            this.setState({isLoading:false});
            let userData = this.props.userState.UserData;
            if(userData.primaryAddress != undefined){
              userData.primaryAddress.beaconId = responseBackend.beaconId;
              this.props.chatState.LoadedData(userData);
              this.props.dispatch({type:"SET_USERDATA", UserData:userData});
            }
            Alert.alert(
             'Exito',
             "Tu dirección fue actualizada exitosamente.",
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )
          }
        });
      })
    }

    getLocationMapObject(){
      let {latitude,longitude} = this.state;

      if(latitude == 0 && longitude == 0){
        return {
            latitude: this.props.userState.Location != null ? Number(this.props.userState.Location.latitude) : 0,
            longitude:this.props.userState.Location != null ? Number(this.props.userState.Location.longitude) : 0,
            latitudeDelta: this.state.latDelta,
            longitudeDelta: this.state.lonDelta
        }
      }
      else{
        return {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: this.state.latDelta,
            longitudeDelta: this.state.lonDelta
        }
      }
    }

      render() {

        return (
          <View style={{backgroundColor:'white', flex:1, height:height,width:width}}>
          <View style={{flex:.55, width:width, backgroundColor:'white', justifyContent:'center', paddingLeft:20, paddingRight:20}}>
            <Text style={styles.textTitle}>Confirma la ubicación de tu dirección</Text>
            <Text style={{color:'gray', alignSelf:'center',marginTop:10,marginBottom:20,fontSize:13}}>Párate al aire libre en la puerta de tu casa y verifica tu posición en el mapa. Al finalizar presiona <Text style={{fontWeight:'700'}}>"Confirmar"</Text></Text>
            <Image source={locationImage} resizeMode="contain" style={{width:width, height:height/6, alignSelf:'center'}}/>
            <Text style={{color:'dimgray', marginTop:20,fontSize:13}}>Dirección:</Text>
            <Text style={{color:'gray', marginTop:5,fontSize:13}}>{this.getAddressString()}</Text>
          </View>
          <View style={{flex:.45, width:width, backgroundColor:'white', justifyContent:'space-around'}}>
          <AnimatedMap userLocationAnnotationTitle="Mi ubicación" showsUserLocation={true}
            mapPadding={{
            top: 0,
            right: 0,
            left: 0,
            bottom:0
            }}
            style={{width: width, height: height/3.75, alignSelf:'center'}} initialRegion={{
            latitude: this.props.userState.Location != null ? this.props.userState.Location.latitude : 20.693918,
            longitude: this.props.userState.Location != null ? this.props.userState.Location.longitude : -100.452809,
            latitudeDelta: this.state.latDelta,
            longitudeDelta: this.state.lonDelta
            }}
            region={this.getLocationMapObject()}>
            </AnimatedMap>
          <ButtonAlt disabled={this.state.isLoading} loading={this.state.isLoading} onPress={() => this.addAddressPrompt()} title="Confirmar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{alignSelf:'center',width:150, backgroundColor:'#7CB185', borderRadius:25}}
           style={{alignSelf:'center'}} />
          </View>
          </View>
          );
        }
      }
      const styles = StyleSheet.create({
      	containerTitle: {
      		flex: 1,height:40, flexDirection: 'row', alignItems: 'center'
      	},
      	textTitle: {
      		fontWeight:'bold',color:'#7CB185', fontSize:18, textAlign:'center'
      	},
      })
let AddressLocationContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(AddressLocation);
export default AddressLocationContainer;
