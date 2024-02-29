import {Alert, AsyncStorage, Platform } from 'react-native';
import DefaultPreference from 'react-native-default-preference';

import RNConfigReader from 'react-native-config-reader';
let IsProduction = RNConfigReader.IsProd === "true" ? true : false;
import { APP_INFO } from './constants';
import NavigationService from '../../NavigationService';

// access any of the defined config variables in andoird build gradle or ios info.plist
const ChatAppEndpoint = RNConfigReader.Server_URL;

let Connected = false;
let controller = new AbortController();
const ApiKey = "AIzaSyD0mAqOkdbeJEGAPqrQc0WX1WU4FxmAe2Y";
let logout = null;
module.exports = {
  controller,
  ChatAppEndpoint,
  IsProduction,
	changeInternetStatus(value){
		Connected = value;
		return;
	},
	getCurrentEndpointDomain(cb){
		cb(ChatAppEndpoint);
	},
  Login(model, cb){
		var request = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body:JSON.stringify(model)
		}

		let url = ChatAppEndpoint + "/Auth/LoginXMPP";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
    .catch((error) => {
			cb(error);
    })
		.catch((error) => console.log(error));
  },
  Register(model, cb){
		var request = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body:JSON.stringify(model)
		}

		let url = ChatAppEndpoint + "/Auth/Register";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
    .catch((error) => {
			cb(error);
    })
		.catch((error) => console.log(error));
  },
  VerifyCode(code, cb){
    this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(code)
			}

			let url = ChatAppEndpoint + "/Auth/VerifyPhoneNumber";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
  },
  GeneratePhoneCode(cb){
    this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			}

			let url = ChatAppEndpoint + "/Auth/GenerateVerificationPhoneToken";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
  },
  CreateChat(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
  		var request = {
  			method: 'POST',
  			headers: {
  				'Accept': 'application/json',
  				'Content-Type': 'application/json',
          'Authorization': authStr
  			},
  			body:JSON.stringify(model)
  		}

  		let url = ChatAppEndpoint + "/Conversations/CreateGroupXMPP";

  		fetch(url, request)
  		.then((response) => response.json())
  		.then((responseData) => {
  			cb(responseData);
  			return;
  		})
      .catch((error) => {
  			cb(error);
      })
  		.catch((error) => console.log(error));
    }.bind(this));
  },
  CreatePrivateChat(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
  		var request = {
  			method: 'POST',
  			headers: {
  				'Accept': 'application/json',
  				'Content-Type': 'application/json',
          'Authorization': authStr
  			},
  			body:JSON.stringify(model)
  		}

  		let url = ChatAppEndpoint + "/Conversations/Create1v1Channel";

  		fetch(url, request)
  		.then((response) => response.json())
  		.then((responseData) => {
  			cb(responseData);
  			return;
  		})
      .catch((error) => {
  			cb(error);
      })
  		.catch((error) => console.log(error));
    }.bind(this));
  },
  SaveChannelData(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
  		var request = {
  			method: 'POST',
  			headers: {
  				'Accept': 'application/json',
  				'Content-Type': 'application/json',
          'Authorization': authStr
  			},
  			body:JSON.stringify(model)
  		}

  		let url = ChatAppEndpoint + "/Conversations/UpdateChannelMetadata";

  		fetch(url, request)
  		.then((response) => response.json())
  		.then((responseData) => {
  			cb(responseData);
  			return;
  		})
      .catch((error) => {
  			cb(error);
      })
  		.catch((error) => console.log(error));
    }.bind(this));
  },
  InviteParticipants(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/Conversations/InviteMembersGroupXMPP";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  UpdateUser(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/User/UpdateUserXMPP";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  UpdatePicture(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/User/UpdateProfilePicture";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  UpdateLocation(model, cb){
    this.getLocationTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/User/UpdateLocation";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  AddOrUpdateMedical(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/User/AddMedicalData";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  GetMembersInfo(conversation_id, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(conversation_id)
    	}

    	let url = ChatAppEndpoint + "/Conversations/GetMembersInformation";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  UploadPicCloud(model, cb) {
    var request = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
      },
      body: model
    }

    let url =  APP_INFO.UPLOAD_URL + "/image/upload";

    fetch(url, request)
    .then((response) => response.json())
    .then((responseData) => {
        cb(responseData);
        return;
    })
    .catch((error) => {
        console.log(error);
    })
    .catch((error) => console.log(error));
  },
  SendNotification(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/Conversations/SendPushNotification";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  CreateAlert(model, cb){
    this.getTokenInfo(function(token) {
      var authStr = "Bearer " + token;
    	var request = {
    		method: 'POST',
    		headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
          'Authorization': authStr
    		},
    		body:JSON.stringify(model)
    	}

    	let url = ChatAppEndpoint + "/Emergency/EmergencyStart";

    	fetch(url, request)
    	.then((response) => response.json())
    	.then((responseData) => {
    		cb(responseData);
    		return;
    	})
      .catch((error) => {
    		cb(error);
      })
    	.catch((error) => console.log(error));
    }.bind(this));
  },
  EndAlert(model, reason, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}
      let url;

      if(reason != undefined){
        url = ChatAppEndpoint + "/Emergency/EmergencyEnd?Reason="+ reason;
      }
      else{
         url = ChatAppEndpoint + "/Emergency/EmergencyEnd";
      }

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  UpdateCache(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Conversations/UpdateGroupCache";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  KickUser(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Conversations/KickUserFromChannel";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetHistoryAlerts(page, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			}

      if(page == undefined){
        page = 1;
      }

			let url = ChatAppEndpoint + "/Emergency/GetHistory?p=" + page;

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetSuspiciousAlerts(page, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			}
      if(page == undefined){
        page = 1;
      }
			let url = ChatAppEndpoint + "/Emergency/GetHistory?p=" + page + "&s=15&Type=3";
			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetLocation(lat, long, cb){
		var request = {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}

		let coordinates = lat + "," + long;

		let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates + "&key=" + ApiKey;

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
				.catch((error) => {
						console.log(error);
				})
		.catch((error) => console.log(error));
	},
  GetEmergencyContacts(cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			}

			let url = ChatAppEndpoint + "/User/GetEmergencyContacts";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AddEmergencyContacts(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/User/AddEmergencyContacts";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  RemoveEmergencyContact(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/User/RemoveEmergencyContact";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  UpdateDevices(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Devices/UpdateDevices";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  EnterBeacon(model, cb) {
		this.getLocationTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/User/EnterBeacon";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  ExitBeacon(model, cb) {
		this.getLocationTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/User/ExitBeacon";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  NotifyNearbyUsers(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/User/NotifyNearbyUsers";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AddSupportedZone(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Devices/AddSupportedGeozone";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AddZones(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Devices/AddZones";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetCloseNodes(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Devices/GetCloseNodes";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  JoinEmergencyChannel(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Emergency/JoinEmergency";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AbandonGroup(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Conversations/AbandonGroup";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  DeleteGroup(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Conversations/DeleteGroup";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  RemoveExpiredChannels(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Emergency/RemoveExpiredChannels";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  RecreateExpiredChannels(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Conversations/RecreateChannels";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AcceptTerms(cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				}
			}

			let url = ChatAppEndpoint + "/User/AcceptTermsAndConditions";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  CreateGlobalAlarm(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Emergency/EmergencyStart";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  DeleteBeacons(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': auth
				},
				body:JSON.stringify(model)
			}

			let url = ChatAppEndpoint + "/Devices/DeleteBeacons";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  UploadThumbnail(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        },
        body: model
			}

      let url = APP_INFO.UPLOAD_URL + "/image/upload";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  UploadVerificationImages(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/User/UpVerificationPhotos";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetVerificationMail(cb) {
    this.getTokenInfo(function(token) {
      let auth = "Bearer " + token;
      var request = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        }
      }

      let url = ChatAppEndpoint + "/Auth/GenerateVerificationEmailToken";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetUserInfo(cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        }
			}

      let url = ChatAppEndpoint + "/Auth/GetUserData";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  CheckPassword(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/Auth/CheckPassword";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  RecoverAccount(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/Auth/RecoverAccount";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  ChangePassword(model, cb) {
		var request = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(model)
		}

    let url = ChatAppEndpoint + "/Auth/ChangePassword";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
        .catch((error) => {
			cb(error);
        })
		.catch((error) => console.log(error));
	},
  GetValidationCode(model, cb) {
		var request = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(model)
		}

    let url = ChatAppEndpoint + "/Auth/GetValidationCode";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
        .catch((error) => {
			cb(error);
        })
		.catch((error) => console.log(error));
	},
  ChangeMedicalDataStatus(value, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        }
			}

      let url = ChatAppEndpoint + "/User/ChangeMedicalDataStatus?Value=" + value;

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  GetNearbyUsersCount(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/User/GetNearbyMembers";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AddAddressLocation(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/User/AddAddressLocation";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  AttendEmergency(model, cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(model)
			}

      let url = ChatAppEndpoint + "/Emergency/AttendEmergency";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  DeleteAccount(cb) {
		this.getTokenInfo(function(token) {
			let auth = "Bearer " + token;
			var request = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': auth
        }
			}

      let url = ChatAppEndpoint + "/User/RemoveAccount";

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
		}.bind(this));
	},
  FetchbyPostalCode(postalCode, cb) {
			var request = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
			}

      let url = ChatAppEndpoint + "/Auth/AddressByPostalCode?postalCode=" + postalCode;

			fetch(url, request)
			.then((response) => response.json())
			.then((responseData) => {
				cb(responseData);
				return;
			})
	        .catch((error) => {
				cb(error);
	        })
			.catch((error) => console.log(error));;
	},
  GetChallengeDeviceValidationCode(model, cb) {
		var request = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(model)
		}

    let url = ChatAppEndpoint + "/Auth/GetChallengeDeviceValidationCode";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
        .catch((error) => {
			cb(error);
        })
		.catch((error) => console.log(error));
	},
  CompleteChallengeDevice(model, cb) {
		var request = {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(model)
		}

    let url = ChatAppEndpoint + "/Auth/ChallengeDevice";

		fetch(url, request)
		.then((response) => response.json())
		.then((responseData) => {
			cb(responseData);
			return;
		})
        .catch((error) => {
			cb(error);
        })
		.catch((error) => console.log(error));
	},
  setToken(logoutFunction){
    logout = logoutFunction;
    this.getTokenInfo(function(token) {
      if(token != 'null'){
        DefaultPreference.setName(APP_INFO.GROUP_NAME);
        DefaultPreference.set('Token', token).then(function() {console.log('token set')});
      }
    }.bind(this));
  },
  deleteToken(){
    DefaultPreference.setName(APP_INFO.GROUP_NAME);
    DefaultPreference.set('Token', "").then(function() {console.log('token deleted')});
  },
  getTokenInfo(cb): Array<string> {
		let updatingStatus = false;
    let time = -1;

		var interval = setInterval(function(){
      time++;

      var getToken = () => {
        clearInterval(interval);

        AsyncStorage.multiGet(['access_token', 'refresh_token', 'expires_in', 'Status'], (err, stores) => {

          var accessToken = this.getValue("access_token", stores);
          var refreshToken = this.getValue("refresh_token", stores);
          var expiresIn = this.getValue("expires_in", stores);
          var status = this.getValue("Status", stores);

          if(expiresIn != null) {
            expiresIn = Number(expiresIn);
            let isValidDate = new Date(expiresIn).getTime();

            if(isNaN(isValidDate)){
              expiresIn = Number(expiresIn);
            }
            else{
              expiresIn = Number(isValidDate);
            }
          }

          let now = new Date();

          var expireLimit = now.getTime();
          updatingStatus = false;
          if(expiresIn > expireLimit) {
            cb(accessToken);
          }
          else {
            this.refreshToken(refreshToken, status, (token) => {
              if(token != undefined && token.error){
                console.log("token error");
              }
              else{
                cb(token);
              }
            });
          }
      });
    }

      if(!Connected){
        if(Number.isInteger(time/50)){
          this.checkConnection((result) => {
            if(result && !updatingStatus){
              updatingStatus = true;
              this.changeInternetStatus(result);
              getToken();
            }
          })
        }
      }
      else{
        getToken();
      }
		}.bind(this),200);
	},
  getLocationTokenInfo(cb): Array<string> {
		let updatingStatus = false;
    let time = -1;

		var interval = setInterval(function(){
      time++;

      var getToken = () => {
        clearInterval(interval);

        AsyncStorage.multiGet(['location_token', 'refresh_token', 'location_expires_in', 'Status'], (err, stores) => {

          var accessToken = this.getValue("location_token", stores);
          var refreshToken = this.getValue("refresh_token", stores);
          var expiresIn = this.getValue("location_expires_in", stores);
          var status = this.getValue("Status", stores);

          if(expiresIn != null) {
            expiresIn = Number(expiresIn);
            let isValidDate = new Date(expiresIn).getTime();

            if(isNaN(isValidDate)){
              expiresIn = Number(expiresIn);
            }
            else{
              expiresIn = Number(isValidDate);
            }
          }

          let now = new Date();

          var expireLimit = now.getTime();
          updatingStatus = false;
          if(expiresIn > expireLimit) {
            cb(accessToken);
          }
          else {
            this.refreshToken(refreshToken, status, (token) => {
              if(token != undefined && token.error){
                console.log("token error");
              }
              else{
                cb(token);
              }
            });
          }
      });
    }

      if(!Connected){
        if(Number.isInteger(time/50)){
          this.checkConnection((result) => {
            if(result && !updatingStatus){
              updatingStatus = true;
              this.changeInternetStatus(result);
              getToken();
            }
          })
        }
      }
      else{
        getToken();
      }
		}.bind(this),200);
	},
  async checkConnection(callback){
		let probablyHasInternet;
		try {
			const googleCall = await fetch(
		    'https://google.com', {
    		headers: {
    			'Cache-Control': 'no-cache, no-store, must-revalidate',
    			Pragma: 'no-cache',
    			Expires: 0,
    		},
    	});
  		probablyHasInternet = googleCall.status === 200;
			callback(probablyHasInternet);
		} catch (e) {
  		probablyHasInternet = false;
			callback(probablyHasInternet);
		}
	},
  setUserCreds(token, refresh, exp, JID, key, status, locationToken, locationExpDate) {
    let dateNumber = new Date(exp);
    dateNumber = String(dateNumber.getTime());
    let locDateTime  = new Date(locationExpDate);
    locDateTime = String(locDateTime.getTime()); //save locationexpdate and token exp as string, can only save strings to asyncstorage
    AsyncStorage.multiSet([['access_token', token], ['refresh_token', refresh], ['expires_in', dateNumber], ['Status', status], ['location_token', locationToken],['location_expires_in',locDateTime]]);
    DefaultPreference.setName(APP_INFO.GROUP_NAME);
    DefaultPreference.set('Token', token).then(function() {console.log('token set')});
  },
  getValue(key: string, store: Array<string>): string {
    	for(var i = 0; i < store.length; i++) {
    		if(store[i][0] === key) {
    			return store[i][1];
    		}
    	}

    	return null;
    },
  refreshToken(token: string, status:string, cb): Array<string> {
  			var authStr = "Bearer " + token;
  			var request = {
      		method: 'GET',
      		headers: {
          		'Accept': 'application/json',
          		'Content-Type': 'application/json',
          		'Authorization': authStr
      		}
  			}

  			let url = ChatAppEndpoint + "/Auth/RefreshToken";

  			fetch(url, request)
  			.then((response) => response.json())
  			.then((responseData) => {
            if(responseData != null && responseData.token != null){
              this.setUserCreds(responseData.token, responseData.refresh, responseData.expiration,"","", status, responseData.locationToken, responseData.locTokenExpiration);
              cb(responseData.token);
        			return;
            }
  					else if(responseData.error && responseData.server_error){
              if(logout != undefined){
                logout();
              }
              AsyncStorage.multiRemove(['access_token', 'refresh_token', 'expires_in',"GeoAreas","SelfiePicture", "MedicalData", "OfficialSchedule", "IdPicture", "LoginCreds", "UserData", "Status", "CurrentArea", "NearbyUsers", "CurrentBeacons", "location_token", "location_expires_in", "push_token" + APP_INFO.PINPOINT_ID], (asyncError) => {
                NavigationService.navigate('LandingScreen');
                let res = {
      						status:401,
                  error:true
      					};
      					cb(res);
              });
            }
            else{
              console.log("timeout or other error")
            }
  			})
  			.catch((error) => {
          console.log(error);
  			})
  		.catch((error) => console.log(error));
	}
}
