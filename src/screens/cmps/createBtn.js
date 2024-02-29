import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { BTN_TYPE } from '../../util/constants'

export default function CreateBtn({ goToScreen, type, disabled }) {
  let renderIcon
  switch (type) {
    case BTN_TYPE.DIALOG: {
      renderIcon = <Icon name="add" size={30} color='white' />
      break
    }
    case BTN_TYPE.CONTACTS: {
      renderIcon = <Icon name="check" size={40} color="white" />
      break
    }
    case BTN_TYPE.CREATE_GROUP: {
      renderIcon = <Icon name="check" size={40} color="white" />
      break
    }
    case BTN_TYPE.PERSONAL_ALERT: {
      renderIcon = <FeatherIcon name="alert-circle" size={40} color="white" />
      break
    }
  }

  return (
    <TouchableOpacity disabled={disabled} style={[styles.createDialog, {backgroundColor:disabled ? "gray" : '#7CB185'}]} onPress={goToScreen}>
      {renderIcon}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  createDialog: {
    position: 'absolute',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    bottom: 40,
    right: 30,
    backgroundColor: '#E64E25'
  }
})
