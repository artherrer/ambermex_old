import React from 'react'
import { Text, StyleSheet } from 'react-native'

export default function convoLastDate({ lastDate, lastMessage, updatedDate }) {
  // TODO: understand this logic
  function getTime() {

    if(lastMessage){
      return "";
    }

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
    const msgLastDate = new Date(updatedDate)
    const msgYear = msgLastDate.getFullYear()
    const msgMonth = msgLastDate.getMonth()
    const msgDate = msgLastDate.getDate()
    const msgDay = msgLastDate.getDay()
    const msgHours = msgLastDate.getHours()
    const msgMinutes = msgLastDate.getMinutes()
    const LastDate = new Date()
    const curYear = LastDate.getFullYear()
    const curMonth = LastDate.getMonth()
    const curDate = LastDate.getDate()
    const curDay = LastDate.getDay()

    if (curYear > msgYear) {
      return `${months[msgMonth]} ${msgDate}, ${msgYear}`
    } else if (curMonth > msgMonth) {
      return `${months[msgMonth]} ${msgDate}`
    } else if (curDate > (msgDate + 6)) {
      return `${months[msgMonth]} ${msgDate}`
    } else if (curDay > msgDay) {
      return `${days[msgDay]}`
    } else {
      return `${(msgHours > 9) ? msgHours : ('0' + msgHours)}:${(msgMinutes > 9) ? msgMinutes : ('0' + msgMinutes)}`
    }
  }

  return <Text style={styles.time} numberOfLines={1}>{getTime()}</Text>
}

const styles = StyleSheet.create({
  time: {
    color: 'grey',
    lineHeight: 25,
    fontSize: 12,
    fontWeight: '500'
  }
})
