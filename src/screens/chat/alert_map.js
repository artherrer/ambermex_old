import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button as ButtonAlt } from 'react-native-elements';
import { connect } from 'react-redux';
import MapView from 'react-native-maps';
const textAMBER = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
import SuccessModal from './success_modal'
import { Header } from 'react-navigation-stack'

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class AlertMap extends Component{
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  setCustomDelta(nextlatDelta, nextlonDelta){
    /*
    let { latDelta, lonDelta } = this.state;

    if(nextlatDelta != latDelta || nextlonDelta != lonDelta){
      this.setState({latDelta:nextlatDelta, lonDelta:nextlonDelta});
    }
    */
  }

  render(){
    return (
      <View>
      <Modal
      animationType="slide"
      transparent={true}
      backdropPressToClose={false}
      backdrop={false}
      visible={this.props.showMap}
      onRequestClose={() => {
        setTimeout(function(){
          Keyboard.dismiss;
          this.props.closeMapModal();
        }.bind(this),300);
      }}>
      <SuccessModal successAlert={this.props.showSuccessModal} closeSuccessModal={() => this.props.closeSuccessModal()}/>
      <View style={{
        backgroundColor: 'transparent',
        flex: 1,
        zIndex:4000,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{height:iPhoneX ? height - 20 : height, width:width, padding:0,borderRadius:0, backgroundColor:"white",marginTop:iPhoneX ? headerHeight - 30 : 20}}>
          <View style={{height:55,width:width, backgroundColor:"white", flexDirection:'row',justifyContent: 'center', marginBottom:0}}>
          <View style={{flex:.5, height:55, justifyContent:'center', flexDirection:'column', backgroundColor:'transparent'}}>
          <Image source={textAMBER} style={{height:50, width:150, alignSelf:'center'}} resizeMode="contain" />
          </View>
          <View style={{flex:.5, height:55, justifyContent:'center', marginTop:3}}>
          <TouchableOpacity style={{backgroundColor:'white', height:55,width:60,justifyContent:'center', alignSelf:'flex-end'}}
          onPress={() => {
            setTimeout(function(){
              Keyboard.dismiss;
              this.props.closeMapModal();
            }.bind(this),300);
          }}>
          <Icon name="ios-close" type="ionicon" color={'black'} size={35} style={{marginBottom:0}} />
          </TouchableOpacity>
          </View>
          </View>
          <MapView userLocationAnnotationTitle="Mi ubicación" showsUserLocation={true} style={{width: width, height: height/2, alignSelf:'center'}} initialRegion={{
            latitude: this.props.latestCoordinates != null ? parseFloat(this.props.latestCoordinates.latitude) : 19.425875,
            longitude:this.props.latestCoordinates != null ? parseFloat(this.props.latestCoordinates.longitude) : -99.1414457,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05
            }}
            onRegionChangeComplete={(values, test) => console.log("zoomed:" + values) }
            region={{
            latitude: this.props.latestCoordinates != null ? parseFloat(this.props.latestCoordinates.latitude) : 19.425875,
            longitude:this.props.latestCoordinates != null ? parseFloat(this.props.latestCoordinates.longitude) : -99.1414457,
            latitudeDelta: 0.004,
            longitudeDelta: 0.005
            }}
            >
              <MapView.Marker
              key={"FirstLocation"}
              strokeColor='blue'
              coordinate={{"latitude":this.props.latestCoordinates != null ? parseFloat(this.props.latestCoordinates.latitude) : 19.425875,"longitude":this.props.latestCoordinates != null ?  parseFloat(this.props.latestCoordinates.longitude) : -99.1414457}}
              title={"Posicion Actual."}/>
              {
                this.props.devices.map((device, index) => (
                  <MapView.Marker
                  key={index}
                  coordinate={{"latitude": parseFloat(device.latitude),"longitude": parseFloat(device.longitude)}}
                  strokeColor='red'
                  strokeWidth={6}
                  title={"Alarma"}>
                    <Image source={AlertIcon} style={{height: 35, width:35 }} />
                  </MapView.Marker>
                ))
              }
              {this.props.historyCoordinates.length > 1 ?
                <MapView.Polyline
                  key={"polyline"}
                  strokeWidth={2}
                  coordinates={this.props.historyCoordinates} />
                  :
                null
              }
          </MapView>
          <View style={{height:(height/2) - 90, padding:15}}>
            <Text numberOfLines={1} style={{textAlign:'center', padding:10, marginBottom:15, fontSize:25, color:'black', fontWeight:'bold'}}>{this.props.chatState.CurrentChat.emergencyInformation != null ? (this.props.chatState.CurrentChat.emergencyInformation.type === "Medical" ? "Alerta Medica" : "Alerta de Emergencia") : "Alerta de Emergencia"}</Text>
            <Text numberOfLines={3} style={{textAlign:'center', padding:10, marginBottom:25, fontSize:20, color:'red'}}>{this.props.chatState.CurrentChat.emergencyInformation != null ? this.props.chatState.CurrentChat.emergencyInformation.text : "Alarma Activada"}</Text>
            <ButtonAlt loading={this.props.disablingAlarm} disabled={this.props.disablingAlarm || !this.props.endPermission} title="Terminar Alerta" borderRadius={5} buttonStyle={{width:150, backgroundColor:'black',alignSelf:'center'}} backgroundColor="black"
            onPress={() => this.props.endAlert()} style={{alignSelf:'center'}} />
          </View>
        </View>
        </TouchableWithoutFeedback>
        </View>
        </Modal>
        </View>
          )
        }
      }

      let AlertMapContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(AlertMap);
      export default AlertMapContainer;
