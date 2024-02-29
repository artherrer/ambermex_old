import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image, Dimensions } from 'react-native'
import ConvoTitles from './convoTitles'
import ConvoLastDate from './convoLastDate'
import ConvoUnreadCounter from './convoUnreadCounter'
import Avatar from '../../../cmps/avatar'
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
import { connect } from 'react-redux';
//https://media1.giphy.com/media/cLqxgg4nke0iu8UpzD/giphy.gif
import moment from "moment";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicon from 'react-native-vector-icons/Ionicons';
var { height, width } = Dimensions.get('window');

class HistoryRow extends Component {
  getExpDate(date){
    if(date == undefined){
      return "";
    }
    date = new Date(date + "Z");
    return moment(new Date(date)).format("DD/MM/YYYY") + " a las " + new Date(date).toLocaleTimeString() + " hrs";
  }

  getDate(date){
    if(date == undefined){
      return "";
    }
    date = new Date(date + "Z");
    return moment(new Date(date)).format("DD/MM/YY");
  }

  getTime(date){
    if(date == undefined){
      return "";
    }
    date = new Date(date + "Z");
    return moment(new Date(date)).format("HH:mm");
  }

  getBody(dialog){
      return <View style={{width:width/1.45}}>
              {dialog.noAddress ?
                null :
                <Text style={{fontWeight:'bold', color:'black'}}>Cerca de: <Text style={{fontWeight:'normal', fontSize:11}}>{dialog.locationText != null ? dialog.locationText : "No Disponible"}</Text></Text>
              }
              <Text style={{fontWeight:'bold', color:"black"}}>Edad: <Text style={{fontWeight:'normal', fontSize:11}}>{dialog.creatorAge}</Text></Text>
              {dialog.alert_type != "Feminist" ?
              <Text style={{fontWeight:'bold', color:"black"}}>Género: <Text style={{fontWeight:'normal', fontSize:11}}>{dialog.creatorGender}</Text></Text>
              :
              null
              }
              <Text style={{fontWeight:'bold', color:"black"}}>Inicio: <Text style={{fontWeight:'normal', fontSize:11}}>{dialog.startDate != undefined ? this.getExpDate(dialog.startDate): "No Disponible"}</Text></Text>
              <Text style={{fontWeight:'bold', color:"black"}}>Terminó: <Text style={{fontWeight:'normal', fontSize:11}}>{dialog.ended ? (dialog.ended_on != undefined ? this.getExpDate(dialog.ended_on) : "No Disponible") : "Alerta Activa"}</Text></Text>
             </View>
  }

    render() {
      const { dialog } = this.props;
      return (
          <TouchableOpacity style={{width:width,borderBottomWidth: 0.5, borderBottomColor: 'lightgrey'}} disabled={this.props.clientState.LoginLoading} onPress={() => this.props.loadChatroom(dialog)}>
            <View style={styles.container}>
              {dialog.alert_type != "Suspicious" ?
              <Image style={dialog.alert_type == "Suspicious" ? styles.photoSuspicious : styles.photo} source={dialog.alert_type === "Medical" ? require("../../../../../assets/image/BARRA_MEDICO.png") : (dialog.alert_type === "Fire" ? require("../../../../../assets/image/FIRE_ICON.png")  : (dialog.alert_type === "Suspicious" ? require("../../../../../assets/image/BARRA_SOSPECHA.png") : (dialog.alert_type === "Feminist" ? require("../../../../../assets/image/BARRA_MUJERES.png") : require("../../../../../assets/image/BARRA_PERSONAL.png"))))} resizeMode={"contain"}/>
              :
              null
              }
              {dialog.alert_type == "Suspicious" ?
                <View style={{height:(height/4),flexDirection:'row', flex:1, justifyContent:'center', alignItems:'center'}}>
                  <View style={{flexDirection:'column', flex:.5,height:'100%'}}>
                  <View style={{height:'10%'}} />
                  <View style={{height:'80%', width:'90%', alignSelf:'center'}}>
                  <View style={{justifyContent:'center', width:'100%', flexDirection:'row'}}>
                    <View style={{flex:.3, justifyContent:'center', alignItems:'center'}}>
                    <Image style={dialog.alert_type == "Suspicious" ? styles.photoSuspicious : styles.photo} source={dialog.alert_type === "Medical" ? require("../../../../../assets/image/BARRA_MEDICO.png") : (dialog.alert_type === "Fire" ? require("../../../../../assets/image/FIRE_ICON.png")  : (dialog.alert_type === "Suspicious" ? require("../../../../../assets/image/BARRA_SOSPECHA.png") : require("../../../../../assets/image/BARRA_PERSONAL.png")))} resizeMode={"contain"}/>
                    </View>
                    <View style={{flex:.7}}>
                    <Text style={{fontWeight:'bold', color:dialog.alert_type === "Medical" ? "#0C479D" : (dialog.alert_type === "Fire" ? "#f37a4e" : (dialog.alert_type === "Suspicious" ? "#fcaf00" : "#e30613"))}}>{dialog.name.toUpperCase()}</Text>
                    <Text style={{marginRight:5, marginBottom:5, fontSize:12, color:'gray'}}>{dialog.startDate != undefined ? this.getDate(dialog.startDate) : null}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={7} style={{fontSize:13,color:'black', marginTop:5, fontWeight:'500', maxWidth:'90%', maxHeight:'60%'}}>{dialog.message != null ? dialog.message : "No Disponible"}</Text>
                  </View>
                  <View style={{height:'10%', justifyContent:'center'}}>
                    <Text style={{textAlign:'right', fontSize:12, color:'#fcaf00',marginRight:10}}>{dialog.startDate != undefined ? this.getTime(dialog.startDate) : null}</Text>
                  </View>
                  </View>
                  <View style={{flexDirection:'column', flex:.5, justifyContent:'center'}}>
                  <View style={{height:(height/4) - 20, width:'100%', backgroundColor:'#f5f5f5', borderRadius:10, justifyContent:'center'}}>
                  {dialog.attachedImage != undefined ?
                    <Image source={{uri:dialog.attachedImage}} resizeMode="contain" style={{height:(height/4)-40,width:'100%', alignSelf:'center'}} />
                    :
                    <View style={{height:height/4, justifyContent:'center'}}>
                    <Ionicon name="ios-camera" size={50} color="#c6c6c6" style={{textAlign:'center'}} />
                    </View>
                  }
                  </View>

                  </View>
                </View>
                :
                <View style={{flexDirection:'column', width:width-75}}>
                  <Text style={{textAlign:'right', marginRight:5, marginTop:5,marginBottom:5, fontSize:12, color:'gray'}}>{dialog.startDate != undefined ? this.getDate(dialog.startDate) : null}</Text>
                  <View style={styles.border} >
                    <View style={[{width:width-75,paddingTop:10, paddingBottom:10, backgroundColor:"white"},styles.messageCointainer]}>
                      <Text style={{fontWeight:'bold', color:dialog.alert_type === "Medical" ? "#0C479D" : (dialog.alert_type === "Fire" ? "#f37a4e" : (dialog.alert_type === "Suspicious" ? "#fcaf00" : (dialog.alert_type === "Feminist" ? "#635592" : "#e30613")))}}>{dialog.name.toUpperCase()}</Text>
                      {dialog.locationCoordinates != undefined && dialog.locationCoordinates.latitude != undefined ?
                        <Text numberOfLines={1} style={{color:'black', fontSize:11, marginBottom:5}}><FontAwesome name="location-arrow" color={"black"} size={12}/> {"(" + dialog.locationCoordinates.latitude + ", " + dialog.locationCoordinates.longitude + ")"}</Text>
                        :
                        null
                      }
                      {this.getBody(dialog)}
                  </View>
                  <View style={styles.infoContainer}>
                  </View>
                </View>
                </View>
              }
            </View>
          </TouchableOpacity >
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: 10,
      backgroundColor:'white'
    },
    border: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    messageCointainer:{
      borderRadius:15,
      borderBottomLeftRadius:2,
      marginTop:5,marginBottom:5,
      padding:10
    },
    infoContainer: {
      maxWidth: 75,
      height: 50,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingVertical: 10,
      marginLeft: 5
    },
    photoSuspicious:{
      borderRadius: 20,
      height: 40,
      width: 40,
      backgroundColor:'white',
      marginVertical: 5,
      justifyContent: 'center',
      alignItems: 'center'
    },
    photo: {
      overflow: 'hidden',
      borderRadius: 20,
      height: 40,
      width: 40,
      backgroundColor:'transparent',
      marginVertical: 35,
      marginRight: 10,
      marginLeft:10,
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

  let HistoryRowContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(HistoryRow);
  export default HistoryRowContainer;
