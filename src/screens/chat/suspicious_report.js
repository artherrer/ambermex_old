import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon, Button } from 'react-native-elements';
import { connect } from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const textAMBER = require('../../../assets/image/newAmbermexText.png');
const newIconAlert = require('../../../assets/image/alert1.png');
const hand = require('../../../assets/image/HAND.png');
const BARRA_SUSPICIOUS = require('../../../assets/image/BARRA_SOSPECHA.png');
const ICON_SOSPECHA = require('../../../assets/image/ICON_SOSPECHA.png');
import moment from "moment";

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

class SuspiciousReport extends Component{
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  getDate(date){
    if(date == undefined){
      return "";
    }
    if(typeof date == "string"){
      date = new Date(date + "Z");
    }
    else{
      date = new Date(date);
    }
    return moment(new Date(date)).format("DD/MM/YY HH:mm");
  }


  closeReportModal(){
    this.props.closeReportModal();
  }

  getLocation(locationObject){
    if(locationObject != undefined){
      return "(" + locationObject.latitude + "," + locationObject.longitude + ")";
    }
    return "";
  }

  render(){

    return (
      <View>
        <Modal
          animationType="fade"
          transparent={true}
          onDismiss={() => this.closeReportModal()}
          backdropPressToClose={false}
          backdrop={true}
          visible={this.props.reportModal}
          onRequestClose={() => {
             this.closeReportModal();
          }}>
          <View style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            flex: 1,
            flexDirection: 'column',
            width:width,
            alignSelf:'center',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <View style={{width:(width/3)*2.5, maxHeight:'85%',borderRadius:20, paddingLeft:20, paddingRight:20,paddingBottom:10, paddingTop:10, backgroundColor:'white',marginTop:0}}>
            <View style={{width:'100%', height:40, justifyContent:'center'}}>
              <TouchableOpacity onPress={() => this.closeReportModal()} style={{width:40, height:40, alignSelf:'flex-end',justifyContent:'center'}}>
                <Icon type="ionicon" name="ios-close" color="gray" style={{textAlign:'center', alignSelf:'center', fontWeight:'300'}} size={40} />
              </TouchableOpacity>
            </View>
            <View style={{top:-10,flexDirection:'row', width:'100%', alignSelf:'center', justifyContent:'center', borderBottomColor:'gray', borderBottomWidth:.25}}>
              <View style={{flexDirection:'column', flex:.9, justifyContent:'center'}}>
                <Image style={{width:50,height:50, alignSelf:'center'}} source={ICON_SOSPECHA} resizeMode="contain" />
                <Text style={{color:'#fcaf00', fontSize:14, fontWeight:'700', textAlign:'center', marginTop:10}}>ACTIVIDAD SOSPECHOSA</Text>
                <View style={{flexDirection:'row', justifyContent:'center', alignSelf:'center', marginBottom:10}}>
                  <Text numberOfLines={1} style={{color:'gray', fontSize:11}}>{this.getDate(this.props.startDate)}</Text>
                </View>
              </View>
            </View>
            <View style={{flexDirection:'row', justifyContent:'center', alignSelf:'center', marginTop:10, width:'90%'}}>
              <FontAwesome name="location-arrow" color={"black"} size={14}/>
              <Text numberOfLines={1} style={{color:'black', fontSize:13, marginLeft:4}}>{this.getLocation(this.props.location)}</Text>
            </View>
            <View style={{width:'100%', height:'50%',borderRadius:10, backgroundColor:"#f6f6f6", marginTop:10, marginBottom:10, justifyContent:'center'}}>
              {this.props.attachedImage != undefined ?
                <Image source={{uri:this.props.attachedImage}} resizeMode="contain" style={{width:'100%', height:'100%', alignSelf:'center'}}/>
                :
                <Icon type="ionicon" name="ios-camera" size={50} color="gray" style={{textAlign:'center'}} />
              }
            </View>
            <Text numberOfLines={7} style={{fontSize:14, color:'black'}}>{this.props.alertText}</Text>
            </View>
          </View>
      </Modal>
    </View>
          )
        }
      }

      export default SuspiciousReport;
