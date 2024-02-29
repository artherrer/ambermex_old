import React, { Component } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  ListItem
} from 'react-native-elements';
import Ionicon from 'react-native-vector-icons/Ionicons';
var {height, width} = Dimensions.get('window');
var SQLite = require('react-native-sqlite-storage');
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const EndpointRequests = require('../../util/requests.js');
const placeholder = require('../../../assets/image/profile_pholder.png');
let ambermex_logo = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');

import { connect } from 'react-redux';

class Settings extends Component {
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
        <Ionicon
          name="ios-arrow-back"
          color={'#7D9D78'}
          size={28}
          style={{textAlign: 'center'}}
        />
      </TouchableOpacity>
    ),
    headerTintColor: '#7D9D78',
  });

  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  gotoGuide() {
    Linking.openURL('http://www.botonambermex.com/guia-de-uso').catch(err =>
      console.error('An error occurred', err),
    );
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

  verifyIdentity() {
    this.props.navigation.navigate('SettingsVerifyUser', {
      PreviousRoute: 'Settings',
    });
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

  render() {
    return (
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        style={{flex: 1, justifyItems: 'center', paddingTop: 0}}>
        <View style={{width: width}}>
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
            key={' Actividad inusual'}
            subtitle=" Actividad sospechosa"
            bottomDivider={true}
            containerStyle={{height: 50}}
            onPress={() => this.gotoSuspicious()}
            subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
            chevron
          />
          <View style={styles.containerTitle}>
            <Text style={styles.textTitle}> Soporte</Text>
          </View>
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
            subtitle=" Términos y Condiciones"
            onPress={() => this.gotoTerms()}
            bottomDivider={true}
            containerStyle={{height: 50}}
            subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
            chevron
          />
          <ListItem
            key={' Política de Privacidad'}
            subtitle=" Política de Privacidad"
            bottomDivider={true}
            onPress={() => this.gotoPrivacy()}
            containerStyle={{height: 50}}
            subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
            chevron
          />
          <ListItem
            key={' Contrato de Licencia para el Usuario'}
            subtitle=" Contrato de Licencia para el Usuario"
            onPress={() => this.gotoEula()}
            bottomDivider={true}
            containerStyle={{height: 50}}
            subtitleStyle={{color: 'grey', fontSize: 13, top: -3}}
            chevron
          />
          <ListItem
            key={11}
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
            Version {appVersion}. Build {buildNumber}
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
let SettingsContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(Settings);
export default SettingsContainer;
