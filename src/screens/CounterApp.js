/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button
} from 'react-native';
import {connect} from 'react-redux';
import { useNavigation } from '@react-navigation/native';

export class CounterApp extends React.Component {

  constructor(props) {
    super(props);
  }
  
  pressHandler = () => {
    const { navigation } = this.props
    navigation.navigate('ReviewDetails');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row', width: 200, justifyContent: "space-around"}}>
          <TouchableOpacity onPress={() => this.props.increaseCounter()}>
            <Text style={{fontSize: 20}}>Increase</Text>
          </TouchableOpacity>
          <Text style={{fontSize: 20}}>{this.props.counter}</Text>
          <TouchableOpacity onPress={() => this.props.decreaseCounter()}>
            <Text style={{fontSize: 20}}>Decrease</Text>
          </TouchableOpacity>
        </View>
        <Button title='go to review dets' onPress={() => this.pressHandler()} />
      </View>
    );
  }
}

function mapStateToProps(state){
    return {
        counter: state.counter
    }
}

function mapDispatchToProps(dispatch) {
    return {
        increaseCounter: () => dispatch({type:'INCREASE_COUNTER'}),
        decreaseCounter: () => dispatch({type:'DECREASE_COUNTER'}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CounterApp)

const navigation = this.props;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});