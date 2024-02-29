import React, { Component } from 'react'
import { View, Text, StyleSheet, Platform, Image, Modal, Button, Keyboard, Linking, Dimensions, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux';
var { height, width } = Dimensions.get('window');
var iPhoneX = height >= 812;
var headerHeight = iPhoneX ? 91 : 64;
import PhoneInput from 'react-native-phone-input'
import { formatNumber } from "libphonenumber-js";
import { ListItem, Icon, Input, FormLabel, Avatar, Button as ButtonAlt } from 'react-native-elements';

const countryList = [
  {
    "name": "Mexico (México)",
    "iso2": "mx",
    "dialCode": "52",
    "priority": 0,
    "areaCodes": null
  },
  {
    "name": "United States",
    "iso2": "us",
    "dialCode": "1",
    "priority": 0,
    "areaCodes": null
  }
];

class PhoneInputView extends Component{
  constructor(props) {
    super(props)

    let phone = props.phone != undefined ? props.phone : null;

    this.state = {
      fullPhone: phone != undefined ? phone : null,
      contactPhone:phone != undefined ? formatNumber(phone, "National").replace(/[^0-9]/g, '') : null,
      countryCode:phone != undefined ? (phone.startsWith("+1") ? "+1" : "+52") : "+52",
      country:phone != undefined ? (phone.startsWith("+1") ? "us" : "mx") : "mx"
    }
  }

  componentDidUpdate(prevProps){
    let { fullPhone } = this.state;

    if(this.props.phone != undefined && fullPhone != this.props.phone){
      this.setState({
        contactPhone:this.props.phone != undefined ? formatNumber(this.props.phone, "National").replace(/[^0-9]/g, '') : null,
        countryCode:this.props.phone != undefined ? (this.props.phone.startsWith("+1") ? "+1" : "+52") : "+52",
        country:this.props.phone != undefined ? (this.props.phone.startsWith("+1") ? "us" : "mx") : "mx",
        fullPhone:this.props.phone
      })
    }
    if(this.props.phone == undefined && fullPhone != undefined){
      this.setState({
        contactPhone:null,
        countryCode:"+52",
        country:"mx",
        fullPhone:null
      })
    }
  }

  evaluate(){
    const { contactPhone, country, countryCode } = this.state;

    if(contactPhone == undefined){
      return false;
    }

    if(contactPhone == undefined || contactPhone == null || contactPhone.length < 10){
      this.props.incorrect({incorrect:true, phone:contactPhone, fullPhone:countryCode + contactPhone, countryCode:countryCode});
    }
    else{
      this.props.incorrect({incorrect:false, phone:contactPhone, fullPhone:countryCode + contactPhone, countryCode:countryCode});
      return true;
    }
  }

  phoneInput(text){
    if(text == undefined || text == ""){
      return true;
    }
    let onlyDigits = /^[0-9]+$/;
    return onlyDigits.test(text);
  }

  render(){

    return (
      <View style={[{flexDirection:'row', height:100, top:-15}, this.props.style]}>
      <PhoneInput
      maxFontSizeMultiplier={1.25}
      ref={(ref) => { this.phone = ref; }}
      initialCountry={"mx"}
      countriesList={countryList}
      returnKey="next"
      value={this.state.countryCode}
      keyboardType="number-pad"
      disabled={this.props.editable != undefined ? !this.props.editable : false}
      flagStyle={this.props.flagStyle != undefined ? this.props.flagStyle : null}
      textStyle={{fontSize:16, color:'black',fontWeight: 'bold', backgroundColor:'transparent'}}
      onSelectCountry={(iso) => {
        this.setState({country:iso, countryCode:iso === "mx" ? "+52" : "+1"});
        setTimeout(function(){
        this.evaluate();
      }.bind(this),200)}}
      style={{height:40, backgroundColor:'transparent',marginBottom:0,paddingBottom:0,paddingLeft:0,marginLeft:0,marginRight:0, paddingRight:0, borderBottomColor:'transparent', top:0}}
      />
      <Input value={this.state.contactPhone}
      editable={this.props.editable != undefined ? this.props.editable : true}
      disabled={this.props.editable != undefined ? !this.props.editable : false}
      keyboardType={"number-pad"}
      onChangeText={(text) => {
        if(this.phoneInput(text)){
          this.setState({contactPhone:text});
        }
        setTimeout(function(){
          this.evaluate();
        }.bind(this),200);
      }}
      inputContainerStyle={{borderColor:'transparent', backgroundColor:'transparent'}} placeholder="Teléfono (10 dígitos)"
      containerStyle={{flex:1, height:40, marginTop:0, borderWidth:0, backgroundColor:'transparent', top:0}}/>
      </View>
          )
        }
      }

let PhoneInputViewContainer = connect(state => ({ clientState: state.clientState, chatState: state.chatState, userState: state.userState }))(PhoneInputView);
export default PhoneInputViewContainer;
