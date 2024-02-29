import React, { Component } from 'react'
import { View, Text, StyleSheet,KeyboardAvoidingView, Button, Alert, ScrollView, SafeAreaView,StatusBar, Platform, Image, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { Icon } from 'react-native-elements';
import CameraRoll from "@react-native-community/cameraroll";
import { connect } from 'react-redux';
const empty = require('../../../assets/image/Empty.png');
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
import Video from 'react-native-video';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as Progress from 'react-native-progress';
import RNFetchBlob from 'rn-fetch-blob'
import ActionSheet from 'react-native-actionsheet'
import {PermissionsAndroid} from 'react-native';
var headerHeight = iPhoneX ? 40 : 20;
class FileUploadModal extends Component{
  constructor(props) {
    super(props)
    this.state = {
      triggerAlertModal:false,
      optionalMessage:null,
      pictureObject:null
    }
  }

  componentDidUpdate(prevProps){
    if(this.props.loading == false && prevProps.loading){
      this.setState({optionalMessage:null, pictureObject:null});
    }
  }

  showOptions(){
    if(Platform.OS === 'android'){
      this.ActionSheet.show();
      return false;
    }
    ActionSheetIOS.showActionSheetWithOptions({
     title:"Opciones de Contenido",
        options: ['Cancelar', 'Descargar'],
        cancelButtonIndex: 0,
    },
    (buttonIndex) => {
      if (buttonIndex === 1) {
        this.downloadContent();
      }
    });
  }

  async downloadContent(){
    try{
      if(Platform.OS === "ios"){
        CameraRoll.save(this.props.picture.source);
        setTimeout(async function(){
          Alert.alert(
           'Exito.',
           "El contenido fue guardado exitosamente.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        }.bind(this),250);
      }
      else{
            // add read, write permissions
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        let groupRoute = RNFetchBlob.fs.dirs.DownloadDir;
        let arr = this.props.picture.source.split("/");
        const filename = arr[arr.length - 1];

        RNFetchBlob
        .config({
          fileCache: true,
          indicator:true,
          path:groupRoute + "/" + filename,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path:groupRoute + "/" + filename,
            description: 'Contenido multimedia'
          }
        })
        .fetch('GET', this.props.picture.source, {})
        .then((res) => {
          Alert.alert(
           'Exito.',
           "El contenido fue guardado exitosamente.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        }).catch((e) => {
          Alert.alert(
           'Error.',
           "Hubo un error guardando este contenido.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
         )
        });
      }
  }catch(error){
    Alert.alert(
     'Error.',
     "Hubo un error guardando este contenido.",
     [
       {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
     ],
     { cancelable: false }
   )
  }
  }

  render(){

    return (
      <View>
      <StatusBar backgroundColor={this.props.uploadFile ? 'black' : 'white'} barStyle={this.props.uploadFile ? 'light-content' : 'dark-content'} />
      <Modal
      animationType="slide"
      useNativeDriver={true}
      transparent={false}
      backdropPressToClose={false}
      backdrop={false}
      scrollEnabled={false}
      visible={this.props.uploadFile}
      avoidKeyboard
      onRequestClose={() => {
        Keyboard.dismiss;
        this.props.closeModal();
      }}>
      <KeyboardAvoidingView
        style={{ flex:1, height:height, width:width }}
        enabled={true}
        enableOnAndroid
        behavior={undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
        <ScrollView scrollEnabled={false} keyboardShouldPersistTaps={'always'} style={{height:height, width:width, padding:0,borderRadius:0, backgroundColor:"#3a3a3d",marginTop:0}}>
        <View style={{height:35,width:width, backgroundColor:"black", flexDirection:'row',justifyContent: 'center', marginBottom:0, marginTop:0}}>
        <View style={{flex:.5, height:60, justifyContent:'center', flexDirection:'column', backgroundColor:'black'}}>
        { this.props.loading ?
          <View style={{height:35, width:60,marginBottom:25, backgroundColor:'transparent', justifyContent:'flex-end'}}>
          <ActivityIndicator size="small" color="white" style={{alignSelf:'center'}}/>
          </View>
          :
          null
        }
        </View>
        <View style={{flex:.5, height:60, justifyContent:'center', marginTop:0,backgroundColor:'black'}}>
        <TouchableOpacity style={{backgroundColor:'black', height:60,width:60,justifyContent:'center', alignSelf:'flex-end'}}
        onPress={() => {
          setTimeout(function(){
            Keyboard.dismiss;
            this.props.closeModal();
          }.bind(this),300);

          this.setState({modal:false,picture:null, pictureModal:false, alertMessage:"", alertValid:true,padHeight:70, modalAlertHeight:iPhoneX ? (height - 350) : (height - 180)})}
        }>
        <Icon name="ios-close" type="ionicon" color={'white'} size={45} style={{marginBottom:10}} />
        </TouchableOpacity>
        </View>
        </View>
        <View style={{height:height - 40, justifyContent:'center'}}>
          {this.props.loading ?
            <Progress.Bar progress={this.props.progress} width={width - 10} style={{marginLeft:5,marginRight:5,marginTop:10}} />
            :
            <View style={{height:20}}/>
          }
          <TouchableWithoutFeedback onPress={() => setTimeout(async function(){  Keyboard.dismiss()}.bind(this),300) } style={{height:iPhoneX ? height - 180 : height - 160, paddingTop:iPhoneX ? 0 : 25, width:width, backgroundColor:'black', justifyContent:'center'}}>
            {this.props.picture != undefined ?
              (this.props.picture.isVideo ?
                <Video source={{ uri: this.props.picture.source }}
                ref={(ref) => {
                  this.playerFull = ref
                }}
                paused={false} controls={true} resizeMode={"contain"} ignoreSilentSwitch={"ignore"} style={{height:iPhoneX ? height - 180 : height - 160, width: width, alignSelf:'center'}} />
                :
                (this.props.picture.isFile ?
                  <View style={{justifyContent:'center'}}>
                    <Icon type="Material" name="attach-file" size={80} color={'lightgray'} style={{textAlign:'center'}} />
                    <Text style={{textAlign:'center', color:'white', marginTop:20}}>{this.props.picture.filename}</Text>
                  </View>
                  :
                  <ImageViewer
                    resizeMode="contain"
                    enableImageZoom={true}
                    imageUrls={[this.props.picture]}
                    index={0}
                    saveToLocalByLongPress={false}
                    enableSwipeDown={false}
                    maxOverflow={0}
                    disableSwipe={true}
                    renderIndicator={() => null}
                    footerContainerStyle={{alignSelf:'center', borderRadius:20, marginLeft:15, marginRight:15, width:width - 30, marginBottom:10}}
                    loadingRender={() =>
                      <View style={{backgroundColor:'black', justifyContent:'center'}}>
                        <ActivityIndicator size="small" color="white" style={{alignSelf:'center'}} />
                      </View>
                    }
                    renderFooter={(currentIndex) =>
                      null
                    } />
                )
              )
              :
              null
            }
          </TouchableWithoutFeedback>
          {this.props.showImage ?
            <View style={{backgroundColor:'#3a3a3d',height:50, width:width, padding:10}}>
              <View style={{height:50,width:100, alignSelf:'flex-end',backgroundColor:'#3a3a3d'}}>
                <TouchableOpacity onPress={() => {this.showOptions()}} style={{height:50, width:100, alignSelf:'flex-end', backgroundColor:'transparent'}}>
                  <Text style={{textAlign:'center', color:'white', fontSize:16}}>Opciones</Text>
                </TouchableOpacity>
              </View>
            </View>
          :
          <View style={{backgroundColor:'#3a3a3d',paddingLeft:15,flexDirection: 'row', marginTop: iPhoneX ? 25 : 15, marginEnd: wp('2%'), alignItems:'center', marginBottom:5}}>
            <View style={{backgroundColor: '#e3e3e3', borderRadius: 6, marginEnd: wp('1%'), flexGrow: 1}}>
              <AutoGrowingTextInput
              style={{marginStart: wp('1%'), marginEnd: wp('1%'), padding:3, color:'black'}}
              value={this.state.optionalMessage}
              placeholder='Escribe un mensaje...'
              returnKeyType="done"
              multiline={false}
              placeholderTextColor={"gray"}
              onChangeText={(text) => this.setState({optionalMessage:text})}
              minHeight={30}
              maxHeight={30}
              maxWidth={300} />
            </View>
            <View>
              <TouchableOpacity disabled={this.props.loading} onPress={() => this.props.startUpload(this.state.optionalMessage)}>
                <Icon name="send" size={30} color={this.props.loading ? 'gray' : 'blue'} />
              </TouchableOpacity>
            </View>
          </View>
          }
        </View>
        </ScrollView >
        </KeyboardAvoidingView>
        </Modal>
        <ActionSheet
        ref={o => this.ActionSheet = o}
        title={'Opciones de contenido'}
        options={['Cancelar', 'Descargar']}
        cancelButtonIndex={0}
        onPress={(index) => {
          if(index === 0){
            this.ActionSheet.hide();
          }
          else if (index === 1) {
            this.downloadContent();
          }
        }}
      />
        </View>
          )
        }
      }

export default FileUploadModal;
