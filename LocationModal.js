import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Button, Image, Modal, Keyboard, Linking, Alert, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon,Slider} from 'react-native-elements';
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class LocationModal extends Component{
  constructor(props) {
    super(props)
  }

  closeModal(){
    Alert.alert(
     'Atención.',
     "Si no aceptas, el funcionamiento de la aplicacion sera limitado, Continuar?.",
     [
       {text: 'Si', onPress: () => this.props.closeModal()},
       {text: 'Cancelar', onPress: () => console.log('cancel'), style:'cancel'},
     ],
     { cancelable: false }
   )
  }

  render(){

    return (
      <View>
          <Modal
          animationType="fade"
          transparent={true}
          backdropPressToClose={true}
          backdrop={false}
          visible={this.props.locationModal}
          onRequestClose={() => {
            console.log('closed')
          }}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{height:height, width:width, backgroundColor:'white'}}>
            <View style={{height:(height/4)*2, width:width, justifyContent:'center', paddingLeft:15,paddingRight:15}}>
              <Icon name="location-on" type="MaterialIcons" size={50} style={{color:'blue', textAlign:'center', marginBottom:15}} />
              <Text style={{textAlign:'center', fontWeight:'700', fontSize:height >= 600 ? 17 : 15, marginBottom:25}}>Permiso de Ubicación</Text>
              <Text style={{textAlign:'center', fontSize:height >= 600 ? 14 : 12, marginBottom:15}}>Para reportar tu ubicación cada que entres y salgas de una área de cobertura, permite a Botón Ambermex acceder tu ubicación todo el tiempo.</Text>
              <Text style={{textAlign:'center', fontSize:height >= 600 ? 14 : 12, marginBottom:15}}>Botón Ambermex usara la información de tu ubicación para determinar si te encuentras en área de cobertura, y para compartir tu ubicación a miembros cercanos y oficiales en caso de crear una alerta.</Text>
            </View>
            <View style={{height:(height/4)*2 - 60, width:width, justifyContent:'center'}}>
              <Image source={require("./assets/image/ABIERTAMX.png")} resizeMode={"contain"} style={{alignSelf:'center', height:(height/4)*2 - 100, width:width}} />
            </View>
            <View style={{flexDirection:'row', justifyContent:'center',height:60, width:width}}>
              <View style={{flex:.5, paddingLeft:10,paddingRight:10, justifyContent:'center',height:50}}>
                <Button
                onPress={() => this.closeModal()}
                title="No Aceptar"
                color="red"
                style={{alignSelf:'center',color:"red", height:50}}
                />
              </View>
              <View style={{flex:.5, paddingLeft:10,paddingRight:10, justifyContent:'center',height:50}}>
                <Button
                onPress={() => this.props.acceptLocation()}
                title="Aceptar"
                color="blue"
                style={{alignSelf:'center',color:"red", height:50}}
                />
              </View>
            </View>
            </View>
            </View>
            </Modal>
            </View>
          )
        }
      }

  export default LocationModal;
