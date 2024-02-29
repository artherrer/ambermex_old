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

class ChallengeStart extends React.Component {
	static navigationOptions = {
	    header: null
	  };

	  constructor(props) {
	    super(props);

	    this.state = {
  			VerifyLoading:false,
        position: new Animated.Value(-50),
        opacity:  new Animated.Value(1),
        margin: new Animated.Value(0),
        Code:"",
        Invalid:true,
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

  generateCode(){
    this.setState({VerifyLoading:true});
    let challengeModel = {
      Phone: null,
      Email: this.props.userState.LoginInfo.Username
    };

    EndpointRequests.GetChallengeDeviceValidationCode(challengeModel, function(response){
      if(response.message == "Ok"){
        //navigate to last step verify code and let user pass
        this.props.navigation.navigate('ChallengeEnd');
      }
      else{
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
      }
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

    return (
      <TouchableWithoutFeedback style={{height:height, backgroundColor: 'white'}} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      <View style={styles.containerImg}>
        <Image style={styles.imageSize} resizeMode="contain" source={require('../../../assets/image/logo_with_text.png')} />
      </View>
      <View style={styles.containerControls}>
      <Text style={{fontSize:20,marginBottom:10,alignSelf:'center'}}>¡Atención!</Text>
      <Text style={{fontSize:14,justifyContent:'center',color:'grey',marginBottom:30,alignSelf:'center', textAlign:'center'}}>El usuario que ingresaste se encuentra activo en otro dispositivo. Deseas iniciar el proceso de transferencia de servicio? (El dispositivo actual firmado en Ambermex perderá acceso a la plataforma)</Text>
      <ButtonAlt title="Continuar" borderRadius={5} disabled={this.state.VerifyLoading} loading={this.state.VerifyLoading} titleStyle={{fontWeight:'bold'}} buttonStyle={{ width: width/1.5, alignSelf:'center', backgroundColor:'#7CB185', borderRadius:25, marginTop:10}} backgroundColor="black"
       style={{alignSelf:'center'}} onPress={() => this.generateCode()}/>
       <ButtonAlt title="Cancelar" borderRadius={5} titleStyle={{fontWeight:'bold'}} buttonStyle={{ width: width/1.5, alignSelf:'center', backgroundColor:'red', borderRadius:25, marginTop:10}}
        style={{alignSelf:'center'}} onPress={() => this.goBack()}/>
      </View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

let ChallengeStartContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(ChallengeStart);
export default ChallengeStartContainer;

const styles = StyleSheet.create({
  container: {
		flex: 1,
		justifyContent: 'center',
    paddingRight:50,
    paddingLeft:50
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
		justifyContent: 'flex-start',
		alignItems: 'center'
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
