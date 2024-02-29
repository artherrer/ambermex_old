import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import ConvoTitles from './convoTitles'
import ConvoLastDate from './convoLastDate'
import ConvoUnreadCounter from './convoUnreadCounter'
import Avatar from '../../../cmps/avatar'
import { xml, jid, client } from '@xmpp/client/react-native';
import id from '@xmpp/id';
import { connect } from 'react-redux';
//https://media1.giphy.com/media/cLqxgg4nke0iu8UpzD/giphy.gif
import moment from "moment";

class Convo extends Component {
    getExpDate(date){
      if(date == undefined){
        return "";
      }

      return "Expira: A las " + new Date(date).toLocaleTimeString() + " el " + moment(new Date(date)).format("DD/MM/YYYY");
    }

    getEmergencyType(name){
      if(name == undefined){
        return "Emergency";
      }
      if(name.startsWith("Alerta Seguridad") && name.includes("-")){
        return "Vecinal";
      }
      else if(name.startsWith("Alerta Seguridad")){
        return "Emergency";
      }
      else if(name.startsWith("Alerta de Incendio")){
        return "Fire";
      }
      else if(name.startsWith("Alerta Médica")){
        return "Medical";
      }
      else if(name.startsWith("Actividad Sospechosa")){
        return "Suspicious";
      }
      else if(name.startsWith("Alerta Mujeres")){
        return "Feminist";
      }
      else{
        return "Emergency";
      }
    }

    render() {
      const { dialog } = this.props;
      return (
          <TouchableOpacity key={dialog.name} disabled={this.props.clientState.LoginLoading} onPress={() => this.props.loadChatroom(dialog)}>
            <View style={styles.container}>
              <Avatar
                photo={dialog.temporal || dialog.thumbnail}
                name={dialog.name.toString()}
                iconSize="large"
                resizeMode="cover"
                chatType={dialog.chatType}
                temporal={dialog.temporal}
                emergency={dialog.emergency}
                emergencyType={this.getEmergencyType(dialog.name.toString())}
              />
              <View style={styles.border} >
                <ConvoTitles
                  chatType={dialog.chatType}
                  temporal={dialog.temporal}
                  emergency={dialog.emergency}
                  emergencyEndDate={dialog.lastAlarmDate != undefined ? this.getExpDate(dialog.lastAlarmDate) : ""}
                  emergencyType={this.getEmergencyType(dialog.name.toString())}
                  name={dialog.name.toString()}
                  description={dialog.description}
                  message={dialog.emergency ? (dialog.description != null && dialog.description != "" ? dialog.description : "Alerta Activa") : dialog.last_message}
                />
                <View style={styles.infoContainer}>
                  <ConvoLastDate
                    lastDate={dialog.last_message_date_sent}
                    lastMessage={dialog.loading}
                    updatedDate={dialog.updated_date}
                  />
                  <ConvoUnreadCounter
                    unreadMessagesCount={dialog.loading ? 0 : dialog.unread_messages_count}
                  />
                </View>
              </View>
            </View>
          </TouchableOpacity >
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingHorizontal: 10
    },
    border: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 0.5,
      borderBottomColor: 'lightgrey'
    },
    infoContainer: {
      maxWidth: 75,
      height: 50,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingVertical: 10,
      marginLeft: 5
    }
  })

  let ConvoContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(Convo);
  export default ConvoContainer;
