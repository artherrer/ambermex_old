/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, StatusBar, Dimensions, AsyncStorage, Image, Platform, Animated, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Button as ButtonAlt, Input } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';
const icon = require('../../../assets/image/logo_with_text.png');
import { connect } from 'react-redux';
import { Header, HeaderHeightContext, useHeaderHeight } from 'react-navigation-stack'

const EndpointRequests = require("../../util/requests.js");
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class VerifyCode extends React.Component {
	static navigationOptions = {
	    header: null
	  };

	  constructor(props) {
	    super(props);

      var creds = props.navigation.state.params.Creds;
      var resend = props.navigation.state.params.Resend != undefined ? props.navigation.state.params.Resend : false;

	    this.state = {
  			VerifyLoading:false,
        position: new Animated.Value(-50),
        opacity:  new Animated.Value(1),
        margin: new Animated.Value(0),
        emailLogin:true,
        Code:"",
        Invalid:true,
        XMPPCreds:creds,
        ResendSMS:resend
	  }
  }

  componentDidMount(){
    let { XMPPCreds, ResendSMS } = this.state;

    this.props.dispatch({type:'ADD_USERNAME', Password:XMPPCreds.Password, Username:XMPPCreds.Username});

    if(ResendSMS){
      this.generateCode();
    }
  }

  showForm(){

    this.setState({emailLogin:true});

    Animated.parallel([
      Animated.timing(                  // Animate over time
        this.state.position,            // The animated value to drive
        {
          toValue: -50,                   // Animate to opacity: 1 (opaque)
          duration: 500,              // Make it take a while
          useNativeDriver: true
        }
      ),
      Animated.timing(                  // Animate over time
        this.state.opacity,            // The animated value to drive
        {
          toValue: 1,                   // Animate to opacity: 1 (opaque)
          duration: 500,              // Make it take a while
          useNativeDriver: true
        }
      ),
      Animated.timing(                  // Animate over time
        this.state.margin,            // The animated value to drive
        {
          toValue: 0,                   // Animate to opacity: 1 (opaque)
          duration: 500,              // Make it take a while
          useNativeDriver: true
        }
      )
		]).start(() => {
      //
		});
  }

  hideForm(){
    this.setState({opacity:new Animated.Value(1), emailLogin:false});


    Animated.parallel([
      Animated.timing(                  // Animate over time
        this.state.margin,            // The animated value to drive
        {
          toValue: 0,                   // Animate to opacity: 1 (opaque)
          duration: 500,              // Make it take a while
          useNativeDriver: true
        }
      ),
      Animated.timing(                  // Animate over time
        this.state.position,            // The animated value to drive
        {
          toValue: 0,                   // Animate to opacity: 1 (opaque)
          duration: 500,              // Make it take a while
          useNativeDriver: true
        }
      )
		]).start(() => {
		    // callback
        this.setState({opacity:new Animated.Value(0), Email:"", Password:""});
		});

  }

  evaluateData(){
    const { Code } = this.state;

    if(Code.length < 3){
      this.setState({Invalid:true});
    }
    else{
      this.setState({Invalid:false});
    }

    return false;
  }

  verifyCode(){
    const { Code, XMPPCreds } = this.state;

    this.setState({VerifyLoading:true});

    EndpointRequests.VerifyCode(Code, function(response) {
      if(response.message != "Ok"){
        Alert.alert(
         'Error',
         response.message,
         [
           {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
         ],
         { cancelable: false }
        )

        setTimeout(function(){
          this.setState({VerifyLoading:false});
        }.bind(this), 250);
      }
      else{
        AsyncStorage.setItem("Status", "phoneverified", (asyncError) => {
          this.props.navigation.navigate('Profile', {Creds:XMPPCreds});
        });
      }
    }.bind(this));
  }

  generateCode(){
    this.setState({VerifyLoading:true});
    EndpointRequests.GeneratePhoneCode(function(response){
      Alert.alert(
       'Atención',
       response.message,
       [
         {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
       ],
       { cancelable: false }
      )
      setTimeout(function(){
        this.setState({VerifyLoading:false});
      }.bind(this), 250);
    }.bind(this));
  }

  goBack(){
    let keys = ['access_token', 'refresh_token', 'expires_in', "Status","LoginCreds", "UserData"];
    AsyncStorage.multiRemove(keys, (err) => {
    });

    let NavigateTo = StackActions.reset({
        index: 0,
        actions: [
              NavigationActions.navigate({ routeName: "Signin"})
          ]
     });

     this.props.navigation.dispatch(NavigateTo);
  }

  render() {

	  var { Invalid } = this.state;

    return (
      <TouchableWithoutFeedback style={{height:height, backgroundColor: 'white'}} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      <View style={styles.containerImg}>
        <Image style={styles.imageSize} resizeMode="contain" source={require('../../../assets/image/logo_with_text.png')} />
      </View>
      <View style={styles.containerControls}>
      <Text style={{fontSize:20,marginBottom:10,alignSelf:'center'}}>¡Bienvenido!</Text>
      <Text style={{fontSize:12,justifyContent:'center',color:'grey',marginBottom:30,alignSelf:'center', textAlign:'center'}}>Ingresa el código que recibiste via SMS en el teléfono registrado.</Text>
      <Input value={this.state.Code} inputStyle={{ letterSpacing: 5 }} onChangeText={(text) => this.setState({Code:text})} textAlign={'center'} keyboardType='numeric' containerStyle={{ width: width/1.5, alignSelf:'center', height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} placeholder="0 0 0 0 0 0"/>
      <ButtonAlt title="Verificar" borderRadius={5} disabled={this.state.VerifyLoading} loading={this.state.VerifyLoading} titleStyle={{fontWeight:'bold'}} buttonStyle={{ width: width/1.5, alignSelf:'center', backgroundColor:'#7CB185', borderRadius:25, marginTop:10}} backgroundColor="black"
       style={{alignSelf:'center'}} onPress={() => this.verifyCode()}/>
       <Text onPress={() => this.generateCode()} style={{alignSelf:'center',marginTop:20,fontSize:12,color:'grey'}}> Enviar código nuevo</Text>
      </View>
      <View style={styles.containerLinks}>
      <Text onPress={() => this.generateCode()} style={{alignSelf:'center', marginTop:20,fontSize:12,color:'#2AA9E0', textAlign:'center'}}>El código puede tomar un minuto en llegar. Si no recibiste el código presiona aquí.</Text>
      <Text onPress={() => this.goBack()} style={{alignSelf:'center', marginTop:20, fontSize:12,color:'red'}}>Entrar con otra cuenta.</Text>
      </View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

let VerifyCodeContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(VerifyCode);
export default VerifyCodeContainer;

const styles = StyleSheet.create({
  container: {
		flex: 1,
		justifyContent: 'center',
    paddingRight:50,
    paddingLeft:50,
    backgroundColor:'white'
	},
  containerControls:{
    height:((height - headerHeight) - height*.25)/2,
    justifyContent:'space-between',
  },
  containerLinks:{
    height:((height - headerHeight) - height*.25)/2,
    justifyContent:'flex-end',
    paddingBottom:30
  },
  containerImg: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	input: {
		height: 50,
		color: 'black',
		borderRadius: 25,
		marginVertical: 5,
		marginHorizontal: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: '#eee',
		fontSize: 18,
	},
	buttonContainer: {
		height: 50,
		borderRadius: 25,
		marginHorizontal: 20,
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonLabel: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: '700'
	},
  imageSize: {
		width: width*.25,
		height: height*.25
	},
})
