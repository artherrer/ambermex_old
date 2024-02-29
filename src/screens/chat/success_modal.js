import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';

const textAMBER = require('../../../assets/image/newAmbermexText.png');
const newIconAlert = require('../../../assets/image/alert1.png');
const hand = require('../../../assets/image/HAND.png');

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

class SuccessModal extends Component{
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  closeSuccessModal(){
    this.props.closeSuccessModal();
  }

  render(){

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          onDismiss={() => this.closeSuccessModal()}
          backdropPressToClose={false}
          backdrop={false}
          visible={this.props.successAlert}
          style={{zIndex:5000,position:'absolute',  elevation:50,top:height/3.5}}
          onRequestClose={() => {
            this.closeSuccessModal();
          }}>
          <View style={{
            backgroundColor: 'rgba(190,190,190,0.05)',
            flex: 1,
            flexDirection: 'column',
            width:width,
            alignSelf:'center',
            zIndex:5000,
            elevation:50,
            position:'absolute',
            justifyContent: 'center',
            top:iPhoneX ? (height - ((height/3)*1.45))/2 - 20 : (height - ((height/3)*1.75))/2 - 20,
            alignItems: 'center'}}>
            <View style={{width:(width/3)*2.25, justifyContent:'space-between', borderRadius:20, paddingLeft:20, paddingRight:20,paddingBottom:20, paddingTop:20, backgroundColor:'white',marginTop:15}}>
            <Image source={textAMBER} style={{height:40, width:150, alignSelf:'center', marginBottom:20}} resizeMode="contain" />
            <Image source={hand} style={{height:(((width/3)*1.5))/1.5, width:((width/3)*2.25)- 40, alignSelf:'center'}} resizeMode="contain" />
            <Text style={{textAlign:'center', marginTop:25, fontSize:18, marginBottom:25, width:width/2, alignSelf:'center'}}>{this.props.type === "Suspicious" ? "Reporte enviado exitosamente" : "Alerta activada exitosamente"}</Text>
            <Button title="Ok" borderRadius={5} buttonStyle={{alignSelf:'center', width:70, backgroundColor:'#7CB185', borderRadius:25}}
            onPress={() => this.closeSuccessModal()} style={{alignSelf:'center', marginTop:15, marginBottom:10}} />
            </View>
          </View>
      </Modal>
    </View>
          )
        }
      }

      export default SuccessModal;
