import React, { Component } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  Avatar as AvatarAlt,
  Icon,
  ListItem
} from 'react-native-elements';
import SuspiciousReport from '../chat/suspicious_report';
import HistoryRow from '../home/convos/cmps/historyRow';
var {height, width} = Dimensions.get('window');
var SQLite = require('react-native-sqlite-storage');
const appVersion = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();
const EndpointRequests = require('../../util/requests.js');
const placeholder = require('../../../assets/image/profile_pholder.png');
let ambermex_logo = require('../../../assets/image/AMBERMEX_HORIZONTAL.png');

var iPhoneX = height >= 812;

import { connect } from 'react-redux';

class HistoryAlert extends Component {
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
        : navigation.state.params != undefined &&
          navigation.state.params.suspicious
        ? 'Actividad sospechosa'
        : 'Emergencia',
    headerLeftContainerStyle: {
      padding: 10,
      paddingLeft: 0,
    },
    headerTintColor: '#7D9D78',
    headerTitleStyle: {color: 'black'},
  });

  constructor(props) {
    super(props);

    let Suspicious =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.Type != undefined
        ? true
        : false;
    this.state = {
      historyAlert: [],
      isLoading: false,
      suspicious: Suspicious,
      suspiciousReportModal: false,
      alertInitialMessage: '',
      alertAttachedPicture: null,
      coordinates: {latitude: 0, longitude: 0},
      startDate: new Date(),
    };
  }

  async componentDidMount() {
    let {suspicious} = this.state;
    this.props.navigation.setParams({
      suspicious: suspicious,
    });
    this.chooseEndpoint();
  }

  chooseEndpoint() {
    let {suspicious} = this.state;

    if (suspicious) {
      this.getSuspicious(1);
    } else {
      this.getHistory(1);
    }
  }

  async getSuspicious(page) {
    this.setState({isLoading: true});
    let history = [];
    EndpointRequests.GetSuspiciousAlerts(
      page,
      async function (responseData) {
        if (
          responseData.alertHistory != undefined &&
          responseData.alertHistory.length > 0
        ) {
          for (let i = 0; i < responseData.alertHistory.length; i++) {
            let emergencyRow = responseData.alertHistory[i];
            let expiredChannel = {
              name: 'ACTIVIDAD SOSPECHOSA',
              fontColor: 'black',
              alert_type: 'Suspicious',
              creatorAge: 0,
              creatorGender: 'Sin Especificar',
              ended_on: new Date(),
              startDate: new Date(),
              lastAlarmDate: new Date(),
              time: new Date().getTime(),
              locationText: '',
              locationCoordinates: '',
              ended: true,
            };

            expiredChannel.creatorAge = emergencyRow.userData.userAge;
            expiredChannel.creatorGender = emergencyRow.userData.gender;

            expiredChannel.ended_on = emergencyRow.emergencyEndedUTC;
            expiredChannel.lastAlarmDate = emergencyRow.emergencyExpiredUTC;
            expiredChannel.startDate = emergencyRow.emergencyStartedUTC;
            expiredChannel.ended = emergencyRow.ended;
            expiredChannel.attachedImage = emergencyRow.attachedPicture;
            expiredChannel.time = new Date(
              emergencyRow.emergencyStartedUTC,
            ).getTime();

            if (emergencyRow.userData.text != null) {
              let location = emergencyRow.userData.text.split(':');
              let coordinates = null;
              let address = null;
              let reportMessage = null;
              if (location.length >= 2) {
                reportMessage = location[0].split('Ubicación')[0];
                location = location[1].split('@');
                if (location.length >= 2) {
                  coordinates = location[1];
                  address = location[0];
                  coordinates = await this.getCoordinates(coordinates);
                  let noAddress = address.trim() === 'Coordenadas';
                  expiredChannel.noAddress = noAddress;
                  expiredChannel.locationText = address;
                  expiredChannel.locationCoordinates = coordinates;
                  expiredChannel.message = reportMessage;
                }
              }
            }

            history.push(expiredChannel);
          }

          this.setState({
            historyAlert: history.sort((a, b) => {
              return b.time - a.time;
            }),
            isLoading: false,
          });
        } else {
          this.setState({isLoading: false});
        }
      }.bind(this),
    );
  }

  async getHistory(page) {
    this.setState({isLoading: true});
    let history = [];
    EndpointRequests.GetHistoryAlerts(
      page,
      async function (responseData) {
        if (
          responseData.alertHistory != undefined &&
          responseData.alertHistory.length > 0
        ) {
          for (let i = 0; i < responseData.alertHistory.length; i++) {
            let emergencyRow = responseData.alertHistory[i];
            let expiredChannel = {
              name: 'Alerta de Seguridad',
              fontColor: 'red',
              alert_type: 'Emergency',
              creatorAge: 0,
              creatorGender: 'Sin Especificar',
              ended_on: new Date(),
              startDate: new Date(),
              lastAlarmDate: new Date(),
              time: new Date().getTime(),
              locationText: '',
              locationCoordinates: '',
              ended: true,
            };
            if (emergencyRow.type == 0) {
              expiredChannel.alert_type = 'Emergency';
              expiredChannel.fontColor = 'white';
            }
            if (emergencyRow.type == 1) {
              expiredChannel.alert_type = 'Medical';
              expiredChannel.name = 'Alerta Medica';
              expiredChannel.fontColor = 'white';
            } else if (emergencyRow.type == 2) {
              expiredChannel.alert_type = 'Fire';
              expiredChannel.name = 'Alerta de Incendio';
              expiredChannel.fontColor = 'white';
            } else if (emergencyRow.type == 4) {
              expiredChannel.alert_type = 'Feminist';
              expiredChannel.name = 'Alerta Mujeres';
              expiredChannel.fontColor = 'white';
            }

            expiredChannel.creatorAge = emergencyRow.userData.userAge;
            expiredChannel.creatorGender = emergencyRow.userData.gender;

            expiredChannel.ended_on = emergencyRow.emergencyEndedUTC;
            expiredChannel.lastAlarmDate = emergencyRow.emergencyExpiredUTC;
            expiredChannel.startDate = emergencyRow.emergencyStartedUTC;
            expiredChannel.ended = emergencyRow.ended;
            if (emergencyRow.ended) {
              expiredChannel.time = new Date(
                emergencyRow.emergencyExpiredUTC,
              ).getTime();
            } else {
              expiredChannel.time = new Date().getTime();
            }

            if (emergencyRow.userData.text != null) {
              let location = emergencyRow.userData.text.split(':');
              let coordinates = null;
              let address = null;
              if (location.length >= 2) {
                location = location[1].split('@');
                if (location.length >= 2) {
                  coordinates = location[1];
                  address = location[0];
                  coordinates = await this.getCoordinates(coordinates);
                  let noAddress = address.trim() === 'Coordenadas';
                  expiredChannel.noAddress = noAddress;
                  expiredChannel.locationText = address;
                  expiredChannel.locationCoordinates = coordinates;
                }
              }
            }

            history.push(expiredChannel);
          }

          this.setState({historyAlert: history, isLoading: false});
        } else {
          this.setState({isLoading: false});
        }
      }.bind(this),
    );
  }

  async getCoordinates(text) {
    let coordinates;
    coordinates = text.match(/\(([^)]+)\)/)[1];
    coordinates = coordinates.split(',');
    if (coordinates.length > 1) {
      coordinates = {
        latitude: parseFloat(coordinates[0]),
        longitude: parseFloat(coordinates[1]),
      };
      return coordinates;
    }
    return null;
  }

  openMap(item) {
    if (item.alert_type === 'Suspicious') {
      this.setState({
        startDate: item.startDate,
        coordinates: item.locationCoordinates,
        alertInitialMessage: item.message,
        suspiciousReportModal: true,
        alertAttachedPicture: item.attachedImage,
      });
    } else {
      if (
        item.locationCoordinates != undefined &&
        item.locationCoordinates.latitude != undefined
      ) {
        let mapsUrl =
          'http://maps.google.com/?q=' +
          item.locationCoordinates.latitude +
          ',' +
          item.locationCoordinates.longitude;
        Linking.openURL(mapsUrl);
      }
    }
  }

  _keyExtractor = (item, index) => index.toString();
  _renderConvo = ({item}) => {
    return (
      <HistoryRow
        dialog={item}
        loadChatroom={item => this.openMap(item)}
        navigation={this.props.navigation}
        clearCurrent={() => this.props.dispatch({type: 'CLEAR_CURRENT'})}
      />
    );
  };

  render() {
    let {suspicious} = this.state;
    return (
      <View style={{flex: 1, width: width, backgroundColor: 'white'}}>
        <FlatList
          style={{backgroundColor: 'white', flex: 1}}
          refreshing={this.state.isLoading}
          onRefresh={() => this.chooseEndpoint()}
          data={
            this.state.historyAlert.length > 0
              ? this.state.historyAlert.sort((a, b) => {
                  return b.time - a.time;
                })
              : []
          }
          keyExtractor={this._keyExtractor}
          renderItem={item => this._renderConvo(item)}
          ListEmptyComponent={() =>
            this.state.isLoading ? (
              <ListItem
                hideChevron
                roundAvatar
                containerStyle={{
                  height: 100,
                  marginTop: 10,
                  justifyContent: 'center',
                  paddingTop: 0,
                }}
                leftAvatar={
                  <AvatarAlt
                    size="medium"
                    style={{
                      height: 60,
                      width: 60,
                      borderRadius: 30,
                      backgroundColor: 'lightgray',
                    }}
                    rounded
                    title={''}
                    activeOpacity={0.7}
                  />
                }
                title={''}
                titleStyle={{
                  height: 25,
                  marginBottom: 5,
                  backgroundColor: 'lightgray',
                }}
                subtitle={
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 0,
                      marginTop: 0,
                      backgroundColor: 'lightgray',
                    }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        color: 'lightgray',
                        marginTop: 3,
                      }}></Text>
                  </View>
                }
              />
            ) : (
              <View
                style={{
                  height: iPhoneX ? height - 305 : height - 325,
                  width: width,
                  justifyContent: 'center',
                  borderBottomColor: 'transparent',
                }}>
                <Icon
                  type="ionicon"
                  name="ios-list"
                  size={140}
                  color="lightgray"
                  style={{textAlign: 'center'}}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    padding: 40,
                    fontSize: 17,
                    paddingTop: 20,
                    paddingBottom: 0,
                    fontWeight: 'bold',
                    color: 'lightgray',
                  }}>
                  {suspicious
                    ? 'Historial de actividad sospechosa vacio'
                    : 'Historial de alertas vacio'}
                </Text>
              </View>
            )
          }
          onEndReachedThreshold={5}
        />
        <SuspiciousReport
          startDate={this.state.startDate}
          location={
            this.state.coordinates != undefined ? this.state.coordinates : null
          }
          attachedImage={this.state.alertAttachedPicture}
          closeReportModal={() => this.setState({suspiciousReportModal: false})}
          reportModal={this.state.suspiciousReportModal}
          alertText={this.state.alertInitialMessage}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTitle: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  textTitle: {
    fontWeight: 'bold',
    color: '#7CB185',
    fontSize: 20,
  },
});
let HistoryAlertContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(HistoryAlert);
export default HistoryAlertContainer;
