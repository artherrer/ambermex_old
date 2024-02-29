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
const cloneDeep = require('lodash/cloneDeep');

const EndpointRequests = require("../../util/requests.js");
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class ChallengeEnd extends React.Component {
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

	verifyCode(){
    const { Code } = this.state;

    this.setState({VerifyLoading:true});
		let completeChallengeModel = cloneDeep(this.props.userState.LoginInfo);
		completeChallengeModel.code = Code;

    EndpointRequests.CompleteChallengeDevice(completeChallengeModel, function(response) {
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
        this.props.clientState.SetSigninData(response);
      }
    }.bind(this));
  }

  evaluateData(text){
    if(text.length < 3){
      this.setState({Invalid:true, Code:text});
    }
    else{
      this.setState({Invalid:false, Code:text});
    }

    return false;
  }

  generateCode(){
    this.setState({VerifyLoading:true});
		let challengeModel = {
      Phone: null,
      Email: this.props.userState.LoginInfo.Username
    };

    EndpointRequests.GetChallengeDeviceValidationCode(challengeModel, function(response){
      if(response.message == "Ok"){
				Alert.alert(
         'Exito',
         'El código fue generado exitosamente.',
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

  render() {
		var { Invalid } = this.state;

    return (
      <TouchableWithoutFeedback style={{height:height, backgroundColor: 'white'}} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      <View style={styles.containerImg}>
        <Image style={styles.imageSize} resizeMode="contain" source={require('../../../assets/image/logo_with_text.png')} />
      </View>
      <View style={styles.containerControls}>
			<Text style={{fontSize:12,justifyContent:'center',color:'grey',marginBottom:30,alignSelf:'center', textAlign:'center'}}>Ingresa el código que recibiste via SMS en el teléfono registrado.</Text>
      <Input value={this.state.Code} inputStyle={{ letterSpacing: 5 }} onChangeText={(text) => this.evaluateData(text)} textAlign={'center'} keyboardType='numeric' containerStyle={{ width: width/1.5, alignSelf:'center', height:40, marginBottom:10, borderStyle: 'solid', overflow: 'hidden', borderWidth: 1, borderColor: 'grey', borderRadius: 25}} placeholder="0 0 0 0 0 0"/>
      <ButtonAlt title="Verificar" borderRadius={5} disabled={Invalid || this.state.VerifyLoading} loading={this.state.VerifyLoading} titleStyle={{fontWeight:'bold'}} buttonStyle={{ width: width/1.5, alignSelf:'center', backgroundColor:'#7CB185', borderRadius:25, marginTop:10}} backgroundColor="black"
       style={{alignSelf:'center'}} onPress={() => this.verifyCode()}/>
      </View>
      <View style={styles.containerLinks}>
      <Text onPress={() => this.generateCode()} style={{alignSelf:'center', marginTop:20,fontSize:12,color:'#2AA9E0', textAlign:'center'}}>El código puede tomar un minuto en llegar. Si no recibiste el código presiona aquí.</Text>
      </View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

let ChallengeEndContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(ChallengeEnd);
export default ChallengeEndContainer;

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
