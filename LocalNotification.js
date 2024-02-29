import React, { Component } from 'react'

import { connect } from 'react-redux';
import NotificationPopup from 'react-native-push-notification-popup';
import NavigationService from './NavigationService';

class LocalNotification extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    this.props.dispatch({type:"SET_LOCAL_NOTIFICATION", ShowLocalNotification:(notification) => this.showLocalNotification(notification)})
  }

  showLocalNotification(notification){
    if(notification.conversationId != null){
      if(this.props.chatState.CurrentChat == null || this.props.chatState.CurrentChat.id == null || (this.props.chatState.CurrentChat.temporal != 1 && this.props.chatState.CurrentChat.id !== notification.conversationId)){
        if(this.popup != undefined){
          this.popup.show({
              onPress: () => {this.props.openNotification(notification)},
              appIconSource: require('./assets/image/icon.png'),
              appTitle: 'Botón Ambermex',
              timeText: 'Ahora',
              title: notification.title,
              body: notification.message,
              slideOutTime: 5000
          });
        }
      }
    }
    else if(notification != undefined && notification.title != undefined){
      if(this.popup != undefined){
        this.popup.show({
            appIconSource: require('./assets/image/icon.png'),
            appTitle: 'Botón Ambermex',
            timeText: 'Ahora',
            title: notification.title,
            body: notification.message,
            slideOutTime: 5000
        });
      }
    }
  }

  render() {
    return (
      <NotificationPopup ref={ref => this.popup = ref} />
    );
  }
}

let LocalNotificationContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(LocalNotification);
export default LocalNotificationContainer;
