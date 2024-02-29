/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow
*/

import React from 'react';
import { View, AsyncStorage, TextInput, Text, Button, FlatList, Dimensions, ActivityIndicator, TouchableOpacity, Image, Modal,Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { createStackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { ListItem, Icon, Input, FormLabel, Avatar, Button as ButtonAlt } from 'react-native-elements';

import ImagePicker from 'react-native-image-crop-picker';
import PhoneInput from 'react-native-phone-input'
import { formatNumber } from "libphonenumber-js";
import { connect } from 'react-redux';
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
const EndpointRequests = require("../../util/requests.js");
import { APP_INFO } from '../../util/constants';

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;

const countryList = [
  {
    "name": "Mexico (México)",
    "iso2": "mx",
    "dialCode": "52",
    "priority": 0,
    "areaCodes": null
  },
  {
    "name": "United States",
    "iso2": "us",
    "dialCode": "1",
    "priority": 0,
    "areaCodes": null
  }
];

class CreateGroup extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Crear Grupo',
    headerLeft: () => <TouchableOpacity
    onPress={() => {
      navigation.state.params.goback();}} style={{paddingLeft:10,height:47, backgroundColor:'transparent', width:35, justifyContent:'center'}}>
      <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>,
      headerRight:
          navigation.state.params.loading ?
        () =>  <ActivityIndicator size="small" color="#0E75FA" style={{marginRight:20}} />
          :
        () =>  <View style={{marginRight:10}}>
          <Button
          testID='CreateGroup'
          onPress={() => {navigation.state.params.create()}}
          title="Crear"
          color="#000"
          style={{marginRight:10}}
          disabled={navigation.state.params.status}
          />
          </View>
    });

    constructor(props) {
      super(props);

      var convoParticipants = props.navigation.state.params.selected;
      var participants = props.navigation.state.params.participants;

      this.state = {
        convoParticipants:convoParticipants,
        chatName:null,
        chatDescription:null,
        chatId:null,
        participants:participants,
        isLoading:true,
        disabled:true,
        selected:convoParticipants,
        type:"group",
        picture:null,
        pictureExists:false,
        newContact:false,
        incorrect:true,
        modalLoading:false,
        anonMode:false,
        phone:"+52"
      }}

      componentDidMount(){
        this.props.navigation.setParams({
          status:true,
          create:this.createChat.bind(this),
          goback:this.goback.bind(this),
          loading:false
        });

        //this.refs.toast.show('Puedes tocar la foto de contacto para editar su informacion.', 5000);
      }

      goback(){
        const { participants, selected } = this.state;

        this.props.navigation.state.params.update(participants, selected);
        this.props.navigation.goBack();
      }

      changeStatus(){
        const { selected, chatName, chatDescription } = this.state;

        if(selected.length == 0 || chatName == null || chatName == "" || chatDescription == null || chatDescription == ""){
          this.props.navigation.setParams({
            status:true
          });
        }
        else if(selected.length > 0 && chatName !== null && chatName != ""){
          this.props.navigation.setParams({
            status:false
          });
        }
        else{
          this.props.navigation.setParams({
            status:true
          });
        }
      }

      checkIfExists(){
        const { convoParticipants, selected, userInfo } = this.state;

        let exists = false;

        if(selected.length >= 2){
          selected.sort(function(a, b){return Number(a)-Number(b)});
        }

        if(convoParticipants.length == 0){
          return false;
        }

        for(let i = 0; i < convoParticipants.length;i++){
          if (!Array.isArray(convoParticipants[i]) || ! Array.isArray(selected) || convoParticipants[i].length !== selected.length){
            exists = false;
            continue;
          }


          var arr1 = convoParticipants[i].concat().sort();
          var arr2 = selected.concat().sort();

          arr1 = arr1.join();
          arr2 = arr2.join();

          if(arr1 === arr2){
            exists = true;
            break;
          }
          else{
            continue;
          }
        }

        return exists;
      }

      async createChat(){
        const { chatName, chatDescription, selected } = this.state;

        this.props.navigation.setParams({
          loading:true
        });

        this.props.dispatch({type:"CREATING_CHAT", Data:{ Name:chatName }});

        this.setState({isLoading:true});

        try {
          let MemberList = [];

          for(let i=0;i < selected.length;i++){
            let MemberObject = {
              Name:selected[i].givenName,
              Phone:selected[i].userInfo.id.replace(/\s/g, '')
            };

            MemberList.push(MemberObject);
          }

          let GroupModel = {
            Name:chatName,
            Description:chatDescription,
            Members:MemberList,
            Type:0
          };

          EndpointRequests.CreateChat(GroupModel, function(responseData) {
        		if(responseData.error != undefined){
              this.setState({isLoading:false});
              this.props.navigation.setParams({
                loading:false
              });

              setTimeout(function(){
                Alert.alert(
                 'Error',
                 responseData.error,
                 [
                   {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                 ],
                 { cancelable: false }
                )
              }.bind(this),1000);
        		}
        		else{
              Alert.alert(
               'Éxito',
               responseData.message,
               [
                 {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
               ],
               { cancelable: false }
              )

              this.props.navigation.popToTop();
        			this.setState({isLoading:false,chatName:"", chatDescription:""});
              this.props.navigation.setParams({
                loading:false
              });
              this.props.clientState.LoadChatList();
        		}
        	}.bind(this));
        }
        catch(error){
          this.props.navigation.setParams({
            loading:false
          });

          Alert.alert(
           'Error',
           "Hubo un error creando el grupo.",
           [
             {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
           ],
           { cancelable: false }
          )

        }
      }

      uploadPicture(picture, model,onlyids){

        this.setState({isLoading:true});

        var data = new FormData();

        data.append('file',{
          uri:picture.uri,
          type:picture.mime,
          name:'picture.png'
        });

        data.append('upload_preset', APP_INFO.PICTURE_PRESET);

        EndpointRequests.uploadPicCloud(data, function(responseData) {
          if(responseData.error){
            Alert.alert(
             'Error',
             responseData.error.message,
             [
               {text: 'Ok', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
             ],
             { cancelable: false }
            )

            this.setState({isLoading:false});
          }
          else{

            this.setState({pictureUrl:responseData.secure_url});

            setTimeout(function(){
              model.PictureUrl = responseData.secure_url;
              this.create(model,onlyids);
            }.bind(this),300);
          }
        }.bind(this));
      }

      genRandomId(){
        var id = null;
        var first = Math.floor((Math.random() * 1000) + 1);

        if(first == 1000){
          first = Math.floor((Math.random() * 1000) + 1);
        }

        var second = Math.floor((Math.random() * 1000) + 1);

        if(second == 1000){
          second = Math.floor((Math.random() * 1000) + 1);
        }

        id = first.toString() + second.toString();

        return id;
      }

      getIcon(user){
        var icon = null;

        if(user.selected){
          icon = <Icon name="ios-checkbox" size={30} color={primaryColor}></Icon>;
        }
        else{
          icon = <Icon name="ios-square-outline" size={30} color={darkGrey}></Icon>;
        }

        return icon;
      }

      loadPictures(){

        ImagePicker.openPicker({
          multiple: false,
          width: width/1.5,
          height: height/1.5,
          compressImageMaxWidth: width/1.5,
          compressImageMaxHeight: height/1.5,
          compressImageQuality:0.8,
          mediaType:'photo',
        }).then(image => {

          if(image != null){
            var pic = {uri:image.path,width:image.width,source:image.sourceURL,height:image.height,mime:image.mime};

            setTimeout(function(){
              this.setState({picture:pic, pictureExists:true});
            }.bind(this),200);
          }
          else{
            console.log('cancelled');
          }
        });

      }

      getAvatar(item,index){

        const { userInfo } = this.state;

        var avatar = null;

        if(item.senderId != userInfo.id){
          if(item.showAvatar){
            if(item.userData != null && item.userData.photoUrl != null){
              avatar = <Avatar small rounded containerStyle={{alignSelf:'flex-start',marginTop:2,marginRight:10}} imageProps={{onError:() => this.onError(index)}} source={{uri:item.userData.photoUrl, cache: 'force-cache'}} activeOpacity={0.7} />;
            }
            else if(item.userData != null){
              avatar = <Avatar small rounded containerStyle={{alignSelf:'flex-start',marginTop:2,marginRight:10}} title={item.userData != null ? item.userData.name.charAt(0) : "?"} activeOpacity={0.7} />;
            }
            else{
              avatar = <Avatar small rounded containerStyle={{alignSelf:'flex-start',marginTop:2,marginRight:10}} title={"?"} activeOpacity={0.7} />;
            }
          }
        }

        return avatar;
      }

      onError(index){
        var { participants } = this.state;

        participants[index].userData.photoUrl = null;

        this.setState({participants:participants});
      }

      selectUser(participant, index){
        let list = this.state.participants;
        let selectedList = this.state.selected;

        let index2 = list.findIndex(x => x.recordID === participant.recordID);

        if(index2 > -1){
          list[index2].selected = false;
        }

        selectedList = selectedList.filter(function(el) {
          return el !== participant;
        });

        this.setState({participants:list,selected:selectedList});

        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
      }

      addUser(){
        const { name, phone, selected } = this.state;

        let newUser = {
          givenName:name,
          phoneNumbers:[{
            label:"mobile",
            number:phone
          }],
          newUser:true,
          userInfo:{
            givenName:name,
            id:phone
          }
        };

        selected.push(newUser);

        this.setState({name:"",phone:"+52", selected:selected, newContact:false, incorrect:true});
        setTimeout(function(){
          this.changeStatus();
        }.bind(this),200);
      }

      evaluate(){
        const { phone, name } = this.state;

        if(phone == undefined){
          return false;
        }

        let phoneValid = phone.startsWith("+1") || phone.startsWith("+52");

        if(name == undefined || name == null || name.length < 1){
          this.setState({incorrect:true});
        }
        else if(!phoneValid){
          this.setState({incorrect:true});
        }
        else if(phone == undefined || phone == null || phone.length <= 12){
          this.setState({incorrect:true});
        }
        else{
          this.setState({incorrect:false});
          return true;
        }
      }

      editUser(){
        let { selected, editIndex, phone, name } = this.state;

        selected[editIndex].userInfo.id = phone;
        selected[editIndex].userInfo.givenName = name;

        this.setState({selected:selected,phone:"", name:"", newContact:false, edit:false, incorrect:true});
      }

      changeAnonStatus(value){
        this.setState({anonMode:value});
      }

      _keyExtractor = (item, index) => index;

      render() {

        const { isLoading, participants, type,selected, picture, pictureExists, edit } = this.state;

        return (
          <View style={{backgroundColor:'white', flex:1, height:height,width:width}}>
          <View style={{padding:10, height:150, flexDirection:'row',backgroundColor:'white'}}>
          <View style={{flex:.25,height:150,justifyContent:'center'}}>
          <TouchableOpacity style={{height:75,width:75, borderRadius:45, alignSelf:'center'}} onPress={() => this.loadPictures()}>
          {pictureExists ?
            <Image source={{uri:picture.uri}} resizeMode="cover" style={{height:75,width:75,borderRadius:38,justifyContent:'center', alignSelf:'center'}} />
            :
            <View style={{height:75,width:75,borderRadius:45,backgroundColor:'lightgray', justifyContent:'center', alignSelf:'center'}}>
            <Icon type="material" name="add-a-photo" color="#000" reversed />
            </View>
          }
          </TouchableOpacity>
          </View>
          <View style={{flex:.75,height:150,justifyContent:'center',backgroundColor:'white'}}>
          <View style={{flexDirection:'column'}}>
          <Input placeholder='Nombre del Grupo' placeholderTextColor="gray" testID='GroupName'
          maxFontSizeMultiplier={1.25}
          containerStyle={{marginTop:50,marginBottom:0}}
          value={this.state.chatName}
          inputStyle={{width:width-40,color:'black'}}
          maxLength={35}
          autoCorrect={true}
          blurOnSubmit={true}
          onChangeText={(text) => {
            this.setState({chatName:text});
            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
          }}
          />
          <Input placeholder='Descripcion' placeholderTextColor="gray" testID='GroupDesc'
          maxFontSizeMultiplier={1.25}
          containerStyle={{marginTop:0,marginBottom:25}}
          inputStyle={{width:width-40, color:'black'}}
          autoCorrect={true}
          blurOnSubmit={true}
          multiline={false}
          maxLength={35}
          value={this.state.chatDescription}
          onChangeText={(text) => {
            this.setState({chatDescription:text});
            setTimeout(function(){
              this.changeStatus();
            }.bind(this),200);
          }}
          />
          </View>
          </View>
          </View>
          <ListItem
          key={"anonMode"}
          roundAvatar
          hideChevron
          containerStyle={{height:80, justifyContent:'center', marginBottom:10, marginTop:iPhoneX ? 25: 10, backgroundColor:'white', borderBottomColor:'transparent'}}
          leftIcon={{name:"incognito", type:"material-community",size:30, style:{marginLeft:0,marginRight:10}}}
          title={"Modo Confidencial"}
          subtitle={"Si habilitas este modo, solo los administradores del chat podran ver la informacion de los participantes."}
          subtitleNumberOfLines={3}
          switch={{onValueChange:(value) => this.changeAnonStatus(value), value:this.state.anonMode}}
          />
          <View style={{paddingTop:0, padding:10, paddingRight:0, flexDirection:'row', height:50, width:width}}>
          <View style={{flex:.5, justifyContent:'center'}}>
          <Text maxFontSizeMultiplier={1.25} style={{fontWeight:'bold'}}>Participantes</Text>
          </View>
          <View style={{flex:.5, justifyContent:'center', backgroundColor:'white'}}>
          <TouchableOpacity testID='AddUser' onPress={() => this.setState({newContact:true})} style={{alignSelf:'flex-end', height:40,width:40, justifyContent:'center'}}>
          <Icon type="ionicon" name="ios-add" color="#0E75FA" size={35} style={{textAlign:'center'}} />
          </TouchableOpacity>
          </View>
          </View>
          <FlatList
          key={selected.length == 0 ? "empty" : "list"}
          keyExtractor={this._keyExtractor}
          refreshing={this.state.isLoading}
          numColumns={selected.length > 0 ? 3 : 1}
          contentContainerStyle={{ width:width - 10,paddingLeft:5,paddingRight:5, }}
          data={selected}
          style={{ flex: 1,width:width - 10,paddingLeft:5,paddingRight:5, height:iPhoneX ? (height - 325) : (height - 350), backgroundColor:'white',borderBottomLeftRadius: iPhoneX ? 30 : 0,borderBottomRightRadius: iPhoneX ? 30 : 0 }}
          ListEmptyComponent={() =>
            <View style={{height:iPhoneX ? (height - 495) : (height - 380), width:width - 10, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
            <Icon type="material" name="group-add" size={100} color="lightgray" style={{textAlign:'center'}} />
            <Text maxFontSizeMultiplier={1.25} style={{textAlign:'center', padding:10, fontSize:17, fontWeight:'bold'}}>Agrega Participantes</Text>
            </View>
          }
          renderItem={({item,index}) => (
            item.hidden ? null :
            <View style={{width:(width - 10)/3, height:110, backgroundColor:'white', justifyContent:'center'}}>
            <Avatar size="medium" rounded onPress={() => this.setState({incorrect:false,name:item.userInfo.givenName, phone:item.userInfo.id, newContact:true, edit:true, editIndex:index})} containerStyle={{alignSelf:'center', marginBottom:10, backgroundColor:'red' }} title={item.hasThumbnail ? null : String(item.userInfo.givenName.charAt(0))} source={item.hasThumbnail ? {uri:item.thumbnailPath} : null} />
            <Text style={{textAlign:'center'}}>{item.userInfo.givenName}</Text>
            <Text style={{textAlign:'center', fontSize:13,color:'gray'}}>{item.userInfo.id}</Text>
            <TouchableOpacity onPress={() => this.selectUser(item, index)} style={{position:'absolute', height:25,width:25,borderRadius:20, alignSelf:'flex-end', top:5, right:7}}>
            <View style={{position:'absolute', height:25,width:25,borderRadius:20, backgroundColor:'white', top:2, right:15,justifyContent:'center', alignSelf:'flex-end'}}>
              <Icon reversed type="material" name="cancel" color="red" style={{textAlign:'center'}} />
            </View>
            </TouchableOpacity>
            </View>
          )}
          />
          <Modal
          animationType="fade"
          transparent={true}
          backdropPressToClose={false}
          backdrop={true}
          onRequestClose={() => {
            this.setState({newContact:false,name:"",phone:"", incorrect:true})
          }}
          visible={this.state.newContact}>
          <View style={{
            backgroundColor: '#00000080',
            flex: 1,
            borderRadius:10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{alignSelf: 'center',borderRadius:10, width:width - 40,paddingTop:5, paddingBottom:10, backgroundColor:"white",marginTop:0}}>
            <TouchableOpacity onPress={() => this.setState({newContact:false,name:"",phone:"+52", incorrect:true})} style={{height:50,width:50,alignSelf:'flex-end', justifyContent:'center'}}>
            <Icon type="ionicon" name="ios-close" size={40} color="black" />
            </TouchableOpacity>
            <View style={{paddingLeft:20, paddingRight:20}}>
            <Input testID="UserName" maxFontSizeMultiplier={1.25} placeholder="Nombre" placeholderTextColor="gray" inputStyle={{color:'black', fontSize:20}} autoCapitalize="words" value={this.state.name} onChangeText={(text) => {
              this.setState({name:text});
              setTimeout(function(){
                this.evaluate();
              }.bind(this),200);}}/>
              <View style={{height:15}} />
              <PhoneInput
              ref={(ref) => { this.phone = ref; }}
              testID='UserPhone'
              initialCountry={"mx"}
              countriesList={countryList}
              onPressFlag={this.onPressFlag}
              value={this.state.phone}
              placeholder="Teléfono (10 dígitos)"
              placeholderTextColor="gray"
              textStyle={{fontSize:20, color:'#0E75FA'}}
              style={{paddingTop:15,paddingBottom:15,paddingLeft:10,marginLeft:10,marginRight:10, paddingRight:10, borderBottomColor:'black', borderBottomWidth:.40, marginBottom:20}}
              onSelectCountry={(obj) => {
                let countryPhone = "+" + this.phone.getCountryCode();
                this.setState({phone:countryPhone});

                setTimeout(function(){
                  this.evaluate();
                }.bind(this),200);
              }}
              onChangePhoneNumber={(text) => {
                if(text.startsWith("+1") || text.startsWith("+52")){
                  let formated = formatNumber(text, "International");
                  this.setState({phone:formated});
                  setTimeout(function(){
                   this.evaluate();
                  }.bind(this),200);
                }
                else{
                  let countryCode = this.phone.getCountryCode();
                  if(countryCode == null){
                    this.setState({phone:text});
                  }
                  else{
                    text = "+" + countryCode + text;
                    let formated = formatNumber(text, "International");
                    this.setState({phone:formated});
                    setTimeout(function(){
                     this.evaluate();
                    }.bind(this),200);
                  }
                }
              }}
              />
              <ButtonAlt
              testID='SubmitUser'
              backgroundColor="#1DA1F2"
              onPress={() => edit ? this.editUser() : this.addUser()}
              disabled={this.state.incorrect}
              title={edit ? "Editar Participante" : 'Agregar Participante'} style={{marginTop:40, marginBottom:10}} />
              </View>
              </View>
              </TouchableWithoutFeedback>
              </View>
              </Modal>
              <Modal
              animationType="fade"
              transparent={true}
              backdropPressToClose={false}
              backdrop={true}
              onRequestClose={() => {
                console.log('close')
              }}
              visible={this.state.modalLoading}>
              <View style={{
                backgroundColor: '#00000040',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'}}>
                <View style={{height:height, width:width, justifyContent:'center', backgroundColor:"transparent",marginTop:0}}>
                <View style={{backgroundColor:'#FFFFFF',justifyContent:'center', height:100,width:100,borderRadius:10,alignSelf:'center'}}>
                <ActivityIndicator size="large" />
                </View>
                </View>
                </View>
                </Modal>
                </View>
              );
            }
          }

let CreateGroupContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(CreateGroup);
export default CreateGroupContainer;
