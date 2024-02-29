import React, { Component } from 'react'
import { StyleSheet, View, Image, ActivityIndicator, AsyncStorage, Platform, NativeModules } from 'react-native'
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
let DeviceName;
DeviceInfo.getDeviceName().then((deviceName) => {
  DeviceName = deviceName;
});
class AppWrap extends Component {
  constructor(props) {
    super(props)
    this.initUser()
  }

  initUser = async () => {
    const { navigation } = this.props;

    AsyncStorage.multiGet(["LoginCreds", "UserData", "Status", "OfficialSchedule", "DeviceData"], async (asyncError, Store) => {
      if(asyncError != null){
        navigation.navigate('LandingScreen');
      }
      else{
        let Creds = null;
        let UserData = null;
        let Status = null;
        let OfficialSchedule = null;
        let DeviceData = null;
        for(let m = 0; m < Store.length;m++){
          if(Store[m][0] === 'LoginCreds'){
            if(Store[m][1] != null){
              Creds = Store[m][1];
              Creds = JSON.parse(Creds);
            }
          }
          else if(Store[m][0] === 'UserData'){
            if(Store[m][1] != null){
              UserData = Store[m][1];
              UserData = JSON.parse(UserData);
            }
          }
          else if(Store[m][0] === "Status"){
            if(Store[m][1] != null){
              Status = Store[m][1];
            }
          }
          else if(Store[m][0] === "OfficialSchedule"){
            if(Store[m][1] != null){
              OfficialSchedule = Store[m][1];
              OfficialSchedule = JSON.parse(OfficialSchedule);
            }
          }
          else if(Store[m][0] === "DeviceData"){
            if(Store[m][1] != null){
              DeviceData = Store[m][1];
              DeviceData = JSON.parse(DeviceData);
            }
          }
        }

        if(DeviceData == undefined){
          try{
            DeviceData = {
              os: Platform.OS,
              model:DeviceInfo.getDeviceId(),
              manufacturer:DeviceInfo.getBrand(),
              language:this.getDeviceLocale(),
              serialNumber:DeviceInfo.getUniqueId(),
              buildNumber:DeviceInfo.getBuildNumber(),
              codeName:DeviceName
            };
            AsyncStorage.setItem("DeviceData", JSON.stringify(DeviceData), (asyncError) => {});
          }
          catch(err){
            console.log(err);
          }
        }

        if(Creds != null && UserData != null){
          if(Status === "verified" || Status === "pendingverification"){
            this.props.dispatch({type:"SET_USERDATA", UserData: UserData, DeviceData:DeviceData});
            if(OfficialSchedule != undefined){
              this.props.dispatch({type:'SET_SCHEDULE', Schedule:OfficialSchedule});
            }
            if(UserData.verifiedIdentity === 2){
              this.props.clientState.LoginXMPP(Creds.Username, Creds.Password, Creds.Resource);
              this.props.clientState.ConfigurePush(Creds.Username);
            }
            else{
              this.props.dispatch({type:"SET_USERDATA", UserData: UserData, DeviceData:DeviceData});
              navigation.navigate('Profile', {Creds:Creds});
              this.props.clientState.ConfigurePush(Creds.Username);
            }
          }
          else if(Status === "not_verified"){
            this.props.dispatch({type:"SET_USERDATA", UserData: UserData, DeviceData:DeviceData});
            navigation.navigate('VerifyCode', {Creds:Creds});
          }
          else if(Status === "phoneverified"){
            this.props.dispatch({type:"SET_USERDATA", UserData: UserData, DeviceData:DeviceData, WelcomeScreen:false});
            navigation.navigate('Profile', {Creds:Creds});
            this.props.clientState.ConfigurePush(Creds.Username);
          }
        }
        else{
          this.props.dispatch({type:"SET_DEVICE_INFO", DeviceData:DeviceData});
          navigation.navigate('LandingScreen');
        }
      }
    });
  }

  getDeviceLocale(){
    try{
      let deviceLanguage =
            Platform.OS === 'ios'
              ? NativeModules.SettingsManager.settings.AppleLocale ||
                NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
              : NativeModules.I18nManager.localeIdentifier;

      return deviceLanguage;
    }
    catch(err){
      return "es-mx";
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.imageSize} resizeMode={"contain"} source={require('../../assets/image/logo_with_text.png')} />
        <ActivityIndicator size="large" color="black" style={{marginTop:50, alignSelf:'center', textAlign:'center'}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSize: {
    width: 200,
    height: 150
  },
})

let WrapContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(AppWrap);
export default WrapContainer;
