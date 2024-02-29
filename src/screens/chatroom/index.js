import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'

//TODO: use PureComponent here. It collides with navigation so fix that
export class Chatroom extends Component {
    constructor(props) {
      super(props)
      this.state = {
        activIndicator: true,
        messageText: ''
      }
    }

    render() {
        const { history } = this.props
        const { messageText, activIndicator } = this.state
        return (
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: 'white' }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
          >
            <StatusBar barStyle="dark-content" />
            {activIndicator &&
              (
                <View style={styles.indicator}>
                  <ActivityIndicator size="large" color="#0000ff" />
                </View>
              )
            }
            <FlatList
              inverted
              data={history}
              keyExtractor={this._keyExtractor}
              renderItem={({ item }) => this._renderMessageItem(item)}
              onEndReachedThreshold={5}
              onEndReached={this.getMoreMessages}
            />
            <View style={styles.container}>
              <View style={styles.inputContainer}>
                <AutoGrowingTextInput
                  style={styles.textInput}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor="grey"
                  value={messageText}
                  onChangeText={this.onTypeMessage}
                  maxHeight={170}
                  minHeight={50}
                  enableScrollToCaret
                />
                <TouchableOpacity style={styles.attachment}>
                  <AttachmentIcon name="attachment" size={22} color="#8c8c8c" onPress={this.sendAttachment} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button}>
                <Icon name="send" size={32} color="blue" onPress={this.sendMessage} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )
      }

    //TODO: Implement mapStateToProps
}

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      borderTopWidth: 1,
      borderTopColor: 'lightgrey',
      paddingVertical: 12,
      paddingHorizontal: 35
    },
    activityIndicator: {
      position: 'absolute',
      alignSelf: 'center',
      paddingTop: 25,
    },
    textInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: '300',
      color: '#8c8c8c',
      borderRadius: 25,
      paddingHorizontal: 12,
      paddingTop: Platform.OS === 'ios' ? 14 : 10,
      paddingBottom: Platform.OS === 'ios' ? 14 : 10,
      paddingRight: 35,
      backgroundColor: 'whitesmoke',
    },
    button: {
      width: 40,
      height: 50,
      marginBottom: Platform.OS === 'ios' ? 15 : 0,
      marginLeft: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachment: {
      width: 40,
      height: 50,
      position: 'absolute',
      right: 5,
      bottom: 0,
      marginLeft: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indicator: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    inputContainer: {
      marginBottom: Platform.OS === 'ios' ? 15 : 0,
      flexDirection: 'row'
    }
  });