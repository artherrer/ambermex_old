import React, { Component } from 'react'
import { View, Text, Button, ActivityIndicator, Dimensions, Linking, ScrollView, Image, Alert } from 'react-native'
import { ListItem, Icon, Avatar as AvatarAlt, Button as ButtonAlt  } from 'react-native-elements';
var { height, width } = Dimensions.get('window');
import Avatar from '../cmps/avatar.js'
var SQLite = require('react-native-sqlite-storage')
import DeviceInfo from 'react-native-device-info';
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

let ambermex_logo = require("../../../assets/image/AMBERMEX_HORIZONTAL.png");
const EndpointRequests = require("../../util/requests.js");
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux';

class TermsAndConditions extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle: navigation.state.params != undefined && navigation.state.params.loading ?
    () => <ActivityIndicator size="small" color="#7D9D78" style={{alignSelf:'center'}} />
    :
    "Términos y Condiciones",
    headerBackTitle: ' ',
    headerLeftContainerStyle:{
      padding:10,
      paddingLeft:0
    },
    headerTintColor: '#7D9D78',
    headerTitleStyle: {color:'black'},
  });

  constructor(props) {
    super(props);

    this.state = {
      loadingTerms:true,
      accepting:false
    }
  }

  componentDidMount(){

  }

  acceptTerms(){
    this.setState({accepting:true});

    EndpointRequests.AcceptTerms(function(responseData) {
      if(responseData.message != undefined && responseData.message === "Ok"){
        Alert.alert(
         'Éxito',
         "Has aceptado los términos y condiciones exitosamente.",
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )
        this.props.dispatch({type:"ACCEPT_TERMS"});
        this.setState({showTerms:false,accepting:false});
        this.props.navigation.pop();
      }
    }.bind(this));
  }

  changeCSS(){
    /*
    let stringInject = "";

    for(let i = 0; i < 37;i++){
      stringInject = stringInject + 'document.getElementsByClassName("font_8")['+i+'].style.fontSize = "10px";';
    }
    */
    //this.webview2.injectJavaScript('document.getElementById("SITE_FOOTER").style.display = "none";document.getElementById("SITE_HEADER").style.height = "0px";document.getElementById("SITE_HEADER").style.display = "none"; '+stringInject+';true;');
    setTimeout(function(){
      this.setState({loadingTerms:false});
    }.bind(this),1000);
  }

  onMessage(){
    console.log('css');
  }

  render() {
    let { loadingTerms } = this.state;
    return (
      <View style={{height:"100%",justifyContent:'center'}}>
      <WebView
        ref={(ref) => (this.webview2 = ref)}
        onLoad={(syntheticEvent) => {
          this.changeCSS();
        }}
        startInLoadingState={true}
        automaticallyAdjustContentInsets={false}
        originWhitelist={["*"]}
        useWebKit={true}
        onMessage={() => this.onMessage()}
        style={{flex:1}}
        source={{ uri: 'https://www.botonambermex.com/terminos-de-uso' }} />
        {loadingTerms ?
          <View style={{position:'absolute', height:height - headerHeight,top:0, backgroundColor:'white', width:width, justifyContent:'center'}}>
            <ActivityIndicator size="large" style={{alignSelf:'center', color:'gray'}}/>
          </View>
          :
          null
        }
        {!this.props.userState.UserData.termsAccepted ?
        <View style={{height:iPhoneX ? 60 : 70, paddingTop:10, width:width, backgroundColor:'white'}}>
        <ButtonAlt title={"Aceptar"} loading={this.state.accepting} disabled={this.state.accepting || this.state.loadingTerms} borderRadius={5} titleStyle={{fontWeight:'bold', paddingLeft:10, paddingRight:10}} buttonStyle={{width:150, padding:10,backgroundColor:"#44AB74", borderRadius:25, alignSelf:'center'}}
         onPress={() => { this.acceptTerms() }}style={{alignSelf:'center'}}/>
        </View>
        :
        null
        }
      </View>
);
}
}

let TermsAndConditionsContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(TermsAndConditions);
export default TermsAndConditionsContainer;
