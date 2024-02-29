import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  Avatar as AvatarAlt,
  Icon,
  ListItem
} from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { APP_INFO } from '../../util/constants';
var {height, width} = Dimensions.get('window');
var SQLite = require('react-native-sqlite-storage');
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

const apiLevelAndroid = '';
DeviceInfo.getApiLevel().then(apiLevel => {
  apiLevelAndroid = apiLevel;
});
const EndpointRequests = require('../../util/requests.js');
const placeholder = require('../../../assets/image/profile_pholder.png');
let ambermex_logo = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');
const cloneDeep = require('lodash/cloneDeep');
const moment = require('moment');

class Profile extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitle:
      navigation.state.params != undefined && navigation.state.params.loading
        ? () => (
            <ActivityIndicator
              size="small"
              color="#0E75FA"
              style={{alignSelf: 'center'}}
            />
          )
        : () => (
            <View style={{height: 45}}>
              <Image
                source={ambermex_logo}
                resizeMode={'contain'}
                style={{width: width / 3, height: 45}}
              />
            </View>
          ),
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Convos');
        }}
        style={{
          height: 50,
          marginLeft: 5,
          backgroundColor: 'transparent',
          width: 40,
          justifyContent: 'center',
        }}>
        <Text>
          {' '}
          <Ionicon
            name="ios-arrow-back"
            color={'#7D9D78'}
            size={28}
            style={{textAlign: 'center'}}
          />{' '}
        </Text>
      </TouchableOpacity>
    ),
  });

  constructor(props) {
    super(props);

    this.state = {
      loadingEmail: false,
      pictureUrl: null,
      pictureExists: false,
      deleting: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      logOut: () => this.logout(),
    });

    this.getData();
  }

  getData() {
    EndpointRequests.GetUserInfo(
      function (responseData) {
        if (responseData.user && responseData.user != undefined) {
          AsyncStorage.getItem('MedicalData').then(value => {
            if (value != undefined) {
              value = JSON.parse(value);
              responseData.user.medicalData = value;
              responseData.user.medicalDataAdded = true;
            }

            this.props.dispatch({
              type: 'SET_USERDATA',
              UserData: responseData.user,
              DataLoaded: true,
            });
            AsyncStorage.setItem(
              'Status',
              responseData.user.verifiedIdentity ? 'verified' : 'phoneverified',
              asyncError => {},
            );
            if (responseData.user.isOfficial) {
              this.props.chatState.ScheduleNotifications(
                responseData.user.responseElementSchedule,
              );
            } else if (!responseData.user.isOfficial && isOfficial) {
              this.props.chatState.ScheduleNotifications(undefined); //if user was official but we removed that status, remove his remaining notifications
            }
          });
        } else if (
          responseData.message != undefined &&
          responseData.message === 'Banned'
        ) {
          this.logout();
        }
      }.bind(this),
    );
  }

  logoutConfirm() {
    Alert.alert(
      '¿Estás seguro que quieres cerrar sesión?',
      'Los mensajes de los canales a lo que perteneces y el historial de alertas serán borrados permanentemente.',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Proceder',
          onPress: () => {
            this.logout();
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  }

  async logout() {
    if (this.props.clientState.Client != undefined) {
      this.props.clientState.Client.stop();
    }

    this.props.navigation.navigate('LandingScreen');

    this.props.dispatch({type: 'LOGOUT_USER'});
    this.props.dispatch({type: 'LOGOUT'});

    setTimeout(
      async function () {
        this.props.dispatch({type: 'FLUSH_DATA'});
        this.props.chatState.SetDBAfterLogout();
      }.bind(this),
      500,
    );
  }

  deleteAccountConfirm() {
    Alert.alert(
      '¿Estás seguro que quieres eliminar tu cuenta de Botón Ambermex?',
      'Tu cuenta sera borrada permanentemente y tendras que crear una nueva para volver a ingresar.',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Proceder',
          onPress: () => {
            this.deleteAccount();
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  }

  deleteAccount() {
    this.setState({deleting: true});
    EndpointRequests.DeleteAccount(
      function (responseData) {
        if (responseData.message != 'Ok') {
          Alert.alert(
            'Atención',
            responseData.message,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );

          this.setState({isLoading: false, deleting: false});
        } else {
          this.setState({isLoading: false, deleting: false});
          this.logout();
          Alert.alert(
            'Éxito',
            'Tu cuenta de Botón Ambermex ha sido borrada.',
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      }.bind(this),
    );
  }

  saveUser() {
    const {pictureExists, pictureUrl} = this.state;

    let UserObject = cloneDeep(this.props.userState.UserData);

    UserObject.pictureExists = pictureExists;
    UserObject.pictureUrl = pictureUrl;

    EndpointRequests.UpdatePicture(
      pictureUrl,
      function (responseData) {
        if (responseData.error != undefined) {
          Alert.alert(
            'Atención',
            responseData.error,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );

          this.setState({isLoading: false});
        } else {
          if (responseData.message === 'Ok') {
            this.props.dispatch({type: 'SET_USERDATA', UserData: UserObject});

            this.setState({isLoading: false});

            Alert.alert(
              'Éxito',
              'Tu información ha sido actualizada.',
              [
                {
                  text: 'Ok',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              {cancelable: false},
            );

            this.props.navigation.pop();
          }
        }
      }.bind(this),
    );
  }

  uploadPicture() {
    var {picture} = this.state;

    if (picture == undefined || picture.uri == undefined) {
      return false;
    }

    this.setState({isLoading: true});

    var data = new FormData();

    data.append('file', {
      uri: picture.uri,
      type: picture.mime,
      name: 'picture.png',
    });

    data.append('upload_preset', APP_INFO.PICTURE_PRESET);

    EndpointRequests.UploadPicCloud(
      data,
      function (responseData) {
        if (responseData.error) {
          Alert.alert(
            'Error',
            responseData.error.message,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );

          this.setState({isLoading: false});
        } else {
          this.setState({
            pictureUrl: responseData.secure_url,
            pictureExists: true,
          });

          setTimeout(
            function () {
              this.saveUser();
            }.bind(this),
            300,
          );
        }
      }.bind(this),
    );
  }

  gotoVerify() {
    if (this.props.userState.UserData.verifiedIdentity == 0) {
      this.props.navigation.navigate('SettingsVerifyUser', {
        PreviousRoute: 'Settings',
      });
    } else {
      this.props.navigation.navigate('VerificationResult', {
        PreviousRoute: 'Settings',
      });
    }
  }

  gotoAddDevices() {
    this.props.navigation.navigate('AddDevices');
  }

  gotoEditUser() {
    this.props.navigation.navigate('EditUser');
  }

  gotoGuide() {
    Linking.openURL('http://www.botonambermex.com/guia-de-uso').catch(err =>
      console.error('An error occurred', err),
    );
  }

  verifyIdentity() {
    this.props.navigation.navigate('SettingsVerifyUser', {
      PreviousRoute: 'Settings',
    });
  }

  editProfile() {
    this.props.navigation.navigate('EditUser');
  }

  gotoTerms() {
    Linking.openURL('https://www.botonambermex.com/terminos-de-uso').catch(
      err => console.error('An error occurred', err),
    );
  }

  gotoPrivacy() {
    Linking.openURL(
      'https://www.botonambermex.com/politicas-de-privacidad',
    ).catch(err => console.error('An error occurred', err));
  }

  gotoHelp() {
    Linking.openURL('https://www.botonambermex.com/tecnologias').catch(err =>
      console.error('An error occurred', err),
    );
  }

  gotoEula() {
    this.props.navigation.navigate('EULA');
  }

  gotoHistory() {
    this.props.navigation.navigate('HistoryAlert');
  }

  gotoSuspicious() {
    this.props.navigation.navigate('HistoryAlert', {Type: 'Suspicious'});
  }

  gotoFastGuide() {
    Linking.openURL('https://www.botonambermex.com/guiarapida').catch(err =>
      console.error('An error occurred', err),
    );
  }

  changeMedicalStatus(value) {
    let Value = cloneDeep(value.nativeEvent.value);

    EndpointRequests.ChangeMedicalDataStatus(
      Value,
      function (responseData) {
        if (responseData.message != undefined && responseData.message != 'Ok') {
          Alert.alert(
            'Error',
            responseData.message,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );

          this.setState({isLoading: false});
        } else {
          this.props.dispatch({
            type: 'CHANGE_MEDICAL_STATUS',
            Value: Value,
            UserData: this.props.userState.UserData,
          });
          this.setState({isLoading: false});
          /*
         if(Value){
           alert("Has habilitado la función de la información médica; Si te encuentras en una zona de cobertura, la información médica sera compartida con servicios médicos en caso de emergencia.");
         }
         else{
           alert("Has deshabilitado la función de información médica; No podras generar emergencias médicas hasta que habilites de nuevo.")
         }
         */
        }
      }.bind(this),
    );
  }

  loadPictures() {
    ImagePicker.openPicker({
      multiple: false,
      compressImageQuality: 0.8,
      width: width / 2,
      height: height / 2,
      compressImageMaxWidth: width / 2,
      compressImageMaxHeight: height / 2,
      mediaType: 'photo',
    })
      .then(image => {
        if (image != null) {
          var pic = {
            uri: image.path,
            width: image.width,
            source: image.sourceURL,
            height: image.height,
            mime: image.mime,
          };
          this.setState({picture: pic, pictureExists: true});

          setTimeout(
            function () {
              this.uploadPicture();
            }.bind(this),
            500,
          );
        } else {
          console.log('cancelled');
        }
      })
      .catch(error => {
        if (error.code === 'E_PERMISSION_MISSING') {
          Alert.alert(
            'La aplicación no tiene los permisos necesarios.',
            'Para accesar a la galería, la aplicación necesita el permiso.',
            [
              {
                text: 'Ir a permisos',
                onPress: () => {
                  Linking.openURL('app-settings:').catch(err => {
                    console.error('An error occurred', err);
                  });
                },
              },
              {
                text: 'Cancelar',
                onPress: () => {
                  console.log('nope');
                },
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      });
  }

  getVerificationMail() {
    this.setState({loadingEmail: true});

    EndpointRequests.GetVerificationMail(
      function (responseData) {
        if (responseData.message && responseData.message != 'Ok') {
          Alert.alert(
            'Error',
            responseData.message,
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );

          setTimeout(
            function () {
              this.setState({loadingEmail: false});
            }.bind(this),
            250,
          );
        } else {
          this.setState({loadingEmail: false});
          this.props.navigation.goBack();
          setTimeout(
            function () {
              Alert.alert(
                'Te enviamos un correo de verificación',
                'Aún no haz verificado tu cuenta de email. Revisa la bandeja de entrada o en spam.',
                [
                  {
                    text: 'Ok',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                ],
                {cancelable: true},
              );
            }.bind(this),
            250,
          );
        }
      }.bind(this),
    );
  }

  getContactName(member) {
    if (member.name != undefined && member.lastName != undefined) {
      return member.name + ' ' + member.lastName;
    } else if (member.name != undefined) {
      return member.name;
    } else {
      return 'Desconocido';
    }
  }

  medicalData() {
    /*
     <View style={styles.containerTitle}>
       <Text style={styles.textTitle}>    Datos Médicos</Text>
     </View>
     <ListItem
     key={6}
     subtitle=' Mostrar datos médicos'
     containerStyle={{height:50}}
     subtitleStyle={{color:'grey', top:-3}}
     bottomDivider={true}
     switch={{value:this.props.userState.MedicalEnabled}}
     onChange={(value) => this.changeMedicalStatus(value)}
     />
     {this.props.userState.MedicalEnabled ?
       <View style={{paddingLeft:5, backgroundColor:'white'}}>
       <ListItem
       key={7}
       subtitle='Datos Médicos'
       containerStyle={{height:50}}
       subtitleStyle={{color:'grey', top:-3}}
       bottomDivider={true}
       chevron
       onPress={() => this.props.navigation.navigate("MedicalData")}
       rightSubtitle={
         <View>
         {this.props.userState.UserData.medicalDataAdded ?
           <View style={{flexDirection:'column',justifyContent:'flex-end',height:30, right:-10}}>
           <Icon type="ionicon" name="ios-checkmark-circle-outline" color="#59a711" size={25} />
           </View>
           :
           <View style={{flexDirection:'column',justifyContent:'center',height:30, right:-10}}>
           <Icon type="feather" name="alert-circle" color="red" size={25} />
           </View>
         }
         </View>
       }
       />
       </View>
       :
       <ListItem
       key={7}
       subtitle='Al desactivar "Mostrar datos médicos" aceptas que no se proporcione información a los servicios de salud.'
       subtitleStyle={{color:'grey'}}
       bottomDivider={true}
       />
     }
     */
  }

  getAddressString() {
    if (
      this.props.userState.UserData != undefined &&
      this.props.userState.UserData.primaryAddress != undefined
    ) {
      let address1 = this.props.userState.UserData.primaryAddress.address1;
      let address2 = this.props.userState.UserData.primaryAddress.address2;
      let cp = this.props.userState.UserData.primaryAddress.postalCode;
      let city = this.props.userState.UserData.primaryAddress.city;
      let entity = this.props.userState.UserData.primaryAddress.entity;

      return (
        address1 + ' ' + address2 + ', ' + entity + ' C.P ' + cp + ', ' + city
      );
    }

    return '';
  }

  getPendingActions() {
    let pendingComponent = (
      <View style={styles.containerTitle}>
        <Text style={styles.textTitle}> Acciones Pendientes</Text>
      </View>
    );
    let pendingExists = false;
    let componentes = [pendingComponent];
    if (!this.props.userState.UserData.verifiedEmail) {
      pendingExists = true;
      componentes.push(
        <ListItem
          key={'Email'}
          subtitle="Email"
          subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
          containerStyle={{height: 50}}
          rightSubtitle={this.props.userState.UserData.email}
          bottomDivider={true}
          rightSubtitle={
            <TouchableOpacity
              disabled={this.props.userState.UserData.verifiedEmail}
              onPress={() => this.getVerificationMail()}
              style={{
                width: width / 1.5,
                flexDirection: 'row',
                justifyContent: 'center',
                top: 3,
              }}>
              <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: 'darkgray',
                    fontSize: 13,
                    textAlign: 'right',
                    width: width / 1.5 - 25,
                  }}>
                  {this.props.userState.UserData.email}
                </Text>
              </View>
              {this.props.userState.UserData.verifiedEmail ? (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: 30,
                    right: -10,
                  }}>
                  <Text>
                    <Icon
                      type="ionicon"
                      name="ios-checkmark-circle-outline"
                      color="#59a711"
                      size={25}
                    />
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: 30,
                    right: -10,
                  }}>
                  <Text>
                    <Icon
                      type="feather"
                      name="alert-circle"
                      color="red"
                      size={25}
                    />
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          }
          chevron={
            this.state.loadingEmail ? (
              <ActivityIndicator size="small" color="#59a711" />
            ) : this.props.userState.UserData.verifiedEmail ? (
              <View style={{width: 5}} />
            ) : (
              true
            )
          }
        />,
      );
    }

    if (this.props.userState.UserData.verifiedIdentity == 0) {
      pendingExists = true;
      componentes.push(
        <ListItem
          key={' Verificación de identidad'}
          subtitle="Verificación de identidad"
          containerStyle={{height: 50}}
          subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
          bottomDivider={true}
          onPress={() => this.gotoVerify()}
          rightSubtitle={
            <View>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  height: 30,
                  right: -10,
                }}>
                <Text>
                  <Icon
                    type="feather"
                    name="alert-circle"
                    color="red"
                    size={25}
                  />
                </Text>
              </View>
            </View>
          }
          chevron
        />,
      );
    }

    if (!pendingExists) {
      return null;
    } else {
      return componentes;
    }
  }

  render() {
    return (
      <View style={{flex: 1, justifyItems: 'center'}}>
        <ScrollView
          contentContainerStyle={{alignItems: 'center'}}
          style={{flex: 1, justifyItems: 'center', paddingTop: 10}}>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              width: width,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              padding: 10,
            }}>
            <View
              style={{
                flexDirection: 'column',
                flex: 0.35,
                justifyContent: 'center',
              }}>
              {this.state.isLoading ? (
                <View
                  style={{
                    height: 75,
                    width: 75,
                    marginBottom: 10,
                    borderRadius: 45,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'lightgray',
                  }}>
                  <ActivityIndicator
                    size="small"
                    color="black"
                    style={{alignSelf: 'center'}}
                  />
                </View>
              ) : (
                <AvatarAlt
                  rounded
                  source={
                    this.props.userState.UserData.pictureUrl != undefined
                      ? {uri: this.props.userState.UserData.pictureUrl}
                      : placeholder
                  }
                  size="large"
                  containerStyle={{
                    marginBottom: 10,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                  showAccessory
                  onAccessoryPress={() => this.loadPictures()}
                />
              )}
            </View>
            <View
              style={{
                flexDirection: 'column',
                flex: 0.65,
                justifyContent: 'center',
              }}>
              <Text
                numberOfLines={1}
                style={{fontWeight: 'bold', marginBottom: 5}}>
                {this.props.userState.UserData.name +
                  ' ' +
                  this.props.userState.UserData.lastName}
              </Text>
              <Text numberOfLines={1} style={{color: 'dimgray', fontSize: 12}}>
                {this.props.userState.UserData.dobString != undefined
                  ? moment(
                      this.props.userState.UserData.dobString,
                      'YYYY/MM/DD',
                    ).format('DD/MM/YYYY')
                  : '00/00/0000'}
              </Text>
              <Text
                numberOfLines={1}
                style={{color: 'dimgray', fontSize: 12, marginTop: 4}}>
                {this.props.userState.UserData.phone}
              </Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  height: 20,
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flex: this.props.userState.UserData.verifiedEmail ? 1 : 0.8,
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={1}
                    style={{color: 'dimgray', fontSize: 12}}>
                    {this.props.userState.UserData.email}
                  </Text>
                </View>
                {!this.props.userState.UserData.verifiedEmail ? (
                  <View style={{flex: 0.2, justifyContent: 'center'}}>
                    <Text>
                      <Icon
                        type="feather"
                        name="alert-circle"
                        color="red"
                        size={20}
                      />
                    </Text>
                  </View>
                ) : null}
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 5,
                }}>
                <View
                  style={{
                    flex:
                      this.props.userState.UserData.primaryAddress !=
                        undefined &&
                      this.props.userState.UserData.primaryAddress.hasLocation
                        ? 1
                        : 0.8,
                    justifyContent: 'center',
                  }}>
                  <Text
                    numberOfLines={2}
                    style={{color: 'dimgray', fontSize: 12}}>
                    {this.getAddressString()}
                  </Text>
                </View>
                {this.props.userState.UserData.primaryAddress == undefined ||
                !this.props.userState.UserData.primaryAddress.hasLocation ? (
                  <View style={{flex: 0.2, justifyContent: 'center'}}>
                    <Text>
                      <Icon
                        type="feather"
                        name="alert-circle"
                        color="red"
                        size={20}
                      />
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={{width: width}}>
            {this.getPendingActions()}
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Reportes</Text>
            </View>
            <ListItem
              key={' Emergencia'}
              subtitle=" Emergencia"
              bottomDivider={true}
              containerStyle={{height: 50}}
              onPress={() => this.gotoHistory()}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              chevron
            />
            <ListItem
              key={' Actividad sospechosa'}
              subtitle=" Actividad sospechosa"
              bottomDivider={true}
              containerStyle={{height: 50}}
              onPress={() => this.gotoSuspicious()}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              chevron
            />
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Ajustes</Text>
            </View>
            <ListItem
              key={'Contraseña'}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              rightSubtitleStyle={{color: 'grey', fontSize: 13}}
              containerStyle={{height: 50}}
              subtitle="Contraseña"
              rightSubtitle=""
              bottomDivider={true}
              chevron
              onPress={() => {
                this.props.navigation.navigate('Password');
              }}
            />
            {this.props.userState.UserData.primaryAddress != undefined ? (
              <ListItem
                key={'location'}
                containerStyle={{height: 50}}
                subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
                bottomDivider={true}
                chevron
                subtitle="Ubicación"
                rightSubtitle={
                  <View>
                    {this.props.userState.UserData.primaryAddress
                      .hasLocation ? (
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          height: 30,
                          right: -10,
                        }}>
                        <Icon
                          type="ionicon"
                          name="ios-checkmark-circle-outline"
                          style={{top: 3}}
                          color="#59a711"
                          size={25}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          flexDirection: 'column',
                          justifyContent: 'center',
                          height: 50,
                          right: -10,
                          top: 8,
                        }}>
                        <Icon
                          type="feather"
                          name="alert-circle"
                          color="red"
                          size={25}
                          style={{top: 0}}
                        />
                      </View>
                    )}
                  </View>
                }
                onPress={() => {
                  this.props.navigation.navigate('AddressLocation');
                }}
              />
            ) : null}
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Contactos de emergencia</Text>
            </View>
            {this.props.userState.UserData.emergencyContacts.map(
              (member, index) =>
                member.phone != undefined ? (
                  <ListItem
                    key={member.phone}
                    subtitle={this.getContactName(member)}
                    containerStyle={{height: 50}}
                    subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
                    bottomDivider={true}
                    chevron
                    rightSubtitle={
                      <View>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            height: 30,
                            right: -10,
                          }}>
                          <Icon
                            type="ionicon"
                            name="ios-checkmark-circle-outline"
                            style={{top: 3}}
                            color="#59a711"
                            size={25}
                          />
                        </View>
                      </View>
                    }
                    onPress={() => {
                      this.props.navigation.navigate('EmergencyContacts', {
                        existingContact: member,
                      });
                    }}
                  />
                ) : null,
            )}
            <ListItem
              key={' Agregar nuevo contacto'}
              subtitle=" Agregar nuevo contacto"
              containerStyle={{height: 50}}
              subtitleStyle={{color: '#2AA9E0', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
              onPress={() =>
                this.props.navigation.navigate('EmergencyContacts')
              }
              rightSubtitle={
                <View>
                  {this.props.userState.UserData.emergencyContacts.length >
                  0 ? null : (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        top: 8,
                        height: 50,
                        right: -10,
                      }}>
                      <Text>
                        <Icon
                          type="feather"
                          name="alert-circle"
                          color="red"
                          size={25}
                          style={{textAlign: 'right'}}
                          style={{top: 0}}
                        />
                      </Text>
                    </View>
                  )}
                </View>
              }
            />

            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Datos médicos</Text>
            </View>
            <ListItem
              key={'Ficha médica'}
              subtitle=" Ficha médica"
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
              onPress={() => this.props.navigation.navigate('MedicalData')}
              rightSubtitle={
                <View>
                  {this.props.userState.UserData.medicalDataAdded ? (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: 30,
                        right: -10,
                      }}>
                      <Text>
                        <Icon
                          type="ionicon"
                          name="ios-checkmark-circle-outline"
                          color="#59a711"
                          size={25}
                          style={{top: 3}}
                        />
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        top: 8,
                        height: 50,
                        right: -10,
                      }}>
                      <Text>
                        <Icon
                          type="feather"
                          name="alert-circle"
                          color="red"
                          size={25}
                          style={{textAlign: 'right'}}
                          style={{top: 0}}
                        />
                      </Text>
                    </View>
                  )}
                </View>
              }
            />
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Soporte</Text>
            </View>
            <ListItem
              key={'GuiaRapida'}
              onPress={() => this.gotoFastGuide()}
              subtitle=" Guía de referencia rápida"
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
            />
            <ListItem
              key={10}
              onPress={() => this.gotoGuide()}
              subtitle=" Guía de uso"
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
            />
            <ListItem
              key={' Contacto'}
              subtitle=" Contacto"
              bottomDivider={true}
              containerStyle={{height: 50}}
              onPress={() => this.gotoHelp()}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              chevron
            />
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Legales</Text>
            </View>
            <ListItem
              key={' Términos y Condiciones'}
              onPress={() =>
                this.props.navigation.navigate('TermsAndConditions')
              }
              subtitle={
                this.props.userState.UserData.termsAccepted
                  ? ' Ver términos'
                  : ' Leer y aceptar'
              }
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
              rightSubtitle={
                <View>
                  {this.props.userState.UserData.termsAccepted ? (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: 30,
                        right: -10,
                      }}>
                      <Text>
                        <Icon
                          type="ionicon"
                          name="ios-checkmark-circle-outline"
                          color="#59a711"
                          size={25}
                          style={{top: 3}}
                        />
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        height: 30,
                        right: -10,
                      }}>
                      <Text>
                        <Icon
                          type="feather"
                          name="alert-circle"
                          color="red"
                          size={25}
                          style={{top: 3}}
                        />
                      </Text>
                    </View>
                  )}
                </View>
              }
            />
            <ListItem
              key={' Política de Privacidad'}
              subtitle=" Política de privacidad"
              bottomDivider={true}
              onPress={() => this.gotoPrivacy()}
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              chevron
            />
            <ListItem
              key={' Contrato de Licencia para el Usuario'}
              subtitle=" Contrato de licencia para el usuario"
              onPress={() => this.gotoEula()}
              bottomDivider={true}
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              chevron
            />
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Cuenta</Text>
            </View>
            <ListItem
              key={11}
              subtitle=" Borrar Cuenta "
              onPress={() => this.deleteAccountConfirm()}
              containerStyle={{height: 50}}
              subtitleStyle={{
                color: 'red',
                fontSize: 13,
                top: -3,
                fontWeight: '700',
              }}
              bottomDivider={true}
              chevron
            />
            <ListItem
              key={12}
              subtitle=" Cerrar sesión "
              onPress={() => this.logoutConfirm()}
              containerStyle={{height: 50}}
              subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
              bottomDivider={true}
              chevron
            />
          </View>
          <View style={{marginTop: 20, marginBottom: 10}}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                marginTop: 15,
                marginBottom: 0,
                color: 'gray',
              }}>
              Versión {appVersion}. Build {buildNumber}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                marginTop: 0,
                marginBottom: 30,
                color: 'gray',
              }}>
              Desarrollado por Tecnologías Amber de México S.R.L de C.V.
            </Text>
          </View>
        </ScrollView>
        {this.state.deleting ? (
          <View
            style={{
              height: height - 50,
              flex: 1,
              width: width,
              alignSelf: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(222, 218, 220, 0.7)',
              position: 'absolute',
            }}>
            <ActivityIndicator
              size="large"
              color="black"
              style={{alignSelf: 'center'}}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTitle: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  textTitle: {
    fontWeight: 'bold',
    color: '#7CB185',
    fontSize: 18,
  },
});
let ProfileContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(Profile);
export default ProfileContainer;
