import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Linking, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon,Slider, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack'
const BANNER_MED_DISABLED = require('../../../../assets/image/BANNER_MED_DISABLED.png');
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class ErrorMedical extends Component{
  constructor(props) {
    super(props)
  }

  reportAfterAlert(){
    this.props.closeModal();
  }

  gotoPage(){
    Linking.openURL("https://www.botonambermex.com/").catch((err) => console.error('An error occurred', err));
  }

  render(){

    let header = headerHeight;

    return (
      <View>
          <Modal
          animationType="fade"
          transparent={true}
          onDismiss={() => this.reportAfterAlert()}
          backdropPressToClose={true}
          backdrop={false}
          visible={this.props.errorMedical}
          onRequestClose={() => {
            console.log('closed')
          }}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{width:width-80, backgroundColor:'white', borderRadius:25, padding:10}}>
            <Image source={BANNER_MED_DISABLED} style={{alignSelf:'center',height:100,width:110}} />
            <Text style={{color:'red', textAlign:'center', marginBottom:5,textDecorationLine: 'underline', fontWeight:'bold'}}>"Sin servicio médico"</Text>
            <Text style={{color:'gray', textAlign:'center',}}>Esta función se encuentra deshabilitada ya que no cuentas con servicio médico.</Text>
            <View style={{height:60, justifyContent:'center'}}>
              <Button
              onPress={() => this.gotoPage()}
              type="clear"
              title="Más Información"
              color="#0E75FA"
              style={{alignSelf:'center'}}
              />
            </View>
            <View style={{height:60, justifyContent:'center'}}>
              <Button
              onPress={() => this.props.closeModal()}
              type="clear"
              title="Cerrar"
              color="red"
              style={{alignSelf:'center'}}
              />
            </View>
            </View>
            </View>
            </Modal>
            </View>
          )
        }
      }

      let ErrorMedicalContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(ErrorMedical);
      export default ErrorMedicalContainer;
