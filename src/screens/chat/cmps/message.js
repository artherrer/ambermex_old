import React, { Component } from 'react'
import { StyleSheet, View, Text, Image, Dimensions, Linking, TouchableOpacity, ActivityIndicator, Modal, Platform, TouchableWithoutFeedback, ActionSheetIOS } from 'react-native'
import { getTime } from '../../../util/getTime'
import Avatar from '../../cmps/avatar'
import { Icon } from 'react-native-elements';
import Hyperlink from 'react-native-hyperlink'

const fullWidth = Dimensions.get('window').width
const fullHeight = Dimensions.get('window').height
import { connect } from 'react-redux';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import { xml, jid, client } from '@xmpp/client/react-native';
import FastImage from 'react-native-fast-image'
import Video from 'react-native-video';
const cloneDeep = require('lodash/cloneDeep');

class Message extends Component {

    userInformation(user_data){
      if(user_data != undefined && user_data.alias != undefined){
        return user_data.alias + " - ";
      }
      else{
        return "";
      }
    }

    getUsername(user_data){
      if(user_data != undefined && user_data.alias != undefined){
        return user_data.alias;
      }
      else{
        return "";
      }
    }

    retrySending(item){
      this.props.clientState.DB.transaction((tx) => {
        tx.executeSql('SELECT * FROM messages WHERE id = ?',
        [item.id],
        (txt, results) => {
          var len = results.rows.length;
          if(len > 0){
            let row = results.rows.item(0);

            if(row.isMedia && !row.isQuoted){
              if(row.isImage){
                let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(row.text)), xml("resourceId", {}, this.props.resourceId), xml("type", {}, "multimedia"), xml("fileType", {}, "image"), xml("url", {}, row.url), xml("filename", {}, "image.jpeg"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                let response = this.props.clientState.Client.send(message);
              }
              else if(row.isVideo){
                let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(row.text)), xml("resourceId", {}, this.props.resourceId), xml("type", {}, "multimedia"), xml("fileType", {}, "video"), xml("url", {}, row.url), xml("filename", {}, "video.mp4"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                let response = this.props.clientState.Client.send(message);
              }
              else if(row.isFile){
                let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(row.text)), xml("resourceId", {}, this.props.resourceId), xml("type", {}, "multimedia"), xml("fileType", {}, "file"), xml("url", {}, row.url), xml("filename", {}, "doc"), xml("request", {xmlns:"urn:xmpp:receipts"}));
                let response = this.props.clientState.Client.send(message);
              }
            }
            else if(row.isQuoted){
              if(row.isMedia){
                let mediaType = row.isVideo ? "video" : (row.isImage ? "image" : "file");

                let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(row.text)), xml("resourceId", {}, this.props.resourceId), xml("messageType", {}, "quote"), xml("quoted_id", {}, row.quoted_msg_id), xml("quoted_msg", {}, row.quoted_text), xml("mediaType", {}, mediaType), xml("url", {}, row.url), xml("thumbnail", {}, row.thumbnail), xml("request", {xmlns:"urn:xmpp:receipts"}));
                let response = this.props.clientState.Client.send(message);
              }
              else{
                let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(row.text)), xml("resourceId", {}, this.props.resourceId), xml("messageType", {}, "quote"), xml("quoted_id", {}, row.quoted_msg_id), xml("quoted_msg", {}, row.quoted_text), xml("request", {xmlns:"urn:xmpp:receipts"}));
                let response = this.props.clientState.Client.send(message);
              }
            }
            else{
              let message = xml("message", {to: this.props.channelId, id:row.id, from: this.props.chatNickname, type:'groupchat'}, xml("body", {}, String(item.body)), xml("resourceId", {}, this.props.resourceId), xml("request", {xmlns:"urn:xmpp:receipts"}), xml("markable",{xmlns:"urn:xmpp:chat-markers:0"}));
              let response = this.props.clientState.Client.send(message);
            }
          }
        })
      });
    }

    getPendingComponent(item){
      if(item.pending){
        let startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 1);

        if(item.date_sent.getTime() >= startDate.getTime()){
          return <ActivityIndicator size="small" color="white" style={{marginLeft:3}} />
        }
        else if(item.resending === true){
          return <ActivityIndicator size="small" color="white" style={{marginLeft:3}} />
        }
        else{
          return <TouchableOpacity onPress={() => this.retrySending(item)} style={{marginLeft:3}}>
                    <Text style={{fontSize:11, color:'white'}}>Presiona para re-intentar enviar</Text>
                </TouchableOpacity>
        }
      }

      return null;
    }

    renderAttachment(item, otherSender){
      if(item.isMedia && item.url != null && !item.isQuote){
        if(item.isImage){
          return <TouchableWithoutFeedback onPress={() => this.props.showImage(item)} style={{height:fullHeight/3.5, width:fullWidth/2.5, justifyContent:'center', alignItems:'center'}}>
                  <FastImage
                    style={{height:fullHeight/3.5, width:fullWidth/2.5, borderRadius:10, marginBottom:5, justifyContent:'center', alignSelf:'center'}}
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
                        ((item.thumbnail != undefined && item.thumbnail != "") || (item.url != undefined && item.url != "")
                        ?
                        <Image source={{uri:item.isVideo && item.thumbnail != undefined ? item.thumbnail : item.url}} resizeMode="cover" style={{height:50}} />
                        :
                        null
                        )
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

    openMessage(message){
      if(message.isAlert){
        let text = cloneDeep(message.text);
        let StringCoords = text.match(/\(([^)]+)\)/)[1];
        StringCoords = StringCoords.split(",");

        if(StringCoords.length > 1){
          Coordinates = {
            latitude:parseFloat(StringCoords[0]),
            longitude:parseFloat(StringCoords[1])
          };

          let mapsUrl = "http://maps.google.com/?q=" + Coordinates.latitude + "," + Coordinates.longitude;

          Linking.openURL(mapsUrl);
        }
      }
      else if(this.props.disableOptions){
        return false;
      }
      else{
        if(message.username === this.props.userState.Nickname){
          this.props.openSheet("Editar", message);
        }
        else{
          this.props.openSheet("Contestar", message);
        }
      }
    }

    render() {
        const { message, otherSender, loading, messageObject, disableOptions, system_message } = this.props;
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
            <View style={[styles.container, styles.positionToLeft]}>
              {message.user_data != null ?
                (
                  message.user_data.pictureUrl != null ?
                  <Avatar
                    photo={message.user_data.pictureUrl}
                    iconSize="small"
                  />
                  :
                  <Avatar
                    name={message.user_data.name === undefined ? "?..." : message.user_data.name}
                    iconSize="small"
                  />
                )
                :
                <Avatar
                  name={"?"}
                  iconSize="small"
                />
              }
              <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToLeft]}>
                <View style={[styles.message, styles.messageToLeft]}>
                {message.user_data != null && this.props.chatType != 1 ?
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
                <Hyperlink onPress={(url, text) => alert("test")} linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                <Text style={[styles.messageText, (otherSender ? styles.selfToLeft : styles.selfToRight)]}>
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
            <View style={[styles.container, styles.positionToRight]}>
              <TouchableWithoutFeedback onPress={() => this.openMessage(messageObject)} style={[styles.message, styles.messageToRight]}>
                <View style={[styles.message, styles.messageToRight]}>
                {messageObject.isMedia || messageObject.isQuote ?
                  this.renderAttachment(messageObject,otherSender)
                  :
                  null
                }
                <Hyperlink onPress={(url, text) => alert("test")} linkStyle={{ color: '#0000EE',textDecorationLine: 'underline'}} linkDefault={ true }>
                <Text style={[styles.messageText, styles.selfToRight]}>
                  {message.body || ' '}
                </Text>
                </Hyperlink>
                <View style={{ padding:5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={styles.dateSent}>
                    {messageObject.isEdited ? "(Editado) " : null} {getTime(message.date_sent)}
                  </Text>
                  {message.pending || (message.sent_by === this.props.nickname && this.props.memberCount > 0 && message.id === this.props.lastMessage) ?
                    (message.read_by_count > 1 && message.read_by_count == this.props.memberCount ?
                      <View style={{top:2,right:-3,height:20,width:20, alignSelf:"center",borderColor:'#0084FF', backgroundColor:'transparent', borderWidth:0, borderRadius:10, justifyContent:'center'}}>
                        <MaterialCommunity name="check-all" color="#99CC66" style={{textAlign:'center', fontSize:15}} />
                      </View>
                      :
                      (message.pending ?
                        this.getPendingComponent(message)
                        :
                        <View style={{top:2,right:-3,height:18,width:18, alignSelf:"flex-start", borderColor:'white', borderWidth:0, borderRadius:9, justifyContent:'center'}}>
                          <MaterialCommunity name="check" size={15} color="#99CC66" style={{textAlign:'center', fontSize:14}} />
                        </View>
                      )
                    )
                    :
                    null
                  }
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
    message: {
      paddingTop: 5,
      paddingBottom: 3,
      paddingHorizontal: 6,
      borderRadius: 10,
      justifyContent:'center'
    },
    messageToLeft: {
      maxWidth: fullWidth - 90,
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

  let MessageContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(Message);
  export default MessageContainer;
