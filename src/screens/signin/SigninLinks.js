import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

export default class SigninLinks extends Component {
	state = {
		showModal: false
	}

	render() {
		const authText = "Aún no tienes cuenta?";
		const authLink = 'Regístrate';
        //const contentPosition = { justifyContent: isLogin ? 'space-between' : 'flex-end' }
        const contentPosition = { justifyContent: 'flex-end' }

		return (
			<View style={[styles.container, contentPosition]}>
				<View style={styles.switchAuthContainer}>
					<Text style={styles.text}>{authText}  </Text>
					<TouchableOpacity onPress={() => this.props.navigation.navigate("Register")}>
						<Text style={[styles.switchAuth, styles.text]}>{authLink}</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingBottom: 25,
	},
	text: {
		fontSize: 16,
	},
	switchAuthContainer: {
		marginVertical: 5,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	switchAuth: {
		fontWeight: '700',
	},
})
