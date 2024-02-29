import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AsyncStorage,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import {Icon, Input, Slider} from 'react-native-elements';
import RNExitApp from 'react-native-exit-app';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicon from 'react-native-vector-icons/Ionicons';
import DialogModalAlert from '../dialog_modal_alerts.js';
import EmergencyCountdown from '../emergency_countdown.js';
import TermsAndConditions from '../termsandconditions.js';
import WelcomePopup from '../welcome_popup.js';
import Convo from './cmps/convo';
import PlansModal from './plans_modal.js';
const BOTON_AMBERMEX = require('../../../../assets/image/AMBERMEX_HORIZONTAL.png');
const BANNER_MED_ENABLED = require('../../../../assets/image/BANNER_MED_ENABLED.png');
const BANNER_MED_DISABLED = require('../../../../assets/image/BANNER_MED_DISABLED.png');
const CREATE_GROUP = require('../../../../assets/image/CREATE_GROUP.png');
const CREATE_INDIVIDUAL = require('../../../../assets/image/CREATE_INDIVIDUAL.png');
const OFFICIAL_ONDUTY = require('../../../../assets/image/OFFICIAL_ON_DUTY.png');
const OFFICIAL_OFFDUTY = require('../../../../assets/image/OFFICIAL_OFF_DUTY.png');
const PIC_PLACEHOLDER = require('../../../../assets/image/profile_pholder.png');
const BOTON_AMBERMEX_OFFICIAL = require('../../../../assets/image/BOTON_HOME.png');
const OFFICIAL_CHANNEL = require('../../../../assets/image/OFICIAL_CHANNEL.png');

//COVERAGE ICONS
const OFFICIAL_NO_INTERNET = require('../../../../assets/image/OFFICIAL_NO_INTERNET.png');
const OFFICIAL_NO_COVERAGE = require('../../../../assets/image/OFFICIAL_NO_COVERAGE.png');
const OFFICIAL_COVERAGE = require('../../../../assets/image/OFFICIAL_COVERAGE.png');
const USER_NO_INTERNET = require('../../../../assets/image/USER_NO_INTERNET.png');
const USER_NO_COVERAGE = require('../../../../assets/image/USER_NO_COVERAGE.png');
const USER_COVERAGE = require('../../../../assets/image/USER_COVERAGE.png');
//COVERAGE ICONS
const BARRA_MEDICAL = require('../../../../assets/image/BARRA_MEDICO.png');
const BARRA_MEDICAL_DISABLED = require('../../../../assets/image/BARRA_MEDICO_DISABLED.png');
const BARRA_PERSONAL = require('../../../../assets/image/BARRA_PERSONAL.png');
const BARRA_PERSONAL_DISABLED = require('../../../../assets/image/BARRA_PERSONAL_DISABLED.png');
const BARRA_SOSPECHA = require('../../../../assets/image/BARRA_SOSPECHA.png');
const BARRA_SOSPECHA_DISABLED = require('../../../../assets/image/BARRA_SOSPECHA_DISABLED.png');
const BARRA_VECINAL = require('../../../../assets/image/BARRA_VECINAL.png');
const BARRA_VECINAL_DISABLED = require('../../../../assets/image/BARRA_VECINAL_DISABLED.png');
const BARRA_MUJERES = require('../../../../assets/image/BARRA_MUJERES.png');
const BARRA_MUJERES_DISABLED = require('../../../../assets/image/BARRA_MUJERES_DISABLED.png');
const FLECHA_SLIDER = require('../../../../assets/image/FLECHA-SLIDER.png');
const FLECHA_THUMB_INDIVIDUAL = require('../../../../assets/image/FLECHA-THUMB.png');

const EndpointRequests = require('../../../util/requests.js');

import {xml} from '@xmpp/client/react-native';
import id from '@xmpp/id';
import {connect} from 'react-redux';
var {height, width} = Dimensions.get('window');
var iPhoneX = height >= 812;

var headerHeight = iPhoneX ? 91 : 64;
//91 for iphoneX 64 for normal
let error_connection = [
  'Public Chatrooms',
  'Socks 5 Bytestreams Proxy',
  'User Search',
  'Broadcast service',
  'Publish-Subscribe service',
  'alertamxdev.net',
];

class Convos extends Component {
  static navigationOptions = ({navigation}) => ({
    headerTitleAlign: 'center',
    headerStyle: {alignItems: 'center', justifyContent: 'center'},
    headerTitle:
      navigation.state.params != undefined && navigation.state.params.loading
        ? () => <ActivityIndicator size="large" color="#0E75FA" />
        : () => (
            <View
              onPress={() => navigation.navigate('Settings')}
              style={{height: 45}}>
              <Image
                source={BOTON_AMBERMEX}
                resizeMode={'contain'}
                style={{width: width / 3, height: 45}}
              />
            </View>
          ),
    headerRight: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={{right: 20}}>
        <FeatherIcon name="settings" color="#B2B2B2" size={25} />
      </TouchableOpacity>
    ),
    headerLeft: null,
    headerStyle: {
      backgroundColor: 'white',
      shadowColor: 'transparent',
      elevation: 0,
    },
  });

  constructor(props) {
    super(props);
    this.state = {
      Loading: false,
      LoadingChats: false,
      EmergencyType: 'Emergency',
      searchList: [],
      searchText: '',
      searching: false,
      Ready: false,
      PlansModal: false,
      showTerms: false,
      accepting: false,
      CurrentEmergency: null,
      loadedData: false,
      alertTypePressed: 'Internet',
      noAlertModal: false,
      showWelcome: false,
      emergencyTypeSelected: 0, //0 = security, 1 = suspicious, 2 = group, 3 = feminist,
      sliderValue: 0,
      arrowSize: new Animated.Value((width / 3) * 1.85),
      showCountdown: false,
      officialChannelId: null,
    };
    this.onBackClicked = this.goBackHandler.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      loading: false,
      showServicePlans: this.showServicePlans.bind(this),
      isOfficial: this.props.userState.UserData.isOfficial,
      onDuty: this.props.userState.UserData.isOnDuty,
      userThumbnail: this.props.userState.UserData.pictureUrl,
      InternetLost: false,
      OnCoverage: false,
      topLeftClick: this.topLeftClick.bind(this),
    });

    this.props.dispatch({
      type: 'SET_LOAD_CHATLIST',
      LoadChatList: (animate, cb) => this.loadChats(animate, cb),
      LoadChatRoom: (item, isAlert) => this.loadChatroom(item, isAlert),
      LoadChannel: item => this.loadChatNotification(item),
    });
    //
    this.props.dispatch({
      type: 'SET_LOAD_FUNCTIONS',
      ReloadChatList: () => this.reloadPresence(),
      ReloadChatRoom: item => this.loadChatroom(item),
    });
    //
    this.loadChats();
    StatusBar.setBarStyle('dark-content');
    BackHandler.addEventListener('hardwareBackPress', this.onBackClicked);

    this.loadUserData();

    setTimeout(
      async function () {
        this.setState({Ready: true});
      }.bind(this),
      10000,
    );
  }

  topLeftClick() {
    this.buttonAction('TopLeftStatus', false);
  }

  showServicePlans() {
    this.setState({PlansModal: true});
  }

  loadUserData() {
    if (!this.props.userState.UserDataLoaded) {
      let isOfficial =
        this.props.userState.UserData.isOfficial == true ? true : false;
      EndpointRequests.GetUserInfo(
        function (responseData) {
          if (responseData.user && responseData.user != undefined) {
            //REMOVE LINE, JUST FOR TESTING
            //responseData.user.isOfficial = true; //this should come from backend
            this.props.navigation.setParams({
              isOfficial: responseData.user.isOfficial,
            });
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
            if (!responseData.user.termsAccepted) {
              this.setState({showTerms: true});
            } else if (this.props.userState.WelcomeScreen) {
              this.showWelcome();
            }
            if (responseData.user.isOfficial) {
              this.props.chatState.ScheduleNotifications(
                responseData.user.responseElementSchedule,
              );
            } else if (!responseData.user.isOfficial && isOfficial) {
              this.props.chatState.ScheduleNotifications(undefined); //if user was official but we removed that status, remove his remaining notifications
            }
          } else if (
            responseData.message != undefined &&
            responseData.message === 'Banned'
          ) {
            this.logout();
          }
        }.bind(this),
      );
    } else {
      if (!this.props.userState.UserData.termsAccepted) {
        this.setState({showTerms: true});
      } else if (this.props.userState.WelcomeScreen) {
        this.showWelcome();
      }
    }
  }

  goBackHandler() {
    if (this.props.navigation.state.routeName === 'Dashboard') {
      this.props;
      RNExitApp.exitApp();
      return true;
    } else {
      return false;
    }
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

  async componentDidUpdate(prevProps) {
    if (
      prevProps.clientState.LoginLoading != this.props.clientState.LoginLoading
    ) {
      this.props.navigation.setParams({
        loading: !prevProps.clientState.LoginLoading,
      });
    }

    if (
      prevProps.clientState.InternetLost != this.props.clientState.InternetLost
    ) {
      this.props.navigation.setParams({
        InternetLost: !prevProps.clientState.InternetLost,
      });
    }

    if (prevProps.userState.CurrentPoint != this.props.userState.CurrentPoint) {
      this.props.navigation.setParams({
        OnCoverage: this.props.userState.CurrentPoint.length > 0,
      });
    }
    /*
      if(prevProps.userState.UserData.isOnDuty != this.props.userState.UserData.isOnDuty){
        this.props.navigation.setParams({
          isOfficial: this.props.userState.UserData.isOfficial,
          onDuty: this.props.userState.UserData.isOnDuty
        });
      }
      */
  }

  async loadChatNotification(channelId, noRetry) {
    if (channelId == undefined || noRetry >= 5) {
      return false;
    }

    let isAlert = false;
    if (channelId.startsWith('alertaglobal')) {
      isAlert = true;
    }

    let chatIndex = this.props.chatState.Chats.findIndex(
      x => x.id === channelId,
    );

    if (chatIndex >= 0) {
      let chat = this.props.chatState.Chats[chatIndex];
      this.loadChatroom(chat, isAlert);
    } else {
      await this.loadChats(false, finished => {
        chatIndex = this.props.chatState.Chats.findIndex(
          x => x.id === channelId,
        );
        if (chatIndex >= 0) {
          let chat = this.props.chatState.Chats[chatIndex];
          this.loadChatroom(chat, isAlert);
        } else {
          setTimeout(
            async function () {
              this.loadChatNotification(
                channelId,
                noRetry != undefined ? noRetry++ : 1,
              );
            }.bind(this),
            500,
          );
        }
      });
    }
  }

  async loadChats(animation, cb) {
    let {LoadingChats} = this.state;

    if (LoadingChats) {
      //if channels are still loading, don't send another request
      if (cb != undefined) {
        cb(true);
      }
      return true;
    }

    if (animation) {
      this.setState({Loading: true, LoadingChats: true});
    } else {
      this.setState({LoadingChats: true});
    }

    let chatsArray = [];

    try {
      let message = xml(
        'iq',
        {
          xmlns: 'jabber:client',
          type: 'get',
          from: this.props.clientState.From,
          to: this.props.clientState.Conference,
        },
        xml('query', 'http://jabber.org/protocol/disco#items'),
      );
      let response = await this.props.clientState.Client.iqCaller.request(
        message,
      );
      chatsArray = response.children[0].children;
    } catch (error) {
      chatsArray = [];
      console.log(error);
    }

    let Conversations = [];
    let fetches = [];
    let ConversationExists = false;

    await this.props.clientState.DB.transaction(async tx => {
      tx.executeSql(
        'SELECT * FROM conversations WHERE temporal = ? OR (temporal = ? AND locked = ?)',
        [false, true, false],
        async (txt, results) => {
          var len = results.rows.length;
          if (len > 0) {
            ConversationExists = true;
            for (let k = 0; k < len; k++) {
              let row = results.rows.item(k);
              let lastMsg = null;

              fetches.push(
                new Promise(async (resolve, reject) => {
                  await tx.executeSql(
                    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at DESC LIMIT 1',
                    [row.JID],
                    (txt, results1) => {
                      try {
                        if (results1.rows.length > 0) {
                          let rowMsg = results1.rows.item(0);

                          if (rowMsg.text != undefined) {
                            lastMsg = {
                              id: rowMsg.id,
                              chat_id: rowMsg.conversation_id,
                              timestamp: new Date(rowMsg.sent_at).getTime(),
                              text: rowMsg.text,
                              time: new Date(rowMsg.sent_at).getTime(),
                              message_by: rowMsg.sent_by,
                              username: rowMsg.sent_by,
                              state: 'Sent',
                              read_by: [rowMsg.sent_by],
                              sent_by: rowMsg.sent_by,
                              read_by_count: 1,
                              isMedia: rowMsg.isMedia,
                              isVideo: rowMsg.isVideo,
                              isImage: rowMsg.isImage,
                              isFile: rowMsg.isFile,
                              url: rowMsg.url,
                              fileName: rowMsg.filename,
                              isSystemMsg: rowMsg.isSystemMsg,
                            };
                          }
                        }

                        let Chat = {
                          id: row.JID,
                          name:
                            row.subject != undefined
                              ? row.subject.toString()
                              : '',
                          messages: lastMsg != null ? [lastMsg] : [],
                          loading: false,
                          active_users: [],
                          members: [],
                          description: row.description,
                          last_time_read: new Date(
                            row.last_time_read,
                          ).getTime(),
                          last_message: lastMsg != null ? lastMsg.text : '',
                          last_message_date_sent:
                            lastMsg != null
                              ? new Date(lastMsg.time).getTime()
                              : new Date(row.created_at).getTime(),
                          updated_date:
                            lastMsg != null
                              ? new Date(lastMsg.time).getTime()
                              : new Date(row.created_at).getTime(),
                          unread_messages_count:
                            lastMsg != null
                              ? new Date(row.last_time_read).getTime() <
                                lastMsg.timestamp
                                ? 1
                                : 0
                              : 0,
                          nickname: '',
                          emergency: false,
                          backgroundColor: 'white',
                          fontColor: '#0E75FA',
                          membersLoaded: false,
                          temporal: row.temporal,
                          chatType: Number(row.type),
                          thumbnail: row.thumbnail,
                          locked: row.locked,
                          last_update: new Date().getTime(),
                          hidden: false,
                          additionalProps:
                            row.additionalProps != undefined
                              ? JSON.parse(row.additionalProps)
                              : null,
                        };

                        if (row.temporal) {
                          txt.executeSql(
                            'SELECT * FROM alert_message WHERE conversationid = ?',
                            [row.JID],
                            async (txt2, resultsAlerts) => {
                              if (resultsAlerts.rows.length > 0) {
                                let emergencyRow = resultsAlerts.rows.item(0);
                                if (emergencyRow.message_end_id === null) {
                                  Chat.emergency = true;
                                  if (
                                    emergencyRow.is_medical != undefined &&
                                    emergencyRow.is_medical
                                  ) {
                                    this.setState({
                                      EmergencyType: 'Medical',
                                      CurrentEmergency: row.JID,
                                    });
                                  } else if (
                                    emergencyRow.is_fire != undefined &&
                                    emergencyRow.is_fire
                                  ) {
                                    this.setState({
                                      EmergencyType: 'Fire',
                                      CurrentEmergency: row.JID,
                                    });
                                  } else if (
                                    emergencyRow.is_feminist != undefined &&
                                    emergencyRow.is_feminist
                                  ) {
                                    this.setState({
                                      EmergencyType: 'Feminist',
                                      CurrentEmergency: row.JID,
                                    });
                                  } else {
                                    this.setState({
                                      EmergencyType: 'Emergency',
                                      CurrentEmergency: row.JID,
                                    });
                                  }
                                } else {
                                  Chat.lastAlarmDate =
                                    emergencyRow.expiration_date;
                                  if (
                                    new Date(Chat.lastAlarmDate) < new Date()
                                  ) {
                                    Chat.hidden = true;
                                  }
                                }
                                Conversations.push(Chat);
                                resolve(true);
                              } else {
                                Chat.emergency = true;
                                Conversations.push(Chat);
                                resolve(true);
                              }
                            },
                          );
                        } else {
                          Conversations.push(Chat);
                          resolve(true);
                        }
                      } catch (error) {
                        resolve(true);
                      }
                    },
                  );
                }),
              );
            }
          } else {
            for (let i = 0; i < chatsArray.length; i++) {
              if (error_connection.includes(chatsArray[i].attrs.name)) {
                console.log('error getting chats');
                continue;
              }

              let ConversationJID = chatsArray[i].attrs.jid;
              let ConversationSubject = chatsArray[i].attrs.name;
              let Description = null;
              let LastDate = new Date().toISOString();
              let Temporal = 0;
              let GetMessagesDateHistory;
              let ChatType = 0; //type = 0, user groups, type = 1, individual, type 2 = ambermex oficial, temporal = global alert

              if (
                ConversationSubject == undefined ||
                ConversationSubject.startsWith('alertaglobal') ||
                ConversationSubject.startsWith('ambermexoficial')
              ) {
                continue;
              }

              if (ConversationSubject.startsWith('chat1v1')) {
                ChatType = 1;
                let NewSubject =
                  ConversationSubject.split('chat1v1')[1].split('-');
                Description = ConversationSubject;
                for (let k = 0; k < NewSubject.length; k++) {
                  if (NewSubject[k] != this.props.userState.UserData.alias) {
                    ConversationSubject = NewSubject[k];
                    break;
                  }
                  if (k + 1 == NewSubject.length) {
                    ConversationSubject = NewSubject[0];
                  }
                }
              }

              if (ConversationJID.startsWith('alertaglobal')) {
                Temporal = 1;
                GetMessagesDateHistory = new Date(2020, 0, 1, 0, 0).getTime();
              } else if (ConversationJID.startsWith('ambermexoficial')) {
                ChatType = 2;
                GetMessagesDateHistory = new Date();
              } else {
                GetMessagesDateHistory = new Date();
              }

              fetches.push(
                new Promise(async (resolve, reject) => {
                  tx.executeSql(
                    'INSERT INTO conversations (JID, created_at, subject, description, type, last_time_read, temporal) VALUES (?,?,?,?,?,?,?)',
                    [
                      ConversationJID,
                      LastDate,
                      ConversationSubject,
                      Description,
                      String(ChatType),
                      LastDate,
                      Temporal,
                    ],
                    (tx1, results1) => {
                      try {
                        if (results1.rowsAffected > 0) {
                          let Chat = {
                            id: ConversationJID,
                            name: ConversationSubject,
                            messages: [],
                            loading: true,
                            active_users: [],
                            members: [],
                            last_message: '',
                            last_time_read: new Date(LastDate).getTime(),
                            last_message_date_sent: GetMessagesDateHistory,
                            updated_date: GetMessagesDateHistory,
                            unread_messages_count: 0,
                            nickname: '',
                            emergency: false,
                            backgroundColor: 'white',
                            fontColor: '#0E75FA',
                            temporal: Temporal,
                            chatType: Number(ChatType),
                            thumbnail: null,
                            locked: false,
                            last_update: new Date().getTime(),
                            lastAlarmDate: null,
                            hidden: false,
                          };

                          if (Temporal) {
                            let Type = this.getEmergencyTypeName(
                              Chat.name.toString(),
                            );
                            let TypeEnum = this.getEmergencyTypeEnum(Type);
                            tx1.executeSql(
                              'INSERT INTO alert_message (started_on, is_medical, is_fire, conversationid, is_suspicious, is_feminist, alert_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                              [
                                LastDate,
                                Type === 'Medical' ? 1 : 0,
                                Type === 'Fire' ? 1 : 0,
                                ConversationJID,
                                Type === 'Suspicious' ? 1 : 0,
                                Type === 'Feminist' ? 1 : 0,
                                TypeEnum,
                              ],
                              (tx1, results2) => {
                                Conversations.push(Chat);
                                this.props.dispatch({
                                  type: 'UPDATE_DATA',
                                  Chats: Conversations,
                                });
                                resolve(true);
                              },
                            );
                          } else {
                            Conversations.push(Chat);
                            this.props.dispatch({
                              type: 'UPDATE_DATA',
                              Chats: Conversations,
                            });
                            resolve(true);
                          }
                        } else {
                          resolve(true);
                          console.log('Insert failed');
                        }
                      } catch (error) {
                        resolve(true);
                      }
                    },
                  );
                }),
              );
            }
          }

          setTimeout(
            async function () {
              await Promise.all(fetches).then(res => {
                if (ConversationExists) {
                  if (Conversations.length < chatsArray.length) {
                    this.addNewConversations(chatsArray, Conversations);
                  }

                  Conversations.sort((a, b) => {
                    return b.last_message_date_sent - a.last_message_date_sent;
                  });
                  this.props.dispatch({
                    type: 'UPDATE_DATA',
                    Chats: Conversations,
                  });

                  if (
                    this.props.userState.UserData.termsAccepted &&
                    !this.state.loadedData
                  ) {
                    this.setState({loadedData: true});
                    this.props.chatState.LoadedData(
                      this.props.userState.UserData,
                    );
                  }
                  let expiredChannels = [];
                  setTimeout(
                    async function () {
                      for (let l = 0; l < Conversations.length; l++) {
                        let GetMessage = xml(
                          'presence',
                          {
                            from: this.props.userState.Username,
                            id: id(),
                            to:
                              Conversations[l].id +
                              '/' +
                              this.props.userState.Nickname,
                          },
                          xml(
                            'x',
                            {xmlns: 'http://jabber.org/protocol/muc'},
                            xml('history', {
                              since: new Date(
                                Conversations[l].updated_date + 1000,
                              ).toISOString(),
                            }),
                          ),
                          xml('status', {code: '100'}),
                        );
                        let ResultMessages =
                          this.props.clientState.Client.send(GetMessage);
                        //check for expiredchannels (oneonone) that are still locally on phone, so we can recreate them
                        if (
                          Conversations[l].chatType == 1 &&
                          chatsArray.length > 0
                        ) {
                          let isExpired = chatsArray.findIndex(
                            n =>
                              n.attrs != undefined &&
                              n.attrs.jid === Conversations[l].id,
                          );
                          if (isExpired == undefined || isExpired < 0) {
                            expiredChannels.push(Conversations[l].id);
                          }
                        }
                      }

                      if (expiredChannels.length > 0) {
                        EndpointRequests.RecreateExpiredChannels(
                          expiredChannels,
                          async function (responseRecreate) {}.bind(this),
                        );
                      }
                    }.bind(this),
                    500,
                  );

                  setTimeout(
                    async function () {
                      this.setState({Loading: false, LoadingChats: false});
                      this.removeExpiredChannels();
                    }.bind(this),
                    250,
                  );

                  try {
                    this.props.clientState.DB.transaction(async tx2 => {
                      tx2.executeSql(
                        'SELECT * FROM alert_message WHERE ended_on is NULL AND started_by = ? AND is_suspicious = ? ORDER BY started_on DESC LIMIT 1',
                        [this.props.userState.Nickname, 0],
                        (txt2, resultsAlerts) => {
                          if (resultsAlerts.rows.length > 0) {
                            let existingAlarm = resultsAlerts.rows.item(0);
                            this.props.dispatch({type: 'SET_ONGOING'});
                            let conversationAlertIndex =
                              Conversations.findIndex(
                                x => x.id == existingAlarm.conversationid,
                              );
                            if (conversationAlertIndex >= 0) {
                              this.props.chatState.ExistingAlarm({
                                id: existingAlarm.conversationid,
                                chat_id: existingAlarm.conversationid,
                                chat_name:
                                  Conversations[conversationAlertIndex].name,
                              });
                            }
                            if (cb != undefined) {
                              cb(true);
                            }
                          } else {
                            if (cb != undefined) {
                              cb(true);
                            }
                          }
                        },
                      );
                    });
                  } catch (err) {
                    console.log(err);
                    setTimeout(
                      async function () {
                        this.setState({Loading: false, LoadingChats: false});
                      }.bind(this),
                      250,
                    );
                  }
                } else {
                  if (
                    this.props.userState.UserData.termsAccepted &&
                    !this.state.loadedData
                  ) {
                    this.setState({loadedData: true});
                    this.props.chatState.LoadedData(
                      this.props.userState.UserData,
                    );
                  }

                  setTimeout(
                    async function () {
                      for (let l = 0; l < Conversations.length; l++) {
                        let GetMessage;
                        let testId = id();

                        if (Conversations[l].temporal) {
                          GetMessage = xml(
                            'presence',
                            {
                              from: this.props.userState.Username,
                              id: id(),
                              to:
                                Conversations[l].id +
                                '/' +
                                this.props.userState.Nickname,
                            },
                            xml(
                              'x',
                              {xmlns: 'http://jabber.org/protocol/muc'},
                              xml('history', {
                                since: new Date(
                                  Conversations[l].updated_date + 1000,
                                ).toISOString(),
                              }),
                            ),
                            xml('status', {code: '100'}),
                          );
                        } else {
                          GetMessage = xml(
                            'presence',
                            {
                              from: this.props.userState.Username,
                              id: id(),
                              to:
                                Conversations[l].id +
                                '/' +
                                this.props.userState.Nickname,
                            },
                            xml(
                              'x',
                              {xmlns: 'http://jabber.org/protocol/muc'},
                              xml('history', {maxstanzas: 0}),
                            ),
                            xml('status', {code: '100'}),
                          );
                        }
                        let ResultMessages =
                          this.props.clientState.Client.send(GetMessage);
                      }
                      this.setState({Loading: false, LoadingChats: false});
                      if (cb != undefined) {
                        cb(true);
                      }
                    }.bind(this),
                    500,
                  );
                }
              });
            }.bind(this),
            250,
          );
        },
      );
    });
  }

  getEmergencyTypeName(name) {
    if (name == undefined) {
      return 'Emergency';
    }
    if (name.startsWith('Alerta Seguridad')) {
      return 'Emergency';
    } else if (name.startsWith('Alerta de Incendio')) {
      return 'Fire';
    } else if (name.startsWith('Alerta Médica')) {
      return 'Medical';
    } else if (name.startsWith('Actividad Sospechosa')) {
      return 'Suspicious';
    } else if (name.startsWith('Alerta Mujeres')) {
      return 'Feminist';
    } else {
      return 'Emergency';
    }
  }

  getEmergencyTypeEnum(type) {
    if (type == 'Emergency') {
      return 0;
    } else if (type == 'Medical') {
      return 1;
    } else if (type == 'Fire') {
      return 2;
    } else if (type == 'Suspicious') {
      return 3;
    } else if (type == 'Feminist') {
      return 4;
    } else {
      return 0;
    }
  }

  async addNewConversations(NewConversations, SavedConversations, cb) {
    let NewAdditions = [];

    let fetches = [];

    for (let i = 0; i < NewConversations.length; i++) {
      if (error_connection.includes(NewConversations[i].attrs.name)) {
        continue;
      }
      let index = SavedConversations.findIndex(
        n => n.id === NewConversations[i].attrs.jid,
      );
      fetches.push(
        new Promise(async (resolve, reject) => {
          try {
            if (index === -1) {
              let ConversationJID = NewConversations[i].attrs.jid;
              let ConversationSubject = NewConversations[i].attrs.name;
              let Description = null;
              let LastDate = new Date().toISOString();
              let Temporal = 0;
              let ChatType = 0;

              if (
                ConversationSubject == undefined ||
                ConversationSubject.startsWith('alertaglobal') ||
                ConversationSubject.startsWith('ambermexoficial')
              ) {
                resolve(true);
                return false;
              }

              if (ConversationSubject.startsWith('chat1v1')) {
                ChatType = 1;
                let NewSubject =
                  ConversationSubject.split('chat1v1')[1].split('-');
                Description = ConversationSubject;
                for (let k = 0; k < NewSubject.length; k++) {
                  if (NewSubject[k] != this.props.userState.UserData.alias) {
                    ConversationSubject = NewSubject[k];
                    break;
                  }
                  if (k + 1 == NewSubject.length) {
                    ConversationSubject = NewSubject[0];
                  }
                }
              }

              if (ConversationJID.startsWith('alertaglobal')) {
                Temporal = 1;
              } else if (ConversationJID.startsWith('ambermexoficial')) {
                ChatType = 2;
              }

              await this.props.clientState.DB.transaction(async tx => {
                tx.executeSql(
                  'INSERT INTO conversations (JID, created_at, subject, description, type, last_time_read, temporal) VALUES (?,?,?,?,?,?,?)',
                  [
                    ConversationJID,
                    LastDate,
                    ConversationSubject,
                    Description,
                    String(ChatType),
                    LastDate,
                    Temporal,
                  ],
                  (tx, results1) => {
                    if (results1.rowsAffected > 0) {
                      let Chat = {
                        id: ConversationJID,
                        name: ConversationSubject,
                        messages: [],
                        loading: true,
                        active_users: [],
                        members: [],
                        last_message: '',
                        last_time_read: new Date(LastDate).getTime(),
                        last_message_date_sent: new Date(LastDate).getTime(),
                        updated_date: new Date(LastDate).getTime(),
                        unread_messages_count: Temporal == 1 ? 0 : 1,
                        nickname: '',
                        emergency: Temporal == 1 ? true : false,
                        backgroundColor: 'white',
                        fontColor: '#0E75FA',
                        membersLoaded: false,
                        temporal: Temporal,
                        chatType: Number(ChatType),
                        locked: false,
                        last_update: new Date().getTime(),
                      };

                      if (Temporal) {
                        let Type = this.getEmergencyTypeName(
                          Chat.name.toString(),
                        );
                        let TypeEnum = this.getEmergencyTypeEnum(Type);
                        tx.executeSql(
                          'INSERT INTO alert_message (started_on, is_medical, is_fire, conversationid, is_suspicious, is_feminist, alert_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                          [
                            LastDate,
                            Type === 'Medical' ? 1 : 0,
                            Type === 'Fire' ? 1 : 0,
                            ConversationJID,
                            Type === 'Suspicious' ? 1 : 0,
                            Type === 'Feminist' ? 1 : 0,
                            TypeEnum,
                          ],
                          (tx, results2) => {
                            SavedConversations.push(Chat);
                            NewAdditions.push(Chat);
                            resolve(true);
                          },
                        );
                      } else {
                        SavedConversations.push(Chat);
                        NewAdditions.push(Chat);
                        resolve(true);
                      }
                    } else {
                      resolve(true);
                    }
                  },
                );
              });
            } else {
              resolve(true);
            }
          } catch (error) {
            resolve(true);
          }
        }),
      );
    }

    await Promise.all(fetches).then(() => {
      this.props.dispatch({type: 'UPDATE_DATA', Chats: SavedConversations});
      if (
        this.props.userState.UserData.termsAccepted &&
        !this.state.loadedData
      ) {
        this.setState({loadedData: true});
        this.props.chatState.LoadedData(this.props.userState.UserData);
      }

      this.setState({Loading: false});

      setTimeout(
        async function () {
          for (let l = 0; l < NewAdditions.length; l++) {
            let GetMessage;
            let testid = id();

            if (NewAdditions[l].temporal) {
              GetMessage = xml(
                'presence',
                {
                  from: this.props.userState.Username,
                  id: id(),
                  to: NewAdditions[l].id + '/' + this.props.userState.Nickname,
                },
                xml(
                  'x',
                  {xmlns: 'http://jabber.org/protocol/muc'},
                  xml('history', {
                    since: new Date(2020, 0, 1, 0, 0).toISOString(),
                  }),
                ),
                xml('status', {code: '100'}),
              );
            } else {
              GetMessage = xml(
                'presence',
                {
                  from: this.props.userState.Username,
                  id: id(),
                  to: NewAdditions[l].id + '/' + this.props.userState.Nickname,
                },
                xml(
                  'x',
                  {xmlns: 'http://jabber.org/protocol/muc'},
                  xml('history', {maxstanzas: 0}),
                ),
                xml('status', {code: '100'}),
              );
            }

            let ResultMessages = this.props.clientState.Client.send(GetMessage);
          }

          if (cb != undefined) {
            cb(true);
          }
        }.bind(this),
        500,
      );
    });
  }

  gotoCreateGroup(type) {
    this.props.navigation.navigate('SelectContacts', {type: type});
  }

  async removeExpiredChannels() {
    let now = new Date();
    let expiredChannels = [];
    let error = [];

    for (let i = 0; i < this.props.chatState.Chats.length; i++) {
      if (this.props.chatState.Chats[i].temporal) {
        if (this.props.chatState.Chats[i].hidden) {
          expiredChannels.push(this.props.chatState.Chats[i].id);
        }
      } else if (
        error_connection.includes(this.props.chatState.Chats[i].name)
      ) {
        error.push({
          id: this.props.chatState.Chats[i].id,
          name: this.props.chatState.Chats[i].name,
        });
      }
    }

    if (expiredChannels.length > 0) {
      EndpointRequests.RemoveExpiredChannels(
        expiredChannels,
        async function (responseData) {
          for (let i = 0; i < expiredChannels.length; i++) {
            await this.props.clientState.DB.transaction(async tx => {
              tx.executeSql(
                'UPDATE conversations SET locked = ? WHERE JID = ?',
                [true, expiredChannels[i]],
                (tx, results1) => {},
              );
            });
          }
        }.bind(this),
      );
    }

    if (error.length > 0) {
      for (let i = 0; i < error.length; i++) {
        await this.props.clientState.DB.transaction(async tx => {
          tx.executeSql(
            'DELETE FROM conversations WHERE Name = ?',
            [error[i].name],
            (txt, results1) => {
              this.props.dispatch({type: 'REMOVE_ROOM', ChatId: error[i].id});
            },
          );
        });
      }
    }
  }

  reloadPresence() {
    setTimeout(
      async function () {
        for (let l = 0; l < this.props.chatState.Chats.length; l++) {
          let GetMessage = xml(
            'presence',
            {
              from: this.props.userState.Username,
              id: id(),
              to:
                this.props.chatState.Chats[l].id +
                '/' +
                this.props.userState.Nickname,
            },
            xml(
              'x',
              {xmlns: 'http://jabber.org/protocol/muc'},
              xml('history', {
                since: new Date(
                  this.props.chatState.Chats[l].updated_date + 1000,
                ).toISOString(),
              }),
            ),
            xml('status', {code: '100'}),
          );
          let ResultMessages = this.props.clientState.Client.send(GetMessage);
        }
      }.bind(this),
      500,
    );
  }

  showLocation(type, channel) {
    if (!this.props.clientState.LoginLoading) {
      if (type === 'Suspicious') {
        this.props.navigation.navigate('PublicAlert', {
          clearCurrent: () => this.clearCurrentChat(),
          type: type,
          channel: channel,
        });
      } else {
        if (this.props.chatState.OngoingAlert) {
          Alert.alert(
            'Alerta Activa.',
            'Tienes una alerta activa, no puedes crear más de una alerta al mismo tiempo.',
            [
              {
                text: 'Ok',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        } else {
          this.props.navigation.navigate('PublicAlert', {
            clearCurrent: () => this.clearCurrentChat(),
            type: type,
            channel: channel,
          });
        }
      }
    }
  }

  async clearCurrentChat() {
    if (
      this.props.chatState.CurrentChat != undefined &&
      this.props.chatState.CurrentChat.id != undefined
    ) {
      let dateCheck = new Date().getTime() + 100;
      let presence = xml(
        'presence',
        {
          from: this.props.userState.Username,
          id: id(),
          to:
            this.props.chatState.CurrentChat.id +
            '/' +
            this.props.userState.Nickname,
        },
        xml(
          'x',
          {xmlns: 'http://jabber.org/protocol/muc'},
          xml('history', {maxstanzas: 0}),
        ),
        xml('status', {code: '100'}),
      );
      let ResultMessages = await this.props.clientState.Client.send(presence);
    }
    this.props.dispatch({type: 'CLEAR_CURRENT', backHome: true});
  }

  getAlertType(item) {
    if (item.alert_type != undefined) {
      if (item.alert_type == 0) {
        return 'Emergency';
      } else if (item.alert_type == 1) {
        return 'Medical';
      } else if (item.alert_type == 2) {
        return 'Fire';
      } else if (item.alert_type == 3) {
        return 'Suspicious';
      } else if (item.alert_type == 4) {
        return 'Feminist';
      } else {
        return 'Emergency';
      }
    } else {
      if (item.is_medical === 1 || item.is_medical === 'true') {
        return 'Medical';
      } else if (item.is_fire === 1 || item.is_fire === 'true') {
        return 'Fire';
      } else if (item.is_suspicious === 1 || item.is_suspicious === 'true') {
        return 'Suspicious';
      } else if (item.is_feminist === 1 || item.is_feminist === 'true') {
        return 'Feminist';
      } else {
        return 'Emergency';
      }
    }
  }

  async loadChatroom(item, isAlert) {
    const {navigate, LoadingChats} = this.props.navigation;

    try {
      if (LoadingChats) {
        return false;
      }

      if (isAlert) {
        if (
          this.props.chatState.CurrentChat != undefined &&
          this.props.chatState.CurrentChat.id != undefined
        ) {
          return false;
        }
      }

      let ChatIndex = this.props.chatState.Chats.findIndex(
        x => x.id === item.id,
      );

      if (ChatIndex === -1) {
        return false;
      }

      let Chat = this.props.chatState.Chats[ChatIndex];

      if (Chat.loading) {
        let message;

        if (Chat.temporal) {
          let message = xml(
            'presence',
            {
              from: this.props.clientState.From,
              id: id(),
              to: item.id + '/' + this.props.userState.Nickname,
            },
            xml('x', 'http://jabber.org/protocol/muc'),
            xml('status', {code: '200'}),
          );
          let response = this.props.clientState.Client.send(message);
        } else {
          let message = xml(
            'presence',
            {
              from: this.props.clientState.From,
              id: id(),
              to: item.id + '/' + this.props.userState.Nickname,
            },
            xml(
              'x',
              {xmlns: 'http://jabber.org/protocol/muc'},
              xml('history', {
                since: new Date(Chat.last_time_read).toISOString(),
              }),
            ),
            xml('status', {code: '200'}),
          );
          let response = this.props.clientState.Client.send(message);
        }
      } else {
        if (Chat.temporal) {
          let message;

          if (Chat.messages.length == 0) {
            message = xml(
              'presence',
              {
                from: this.props.clientState.From,
                id: id(),
                to: item.id + '/' + this.props.userState.Nickname,
              },
              xml('x', {xmlns: 'http://jabber.org/protocol/muc'}),
              xml('status', {code: '200'}),
            );
          } else {
            message = xml(
              'presence',
              {
                from: this.props.clientState.From,
                id: id(),
                to: item.id + '/' + this.props.userState.Nickname,
              },
              xml(
                'x',
                {xmlns: 'http://jabber.org/protocol/muc'},
                xml('history', {
                  since: new Date(Chat.last_time_read).toISOString(),
                }),
              ),
              xml('status', {code: '200'}),
            );
          }
          let response = this.props.clientState.Client.send(message);
        } else {
          let dateTime = new Date(Chat.updated_date).getTime();
          let message = xml(
            'presence',
            {
              from: this.props.clientState.From,
              id: id(),
              to: item.id + '/' + this.props.userState.Nickname,
            },
            xml(
              'x',
              {xmlns: 'http://jabber.org/protocol/muc'},
              xml('history', {since: new Date(dateTime + 1000).toISOString()}),
            ),
            xml('status', {code: '200'}),
          );
          let response = this.props.clientState.Client.send(message);
        }
      }

      this.props.clientState.DB.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM conversation_member LEFT JOIN users ON conversation_member.user_id = users.username WHERE conversation_member.conversation_id = ?',
          [item.id],
          (txx, results) => {
            if (results.rows.length > 0) {
              let memberInfo = [];
              let messages = [];
              let attendantUpdates = [];
              for (let i = 0; i < results.rows.length; i++) {
                let row = results.rows.item(i);

                let member = {
                  name: row.name,
                  jid: row.JID,
                  nickname: row.username,
                  pictureUrl: row.picture,
                  address: row.address,
                  unit: row.unit,
                  alias: row.alias,
                  phone: row.phone.toString(),
                  admin: row.is_admin === 'true',
                  owner: row.is_owner === 'true',
                  isSupport: row.is_response,
                  isEmergencyContact: row.is_emcontact,
                  responseType: row.response_type,
                };

                memberInfo.push(member);
              }

              let AlertObject;
              let AlertExists = false;
              let AdditionalProps;

              if (Chat.temporal) {
                AlertExists = true;
                tx.executeSql(
                  'SELECT * FROM alert_message WHERE conversationid = ?',
                  [item.id],
                  (txt, results1) => {
                    if (results1.rows.length > 0) {
                      let rowAlert = results1.rows.item(
                        results1.rows.length - 1,
                      );
                      AdditionalProps =
                        rowAlert.additionalProps != undefined
                          ? JSON.parse(rowAlert.additionalProps)
                          : null;
                      AlertObject = {
                        startedOn: new Date(rowAlert.started_on).getTime(),
                        createdBy: null,
                        text:
                          AdditionalProps != undefined
                            ? AdditionalProps.alertInitialMessage
                            : null,
                        endedOn:
                          rowAlert.ended_on != undefined
                            ? new Date(rowAlert.ended_on).getTime()
                            : null,
                        locationList:
                          AdditionalProps != undefined
                            ? AdditionalProps.coordinates != undefined
                              ? [AdditionalProps.coordinates]
                              : []
                            : [],
                        latestCoordinates:
                          AdditionalProps != undefined
                            ? AdditionalProps.coordinates != undefined
                              ? AdditionalProps.coordinates
                              : null
                            : null,
                        type: this.getAlertType(rowAlert),
                        ended:
                          rowAlert.message_end_id != undefined ? true : false,
                      };

                      alertStart = true;
                    }
                  },
                );
              }

              tx.executeSql(
                'SELECT * FROM messages m LEFT JOIN (SELECT message_id, COUNT(*) AS cnt FROM message_member GROUP BY message_id) AS L ON m.id = L.message_id WHERE conversation_id = ?',
                [item.id],
                (txt, results1) => {
                  if (results1.rows.length > 0) {
                    for (let k = 0; k < results1.rows.length; k++) {
                      try {
                        let messageRow = results1.rows.item(k);
                        let memberIndex = memberInfo.findIndex(
                          x => x.nickname === messageRow.sent_by,
                        );
                        let memberData = null;
                        let alertStart = false;
                        let quoteAlias = null;

                        if (memberIndex >= 0) {
                          memberData = memberInfo[memberIndex];
                        }

                        if (messageRow.isQuoted) {
                          let indexMsg = messages.findIndex(
                            n => n.id === messageRow.quoted_msg_id,
                          );

                          if (indexMsg >= 0) {
                            quoteAlias =
                              messages[indexMsg].user != undefined
                                ? messages[indexMsg].user.alias
                                : null;
                          }
                        }

                        let message = {
                          id: messageRow.id,
                          chat_id: item.id,
                          timestamp: new Date(messageRow.sent_at),
                          text: messageRow.text,
                          time: new Date(messageRow.sent_at).getTime(),
                          message_by:
                            memberData != undefined
                              ? memberData.jid
                              : messageRow.sent_by,
                          username: messageRow.sent_by,
                          state: 'Sent',
                          read_by: [],
                          sent_by: messageRow.sent_by,
                          isAlert: alertStart,
                          user: memberData,
                          read_by_count:
                            messageRow.cnt != null ? messageRow.cnt : 0,
                          pending: messageRow.sent === 1 ? false : true,
                          url: messageRow.url,
                          isVideo: messageRow.isVideo,
                          isMedia: messageRow.isMedia,
                          isImage: messageRow.isImage,
                          isFile: messageRow.isFile,
                          fileName: messageRow.filename,
                          thumbnail: messageRow.thumbnail,
                          isQuote: messageRow.isQuoted,
                          quoted_id: messageRow.quoted_msg_id,
                          quoted_msg: messageRow.quoted_text,
                          quote_by: quoteAlias,
                          isEdited: messageRow.isEdited,
                          isSystemMsg: messageRow.isSystemMsg,
                          hidden: messageRow.isHidden,
                        };

                        if (messageRow.isHidden == 1) {
                          attendantUpdates.push(message);
                        } else {
                          messages.push(message);
                        }
                      } catch (err) {
                        console.log(err);
                        continue;
                      }
                    }
                  }

                  if (attendantUpdates.length > 0) {
                    //take hidden messages, if containing coordinate format, we parse coordinates, and take the last one for emergency attendant
                    let lastAttendantLocation = null;
                    attendantUpdates.sort((a, b) => {
                      return b.time - a.time;
                    });
                    for (let k = 0; k < attendantUpdates.length; k++) {
                      try {
                        let StringCoords = attendantUpdates[k].text.split(',');
                        if (StringCoords.length == 2) {
                          lastAttendantLocation = {
                            latitude: parseFloat(StringCoords[0]),
                            longitude: parseFloat(StringCoords[1]),
                          };
                          break;
                        }
                      } catch (parseError) {
                        continue;
                      }
                    }

                    if (
                      lastAttendantLocation != null &&
                      AlertObject != undefined
                    ) {
                      AlertObject.emergencyAttendant = {
                        latestCoordinates: lastAttendantLocation,
                      };
                    }
                  }
                  if (AlertExists) {
                    tx.executeSql(
                      'SELECT * FROM alert_coords WHERE alertid = ? ORDER BY date DESC',
                      [item.id],
                      (txt2, coord_list) => {
                        if (coord_list.rows.length > 0) {
                          AlertObject.latestCoordinates =
                            coord_list.rows.item(0);

                          for (let m = 0; m < coord_list.rows.length; m++) {
                            let row = coord_list.rows.item(m);
                            row.latitude = parseFloat(row.latitude);
                            row.longitude = parseFloat(row.longitude);

                            AlertObject.locationList.push(row);
                          }
                        }

                        item.membersLoaded = true;
                        this.props.dispatch({
                          type: 'LOAD_MESSAGES',
                          Chat: item.id,
                          Messages: messages,
                          AlertExists: AlertExists,
                          AlertObject: AlertObject,
                        });
                        this.props.dispatch({
                          type: 'UPDATE_MEMBERS',
                          Chat: item.id,
                          MemberList: memberInfo,
                        });
                        this.props.dispatch({
                          type: 'ENTER_CHAT',
                          Chat: item.id,
                          Username: this.props.userState.Nickname,
                          Props: AdditionalProps,
                        });
                        navigate(item.temporal ? 'PublicAlert' : 'Chat', {
                          Chat: item.id,
                          clearCurrent: () => this.clearCurrentChat(),
                          createEmergency: (chat, messageObject, messageXML) =>
                            this.createEmergency(
                              chat,
                              messageObject,
                              messageXML,
                            ),
                        });
                      },
                    );
                  } else if (item.additionalProps != null) {
                    AlertExists = true;
                    AlertObject = {
                      startedOn: new Date().getTime(),
                      createdBy: null,
                      text: item.additionalProps,
                      endedOn: null,
                      locationList: [],
                      latestCoordinates: null,
                      type: Chat.name.toString().startsWith('Alerta Seguridad')
                        ? 'Emergency'
                        : Chat.name.toString().startsWith('Alerta de Incendio')
                        ? 'Fire'
                        : Chat.name
                            .toString()
                            .startsWith('Actividad Sospechosa')
                        ? 'Suspicious'
                        : 'Medical',
                    };
                    this.props.dispatch({
                      type: 'LOAD_MESSAGES',
                      Chat: item.id,
                      Messages: messages,
                      AlertExists: AlertExists,
                      AlertObject: AlertObject,
                    });
                    this.props.dispatch({
                      type: 'ENTER_CHAT',
                      Chat: item.id,
                      Username: this.props.userState.Nickname,
                    });
                    navigate('PublicAlert', {
                      Chat: item.id,
                      clearCurrent: () => this.clearCurrentChat(),
                    });
                  } else {
                    item.membersLoaded = true;
                    this.props.dispatch({
                      type: 'LOAD_MESSAGES',
                      Chat: item.id,
                      Messages: messages,
                      AlertExists: AlertExists,
                      AlertObject: AlertObject,
                    });
                    this.props.dispatch({
                      type: 'UPDATE_MEMBERS',
                      Chat: item.id,
                      MemberList: memberInfo,
                    });
                    this.props.dispatch({
                      type: 'ENTER_CHAT',
                      Chat: item.id,
                      Username: this.props.userState.Nickname,
                    });
                    navigate(item.temporal ? 'PublicAlert' : 'Chat', {
                      Chat: item.id,
                      clearCurrent: () => this.clearCurrentChat(),
                      createEmergency: (chat, messageObject, messageXML) =>
                        this.createEmergency(chat, messageObject, messageXML),
                    });
                  }
                },
              );
            } else {
              if (Chat.temporal) {
                tx.executeSql(
                  'SELECT * FROM messages m LEFT JOIN (SELECT message_id, COUNT(*) AS cnt FROM message_member GROUP BY message_id) AS L ON m.id = L.message_id WHERE conversation_id = ?',
                  [item.id],
                  (txt, results1) => {
                    let AlertObject;
                    let AlertExists = true;
                    let messages = [];
                    let attendantUpdates = [];
                    txt.executeSql(
                      'SELECT * FROM alert_message WHERE conversationid = ?',
                      [item.id],
                      (txt, resultsAlert) => {
                        if (resultsAlert.rows.length > 0) {
                          let rowAlert = resultsAlert.rows.item(
                            resultsAlert.rows.length - 1,
                          );

                          AlertObject = {
                            startedOn: new Date(rowAlert.started_on).getTime(),
                            createdBy: null,
                            text:
                              Chat.additionalProps != undefined
                                ? Chat.additionalProps.text
                                : Chat.emergencyInformation != undefined
                                ? Chat.emergencyInformation.text
                                : null,
                            endedOn:
                              rowAlert.ended_on != undefined
                                ? new Date(rowAlert.ended_on).getTime()
                                : null,
                            locationList:
                              Chat.additionalProps != undefined
                                ? Chat.additionalProps.location != undefined
                                  ? [Chat.additionalProps.location]
                                  : Chat.emergencyInformation != undefined &&
                                    Chat.emergencyInformation.locationList !=
                                      undefined
                                  ? Chat.emergencyInformation.locationList
                                  : []
                                : Chat.emergencyInformation != undefined &&
                                  Chat.emergencyInformation.locationList !=
                                    undefined
                                ? Chat.emergencyInformation.locationList
                                : [],
                            latestCoordinates:
                              Chat.additionalProps != undefined
                                ? Chat.additionalProps.location != undefined
                                  ? Chat.additionalProps.location
                                  : Chat.emergencyInformation != undefined &&
                                    Chat.emergencyInformation
                                      .latestCoordinates != undefined
                                  ? Chat.emergencyInformation.latestCoordinates
                                  : null
                                : Chat.emergencyInformation != undefined &&
                                  Chat.emergencyInformation.latestCoordinates !=
                                    undefined
                                ? Chat.emergencyInformation.latestCoordinates
                                : null,
                            type: this.getAlertType(rowAlert),
                            ended:
                              rowAlert.message_end_id != undefined
                                ? true
                                : false,
                          };

                          alertStart = true;
                          AdditionalProps =
                            rowAlert.additionalProps != undefined
                              ? JSON.parse(rowAlert.additionalProps)
                              : null;
                        }
                      },
                    );

                    if (results1.rows.length > 0) {
                      for (let k = 0; k < results1.rows.length; k++) {
                        try {
                          let messageRow = results1.rows.item(k);
                          let memberIndex = -1;
                          let memberData = null;
                          let alertStart = false;
                          let quoteAlias = null;

                          if (memberIndex >= 0) {
                            memberData = memberInfo[memberIndex];
                          }

                          let message = {
                            id: messageRow.id,
                            chat_id: item.id,
                            timestamp: new Date(messageRow.sent_at),
                            text: messageRow.text,
                            time: new Date(messageRow.sent_at).getTime(),
                            username: messageRow.sent_by,
                            state: 'Sent',
                            read_by: [],
                            sent_by: messageRow.sent_by,
                            isAlert: alertStart,
                            read_by_count:
                              messageRow.cnt != null ? messageRow.cnt : 0,
                            pending: messageRow.sent === 1 ? false : true,
                            url: messageRow.url,
                            isVideo: messageRow.isVideo,
                            isMedia: messageRow.isMedia,
                            isImage: messageRow.isImage,
                            isFile: messageRow.isFile,
                            fileName: messageRow.filename,
                            thumbnail: messageRow.thumbnail,
                            isQuote: messageRow.isQuoted,
                            quoted_id: messageRow.quoted_msg_id,
                            quoted_msg: messageRow.quoted_text,
                            quote_by: quoteAlias,
                            isEdited: messageRow.isEdited,
                            isSystemMsg: messageRow.isSystemMsg,
                            hidden: messageRow.isHidden,
                          };

                          if (messageRow.isHidden == 1) {
                            attendantUpdates.push(message);
                          } else {
                            messages.push(message);
                          }
                        } catch (err) {
                          console.log(err);
                          continue;
                        }
                      }
                    }

                    let lastAttendantLocation = null;
                    if (attendantUpdates.length > 0) {
                      //take hidden messages, if containing coordinate format, we parse coordinates, and take the last one for emergency attendant
                      attendantUpdates.sort((a, b) => {
                        return b.time - a.time;
                      });
                      for (let k = 0; k < attendantUpdates.length; k++) {
                        try {
                          let StringCoords =
                            attendantUpdates[k].text.split(',');
                          if (StringCoords.length == 2) {
                            lastAttendantLocation = {
                              latitude: parseFloat(StringCoords[0]),
                              longitude: parseFloat(StringCoords[1]),
                            };
                            break;
                          }
                        } catch (parseError) {
                          continue;
                        }
                      }
                    }

                    if (AlertExists) {
                      tx.executeSql(
                        'SELECT * FROM alert_coords WHERE alertid = ? ORDER BY date DESC',
                        [item.id],
                        (txt2, coord_list) => {
                          if (coord_list.rows.length > 0) {
                            AlertObject.latestCoordinates =
                              coord_list.rows.item(0);
                            if (lastAttendantLocation != null) {
                              AlertObject.emergencyAttendant = {
                                latestCoordinates: lastAttendantLocation,
                              };
                            }
                            for (let m = 0; m < coord_list.rows.length; m++) {
                              let row = coord_list.rows.item(m);
                              row.latitude = parseFloat(row.latitude);
                              row.longitude = parseFloat(row.longitude);

                              AlertObject.locationList.push(row);
                            }
                          }

                          //item.membersLoaded = true;
                          this.props.dispatch({
                            type: 'LOAD_MESSAGES',
                            Chat: item.id,
                            Messages: messages,
                            AlertExists: AlertExists,
                            AlertObject: AlertObject,
                          });
                          this.props.dispatch({
                            type: 'ENTER_CHAT',
                            Chat: item.id,
                            Username: this.props.userState.Nickname,
                          });
                          navigate('PublicAlert', {
                            Chat: item.id,
                            clearCurrent: () => this.clearCurrentChat(),
                          });
                        },
                      );
                    } else if (item.additionalProps != null) {
                      AlertExists = true;
                      AlertObject = {
                        startedOn: new Date().getTime(),
                        createdBy: null,
                        text: item.additionalProps,
                        endedOn: null,
                        locationList: [],
                        latestCoordinates: null,
                        emergencyAttendant:
                          lastAttendantLocation != undefined
                            ? {latestCoordinates: lastAttendantLocation}
                            : null,
                        type: Chat.name
                          .toString()
                          .startsWith('Alerta Seguridad')
                          ? 'Emergency'
                          : Chat.name
                              .toString()
                              .startsWith('Alerta de Incendio')
                          ? 'Fire'
                          : Chat.name
                              .toString()
                              .startsWith('Actividad Sospechosa')
                          ? 'Suspicious'
                          : 'Medical',
                      };

                      this.props.dispatch({
                        type: 'LOAD_MESSAGES',
                        Chat: item.id,
                        Messages: messages,
                        AlertExists: AlertExists,
                        AlertObject: AlertObject,
                      });
                      this.props.dispatch({
                        type: 'ENTER_CHAT',
                        Chat: item.id,
                        Username: this.props.userState.Nickname,
                      });
                      navigate('PublicAlert', {
                        Chat: item.id,
                        clearCurrent: () => this.clearCurrentChat(),
                      });
                    } else {
                      this.props.dispatch({
                        type: 'ENTER_CHAT',
                        Chat: item.id,
                        Username: this.props.userState.Nickname,
                      });
                      navigate('PublicAlert', {
                        Chat: item.id,
                        clearCurrent: () => this.clearCurrentChat(),
                      });
                    }
                  },
                );
              } else {
                this.props.dispatch({
                  type: 'ENTER_CHAT',
                  Chat: item.id,
                  Username: this.props.userState.Nickname,
                });
                navigate(item.temporal ? 'PublicAlert' : 'Chat', {
                  Chat: item.id,
                  clearCurrent: () => this.clearCurrentChat(),
                  createEmergency: (chat, messageObject, messageXML) =>
                    this.createEmergency(chat, messageObject, messageXML),
                });
              }
            }
          },
        );
      });
    } catch (error) {
      alert(error);
    }
  }

  createEmergency(chat, messageBody, messageXML) {
    let messageXMPP = xml(
      'presence',
      {
        from: this.props.clientState.From,
        id: id(),
        to: chat.id + '/' + this.props.userState.Nickname,
      },
      xml('x', 'http://jabber.org/protocol/muc'),
      xml('status', {code: '200'}),
    );
    let responseXMPP = this.props.clientState.Client.send(messageXMPP);

    this.props.dispatch({
      type: 'PENDING_MSG',
      ChatId: chat.id,
      Message: messageBody,
    });

    this.props.clientState.DB.transaction(tx => {
      tx.executeSql(
        'INSERT INTO messages (id, text, sent_at, read_by_all, sent_by, conversation_id, sent, isMedia, isImage, isVideo, isFile, url, filename) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
          messageBody.id,
          messageBody.text,
          new Date().toISOString(),
          'false',
          messageBody.username,
          messageBody.chat_id,
          false,
          messageBody.isMedia,
          messageBody.isImage,
          messageBody.isVideo,
          messageBody.isFile,
          messageBody.url,
          messageBody.fileName,
        ],
        (txt, results1) => {
          if (results1.rowsAffected > 0) {
            setTimeout(
              async function () {
                this.setState({showCountdown: false});
              }.bind(this),
              250,
            );
            setTimeout(
              async function () {
                let response = this.props.clientState.Client.send(messageXML);
              }.bind(this),
              500,
            );
            setTimeout(
              async function () {
                this.loadChatroom(chat);
              }.bind(this),
              1000,
            );
          }
        },
      );
    });
  }

  searchChannel(text) {
    if (
      this.props.chatState.Chats != undefined &&
      this.props.chatState.Chats.length > 0
    ) {
      let chatsAlt = JSON.stringify(this.props.chatState.Chats);

      chatsAlt = JSON.parse(chatsAlt);

      var re = new RegExp(text, 'i');

      chatsAlt = chatsAlt.filter(function (e, i, a) {
        if (e.name != undefined) {
          return e.name.search(re) != -1;
        }
      });

      if (text != null && text.length > 0) {
        this.setState({
          searchList: chatsAlt,
          searching: true,
          searchText: text,
        });
      } else {
        this.setState({searching: false, searchText: ''});
      }
    } else {
      this.setState({searchText: text});
    }
  }

  acceptTerms() {
    this.setState({accepting: true});

    EndpointRequests.AcceptTerms(
      function (responseData) {
        if (
          responseData.message != undefined &&
          responseData.message === 'Ok'
        ) {
          this.setState({showTerms: false, accepting: false, loadedData: true});
          this.props.dispatch({type: 'ACCEPT_TERMS'});
          this.props.chatState.LoadedData();
          this.showWelcome();
        }
      }.bind(this),
    );
  }

  showWelcome() {
    if (this.props.userState.WelcomeScreen) {
      setTimeout(
        function () {
          this.setState({showWelcome: true});
        }.bind(this),
        1000,
      );
    }
  }

  keyExtractor = (item, index) => index.toString();
  _renderConvo = ({item}) => {
    if (item.hidden) {
      return null;
    }
    return (
      <Convo
        dialog={item}
        loadChatroom={item => this.loadChatroom(item)}
        navigation={this.props.navigation}
        clearCurrent={() => this.clearCurrentChat()}
      />
    );
  };

  getMainComponent() {
    if (this.props.userState.UserData.verifiedIdentity == 0) {
      return (
        <View
          style={{
            height: height - headerHeight,
            width: width,
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}>
          <Icon
            type="feather"
            name="alert-circle"
            color="red"
            size={100}
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
            }}>
            {
              'Aun no inicias el proceso de verificación, el cual es requerido para acceder a las funciones de la aplicación.'
            }
          </Text>
        </View>
      );
    } else if (this.props.userState.UserData.verifiedIdentity == 1) {
      return (
        <View
          style={{
            height: height - headerHeight,
            width: width,
            justifyContent: 'center',
            borderBottomColor: 'transparent',
          }}>
          <Icon
            type="feather"
            name="clock"
            color="blue"
            size={100}
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
            }}>
            {
              'Estamos verificando tu identidad, recibiras un email pronto con el resultado.'
            }
          </Text>
        </View>
      );
    }
  }

  openCurrentAlert() {
    let {CurrentEmergency} = this.state;

    if (this.props.chatState.CurrentEmergency != undefined) {
      this.loadChatroom(
        {id: this.props.chatState.CurrentEmergency, temporal: true},
        true,
      );
    } else if (CurrentEmergency != undefined) {
      this.loadChatroom({id: CurrentEmergency, temporal: true}, true);
    }
  }

  getOfficialComponent() {
    //message to show official users is pending, this is just a placeholder
    if (this.props.userState.UserData.isOnDuty) {
      return (
        <View
          style={{
            height: 30,
            backgroundColor: '#859D7B',
            width: width,
            justifyContent: 'center',
          }}>
          <Text
            style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
            Usuario oficial en servicio
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            height: 30,
            backgroundColor: '#c6c6c6',
            width: width,
            justifyContent: 'center',
          }}>
          <Text
            style={{textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
            Usuario oficial fuera de servicio
          </Text>
        </View>
      );
    }
  }

  getCreateChannelButton() {
    if (this.props.userState.UserData.verifiedIdentity == 2) {
      return (
        <ActionButton
          fixNativeFeedbackRadius={true}
          useNativeFeedback={true}
          disabled={this.props.userState.UserData.verifiedIdentity != 2}
          testID="ChatOptions"
          renderIcon={() => (
            <FeatherIcon
              name={'plus'}
              size={35}
              color="#7d9d78"
              style={{textAlign: 'center', alignSelf: 'center', top: 0}}
            />
          )}
          buttonColor={
            this.props.userState.UserData.verifiedIdentity != 2
              ? 'lightgray'
              : '#f5f5f5'
          }
          allowFontScaling={false}>
          <ActionButton.Item
            testID="CreateChat"
            buttonColor="#f0ad43"
            title="Nuevo canal grupal"
            onPress={() => this.gotoCreateGroup('Group')}>
            <Image
              source={CREATE_GROUP}
              resizeMode={'contain'}
              style={{height: 70, width: 70}}
            />
          </ActionButton.Item>
          <ActionButton.Item
            buttonColor="#1DA1F2"
            title="Nuevo canal individual"
            onPress={() => this.gotoCreateGroup('1v1')}>
            <Image
              source={CREATE_INDIVIDUAL}
              resizeMode={'contain'}
              style={{height: 70, width: 70}}
            />
          </ActionButton.Item>
        </ActionButton>
      );
    } else {
      return null;
    }
  }

  getOfficialActionButtons() {
    let officialChats = [];
    if (this.props.clientState.LoginLoading) {
      return <View />;
    }
    if (
      this.props.chatState.SectionList != undefined &&
      this.props.chatState.SectionList.find(
        n => n.title === 'Detonación remota',
      )
    ) {
      let list = this.props.chatState.SectionList.find(
        n => n.title === 'Detonación remota',
      );
      if (list != undefined && list.data.length > 1) {
        for (let i = 0; i < list.data.length; i++) {
          officialChats.push(
            <ActionButton.Item
              key={list.data[i].id}
              buttonColor="green"
              title={list.data[i].name}
              onPress={() => this.showLocation('Emergency', list.data[i].id)}>
              <Image
                source={OFFICIAL_CHANNEL}
                resizeMode={'contain'}
                style={{height: 40, width: 40}}
              />
            </ActionButton.Item>,
          );
        }
        return officialChats;
      }
      return <View />;
    } else {
      return <View />;
    }
  }

  getAvailableAlertOptions() {
    let {emergencyTypeSelected} = this.state;
    let inCoverage = this.props.userState.CurrentPoint.length > 0;
    let availableAlertOptions = [];
    if (this.props.clientState.LoginLoading) {
      return <View />;
    }
    if (emergencyTypeSelected != 0) {
      availableAlertOptions.push(
        <ActionButton.Item
          key={'personalBtn'}
          buttonColor="white"
          title={'Alerta seguridad'}
          onPress={() => this.buttonAction('Personal', inCoverage)}>
          <Image
            source={
              this.props.clientState.InternetLost
                ? BARRA_PERSONAL_DISABLED
                : BARRA_PERSONAL
            }
            resizeMode={'cover'}
            style={{height: 45, width: 45}}
          />
        </ActionButton.Item>,
      );
    }
    if (inCoverage && emergencyTypeSelected != 1) {
      availableAlertOptions.push(
        <ActionButton.Item
          key={'suspiciousBtn'}
          buttonColor="white"
          title={'Actividad sospechosa'}
          onPress={() => this.buttonAction('Suspicious', inCoverage)}>
          <Image
            source={
              inCoverage
                ? this.props.clientState.InternetLost
                  ? BARRA_SOSPECHA_DISABLED
                  : BARRA_SOSPECHA
                : BARRA_SOSPECHA_DISABLED
            }
            resizeMode={'cover'}
            style={{height: 45, width: 45}}
          />
        </ActionButton.Item>,
      );
    }
    if (
      emergencyTypeSelected != 2 &&
      this.props.chatState.SectionList != undefined &&
      this.props.chatState.SectionList.find(
        n => n.title === 'Detonación remota',
      )
    ) {
      availableAlertOptions.push(
        <ActionButton.Item
          key={'vecinosBtn'}
          buttonColor="white"
          title={'Alerta remota'}
          onPress={() => this.buttonAction('Vecinal', inCoverage)}>
          <Image
            source={
              this.props.userState.UserData.verifiedIdentity != 2 ||
              this.props.chatState.Chats == undefined ||
              !this.props.chatState.Chats.some(e => e.chatType === 2) ||
              this.props.clientState.InternetLost
                ? BARRA_VECINAL_DISABLED
                : BARRA_VECINAL
            }
            resizeMode={'cover'}
            style={{height: 45, width: 45}}
          />
        </ActionButton.Item>,
      );
    }
    if (
      this.props.userState.UserData.gender == 2 &&
      emergencyTypeSelected != 3
    ) {
      availableAlertOptions.push(
        <ActionButton.Item
          key={'feministBtn'}
          buttonColor="purple"
          title={'Alerta mujeres'}
          onPress={() => this.buttonAction('Feminist', inCoverage)}>
          <Image
            source={
              this.props.clientState.InternetLost
                ? BARRA_MUJERES_DISABLED
                : this.props.userState.UserData != undefined &&
                  this.props.userState.UserData.gender == 2
                ? BARRA_MUJERES
                : BARRA_MUJERES_DISABLED
            }
            resizeMode={'cover'}
            style={{height: 45, width: 45}}
          />
        </ActionButton.Item>,
      );
    }
    return availableAlertOptions;
  }

  channelAlert() {
    if (
      this.props.chatState.SectionList != undefined &&
      this.props.chatState.SectionList.find(
        n => n.title === 'Detonación remota',
      )
    ) {
      let list = this.props.chatState.SectionList.find(
        n => n.title === 'Detonación remota',
      );
      if (list != undefined && list.data.length == 1) {
        this.showLocation('Emergency', list.data[0].id);
        this.refs.officialChannelBtn.reset();
      }
      return false;
    } else {
      return false;
    }
  }

  buttonAction(type, inCoverage) {
    if (this.props.clientState.InternetLost) {
      this.setState({alertTypePressed: 'Internet', noAlertModal: true});
      return false;
    }

    if (type === 'Personal') {
      this.setState({emergencyTypeSelected: 0});
      //this.showLocation("Emergency");
    } else if (type === 'Feminist') {
      if (this.props.userState.UserData.gender != 2) {
        this.setState({alertTypePressed: 'Vecinal', noAlertModal: true});
        return false;
      } else {
        this.setState({emergencyTypeSelected: 3});
        //this.showLocation("Feminist");
      }
    } else if (type === 'Vecinal') {
      if (
        this.props.userState.UserData.verifiedIdentity != 2 ||
        this.props.chatState.Chats == undefined ||
        !this.props.chatState.Chats.some(e => e.chatType === 2)
      ) {
        this.setState({alertTypePressed: 'Vecinal', noAlertModal: true});
        return false;
      } else {
        this.setState({emergencyTypeSelected: 2});
        //this.channelAlert();
      }
    } else if (type === 'Suspicious') {
      if (inCoverage) {
        this.setState({emergencyTypeSelected: 1});
        //this.showLocation("Suspicious");
      } else {
        this.setState({alertTypePressed: 'Sospechosa', noAlertModal: true});
      }
    } else if (type === 'Medical') {
      this.setState({alertTypePressed: 'Medical', noAlertModal: true});
    } else if (type === 'TopLeftStatus') {
      this.setState({alertTypePressed: 'TopLeftStatus', noAlertModal: true});
    }
  }

  getAlertButtonType() {
    let {emergencyTypeSelected} = this.state;
    if (emergencyTypeSelected == 0) {
      if (this.props.clientState.InternetLost) {
        return (
          <Image
            source={BARRA_PERSONAL_DISABLED}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      } else {
        return (
          <Image
            source={BARRA_PERSONAL}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      }
    } else if (emergencyTypeSelected == 1) {
      if (this.props.clientState.InternetLost) {
        return (
          <Image
            source={BARRA_SOSPECHA_DISABLED}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      } else {
        return (
          <Image
            source={BARRA_SOSPECHA}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      }
    } else if (emergencyTypeSelected == 2) {
      if (this.props.clientState.InternetLost) {
        return (
          <Image
            source={BARRA_VECINAL_DISABLED}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      } else {
        return (
          <Image
            source={BARRA_VECINAL}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      }
    } else if (emergencyTypeSelected == 3) {
      if (this.props.clientState.InternetLost) {
        return (
          <Image
            source={BARRA_MUJERES_DISABLED}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      } else {
        return (
          <Image
            source={BARRA_MUJERES}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      }
    } else {
      if (this.props.clientState.InternetLost) {
        return (
          <Image
            source={BARRA_PERSONAL_DISABLED}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      } else {
        return (
          <Image
            source={BARRA_PERSONAL}
            resizeMode={'cover'}
            style={{width: 45, height: 45, borderRadius: 22.5}}
          />
        );
      }
    }
  }

  getFontSize(originalSize) {
    if (PixelRatio.get() < 1.5) {
      return (originalSize * 0.5) / PixelRatio.get();
    } else if (PixelRatio.get() >= 1.5 && PixelRatio.get() < 2.5) {
      return (originalSize * 1.5) / PixelRatio.get();
    } else if (PixelRatio.get() >= 2.5) {
      return (originalSize * 2.5) / PixelRatio.get();
    } else {
      return originalSize;
    }
  }

  checkComplete() {
    let {sliderValue, emergencyTypeSelected} = this.state;
    if (sliderValue === 100) {
      Vibration.cancel();
      if (this.props.chatState.OngoingAlert && emergencyTypeSelected != 1) {
        Alert.alert(
          'Atención',
          'Tienes una alerta activa, no puedes crear más de una alerta al mismo tiempo.',
          [
            {
              text: 'Ok',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
        this.setState({
          sliderValue: 0,
          arrowSize: new Animated.Value((width / 3) * 1.85),
          officialChannelId: null,
        });
        return false;
      }
      if (emergencyTypeSelected == 0) {
        this.setState({
          showCountdown: true,
          sliderValue: 0,
          arrowSize: new Animated.Value((width / 3) * 1.85),
          officialChannelId: null,
        });
      } else if (emergencyTypeSelected == 1) {
        this.showLocation('Suspicious');
        this.setState({
          sliderValue: 0,
          arrowSize: new Animated.Value((width / 3) * 1.85),
          officialChannelId: null,
        });
      } else if (emergencyTypeSelected == 2) {
        //get channel id
        if (
          this.props.chatState.SectionList != undefined &&
          this.props.chatState.SectionList.find(
            n => n.title === 'Detonación remota',
          )
        ) {
          let list = this.props.chatState.SectionList.find(
            n => n.title === 'Detonación remota',
          );
          if (list != undefined && list.data.length >= 1) {
            let firstOfficialChannel = list.data[0].id;
            this.setState({
              officialChannelId: firstOfficialChannel,
              showCountdown: true,
              sliderValue: 0,
              arrowSize: new Animated.Value((width / 3) * 1.85),
            });
          } else {
            Alert.alert(
              'Atención',
              'Hubo un error con el canal oficial.',
              [
                {
                  text: 'Ok',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ],
              {cancelable: false},
            );
            this.setState({
              sliderValue: 0,
              arrowSize: new Animated.Value((width / 3) * 1.85),
            });
          }
        }
      } else if (emergencyTypeSelected == 3) {
        this.setState({
          showCountdown: true,
          sliderValue: 0,
          arrowSize: new Animated.Value((width / 3) * 1.85),
          officialChannelId: null,
        });
      } else {
        console.log('error');
      }
    } else {
      Vibration.cancel();
      this.setState({
        sliderValue: 0,
        arrowSize: new Animated.Value((width / 3) * 1.85),
      });
    }
  }

  sliderMove(value) {
    let {arrowSize} = this.state;
    Animated.timing(arrowSize, {
      toValue: (width / 3) * 1.85 - value * 2.5,
      duration: 0,
      useNativeDriver: false,
    }).start();
    this.setState({sliderValue: value});
  }

  render() {
    const {
      Loading,
      searchList,
      searching,
      Ready,
      LoadingChats,
      emergencyTypeSelected,
      sliderValue,
      arrowSize,
    } = this.state;
    let inCoverage = this.props.userState.CurrentPoint.length > 0;

    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="white" barStyle={'dark-content'} />
        <View style={{alignItems: 'center'}}>
          {this.props.userState.UserData.verifiedIdentity == 2 ? (
            <View style={{height: 50, width: width}}>
              <View
                style={{
                  flexDirection: 'row',
                  height: 50,
                  width: width,
                  paddingLeft: 10,
                  paddingRight: 10,
                  backgroundColor: 'white',
                  justifyContent: 'space-around',
                }}>
                <View style={{height: 50, width: 70}}></View>
                <View
                  style={{
                    height: 50,
                    width: width - 70,
                    justifyContent: 'center',
                  }}>
                  {sliderValue == 0 ? (
                    <Text
                      allowFontScaling={false}
                      style={{
                        letterSpacing: 1.15,
                        fontWeight: '100',
                        color: 'white',
                        backgroundColor: this.props.clientState.InternetLost
                          ? 'gray'
                          : emergencyTypeSelected == 0
                          ? '#e30613'
                          : emergencyTypeSelected == 1
                          ? '#fcaf00'
                          : emergencyTypeSelected == 2
                          ? '#7d9d78'
                          : '#635592',
                        fontSize:
                          emergencyTypeSelected == 0
                            ? this.getFontSize(33)
                            : emergencyTypeSelected == 1
                            ? this.getFontSize(30)
                            : this.getFontSize(25),
                        fontWeight: '700',
                        textAlign: 'center',
                        position: 'absolute',
                        alignSelf: 'center',
                        zIndex: 100,
                      }}>
                      {emergencyTypeSelected == 0
                        ? 'SOS'
                        : emergencyTypeSelected == 1
                        ? 'REPORTE'
                        : emergencyTypeSelected == 2
                        ? 'ALERTA REMOTA'
                        : 'ALERTA MUJERES'}
                    </Text>
                  ) : null}
                  <Animated.Image
                    source={FLECHA_SLIDER}
                    style={{
                      height: 50,
                      width: arrowSize,
                      right: 20,
                      alignSelf: 'flex-end',
                      zIndex: 99,
                      position: 'absolute',
                    }}
                    resizeMode="contain"
                  />
                  <View
                    style={{
                      backgroundColor: this.props.clientState.InternetLost
                        ? 'gray'
                        : emergencyTypeSelected == 0
                        ? '#e30613'
                        : emergencyTypeSelected == 1
                        ? '#fcaf00'
                        : emergencyTypeSelected == 2
                        ? '#7d9d78'
                        : '#635592',
                      height: 45,
                      width: 60,
                      right: 5,
                      borderRadius: 40,
                      position: 'absolute',
                      alignSelf: 'flex-end',
                    }}
                  />
                  <Slider
                    style={{
                      alignSelf: 'center',
                      backgroundColor: this.props.clientState.InternetLost
                        ? 'gray'
                        : emergencyTypeSelected == 0
                        ? '#e30613'
                        : emergencyTypeSelected == 1
                        ? '#fcaf00'
                        : emergencyTypeSelected == 2
                        ? '#7d9d78'
                        : '#635592',
                      width: width * 0.75,
                      height: 45,
                      borderRadius: 25,
                    }}
                    minimumValue={0}
                    value={this.state.sliderValue}
                    step={1}
                    disabled={this.props.clientState.InternetLost}
                    onSlidingComplete={() => this.checkComplete()}
                    maximumValue={100}
                    onValueChange={value => this.sliderMove(value)}
                    onSlidingStart={() => {
                      if (!this.props.clientState.InternetLost) {
                        if (Platform.OS === 'ios') {
                          Vibration.vibrate([0, 100, 100, 100, 100, 100], true);
                        } else {
                          Vibration.vibrate([100, 500], true);
                        }
                      }
                    }}
                    thumbTintColor={'white'}
                    thumbTouchSize={{width: 125, height: 125}}
                    thumbStyle={{
                      width: 35,
                      height: 35,
                      borderRadius: 50,
                      marginLeft: 3,
                    }}
                    thumbProps={{
                      Component: Animated.Image,
                      source: FLECHA_THUMB_INDIVIDUAL,
                    }}
                    trackStyle={{height: 0, width: 0}}
                  />
                </View>
              </View>
            </View>
          ) : null}
          {this.props.clientState.InternetLost ? (
            <View
              style={{
                height: 30,
                marginTop: 10,
                width: '100%',
                backgroundColor: '#cc4e4e',
                justifyContent: 'center',
                alignSelf: 'center',
                flexDirection: 'row',
              }}>
              <FeatherIcon
                name="alert-circle"
                color="white"
                size={16}
                style={{alignSelf: 'center', marginRight: 5, top: 1}}
              />
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 13,
                  alignSelf: 'center',
                }}>
                Sin conexión a internet
              </Text>
            </View>
          ) : null}
        </View>
        {this.props.userState.UserData.verifiedIdentity == 2 ? (
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              marginTop: this.props.clientState.InternetLost ? 0 : 10,
              borderTopColor: 'lightgray',
              borderTopWidth: 1,
              height: iPhoneX
                ? height - (160 + headerHeight)
                : height - (170 + headerHeight),
            }}>
            <Input
              containerStyle={{
                alignSelf: 'center',
                height: 40,
                width: width - 30,
                marginBottom: 10,
                marginTop: 15,
                backgroundColor: '#EEEEEE',
                borderStyle: 'solid',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 15,
              }}
              value={this.state.searchText}
              onChangeText={text => this.searchChannel(text)}
              placeholder="Buscar"
              inputContainerStyle={{
                borderColor: 'transparent',
                marginBottom: 0,
                top: -5,
              }}
              leftIcon={<Icon color="grey" name="search" size={24} />}
            />
            <FlatList
              style={{backgroundColor: 'white', flex: 1}}
              onRefresh={() => this.loadChats(true)}
              refreshing={Loading}
              data={
                searching
                  ? searchList.length > 0
                    ? searchList
                    : []
                  : this.props.chatState.Chats.sort((a, b) => {
                      return b.updated_date - a.updated_date;
                    })
              }
              sections={
                searching
                  ? searchList.length > 0
                    ? [{title: 'Busqueda', data: searchList}]
                    : []
                  : this.props.chatState.SectionList
              }
              keyExtractor={this.keyExtractor}
              renderSectionHeader={({section}) => (
                <View style={styles.containerTitle}>
                  <Text style={styles.textTitle}>{section.title}</Text>
                </View>
              )}
              ListEmptyComponent={() =>
                searching ? (
                  <View
                    style={{
                      height: iPhoneX ? height - 375 : height - 325,
                      width: width,
                      justifyContent: 'center',
                      borderBottomColor: 'transparent',
                    }}>
                    <Ionicon
                      name="ios-chatbubbles"
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
                      {'No se encontro ningun canal con ese nombre.'}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      height: iPhoneX ? height - 375 : height - 325,
                      width: width,
                      justifyContent: 'center',
                      borderBottomColor: 'transparent',
                    }}>
                    <Ionicon
                      name="ios-chatbubbles"
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
                      {'Crea un nuevo canal'}
                    </Text>
                  </View>
                )
              }
              renderItem={item => this._renderConvo(item)}
            />
          </View>
        ) : (
          this.getMainComponent()
        )}
        {this.getCreateChannelButton()}
        <PlansModal
          plansModal={this.state.PlansModal}
          closeModal={() => this.setState({PlansModal: false})}
        />
        <TermsAndConditions
          showTerms={this.state.showTerms}
          accepting={this.state.accepting}
          acceptTerms={() => this.acceptTerms()}
        />

        {this.props.userState.UserData.verifiedIdentity == 2 ? (
          <ActionButton
            ref="alertButtonOptions"
            degrees={0}
            shadowStyle={[
              {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.3,
                shadowRadius: 1.65,
                elevation: 5,
              },
            ]}
            useNativeDriver={true}
            position="left"
            hideShadow={false}
            style={{left: -12, top: -25}}
            verticalOrientation={'down'}
            size={40}
            renderIcon={() => this.getAlertButtonType()}
            buttonColor={
              this.props.userState.UserData.verifiedIdentity != 2 ||
              this.props.chatState.Chats == undefined
                ? 'lightgray'
                : 'transparent'
            }
            allowFontScaling={false}>
            {this.getAvailableAlertOptions()}
          </ActionButton>
        ) : null}
        <DialogModalAlert
          isOfficial={
            this.props.userState.UserData != undefined &&
            this.props.userState.UserData.isOfficial
          }
          messageType={this.state.alertTypePressed}
          noAlertModal={this.state.noAlertModal}
          closeModal={() => this.setState({noAlertModal: false})}
        />
        <WelcomePopup
          showWelcome={this.state.showWelcome}
          closeWelcome={() => this.setState({showWelcome: false})}
        />
        <EmergencyCountdown
          dispatch={this.props.dispatch}
          createEmergency={(chat, messageObject, messageXML) =>
            this.createEmergency(chat, messageObject, messageXML)
          }
          officialChannelId={this.state.officialChannelId}
          chatState={this.props.chatState}
          clientState={this.props.clientState}
          userState={this.props.userState}
          emergencyTypeSelected={this.state.emergencyTypeSelected}
          showCountdown={this.state.showCountdown}
          closeModal={() =>
            this.setState({showCountdown: false, officialChannelId: null})
          }
          cancelCountdown={() =>
            this.setState({showCountdown: false, officialChannelId: null})
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 0,
    backgroundColor: 'white',
  },
  containerTitle: {
    flex: 1,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
  },
  textTitle: {
    fontWeight: 'bold',
    color: 'gray',
    fontSize: 17,
    marginLeft: 15,
  },
});

let ConvosContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(Convos);
export default ConvosContainer;
