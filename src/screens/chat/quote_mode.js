import React, { Component } from 'react'
import { View, Text, StyleSheet, Image, Keyboard, Dimensions, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

class QuoteEditMode extends Component{
  constructor(props) {
    super(props)
    this.state = {}
  }

  render(){

    return (
      this.props.openView ?
        <View style={{height:60, width:width, backgroundColor:'white', borderColor:'gray', borderTopWidth:1}}>
          <View style={{flexDirection:'row', flex:1}}>
          <View style={{width:50,height:60, backgroundColor:'white', justifyContent:'center'}}>
            <TouchableOpacity style={{height:60, justifyContent:'center', alignSelf:'center'}}
            onPress={() => {
              Keyboard.dismiss;
              this.props.closeQuoteMode();
            }}>
              <Icon type="ionicon" name="ios-close-circle-outline" color={'black'} size={25} style={{marginBottom:0, textAlign:'center'}} />
            </TouchableOpacity>
          </View>
          <View style={{width:this.props.quotedMessage.isMedia ? (width/1.35) - 50 : width - 50,height:60, backgroundColor:'white', padding:10, justifyContent:'center'}}>
            <Text style={{fontWeight:'bold', color:'black', fontSize:13}}>{this.props.quoteMode ? "Contestar a:" : "Editar Mensaje"} {!this.props.editMode && this.props.quotedMessage.user != undefined ? this.props.quotedMessage.user.alias : ""}</Text>
            <Text numberOfLines={2} style={{color:'gray', marginTop:5}}>{this.props.quotedMessage.text}</Text>
          </View>
          {this.props.quotedMessage.isMedia ?
            <View style={{height:60, justifyContent:'center'}}>
              {this.props.quotedMessage.isImage || this.props.quotedMessage.isVideo ?
                <Image style={{height:50, width:50, marginTop:5}} source={{uri:this.props.quotedMessage.isImage ? this.props.quotedMessage.url : this.props.quotedMessage.thumbnail}} resizeMode="cover" />
                :
                <Icon name="attach-file" size={30} color={'gray'} style={{textAlign:'left'}} />
              }
            </View>
            :
            null
          }
          </View>
        </View>
        :
        null
          )
        }
      }

export default QuoteEditMode;
