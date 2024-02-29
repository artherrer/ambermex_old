import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import Dialog from "react-native-dialog";

class DialogAlert extends Component{
  constructor(props) {
    super(props)
    this.state = {
      causeMessage:null,
      visible:false,
      enableButton:false
    }
  }

  async componentDidUpdate(prevProps) {
    if(prevProps.visible != this.props.visible){
      this.setState({visible:this.props.visible})
    }
  }

  cancelAlert(){
    this.props.cancel();
    setTimeout(() => {
      this.setState({causeMessage:""});
    },200);
  }

  reasonInput(text){
    if(text != undefined && text.length >= 5){
      this.setState({causeMessage:text, enableButton:true});
    }
    else{
      this.setState({causeMessage:text, enableButton:false});
    }
  }

  render(){

    return (
    <View style={styles.container}>
      <Dialog.Container visible={this.state.visible}>
        <Dialog.Title>¿Quieres terminar la alerta?</Dialog.Title>
        <Dialog.Description>
          El canal de emergencia permanecerá activo por 24 horas.
        </Dialog.Description>
        <Dialog.Input
          value={this.state.causeMessage}
          placeholder={'Razón para terminar la alerta.'}
          onChangeText={(text) => this.reasonInput(text)}>
        </Dialog.Input>
        <Dialog.Button label="Cancelar" bold={true} onPress={() => this.cancelAlert()} />
        <Dialog.Button label="Terminar" disabled={!this.state.enableButton} color={this.state.enableButton ? "red" : "gray"} onPress={() => this.props.endAlert(this.state.causeMessage)} />
      </Dialog.Container>
    </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DialogAlert;
