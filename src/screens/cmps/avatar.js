import React from 'react'
import { View, Text, StyleSheet, Platform, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
//import { getCbToken } from '../../helpers/file'
const CREATE_GROUP = require('../../../assets/image/CREATE_GROUP.png');
const CREATE_INDIVIDUAL = require('../../../assets/image/CREATE_INDIVIDUAL.png');

export default function ProfileIcon({ photo, name, iconSize, resizeMode, emergency, temporal, emergencyType, chatType }) {
  let styles
  switch (iconSize) {
    case 'extra-large': {
      styles = extraLargeIcon
      break;
    }
    case 'xlarge': {
      styles = xLargeIcon
      break;
    }
    case 'large': {
      styles = largeIcon
      break;
    }
    case 'medium': {
      styles = mediumIcon
      break;
    }
    case 'small': {
      styles = smallIcon
      break;
    }
  }

  function randomizeColor() {
    const colors = [
      'blue',
      'darkmagenta',
      'fuchsia',
      'gold',
      'green',
      'limegreen',
      'navy',
      'purple',
      'red',
      'skyblue'
    ]

    let random = Math.random() * (colors.length - 0) + 0;
    random = parseInt(random);

    return colors[random]
  }

  function getIconLabel() {
    const words = name != undefined ? name.split(' ') : ['?...']

    return (
      words.length > 1
        ? label = `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`
        : name.slice(0, 2)
    )
  }

  function getEmergencyIcon(type){
    if(type == "Emergency"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_PERSONAL.png")} resizeMode={"contain"}/>
    }
    else if(type == "Vecinal"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_VECINAL.png")} resizeMode={"contain"}/>
    }
    else if(type == "Fire"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/FIRE_ICON.png")} resizeMode={"contain"}/>
    }
    else if(type == "Medical"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_MEDICO.png")} resizeMode={"contain"}/>
    }
    else if(type == "Suspicious"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_SOSPECHA.png")} resizeMode={"contain"}/>
    }
    else if(type == "Feminist"){
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_MUJERES.png")} resizeMode={"contain"}/>
    }
    else{
      return <Image style={[{ alignSelf:'center',marginLeft:10,marginRight: 0, overflow:'hidden',height: 60, width: 60 }, styles.photo]} source={require("../../../assets/image/BARRA_PERSONAL.png")} resizeMode={"contain"}/>
    }
  }

  fastImageWrap = () => {
    // TODO: Implement for FastImage
     //let source = getCbToken(photo)
     let source = {
       uri:photo,
       priority:FastImage.priority.high
     };

     return (
       temporal ?
       <View style={{overflow:'hidden',backgroundColor:'#f3f3f3', borderRadius: 25,height: 50, width: 50,alignSelf:'center',justifyContent: 'center',  alignItems: 'center',marginVertical: 10,marginRight: 10}}>
       {getEmergencyIcon(emergencyType)}
       </View>
       :
       <FastImage
         style={styles.photo}
         source={source}
         resizeMode={resizeMode != undefined ? resizeMode : "cover"}>
      </FastImage>
     )
  }

  getPlaceholder = () => {
    return (
      chatType == 0 ?
      <Image style={styles.photo} source={require('../../../assets/image/CREATE_GROUP.png')} resizeMode={"cover"}/>
      :
      (chatType == 1 ?
        <Image style={styles.photo} source={require('../../../assets/image/CREATE_INDIVIDUAL.png')} resizeMode={"cover"}/>
        :
        <Image style={styles.photo} source={require('../../../assets/image/OFICIAL_CHANNEL.png')} resizeMode={"cover"}/>
      )
    )
  }

  return (
    photo ?
      fastImageWrap()
      : (
        chatType != undefined ?
        getPlaceholder()
        :
        <View style={[styles.photo, { backgroundColor: 'red' }]}>
          <Text style={styles.randomIcon}> {getIconLabel().toUpperCase().trim()}</Text >
        </View >
      )
  )
}

const extraLargeIcon = StyleSheet.create({
  photo: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  randomIcon: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
    paddingRight: Platform.OS === 'android' ? 5 : 1
  }
})

const xLargeIcon = StyleSheet.create({
  photo: {
    borderRadius: 35,
    height: 70,
    width: 70,
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  randomIcon: {
    fontSize: 48,
    fontWeight: '600',
    color: 'white',
    paddingRight:0
  }
})

const largeIcon = StyleSheet.create({
  photo: {
    borderRadius: 25,
    height: 50,
    width: 50,
    marginVertical: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  randomIcon: {
    fontSize: 22,
    fontWeight: '700',
    alignItems: 'center',
    alignSelf:'center',
    color: 'white',
    paddingRight: Platform.OS === 'android' ? 5 : 1
  }
})

const mediumIcon = StyleSheet.create({
  photo: {
    borderRadius: 20,
    height: 40,
    width: 40,
    marginVertical: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  randomIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white'
  }
})

const smallIcon = StyleSheet.create({
  photo: {
    borderRadius: 18,
    height: 36,
    width: 36,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  randomIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    paddingRight: Platform.OS === 'android' ? 5 : 1
  }
})
