import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function convoTitles({ name, message, temporal, emergencyType, emergency, emergencyEndDate, description, chatType }) {

  function returnStyleType(alert_type){
    if(alert_type == "Emergency"){
      return styles.emergency;
    }
    else if(alert_type == "Vecinal"){
      return styles.vecinal;
    }
    else if(alert_type == "Fire"){
      return styles.fire;
    }
    else if(alert_type == "Medical"){
      return styles.medical;
    }
    else if(alert_type == "Suspicious"){
      return styles.suspicious
    }
    else if(alert_type == "Feminist"){
      return styles.feminist
    }
    else{
      return styles.emergency
    }
  }

  return (
    <View style={styles.container}>
      <Text style={temporal ? returnStyleType(emergencyType) : (chatType === 2 ? styles.official : styles.name)} numberOfLines={1}>{name}</Text>
      {temporal && !emergency && description != null ?
        <Text style={[{marginBottom:5},styles.message]} numberOfLines={1}>{description}</Text>
        : null}
      <Text style={styles.message} numberOfLines={1}>{temporal ? (emergency ? message : emergencyEndDate) : message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: 10
  },
  official:{
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#7D9D78'
  },
  name: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#3C3C3B'
  },
  emergency: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'red'
  },
  suspicious: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#fcaf00'
  },
  vecinal: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#7d9d78'
  },
  feminist: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#635592'
  },
  medical: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#0C479D'
  },
  fire: {
    height: 30,
    lineHeight: 30,
    fontSize: 18,
    fontWeight: '700',
    color:'#f05a23'
  },
  message: {
    height: 15,
    lineHeight: 15,
    fontSize: 15,
    fontWeight: '400'
  }
})
