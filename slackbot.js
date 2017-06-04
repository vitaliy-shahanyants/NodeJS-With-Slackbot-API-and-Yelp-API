/*
"StAuth10065: I Vitaliy Shahanyants, 000311736 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else." 
*/
var Bot = require('slackbots');
var settings = {
	token:'xoxb-110081062775-NqmcYeTUH3CahAVziH9p8ta0',
	name:'Bot'
}
var bot = new Bot(settings);

/* Main Functionality Class*/
class MainFunc {
	constructor(command,msg){
		this.msg = msg;
		this.command;
		switch(command){
			case 'Nearby':
				this.nearby();
				break;
			case 'Closeby':
				this.closeby();
				break;
			case 'Top':
				this.top();
				break;
			case 'Closest':
				this.closest();
				break;
			case 'FindMe':
				this.findme();
				break;
			case 'Reviews':
				this.reviews();
				break;
			case 'SearchByPhone':
				this.searchbyphone();
				break;
		}
	}

	loopThroughAllRestaurants(str,err){
		var restaurants = JSON.parse(str);
		var bot_response = "";
		if(restaurants.error == undefined){
			if(restaurants.total > 0){
				for(var i = 0; i < restaurants.businesses.length; i++){
					bot_response += "("+(i+1)+")" + "(Name): " + restaurants.businesses[i].name + 
								", (Address): " + restaurants.businesses[i].location.address1;
					if(restaurants.businesses[i].location.address2 != ''){
						bot_response += " " + restaurants.businesses[i].location.address2 + " ";
					}
					if(restaurants.businesses[i].location.address3 != ''){
						bot_response += " " + restaurants.businesses[i].location.address3 + ", ";
					}
					bot_response += restaurants.businesses[i].location.city + " " + 
									restaurants.businesses[i].location.state + "," +
									restaurants.businesses[i].location.country + " " +
									restaurants.businesses[i].location.zip_code + " ";
					if(this.showRating){
						bot_response += "(Rating): " + restaurants.businesses[i].rating + "\n";
					}	else{
						bot_response += "\n";
					}
				}
				console.log(bot_response);
				bot.postMessageToChannel('general',bot_response);
			}else{
				bot.postMessageToChannel('general',err);
			}
		}else{
			bot.postMessageToChannel('general',err);
		}
	}

	provideReviewDetails(str,err){
		var restaurants = JSON.parse(str);
		var bot_response = "";
		if(restaurants.error == undefined){
			if(restaurants.total > 0){
				var iterator = 3;
				if(restaurants.total < 3){
					iterator = restaurants.total;
				}
				for(var i = 0; i < iterator; i++){
					bot_response += "("+(i+1)+")" +". (Name): " + restaurants.reviews[i].user.name + 
									"\n(Review Text): " + restaurants.reviews[i].text + "\n" + 
									" (Rating): " + restaurants.reviews[i].rating +"\n"+ 
									"(Link): "+restaurants.reviews[i].url + "\n";
				}
				console.log(bot_response);
				bot.postMessageToChannel('general',bot_response);
			}else{
				bot.postMessageToChannel('general',err);
			}
		}else{
			bot.postMessageToChannel('general',err);
		}
	}

	nearby(){
		console.log("Nearby command runs");
		//console.log(parsed);
		var parsed = this.msg.text.split('Nearby');
		var search_req = {
			'term' : 'restaurants',
			'location' : parsed[1],
			'limit' : 5,
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
		callYelpRequest(search_req,'nearby',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}

	closeby(){
		console.log("Closeby command runs");
		var parsed = this.msg.text.split(' ');
		if(parsed[1].includes("W")){
			parsed[1] = -1 * parseFloat(parsed[1]);
		}else{
			parsed[1] = parseFloat(parsed[1]);
		}

		if(parsed[2].includes("S")){
			parsed[2] = -1 * parseFloat(parsed[2]);
		}else{
			parsed[2] = parseFloat(parsed[2]);
		}
		var search_req = {
			'term' : 'restaurants',
			'longitude' : parsed[1],
			'latitude' : parsed[2],
			'limit' : 5,
			'radius' : 10000,
		};
		var error = "No closeby restaurants can be found";
		callYelpRequest(search_req,'closeby',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	top(){
		console.log("Top command runs");
		var parsed = this.msg.text.split(" ");
		var xNumber = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(" ");
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'limit' : xNumber,
			'sort_by' : 'rating',
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
		callYelpRequest(search_req,'top',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	closest(){
		console.log('Closest command runs');
		var parsed = this.msg.text.split(" ");
		var xNumber = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(' ');
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'limit' : xNumber,
			'radius' : 10000,
		};
		var error = "No nearby restaurants can be found";
		callYelpRequest(search_req,'closest',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	findme(){
		this.showRating = true;
		console.log('FindMe command runs');
		var parsed = this.msg.text.split(" ");
		var category = parsed[1];
		parsed.splice(0,1);
		parsed.splice(0,1);
		var address = parsed.join(' ');
		var search_req = {
			'term' : 'restaurants',
			'location' : address,
			'categories' : category,
			'radius' : 20000,
		};
		var error = "No "+category+" restaurant can be found";
		callYelpRequest(search_req,'findme',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		});
	}
	/**
		@name review()
		@return null

		Wojtek Matwiejczyk and I, worked together on this function.
	*/
	reviews(){
		var addressFormula = /[0-9]{1,6} [\w\s]{3,} [\w,\s]{2,}/g;
		var address = this.msg.text.match(addressFormula);
		var parsed = this.msg.text.replace(addressFormula,'');
		parsed = parsed.split(' ');
		parsed.splice(0,1);
		var name = parsed.join(' ');
		var search_req = {
			'term' : name,
			'location' : address,
		};
		var error = name+" cannot be found";
		callYelpRequest(search_req,'top',(str)=>{
			var id = JSON.parse(str).businesses[0].id;
			callYelpRequest(search_req,'top',(str)=>{
				this.provideReviewDetails(str,error);
			},{reviews:true,id:id});
		});
	}
	searchbyphone(){
		var parsed = this.msg.text.split(' ');
		var phone = '+'+parsed[1];
		var search_req = {
			'phone':phone
		}
		var error = "No restaurant with phone number "+phone+" can be found";
		callYelpRequest(search_req,'searchbyphone',(str)=>{
			this.loopThroughAllRestaurants(str,error);
		},{phone:true});
	}
}
/*End og Main Func Class*/


var https = require('https');
var querystring = require('querystring');

/*
Yelp App
*/
var getResturants = (access_token, search_req, commandCallback,extras) =>{
	var myreq = search_req;

	var myreqstr = querystring.stringify(myreq);

	var options = {
		host: 'api.yelp.com',
		port: '443',
		path: '/v3/businesses/search?' + myreqstr, // include the URL parameters
		method: 'get',
		headers : {
			'Authorization' : 'Bearer ' + access_token,
		}
	}
	if(extras != null && extras.reviews){
		options.path = '/v3/businesses/'+extras.id+'/reviews';
	}
	if(extras != null && extras.phone){
		myreqstr = myreqstr.replace('%2B','+');
		options.path = '/v3/businesses/search/phone?'+myreqstr;
	}
	var callback = (res) =>{
		var str = "";
		res.on('data', (chunck) =>{
			str += chunck;
		});
		res.on('end',()=>{
			commandCallback(str);
		});
	}
	var req = https.request(options,callback).end();
}
/**/

/* Yelp Get TOKEN */
var getYelpToken = (search_req,commandCallback,extras) => {
	var authreq = {
		'grant_type' : "client_credentials",
		'client_id' : "LEumLx9_tzMDmetEm8QGGQ",
		'client_secret' : "axoNNVfuqynEt6zEuTmu7YLB2g5JfUNBoqlhZubZcTHgodErvTUHVBpoeW6ZIN9G" 
	}
	var authreqstr = querystring.stringify(authreq);
	var authoptions = {
		host: 'api.yelp.com',
		port: '443',
		path: '/oauth2/token',
		method: 'POST',
		headers: {
			'Content-Type':'application/x-www-form-urlencoded',
			'Content-Length' : Buffer.byteLength(authreqstr)      
		}
	}
	var callback = (res) => {
		var str = "";
		res.on('data',(chunck)=>{
			str += chunck;
		});
		res.on('end',()=>{
			var data_back = JSON.parse(str);
			var token = data_back.access_token;
			getResturants(token,search_req,commandCallback,extras);
		});
	}
	var req = https.request(authoptions,callback);
	req.write(authreqstr);
	req.end();
}
/* End of Get token function */

var callYelpRequest = (search_req,command, commandCallback , extras = null) =>{
	getYelpToken(search_req,commandCallback,extras);
}

/* End of Yelp Functions*/
/* SlackBot */
bot.on('start',() =>{
	bot.postMessageToChannel('general','How Can I Help');
});
bot.on('message',(msg) =>{
	if(msg.text != undefined && msg.text != 'How Can I Help' && msg.subtype == undefined){
		console.log(msg);
		var command = msg.text.split(' ');
		new MainFunc(command[0],msg);
	}
});
/* End of Slackbot */