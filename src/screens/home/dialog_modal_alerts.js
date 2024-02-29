import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Linking, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';

const POP_MEDICA = require('../../../assets/image/POP_MEDICA.png');
const POP_NO_CONNECTION = require('../../../assets/image/POP_NO_CONNECTION.png');
const POP_SOSPECHA = require('../../../assets/image/POP_SOSPECHA.png');
const POP_VECINAL = require('../../../assets/image/POP_VECINAL.png');
//COVERAGE ICONS
const OFFICIAL_NO_INTERNET = require('../../../assets/image/OFFICIAL_NO_INTERNET.png');
const OFFICIAL_NO_COVERAGE = require('../../../assets/image/OFFICIAL_NO_COVERAGE.png');
const OFFICIAL_COVERAGE = require('../../../assets/image/OFFICIAL_COVERAGE.png');
const USER_NO_INTERNET = require('../../../assets/image/USER_NO_INTERNET.png');
const USER_NO_COVERAGE = require('../../../assets/image/USER_NO_COVERAGE.png');
const USER_COVERAGE = require('../../../assets/image/USER_COVERAGE.png');
//COVERAGE ICONS
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

class DialogModalAlert extends Component{
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  closeModal(){
    this.props.closeModal();
  }

  gotoPage(){
    Linking.openURL("https://www.botonambermex.com/tecnologias").catch((err) => console.error('An error occurred', err));
  }

  getComponent(){
    if(this.props.messageType === "Internet"){
      return <View style={{width:'100%', height:'100%'}}>
                <View style={{paddingLeft:15,paddingRight:15,padding:20, height:'85%', paddingTop:30, justifyContent:'space-between'}}>
                <Text style={{fontWeight:'700', fontSize:15, textAlign:'center', width:'80%', alignSelf:'center'}}>Sin conexión a internet</Text>
                <Image source={POP_NO_CONNECTION} style={{height:50, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                <Text style={{textAlign:'center', fontWeight:'300'}}>Necesitas tener conexión para activar la alerta. Verifica estar conectado a una red o datos móviles</Text>
                </View>
                <View style={{height:'15%'}}>
                <TouchableOpacity onPress={() => this.closeModal()} style={{height:'100%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray',justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                </TouchableOpacity>
                </View>
             </View>
    }
    else if(this.props.messageType === "Vecinal"){
      return <View style={{width:'100%', height:'100%'}}>
                <View style={{padding:20, height:'70%', paddingTop:30, justifyContent:'space-between'}}>
                <Text style={{fontWeight:'700', fontSize:15, textAlign:'center', width:'80%', alignSelf:'center'}}>Detonación vecinal no disponible</Text>
                <Image source={POP_VECINAL} style={{height:50, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                <Text style={{textAlign:'center', fontWeight:'300'}}>Tu residencia no tiene acceso a una alarma autosuficiente.</Text>
                </View>
                <View style={{height:'30%'}}>
                <TouchableOpacity onPress={() => this.gotoPage()} style={{height:'50%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>Conoce más</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.closeModal()} style={{height:'50%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                </TouchableOpacity>
                </View>
             </View>
    }
    else if(this.props.messageType === "Sospechosa"){
      return <View style={{width:'100%', height:'100%'}}>
                <View style={{paddingLeft:15,paddingRight:15,padding:20, height:'85%', paddingTop:30, justifyContent:'space-between'}}>
                <Text style={{fontWeight:'700', fontSize:15, textAlign:'center', width:'80%', alignSelf:'center'}}>Reporte actividad sospechosa no disponible</Text>
                <Image source={POP_SOSPECHA} style={{height:50, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                <Text style={{textAlign:'center', fontWeight:'300'}}>Esta ubicación no cuenta con equipo de asistencia para atender el reporte.</Text>
                </View>
                <View style={{height:'15%'}}>
                <TouchableOpacity onPress={() => this.closeModal()} style={{height:'100%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                </TouchableOpacity>
                </View>
             </View>
    }
    else if(this.props.messageType === "Medical"){
      return <View style={{width:'100%', height:'100%'}}>
                <View style={{padding:20, height:'70%', paddingTop:30, justifyContent:'space-between'}}>
                <Text style={{fontWeight:'700', fontSize:15, textAlign:'center', width:'80%', alignSelf:'center'}}>Detonación médica no disponible</Text>
                <Image source={POP_MEDICA} style={{height:50, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                <Text style={{textAlign:'center', fontWeight:'300'}}>No cuentas con servicio de asistencia médica.</Text>
                </View>
                <View style={{height:'30%'}}>
                <TouchableOpacity onPress={() => this.gotoPage()} style={{height:'50%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>Conoce más</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.closeModal()} style={{height:'50%', width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                </TouchableOpacity>
                </View>
             </View>
    }
    else if(this.props.messageType === "TopLeftStatus"){
      if(this.props.isOfficial){
        return <View style={{width:'100%', height:'100%'}}>
                  <View style={{padding:20, height:'100%', paddingTop:15, paddingBottom:0, paddingLeft:0,paddingRight:0, justifyContent:'space-between'}}>
                  <Text style={{fontWeight:'700', fontSize:17, textAlign:'center', width:'80%', alignSelf:'center'}}>Cobertura Ambermex</Text>
                  <View style={{height:'75%', paddingLeft:10,paddingRight:10, justifyContent:'space-around'}}>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={OFFICIAL_NO_INTERNET} style={{height:35, alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                      <Text style={{fontWeight:'600'}}>Sin cobertura</Text>
                      <Text style={{fontSize:12}}>Tu dispositivo no tiene internet.</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={OFFICIAL_NO_COVERAGE} style={{height:35, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                    <Text style={{fontWeight:'600'}}>En cobertura</Text>
                    <Text style={{fontSize:12}}>Conexión con central de monitoreo activa.</Text>
                    <Text style={{fontSize:9, color:'#878787'}}>*Disponibilidad sujeta a contratación. Si no cuentas con él se notificará únicamente a tus contactos de emergencia.</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={OFFICIAL_COVERAGE} style={{height:35, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                    <Text style={{fontWeight:'600'}}>En cobertura avanzada</Text>
                    <Text style={{fontSize:12}}>Conexión con central de monitoreo activa. Recursos adicionales disponibles.</Text>
                    </View>
                  </View>
                  </View>
                  <TouchableOpacity onPress={() => this.closeModal()} style={{height:40,width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                    <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                  </TouchableOpacity>
                  </View>
               </View>
      }
      else{
        return <View style={{width:'100%', height:'100%'}}>
                  <View style={{padding:20, height:'100%', paddingTop:15, paddingBottom:0, paddingLeft:0,paddingRight:0, justifyContent:'space-between'}}>
                  <Text style={{fontWeight:'700', fontSize:17, textAlign:'center', width:'80%', alignSelf:'center'}}>Cobertura Ambermex</Text>
                  <View style={{height:'75%', paddingLeft:10,paddingRight:10, justifyContent:'space-around'}}>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={USER_NO_INTERNET} style={{height:35, alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                      <Text style={{fontWeight:'600'}}>Sin cobertura</Text>
                      <Text style={{fontSize:12}}>Tu dispositivo no tiene internet.</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={USER_NO_COVERAGE} style={{height:35, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                    <Text style={{fontWeight:'600'}}>En cobertura</Text>
                    <Text style={{fontSize:12}}>Conexión con central de monitoreo activa.</Text>
                    <Text style={{fontSize:9, color:'#878787'}}>*Disponibilidad sujeta a contratación. Si no cuentas con él se notificará únicamente a tus contactos de emergencia.</Text>
                    </View>
                  </View>
                  <View style={{flexDirection:'row'}}>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.25}}>
                    <Image source={USER_COVERAGE} style={{height:35, width:'100%', alignSelf:'center'}} resizeMode={"contain"} />
                    </View>
                    <View style={{flexDirection:'column', justifyContent:'center', flex:.75}}>
                    <Text style={{fontWeight:'600'}}>En cobertura avanzada</Text>
                    <Text style={{fontSize:12}}>Conexión con central de monitoreo activa. Recursos adicionales disponibles.</Text>
                    </View>
                  </View>
                  </View>
                  <TouchableOpacity onPress={() => this.closeModal()} style={{height:40,width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', justifyContent:'center'}}>
                    <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                  </TouchableOpacity>
                  </View>
               </View>
      }
    }
    else{
      return <View style={{width:'100%', height:'100%', backgroundColor:'yellow'}}>
                <TouchableOpacity onPress={() => this.closeModal()} style={{height:50, width:'100%', alignSelf:'flex-end', borderTopWidth:0.5, borderTopColor:'lightgray', backgroundColor:'pink', justifyContent:'center'}}>
                  <Text style={{textAlign:'center', color:'#0E75FA'}}>OK</Text>
                </TouchableOpacity>
             </View>
    }
  }

  render(){

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          onDismiss={() => this.closeModal()}
          backdropPressToClose={false}
          backdrop={true}
          visible={this.props.noAlertModal}
          onRequestClose={() => {
            this.closeModal()
          }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            flex: 1,
            flexDirection: 'column',
            width:width,
            alignSelf:'center',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{width:(width/3)*2.25, height:320, borderRadius:20,backgroundColor:'white',marginTop:15}}>
              { this.getComponent() }
            </View>
          </View>
      </Modal>
    </View>
          )
        }
      }

export default DialogModalAlert;
