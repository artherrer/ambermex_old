import React, { Component } from 'react'
import { StyleSheet, View, Text, Image, Dimensions, Linking, TouchableOpacity, ActivityIndicator, Modal, Platform, TouchableWithoutFeedback, ActionSheetIOS } from 'react-native'
import { getTime } from '../../../../util/getTime'
import Avatar from '../../../cmps/avatar'
import { Icon } from 'react-native-elements';
import Hyperlink from 'react-native-hyperlink'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const fullWidth = Dimensions.get('window').width
const fullHeight = Dimensions.get('window').height
import { connect } from 'react-redux';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import { xml, jid, client } from '@xmpp/client/react-native';
import FastImage from 'react-native-fast-image'
import Video from 'react-native-video';
const cloneDeep = require('lodash/cloneDeep');
const EMCONTACT_AVATAR = require("../../../../../assets/image/EMCONTACT_AVATAR.png");
const SUPPORT_AVATAR = require("../../../../../assets/image/SUPPORT_AVATAR.png");
const AMBERMEX_OFFICIAL = require("../../../../../assets/image/OFICIAL_CHANNEL.png");
const EMPTY_PLACEHOLDER = require("../../../../../assets/image/CREATE_INDIVIDUAL.png");
const BARRA_MEDICAL = require('../../../../../assets/image/BARRA_MEDICO.png');
const BARRA_PERSONAL = require('../../../../../assets/image/BARRA_PERSONAL.png');
const BARRA_SOSPECHA = require('../../../../../assets/image/BARRA_SOSPECHA.png');
const BARRA_VECINAL = require('../../../../../assets/image/BARRA_VECINAL.png');
const empty_thumbnail = require("../../../../../assets/image/profile_pholder.png");

class MessageAlert extends Component {

    userInformation(user_data){
      if(user_data != undefined && user_data.alias != undefined){
        if(user_data.isSupport){
          switch(user_data.responseType){
            case 0:
              return "Soporte Seguridad " + user_data.alias + " - ";
            case 1:
              return "Soporte Médico " + user_data.alias + " - ";
            case 2:
              return "Soporte de Incendios " + user_data.alias + " - ";
            case 3:
              return "Ambermex " + user_data.alias + " - ";
            case 4:
              return user_data.alias + " - ";
            case 5:
              return "Seguridad Privada " + user_data.alias + " - ";
            default:
              return user_data.alias + " - ";
          }
        }
        else{
          return user_data.alias + " - ";
        }
      }
      else{
        return "";
      }
    }

    getUsername(user_data){
      if(user_data != undefined && user_data.alias != undefined){
        if(user_data.isSupport){
          switch(user_data.responseType){
            case 0:
              return "Soporte Seguridad " + user_data.alias;
            case 1:
              return "Soporte Médico " + user_data.alias;
            case 2:
              return "Soporte de Incendios " + user_data.alias;
            case 3:
              return "Ambermex " + user_data.alias;
            case 4:
              return user_data.alias;
            case 5:
              return "Seguridad Privada " + user_data.alias;
            default:
              return user_data.alias;
          }
        }
        else{
          return user_data.alias;
        }
      }
      else{
        return "";
      }
    }

    openMessage(messagePressed){
      if(messagePressed.text === this.props.alertMessage){
        let text;
        let StringCoords = [];
        try{
          text = cloneDeep(messagePressed.text);
          StringCoords = text.match(/\(([^)]+)\)/)[1];
          StringCoords = StringCoords.split(",");
        }catch(e){
          StringCoords = [];
        }

        if(StringCoords.length > 1){
          Coordinates = {
            latitude:parseFloat(StringCoords[0]),
            longitude:parseFloat(StringCoords[1])
          };

          let mapsUrl = "http://maps.google.com/?q=" + Coordinates.latitude + "," + Coordinates.longitude;

          this.props.openSheet("Maps", messagePressed, mapsUrl);
        }
        else{
          this.props.openSheet("Copy", messagePressed);
        }
      }
      else if(messagePressed.text != undefined && messagePressed.text.includes("Ubicación:")){
        let text;
        let StringCoords = [];
        try{
          text = cloneDeep(messagePressed.text);
          StringCoords = text.match(/\(([^)]+)\)/)[1];
          StringCoords = StringCoords.split(",");
        }catch(e){
          StringCoords = [];
        }

        if(StringCoords.length > 1){
          Coordinates = {
            latitude:parseFloat(StringCoords[0]),
            longitude:parseFloat(StringCoords[1])
          };

          let mapsUrl = "http://maps.google.com/?q=" + Coordinates.latitude + "," + Coordinates.longitude;

          this.props.openSheet("Maps", messagePressed, mapsUrl);
        }
        else{
          this.props.openSheet("Copy", messagePressed);
        }
      }
      else if(this.props.disableOptions){
        return false;
      }
      else{
        if(!messagePressed.isMedia){
          if(messagePressed.url != undefined && messagePressed.url != ""){
            if(messagePressed.username === this.props.nickname){
              this.props.openSheet("Url", messagePressed, messagePressed.url);
            }
            else{
              this.props.openSheet("Url", messagePressed, messagePressed.url);
            }
          }
          else{
            if(messagePressed.username === this.props.nickname){
              this.props.openSheet("Copy", messagePressed);
            }
            else{
              this.props.openSheet("Copy", messagePressed);
            }
          }
        }
        else{
          if(messagePressed.username !== this.props.nickname){
            this.props.openSheet("Copy", messagePressed);
          }
          else{
            this.props.openSheet("Copy", messagePressed);
          }
        }
      }
    }

    renderAttachment(item, otherSender){
      if(item.isMedia && item.url != null && !item.isQuote){
        if(item.isImage){
          return <TouchableWithoutFeedback onPress={() => this.props.showImage(item)} style={{height:fullHeight/3.5, width:fullWidth/2.5, justifyContent:'center', alignItems:'center'}}>
                  <FastImage
                    style={{height:fullHeight/3.5, width:fullWidth/2.5, borderRadius:10, marginBottom:5, marginTop:7, justifyContent:'center', alignSelf:'center'}}
                    source={{uri:item.url}}
                  />
                  </TouchableWithoutFeedback>
        }
        else if(item.isVideo){
          return <TouchableWithoutFeedback onPress={() => this.props.showImage(item)} style={{height:fullHeight/3.5, width:fullWidth/2.5, justifyContent:'center', alignItems:'center'}}>
                  <FastImage
                    style={{height:fullHeight/3.5, width:fullWidth/2.5, borderRadius:10, marginBottom:5, justifyContent:'center', alignSelf:'center'}}
                    source={{uri:item.thumbnail}}
                  />
                  </TouchableWithoutFeedback>
        }
        else if(item.isFile){
          return <TouchableWithoutFeedback onPress={() => Linking.openURL(item.url)} style={{height:100, width:fullWidth/3}}>
                    <View style={{backgroundColor:otherSender ? '#cccccc' : '#afcfb6', borderRadius:2,justifyContent:'center', height:100, width:fullWidth/3, padding:20, marginBottom:5}}>
                    <Icon type="Material" name="attach-file" size={40} color={'white'} style={{textAlign:'center'}} />
                    <Text numberOfLines={1} style={{textAlign:'center', color:'white', marginTop:15}}>{item.fileName}</Text>
                    </View>
                  </TouchableWithoutFeedback>
        }
      }
      else if(item.isQuote){
        if(item.isMedia){
          return <View style={{minWidth:fullWidth/3, width:fullWidth/2, alignSelf:'center', flexDirection:'row',marginBottom:10, backgroundColor: otherSender ? '#cccccc' : '#afcfb6', borderRadius:2, padding:10, justifyContent:'center',borderLeftWidth:4,borderLeftColor:otherSender ? "#8c8c8c" : '#4d8058'}}>
                    <View style={{flex:.75}}>
                      <View style={{flex:.2, marginBottom:3}}>
                        <Text style={{fontSize:10, textAlign:'left', color:'red'}}>{item.quote_by != undefined ? item.quote_by : ""}</Text>
                      </View>
                      <View style={{flex:.8}}>
                        <Text numberOfLines={2} style={{color:'black', fontStyle:'italic', fontSize:13, marginTop:5}}>"{item.quoted_msg}"</Text>
                      </View>
                    </View>
                    <View style={{flex:.25,minWidth:50, justifyContent:'center'}}>
                      {item.isFile ?
                        <Icon type="Material" name="attach-file" size={30} color={'white'} style={{textAlign:'center'}} />
                        :
                        <Image source={{uri:item.isVideo && item.thumbnail != undefined ? item.thumbnail : item.url}} resizeMode="cover" style={{height:50}} />
                      }
                    </View>
                 </View>
        }
        else{
          return <View style={{minWidth:fullWidth/3, marginBottom:10, backgroundColor: otherSender ? '#cccccc' : '#afcfb6', borderRadius:2, padding:10, justifyContent:'center',borderLeftWidth:4,borderLeftColor:otherSender ? "#8c8c8c" : '#4d8058'}}>
                    <View style={{flex:.2, marginBottom:3}}>
                      <Text style={{fontSize:10, textAlign:'left', color:'red'}}>{item.quote_by != undefined ? item.quote_by : ""}</Text>
                    </View>
                    <View style={{flex:.8}}>
                      <Text numberOfLines={2} style={{color:'black', fontStyle:'italic', fontSize:13, marginTop:5}}>"{item.quoted_msg}"</Text>
                    </View>
                 </View>
        }
      }
      else{
        return null;
      }
    }

    getAvatar(message){
      if(message.user != null){
        if(message.user.isSupport){
          if(message.user.responseType == 0){
            return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={SUPPORT_AVATAR} resizeMode={"cover"}/>;
          }
          else if(message.user.responseType == 1){
            return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={SUPPORT_AVATAR} resizeMode={"cover"}/>;
          }
          else if(message.user.responseType == 2){
            return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={SUPPORT_AVATAR} resizeMode={"cover"}/>;
          }
          else if(message.user.responseType == 3){
            return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={AMBERMEX_OFFICIAL} resizeMode={"cover"}/>;
          }
        }
        else if(message.user.isEmergencyContact){
          return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={EMCONTACT_AVATAR} resizeMode={"cover"}/>
        }
        else if(message.user.pictureUrl != null){
          return <Avatar
                  photo={message.user.pictureUrl}
                  iconSize="small"
                  />
        }
        else{
          return <Avatar
                  name={message.user.name === undefined ? "?..." : message.user.name}
                  iconSize="small"
                />
        }
      }
      else{
        return <Image style={[{backgroundColor:'lightgray'}, styles.photo]} source={EMPTY_PLACEHOLDER} resizeMode={"cover"}/>
      }
    }

    alertGetThumbnail(message){
      if(message.user != undefined && message.user.pictureUrl != null){
        return <Avatar
                photo={message.user.pictureUrl}
                iconSize="xlarge"
                />
      }
      else{
        return <Image style={{backgroundColor:'lightgray', height:70,width:70, borderRadius:35}} source={empty_thumbnail} resizeMode={"contain"}/>
      }
    }

    getLocationText(initialCoords){
      if(initialCoords != undefined && initialCoords.latitude != undefined){
        return "(" + initialCoords.latitude + ", " + initialCoords.longitude + ")";
      }
      else{
        return "(0, 0)";
      }
    }

    render() {
        const { message, otherSender, loading, messageObject, disableOptions, system_message, alertMessage, initialCoords } = this.props;
        const user = otherSender ? {full_name: loading ? "?" : message.sent_by} : '?';

        return (
        <View>
            {system_message ?
              (
                <View style={[styles.container, styles.positionToCenter]}>
                  <View style={[styles.message, styles.messageToCenter]}>
                  <Text style={[styles.messageTextSystem, styles.selfToCenter]}>
                    {message.body || ' '}
                  </Text>
                  </View>
                </View>
              )
              :
            otherSender ?
            (
              messageObject.text === this.props.alertMessage || (this.props.alert != undefined && messageObject.text === this.props.alert.text) ?
              <View style={[styles.container, styles.positionToCenter]}>
                <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToLeft]}>
                  <View style={[styles.message, styles.messageToLeft,{backgroundColor:this.props.textBackgroundColor}]}>
                  <View style={{flexDirection:'row', height:40, width:'100%', alignSelf:'center', marginTop:5, marginLeft:5}}>
                    <View style={{flexDirection:'column'}}>
                      <Image style={{width:40,height:40, borderRadius:20}} source={this.props.imageTitleAlert} resizeMode="cover" />
                    </View>
                    <View style={{flexDirection:'column', flex:.85, marginLeft:10, justifyContent:'center'}}>
                      <Text style={{color:this.props.titleTextColor, fontSize:14, fontWeight:'700'}}>{this.props.textTitleAlert}</Text>
                      <Text numberOfLines={1} style={{color:this.props.bodyTextColor, fontSize:11, marginBottom:5, fontWeight:'bold'}}><FontAwesome name="location-arrow" color={"white"} size={12}/> {this.getLocationText(initialCoords)}</Text>
                    </View>
                  </View>
                  {messageObject.isMedia || messageObject.isQuote ?
                    this.renderAttachment(messageObject,otherSender)
                    :
                    null
                  }
                  <View style={{flexDirection:'row'}}>
                  <View style={{flexDirection:'column', justifyContent:'center'}}>
                  {this.alertGetThumbnail(messageObject)}
                  </View>
                  <View style={{flexDirection:'column'}}>
                  <Hyperlink linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                  <Text onPress={() => this.openMessage(messageObject)}  style={[styles.messageTextAlert, styles.selfToLeft,{backgroundColor:this.props.textBackgroundColor,padding:10, color:this.props.bodyTextColor, maxWidth:fullWidth*.6}]}>
                    {message.body || ' '}
                  </Text>
                  </Hyperlink>
                  </View>
                  </View>
                  <Text style={styles.dateSentAlert}>
                    {this.userInformation(message.user_data) + getTime(message.date_sent)} {messageObject.isEdited ? " (Editado)" : null}
                  </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              :
            <View style={[styles.container, styles.positionToLeft]}>
              {this.getAvatar(messageObject)}
              <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToLeft]}>
                <View style={[styles.message, styles.messageToLeft]}>
                {message.user_data != null ?
                  <Text style={styles.username}>
                    {this.getUsername(message.user_data)}
                  </Text>
                  :
                  null
                }
                {messageObject.isMedia || messageObject.isQuote ?
                  this.renderAttachment(messageObject,otherSender)
                  :
                  null
                }
                <Hyperlink linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                <Text onPress={() => this.openMessage(messageObject)}  style={[styles.messageText, (otherSender ? styles.selfToLeft : styles.selfToRight)]}>
                  {message.body || ' '}
                </Text>
                </Hyperlink>
                <Text style={styles.dateSent}>
                  {getTime(message.date_sent)} {messageObject.isEdited ? " (Editado)" : null}
                </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            ) :
            (
            messageObject.text === this.props.alertMessage || (this.props.alert != undefined && messageObject.text === this.props.alert.text) ?
            <View style={[styles.container, styles.positionToCenter]}>
              <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToRight]}>
                <View style={[styles.message, styles.messageToRight,{backgroundColor:this.props.textBackgroundColor}]}>
                <View style={{flexDirection:'row', height:40, width:'95%', alignSelf:'center', marginTop:5}}>
                  <View style={{flexDirection:'column'}}>
                    <Image style={{width:40,height:40, borderRadius:20}} source={this.props.imageTitleAlert} resizeMode="cover" />
                  </View>
                  <View style={{flexDirection:'column', flex:.85, marginLeft:10, justifyContent:'center'}}>
                    <Text style={{color:this.props.titleTextColor, fontSize:14, fontWeight:'700'}}>{this.props.textTitleAlert}</Text>
                    <Text numberOfLines={1} style={{color:this.props.bodyTextColor, fontSize:11, marginBottom:5, fontWeight:'bold'}}><FontAwesome name="location-arrow" color={this.props.bodyTextColor} size={12}/> {this.getLocationText(initialCoords)}</Text>
                  </View>
                </View>
                {messageObject.isMedia || messageObject.isQuote ?
                  this.renderAttachment(messageObject,otherSender)
                  :
                  null
                }
                <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'column', justifyContent:'center'}}>
                {this.alertGetThumbnail(messageObject)}
                </View>
                <View style={{flexDirection:'column'}}>
                <Hyperlink linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                <Text onPress={() => this.openMessage(messageObject)} style={[styles.messageTextAlert, styles.selfToLeft,{backgroundColor:this.props.textBackgroundColor,padding:10, color:this.props.bodyTextColor, maxWidth:fullWidth*.6}]}>
                  {message.body || ' '}
                </Text>
                </Hyperlink>
                </View>
                </View>
                <View style={{ padding:5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={styles.dateSentAlert}>
                    {messageObject.isEdited ? "(Editado) " : null} {getTime(message.date_sent)}
                  </Text>
                </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
            :
            <View style={[styles.container, styles.positionToRight]}>
              <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToRight]}>
                <View style={[styles.message, styles.messageToRight]}>
                {messageObject.isMedia || messageObject.isQuote ?
                  this.renderAttachment(messageObject,otherSender)
                  :
                  null
                }
                <Hyperlink linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                <Text onPress={() => this.openMessage(messageObject)} style={[styles.messageText, styles.selfToRight]}>
                  {message.body || ' '}
                </Text>
                </Hyperlink>
                <View style={{ padding:5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={styles.dateSent}>
                    {messageObject.isEdited ? "(Editado) " : null} {getTime(message.date_sent)}
                  </Text>
                </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
            )
            }
        </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    positionToLeft: {
      justifyContent: 'flex-start'
    },
    positionToRight: {
      justifyContent: 'flex-end'
    },
    positionToCenter: {
      justifyContent: 'center'
    },
    photo: {
      borderRadius: 18,
      height: 36,
      width: 36,
      marginRight: 5,
      justifyContent: 'center',
      alignItems: 'center',
      overflow:'hidden'
    },
    message: {
      paddingTop: 5,
      paddingBottom: 3,
      paddingHorizontal: 6,
      borderRadius: 10,
      justifyContent:'center'
    },
    messageToLeft: {
      maxWidth: fullWidth - 70,
      borderBottomLeftRadius: 2,
      backgroundColor: 'white'
    },
    messageToRight: {
      maxWidth: fullWidth - 55,
      borderBottomRightRadius: 2,
      backgroundColor: '#c2d6b2'
    },
    messageToCenter: {
      maxWidth: (fullWidth/3)*2,
      borderRadius: 50,
      backgroundColor: '#bbcbb7'
    },
    messageTextSystem: {
      fontSize: 14,
      color: 'black'
    },
    messageText: {
      fontSize: 16,
      color: 'black'
    },
    messageTextAlert: {
      fontSize: 16,
      color: 'white'
    },
    selfToLeft: {
      alignSelf: 'flex-start'
    },
    selfToRight: {
      alignSelf: 'flex-end'
    },
    selfToCenter: {
      alignSelf: 'center',
      textAlign:'center',
      fontSize:13,
      paddingLeft:20,
      paddingRight:20,
      padding:5
    },
    dateSent: {
      alignSelf: 'flex-end',
      paddingTop: 1,
      paddingHorizontal: 3,
      fontSize: 12,
      color: 'gray'
    },
    dateSentAlert: {
      alignSelf: 'flex-end',
      paddingTop: 1,
      paddingHorizontal: 3,
      fontSize: 12,
      color: 'dimgray'
    },
    username:{
      alignSelf: 'flex-start',
      paddingTop: 1,
      paddingHorizontal: 0,
      fontSize: 12,
      color: 'black',
      fontWeight:'600',
      marginBottom:3
    }
  })

  export default MessageAlert;
