/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button as ButtonAlt,
  Icon,
  Input
} from 'react-native-elements';

import { connect } from 'react-redux';
const EndpointRequests = require('../../util/requests.js');

var {height, width} = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class Password extends React.Component {
  static navigationOptions = ({navigation}) => ({
    title: 'Contraseña',
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => {
          navigation.pop();
        }}
        style={{
          paddingLeft: 10,
          height: 47,
          backgroundColor: 'transparent',
          width: 35,
          justifyContent: 'center',
        }}>
        <Icon type="ionicon" name="ios-arrow-back" color="#7D9D78" size={28} />
      </TouchableOpacity>
    ),
  });

  constructor(props) {
    super(props);

    let forgotPassword =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.ForgotPassword
        ? props.navigation.state.params.ForgotPassword
        : false;
    let userId =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.UserId
        ? props.navigation.state.params.UserId
        : false;
    let type =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.Type
        ? props.navigation.state.params.Type
        : 'Phone';
    let identifier =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.Identifier
        ? props.navigation.state.params.Identifier
        : null;
    let password =
      props.navigation.state.params != undefined &&
      props.navigation.state.params.Password
        ? props.navigation.state.params.Password
        : null;

    this.state = {
      Code: password,
      Password: null,
      NewPassword: null,
      ConfirmPassword: null,
      IsLoading: false,
      incorrect: true,
      forgotPassword: forgotPassword,
      userId: userId,
      type: type,
      identifier: identifier,
    };
  }

  validate() {
    let {NewPassword, ConfirmPassword, forgotPassword, Code} = this.state;

    if (forgotPassword) {
      if (
        ConfirmPassword == undefined ||
        NewPassword == undefined ||
        Code == undefined
      ) {
        this.setState({incorrect: true});
      } else if (
        ConfirmPassword.length >= 5 &&
        NewPassword.length >= 5 &&
        Code.length >= 6
      ) {
        this.setState({incorrect: false});
      } else {
        this.setState({incorrect: true});
      }
    } else {
      if (ConfirmPassword == undefined || NewPassword == undefined) {
        this.setState({incorrect: true});
      } else if (ConfirmPassword.length >= 5 && NewPassword.length >= 5) {
        this.setState({incorrect: false});
      } else {
        this.setState({incorrect: true});
      }
    }
  }

  resendCode() {
    let {type, identifier} = this.state;

    if (
      this.props.userState.UserData == undefined ||
      this.props.userState.UserData.jid == undefined
    ) {
      this.setState({isLoading: true});

      let model = {
        IdentificationString: identifier,
        Type: 0,
      };

      EndpointRequests.RecoverAccount(model, response => {
        if (response.message != undefined && response.message != 'Ok') {
          this.setState({isLoading: false});
          Alert.alert(
            'Error',
            'Hubo un error al buscar tu cuenta.',
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
          this.setState({isLoading: false});
          Alert.alert(
            'Éxito',
            'El mensaje se ha enviado correctamente a tu número de teléfono.',
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
      });
    } else {
      if (type === 'Phone') {
        this.setState({isLoading: true});

        let model = {
          IdentificationString: this.props.userState.UserData.phone,
          Type: 0,
        };

        EndpointRequests.RecoverAccount(model, response => {
          if (response.message != undefined && response.message != 'Ok') {
            this.setState({isLoading: false});
            Alert.alert(
              'Error',
              'Hubo un error al buscar tu cuenta.',
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
            this.setState({isLoading: false});
            Alert.alert(
              'Éxito',
              'El mensaje se ha enviado correctamente a tu número de teléfono.',
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
        });
      } else {
        this.setState({isLoading: true});

        let model = {
          IdentificationString: this.props.userState.UserData.email,
          Type: 1,
        };

        EndpointRequests.RecoverAccount(model, response => {
          if (response.message != undefined && response.message != 'Ok') {
            this.setState({isLoading: false});
            Alert.alert(
              'Error',
              'Hubo un error al buscar tu cuenta.',
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
            this.setState({isLoading: false});
            Alert.alert(
              'Éxito',
              'El mensaje se ha enviado correctamente a tu correo electronico.',
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
        });
      }
    }
  }

  updatePassword() {
    let {ConfirmPassword, NewPassword, Code, userId, forgotPassword} =
      this.state;

    if (ConfirmPassword != NewPassword) {
      Alert.alert(
        'Error',
        'Las contraseñas no concuerdan, por favor, ingresa la información correctamente.',
        [
          {
            text: 'Ok',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else if (forgotPassword) {
      this.setState({isLoading: true});

      let model = {
        Code: Code,
        NewPassword: NewPassword,
        UserId: userId,
        PasswordProvided: false,
      };

      EndpointRequests.ChangePassword(model, response => {
        if (response.message != undefined && response.message != 'Ok') {
          this.setState({isLoading: false});
          Alert.alert(
            'Error',
            response.message,
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
          Alert.alert(
            'Éxito',
            'Tu contraseña fue actualizada correctamente.',
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
          this.props.navigation.pop(2);
        }
      });
    } else {
      this.setState({isLoading: true});

      let model = {
        Code: Code,
        NewPassword: NewPassword,
        UserId: this.props.userState.UserData.userId,
        PasswordProvided: true,
      };

      EndpointRequests.ChangePassword(model, response => {
        if (response.message != undefined && response.message != 'Ok') {
          this.setState({isLoading: false});
          Alert.alert(
            'Error',
            'Tu contraseña es incorrecta, por favor, ingresa tu contraseña para poder actualizarla.',
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
          Alert.alert(
            'Éxito',
            'Tu contraseña fue actualizada correctamente.',
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
          this.props.navigation.pop(2);
        }
      });
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <ScrollView style={{flex: 1}}>
          {this.state.forgotPassword ? (
            <View style={{backgroundColor: 'white'}}>
              <View style={styles.containerTitle}>
                <Text style={styles.textTitle}> Restablecer contraseña</Text>
              </View>
              <Text
                style={{
                  backgroundColor: 'white',
                  textAlign: 'center',
                  fontSize: 15,
                  color: 'gray',
                  padding: 20,
                }}>
                Ingresa el código que recibiste.
              </Text>
              <Input
                value={this.state.Code}
                inputStyle={{letterSpacing: 5}}
                onChangeText={text => {
                  this.setState({Code: text});
                  setTimeout(
                    function () {
                      this.validate();
                    }.bind(this),
                    200,
                  );
                }}
                textAlign={'center'}
                keyboardType="numeric"
                containerStyle={{
                  width: width / 1.5,
                  alignSelf: 'center',
                  height: 40,
                  marginBottom: 10,
                  borderStyle: 'solid',
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'grey',
                  borderRadius: 25,
                }}
                placeholder="0 0 0 0 0 0"
              />
              <Text
                onPress={() => this.resendCode()}
                style={{
                  backgroundColor: 'white',
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#2AA9E0',
                  padding: 20,
                }}>
                Enviar código nuevo
              </Text>
            </View>
          ) : null}
          <Text
            style={{
              backgroundColor: 'white',
              textAlign: 'center',
              fontSize: 15,
              color: 'gray',
              padding: 20,
            }}>
            Elige una nueva contraseña de seis caracteres con una combinación de
            mayúsculas, minúsculas y números.
          </Text>
          <View style={{backgroundColor: 'white'}}>
            <View style={styles.containerTitle}>
              <Text style={styles.textTitle}> Nueva contraseña</Text>
            </View>
            <Input
              secureTextEntry={true}
              value={this.state.NewPassword}
              onChangeText={text => {
                this.setState({NewPassword: text});
                setTimeout(
                  function () {
                    this.validate();
                  }.bind(this),
                  200,
                );
              }}
              inputContainerStyle={{
                borderColor: 'transparent',
                marginBottom: 0,
              }}
              containerStyle={{height: 50, marginLeft: 10, marginTop: 10}}
              placeholder="Nueva contraseña"
            />
            <View style={{borderWidth: 0.75, borderColor: 'lightgray'}} />
            <Input
              secureTextEntry={true}
              value={this.state.ConfirmPassword}
              onChangeText={text => {
                this.setState({ConfirmPassword: text});
                setTimeout(
                  function () {
                    this.validate();
                  }.bind(this),
                  200,
                );
              }}
              inputContainerStyle={{
                borderColor: 'transparent',
                marginBottom: 0,
              }}
              containerStyle={{height: 50, marginLeft: 10, marginTop: 10}}
              placeholder="Repetir contraseña"
            />
          </View>
          <View style={{backgroundColor: '#F4F4F4', margin: 30}}>
            <ButtonAlt
              disabled={this.state.incorrect || this.state.isLoading}
              loading={this.state.isLoading}
              testID="SubmitUpdate"
              title="Guardar"
              borderRadius={5}
              titleStyle={{fontWeight: 'bold'}}
              buttonStyle={{
                width: 150,
                backgroundColor: '#7CB185',
                borderRadius: 25,
                alignSelf: 'center',
              }}
              backgroundColor="black"
              onPress={() => this.updatePassword()}
              style={{alignSelf: 'center'}}
            />
          </View>
          <View style={{backgroundColor: 'white', width: width}}></View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  containerTitle: {
    flex: 0,
    backgroundColor: '#F4F4F4',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTitle: {
    fontWeight: 'bold',
    color: 'grey',
    fontSize: 20,
  },
});
let PasswordContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(Password);
export default PasswordContainer;
