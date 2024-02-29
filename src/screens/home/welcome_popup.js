import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, StatusBar } from 'react-native'
import { Icon,Slider, Button as ButtonAlt } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack'

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
import { WebView } from 'react-native-webview';

class WelcomePopup extends Component{
  constructor(props) {
    super(props)
    this.state = {
      loadingWelcome:true
    }
  }

  closeWelcome(){
    this.props.closeWelcome();
  }

  changeCSS(){
    /*
    let stringInject = "";

    for(let i = 0; i < 37;i++){
      stringInject = stringInject + 'document.getElementsByClassName("font_8")['+i+'].style.fontSize = "10px";';
    }
    this.webview2.injectJavaScript('document.getElementById("SITE_FOOTER").style.display = "none";document.getElementById("SITE_HEADER").style.height = "0px";document.getElementById("SITE_HEADER").style.display = "none"; '+stringInject+'true;');
    */
    setTimeout(function(){
      this.setState({loadingWelcome:false});
    }.bind(this),1000);
  }

  onMessage(){
    console.log('css');
  }

  render(){
    let header = headerHeight;
    let { loadingWelcome } = this.state;
    return (
      <View>
      <Modal
      animationType="slide"
      transparent={false}
      backdropPressToClose={false}
      backdrop={false}
      visible={this.props.showWelcome}
      onRequestClose={() => {
        this.closeWelcome();
      }}>
      <View style={{
        backgroundColor: 'transparent',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <View style={{flex:1, width:width, flexDirection:'column',backgroundColor:iPhoneX ? 'white' : 'white'}}>
        <WebView
          ref={(ref) => (this.webview2 = ref)}
          onLoad={(syntheticEvent) => {
            this.changeCSS();
          }}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" style={{top:-50}}/>}
          automaticallyAdjustContentInsets={false}
          originWhitelist={["*"]}
          useWebKit={true}
          onMessage={() => this.onMessage()}
          style={{flex:1, height:height - headerHeight}}
          source={{ uri: 'https://www.botonambermex.com/guiarapida' }} />
          {loadingWelcome ?
            <View style={{position:'absolute', height:iPhoneX ? height - 40 : height - 24,backgroundColor:'white', width:width, justifyContent:'center'}}>
              <ActivityIndicator size="large" style={{alignSelf:'center', color:'gray'}}/>
            </View>
            :
            null
          }
        <View style={{height:iPhoneX ? 80 : 70, paddingTop:10, width:width, backgroundColor:'white'}}>
        <ButtonAlt title={"Cerrar"} disabled={this.state.loadingWelcome} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{width:150, padding:10,backgroundColor:"#44AB74", borderRadius:25, alignSelf:'center'}}
         onPress={() => { this.props.closeWelcome() }}style={{alignSelf:'center'}}/>
        </View>
        </View>
          </View>
          </Modal>
            </View>
          )
        }
      }

export default WelcomePopup;
