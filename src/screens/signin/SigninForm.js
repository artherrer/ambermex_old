import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import Indicator from '../cmps/indicator';
import {connect} from 'react-redux';
import {Input} from 'react-native-elements';
var {height, width} = Dimensions.get('window');
import {Header} from 'react-navigation-stack';
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;

class AuthForm extends Component {
  state = {
    name: '',
    password: '',
    Loading: false,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'UPDATE_STATUS',
      Status: 'OFFLINE',
      Disconnected: false,
    });
  }

  validateEmail(email) {
    var re = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/;
    return re.test(String(email));
  }

  login = () => {
    const {navigation} = this.props;
    const {name, password} = this.state;

    if (name == undefined || name.length < 3 || password.length < 3) {
      Alert.alert(
        'Atención',
        'Por favor llene la forma con información valida',
        [
          {
            text: 'Ok',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else if (!this.validateEmail(name)) {
      Alert.alert(
        'Atención',
        'Por favor, ingrese una dirección de correo electronico valida y en letras minusculas.',
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
      this.props.clientState.Login(
        name,
        password,
        this.props.userState.DeviceData,
        response => {
          if (response.status === 'not_verified') {
            this.props.navigation.navigate('VerifyCode', {
              Creds: response.Creds,
              Resend: true,
            });
          } else if (response.status === 'verify_identity') {
            this.props.navigation.navigate('Profile', {Creds: response.Creds});
          } else if (response.status === 'profile') {
            this.props.dispatch({
              type: 'ADD_USERNAME',
              Password: response.Creds.Password,
              Username: response.Creds.Username,
            });
            this.props.navigation.navigate('Profile', {Creds: response.Creds});
          } else if (response.status === 'challenge_device') {
            this.props.navigation.navigate('ChallengeStart');
          }
        },
      );
    }
  };

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

  render() {
    const {name, password} = this.state;
    const {isLogin} = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Correo"
            placeholderTextColor="grey"
            returnKeyType="next"
            keyboardType="email-address"
            autoCapitalize={'none'}
            onSubmitEditing={() => this.emailInput.focus()}
            onChangeText={text => this.setState({name: text.trim()})}
            value={name}
            style={styles.input}
            autoFocus={false}
          />
          <Input
            ref={ref => {
              this.emailInput = ref;
            }}
            placeholder="Contraseña"
            placeholderTextColor="grey"
            secureTextEntry={true}
            autoCapitalize="none"
            returnKeyType="done"
            onChangeText={text => this.setState({password: text.trim()})}
            value={password}
            style={styles.input}
          />
        </View>
        <View style={styles.touchableContainer}>
          <Text
            onPress={() => this.props.navigation.navigate('RecoverPassword')}
            style={{fontSize: 16, alignSelf: 'center', color: '#2AA9E0'}}>
            ¿Olvidaste tu contraseña?
          </Text>
          <TouchableOpacity
            onPress={() => this.login()}
            disabled={this.props.clientState.LoginLoading}>
            <View
              style={[
                {
                  backgroundColor: this.props.clientState.LoginLoading
                    ? 'lightgray'
                    : '#7CB185',
                },
                styles.buttonContainer,
              ]}>
              {this.props.clientState.LoginLoading ? (
                <ActivityIndicator
                  size="large"
                  color="gray"
                  style={{alignSelf: 'center', textAlign: 'center'}}
                />
              ) : (
                <Text style={styles.buttonLabel}>Iniciar sesión</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12.5,
              color: 'grey',
              textAlign: 'center',
              justifyContent: 'center',
            }}>
            Al continuar aceptas los{' '}
            <Text onPress={() => this.gotoTerms()} style={{color: '#97B297'}}>
              Términos y Condiciones
            </Text>{' '}
            y la{' '}
            <Text onPress={() => this.gotoPrivacy()} style={{color: '#97B297'}}>
              Política de Privacidad.
            </Text>
          </Text>
        </View>
      </View>
    );
  }
}

let AuthFormContainer = connect(state => ({
  clientState: state.clientState,
  chatState: state.chatState,
  userState: state.userState,
}))(AuthForm);
export default AuthFormContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingRight: 50,
    paddingLeft: 50,
    paddingTop: 0,
    paddingBottom: iPhoneX ? 20 : 0,
  },
  input: {
    height: 50,
    color: 'black',
    borderRadius: 25,
    marginVertical: 5,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    fontSize: 18,
  },
  inputContainer: {
    height: (height - (height * 0.25 + headerHeight)) / 3,
    justifyContent: 'center',
  },
  touchableContainer: {
    height: ((height - (height * 0.25 + headerHeight)) / 3) * 2,
    justifyContent: 'space-around',
  },
  buttonContainer: {
    height: 50,
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
