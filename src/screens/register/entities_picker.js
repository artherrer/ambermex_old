import React, { Component } from 'react'
import { View, Text, FlatList, StyleSheet, Alert, Platform, Image, Vibration, Modal, Keyboard, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, StatusBar } from 'react-native'
import { ListItem,Icon,Slider, Button as ButtonAlt } from 'react-native-elements';
import { connect } from 'react-redux';
import { Header } from 'react-navigation-stack';

var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
let counter;
class EntitiesPicker extends Component{
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  async componentDidUpdate(prevProps) {

  }

  close(){
    this.props.closeEntityPicker();
  }

  chooseEntity(entity){
    this.props.selectEntity(entity);
  }

  _keyExtractor = (item, index) => index.toString();

  render(){
    let header = headerHeight;
    return (
      <View>
      <Modal
      animationType="fade"
      transparent={true}
      backdropPressToClose={false}
      backdrop={false}
      visible={this.props.showEntityList}
      onRequestClose={() => {
        this.close();
      }}>
      <View style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        flex: 1,
        flexDirection: 'column',
        width:width,
        alignSelf:'center',
        justifyContent: 'center',
        alignItems: 'center'}}>
        <View style={{width:(width/3)*2.25, height:iPhoneX ? height/2 : height/1.5, borderRadius:20,backgroundColor:'white',marginTop:25}}>
        <FlatList
        keyExtractor={this._keyExtractor}
        contentContainerStyle={{ borderRadius:20,marginTop:20, width:(width/3)*2.25, height:iPhoneX ? height/2 : height/1.5 }}
        data={this.props.entityList != undefined ? this.props.entityList : []}
        style={{ flex: 1, borderRadius:20}}
        ListEmptyComponent={() =>
            <View style={{width:(width/3)*2.25, height:iPhoneX ? height/2 : height/1.5, justifyContent:'center', borderBottomWidth:1, borderBottomColor:'transparent'}}>
            <Icon name="ios-contacts" type="ionicon" size={100} color="gray" style={{textAlign:'center'}} />
            <Text style={{textAlign:'center', padding:40, fontSize:14}}>Ingresa un codigo postal valido para cargar la lista de colonias.</Text>
            </View>
        }
        renderItem={({item,index}) => (
          <ListItem
          style={{width:(width/3)*2.25}}
          title={item.name}
          rightIcon={item.selected ? <Icon name="check-circle" type="material" color="#1DA1F2" /> : <Icon name="radio-button-unchecked" type="material"/>}
          onPress={() => {
            this.chooseEntity(item);
          }}
          />
        )}
        />
        </View>
          </View>
          </Modal>
            </View>
          )
        }
      }

export default EntitiesPicker;
