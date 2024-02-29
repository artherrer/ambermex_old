import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Linking, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon,Slider, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack'
const BANNER_MED_ENABLED = require('../../../../assets/image/BANNER_MED_ENABLED.png');
const BANNER_MED_DISABLED = require('../../../../assets/image/BANNER_MED_DISABLED.png');
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class PlansModal extends Component{
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
          visible={this.props.plansModal}
          onRequestClose={() => {
            console.log('closed')
          }}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{height:height/2, width:width-80, backgroundColor:'white', borderRadius:25}}>
            <View style={{alignItems:'center',justifyContent:'center', height:40, marginTop:10,backgroundColor:'transparent'}}>
              <Text style={{fontSize:16,color:'#0C479D', textAlign:'center', fontWeight:'bold'}}>Servicio Médico</Text>
            </View>
            <View style={{flex:1,justifyContent:'center'}}>
              <View style={{height:50,flex:1,flexDirection:'row',justifyContent:'center'}}>
                <View style={{flex:.4, flexDirection:'column', justifyContent:'center'}}>
                <Image source={BANNER_MED_DISABLED} style={{alignSelf:'flex-end',height:100,width:110}} />
                </View>
                <View style={{flex:.6, flexDirection:'column', justifyContent:'center'}}>
                <Text style={{color:'red', marginBottom:3,textDecorationLine: 'underline'}}>Sin servicio médico</Text>
                <Text style={{color:'gray'}}>Botón de servicio médico deshabilitado.</Text>
                </View>
              </View>
              <View style={{height:50,flex:1,flexDirection:'row'}}>
                <View style={{flex:.4, justifyContent:'center'}}>
                <Image source={BANNER_MED_ENABLED} style={{alignSelf:'flex-end',height:70,width:110}} />
                </View>
                <View style={{flex:.6, justifyContent:'center'}}>
                  <Text style={{color:'#59a711', marginBottom:3,textDecorationLine: 'underline'}}>Servicio médico activo</Text>
                  <Text style={{color:'gray'}}>Botón de servicio médico habilitado.</Text>
                </View>
              </View>
            </View>
            <View style={{height:60, justifyContent:'center'}}>
              <Button
              onPress={() => this.gotoPage()}
              type="clear"
              title="Más Información"
              color="#0E75FA"
              style={{alignSelf:'center',color:"#0E75FA"}}
              />
            </View>
            <View style={{height:60, justifyContent:'center'}}>
              <Button
              onPress={() => this.props.closeModal()}
              type="clear"
              title="Cerrar"
              color="red"
              textStyle={{color:"red"}}
              style={{alignSelf:'center',color:"red"}}
              />
            </View>
            </View>
            </View>
            </Modal>
            </View>
          )
        }
      }

      let PlansModalContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(PlansModal);
      export default PlansModalContainer;
