import React from 'react'
import { StyleSheet, View, Image, Dimensions } from 'react-native'

var { height, width } = Dimensions.get('window');

export default SigninLogo = () => {
	return (
		<View style={styles.container}>
			<Image style={styles.imageSize} resizeMode="contain" source={require('../../../assets/image/logo_with_text.png')} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex:0.5,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imageSize: {
		width: width*.25,
		height: height*.25
	},
})
