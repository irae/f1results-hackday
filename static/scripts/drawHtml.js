// Globals

var season = _GET('season') || '2009';
var pixelPerPoints = 4;
var players = [];
var playerCount = 0;
var absoluteTotalPlayers = 0;
var raceCount = 0;
var playerPoints = [];
var playerPlaces = [];

var tableLineHeigth = 21;

// This is duplicate with the CSS. If you change here, change there too!
var raceTableWidth = 250;
var raceTableMarginLeft = 20;
var raceTableBorderLeft = 1;

var playerHeight = 45;
var playerMargin = 30;
var playerMeterHeight = 15;

function _GET(param) {
	var re = new RegExp(param+'=([^&]+)');
	var loc = unescape(''+document.location.href);
	if (loc.match(re)) { return re.exec(loc)[1].replace(/</g,'&lt;').replace(/>/g,'&gt;'); } else { return false;	}
};

var yqlquery = 'USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.races.xml?5" AS formula1.races;\n\
	USE "http://github.com/irae/yql-tables/raw/master/formula1/formula1.race.results.xml?5" AS formula1.race.results;\n\
	\n\
	select *\n\
	from formula1.race.results\n\
	where season="'+season+'"\n\
	and race in (\n\
		select round from formula1.races where season="2009" \n\
	);';
	
function racesJsonPrettify(data) {
	var json = {};
	json.races = [];
	$.each(data.query.results.Races,function(i,oRace){
		var nRace = {
			name: oRace.raceName,
			results: []
		};
		if(!oRace.Results) {
			return false;
		}
		for(var j=0;j<oRace.Results.length;j++) {
			var res = oRace.Results[j];
			var resOut = {
				pos: res.position,
				driver: res.Driver.givenName + ' ' + res.Driver.familyName,
				team: res.Constructor.name,
				laps: parseInt(res.laps,10),
				points: parseInt(res.points,10),
				status: res.status,
				grid: parseInt(res.grid,10),
				num: parseInt(res.number,10),
				driverId: res.Driver.driverId
			};
			if(res.Time) {
				resOut.time = res.Time.time;
			}
			nRace.results.push(resOut);
		}
		json.races.push(nRace);
	});
	return json;
};

function playerExists(searchId) {
	var exists = false;
	$.each(players, function(i,player){
		if(player.driverId == searchId) {
			exists = player;
		}
	});
	return exists;
};

function printDriverInfos(data) {
	// console.debug(data.races);
	$.each(data.races,function(i,race){
		
		$.each(race.results,function(j,result){
			var found = playerExists(result.driverId);
			if(!found) {
				var driver = {
					driver: result.driver,
					playerCount: ++playerCount,
					driverId: result.driverId,
					sumPoints: 0,
					racesRun:[]
				};
				players.push(driver);
			} else {
				var driver = found;
			}
			driver.racesRun.push(i+1);
			driver.sumPoints += result.points;
		});
	});
	
	absoluteTotalPlayers = players.length;
	
	// console.dir(players);
	
	// sort players
	players = players.sort(function(a,b){
		return b.sumPoints - a.sumPoints;
	});
	
	// reset counter
	$.each(players,function(i,player){
		player.playerCount = i+1;
	});
	
	var limit = parseInt(_GET('limit'),10);
	if( limit > 2) {
		players = players.slice(0,limit);
		playerCount = limit;
	}
	
	var html = '<canvas id="curves" width="600" height="'+(playerCount*playerHeight)+'"></canvas>';
	
	var posSufixes = ['st','nd','rd','th','th','th','th','th','th','th'];
	
	$.each(players,function(i,player){
		
		var pointsStack = 0;
		
		html += '<div id="player_'+player.playerCount+'" class="player '+player.driverId+'" style="top:'+((player.playerCount-1)*playerHeight)+'px">'+
			'<p class="total">'+player.sumPoints+'</p>'+
			'<progress class="round" value="'+player.sumPoints+'" max="'+(data.races.length*10)+'" style="width: '+(pixelPerPoints*player.sumPoints+2)+'px;">';
		
		
		playerPoints[i+1] = [];
		playerPlaces[i+1] = [];
		playerPoints[i+1].push(undefined);
		playerPlaces[i+1].push(undefined);

		$.each(data.races,function(j,race){
			var borderShift = 2;
			// if(j == 0) {
			// 	borderShift = 0;
			// }
			var hasRun = false;
			var thisRacePoints = 0;
			$.each(race.results,function(k,result){
				// console.info(result.driverId, player.driverId);
				if(result.driverId == player.driverId) {
					hasRun = true;
					thisRacePoints = result.points;
					thisRacePos = parseInt(result.pos,10) > 0 ?parseInt(result.pos,10):k+1;
				}
			});
			if(!hasRun){
				thisRacePos = 'X';
			};

			// if(player.driverId == 'hamilton') {
			// 	console.info('points',parseInt(thisRacePoints,10) > 0 ?parseInt(thisRacePoints,10):0);
			// 	console.info('place',parseInt(thisRacePos,10) > 0 ?parseInt(thisRacePos,10):j+1);
			// }
			// 
			// graph objects
			playerPoints[i+1].push(parseInt(thisRacePoints,10) > 0 ?parseInt(thisRacePoints,10):0);
			playerPlaces[i+1].push(parseInt(thisRacePos,10) > 0 ?parseInt(thisRacePos,10):j+1);


			// console.info(thisRacePos,player.driver);
			
			html += '\n\n<meter class="race race'+j+'" value="'+thisRacePoints+'" min="0" max="10" style="width: '+(thisRacePoints*pixelPerPoints)+'px; left: '+(pointsStack*pixelPerPoints)+'px;">'+
						'<strong class="place">'+
							thisRacePos+'<span>'+(  posSufixes[ (thisRacePos % 10) -1 ] )+'</span>'+
						'</strong>'+
						'<span class="points">'+thisRacePoints+' points</span>'+
					'</meter>';
			pointsStack += thisRacePoints;
		});
		html += '	</progress>'+
			'<dl class="identity">'+
				'<dt class="name">'+player.driver.replace(/.* /,'')+'</dt>'+
				'<dd class="avatar character '+player.driverId+'">'+
					'<div><img src="_base/img/character_avatars.png" alt="'+player.driver+'" /></div>'+
				'</dd>'+
			'</dl>'+
		'</div>';
		// console.info(html);
	});
	
	$('#graph').css({
		height: (playerCount*playerHeight)+'px'
	}).append(html);
	
	$('.graph_lines').css({
		height: (playerCount*playerHeight)+'px'
	});
	
	// console.info('playerPoints');
	// console.dir(playerPoints);
	// console.info('playerPlaces');
	// console.dir(playerPlaces);
	
};

function printRaceTables(data) {
	// console.info(data.races.length,'totalRaces');
	var races = data.races;
	var driversSums = {};
	raceCount = races.length;
	printDriverInfos(data);
	
	var totalWidth = raceTableWidth + raceTableMarginLeft + raceTableBorderLeft;
	

	var slider = '<div class="slider" style="width: '+(data.races.length*totalWidth+raceTableMarginLeft)+'px">'+
			'<canvas id="round_races_curves" width="'+(data.races.length*totalWidth-34)+'px" height="'+(26*absoluteTotalPlayers)+'"></canvas>'+
		'</div>';

	$('#round_races').html(slider)

	for (i in races){
		var article = document.createElement("article");
		article.className = "race race"+i;
		var html = '<h3>' + data.races[i].name + '</strong></h3>' +
		"<ol>";
		for (j in races[i].results){
			if (!driversSums[races[i].results[j].driverId]) {
				driversSums[races[i].results[j].driverId] = races[i].results[j].points;
			} else {
				driversSums[races[i].results[j].driverId] += races[i].results[j].points;
			}
			html +=	'<li class="player">' +
			'<h4>' + races[i].results[j].pos + '</h4>' +
			'<dl class="identity">' +  
			'<dt class="name">' + races[i].results[j].driver + '</dt>' +
			'<dd class="avatar character king_boo">' + 
			'<div><img src="_base/img/character_avatars.png" alt="King Boo" /></div>' +
			'</dd>' +
			'<dd class="points">+' + races[i].results[j].points + '</dd>' +
			'<dd class="score">' + driversSums[races[i].results[j].driverId] + '</dd>' + 
			'</dl>' +
			'</li>';
		}
		html += "</ol>";
		$(article).html(html);
		document.getElementById("round_races").getElementsByTagName("div")[0].appendChild(article);	
	}
	stageInit();
}

$(function(){
	$('#wrap h1').html('Season '+season);
	$('<div>',{
			id:'loadingimg',
			css:{
				position:'absolute',
				top:'250px',
				left:'50%',
				background: "url('static/images/loading.gif') no-repeat",
				zIndex: 100,
				width:'220px',
				height:'30px',
				marginLeft:'-110px'
			}
		})
		.appendTo('#top')
	$.ajax({
		type: 'GET',
		dataType: 'jsonp',
		url:'http://query.yahooapis.com/v1/public/yql',
		data:{
			format:'json',
			q:yqlquery,
			'_maxAge': 60*60
		},
		error: function() {
			alert('Something wrong retrieving from YQL.')
		},
		success:function(data) {
			$('#loadingimg').remove();
			data = racesJsonPrettify(data);
			printRaceTables(data);
		}
	});
});
