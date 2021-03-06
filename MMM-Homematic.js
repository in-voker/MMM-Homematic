Module.register("MMM-Homematic",{
	// default module config
	defaults: {
		initialLoadDelay: 0,
		updateInterval: 30,
		animationSpeed: 1000,
		tempUnit: "°C",
		humUnit: "%",
		shutterUnit: "%",
		ampUnit: " mA",
		voltUnit: " V",
		pwrUnit: " W",
		energyUnit: " Wh",
		energyUnitK: " kWh", 
		freqUnit: " Hz",
		
		// Introduction numberUnit
		// @spitzlbergerj, 20190624
		numberUnit: " ",
		
		locale: config.language,
		ccuProtocol: 'http://',
		ccuHost: 'ccu3-webui',
		ccuXmlApiUrl: '/addons/xmlapi',
		ccuStateServiceUrl: '/state.cgi',
		ccuSysvarServiceUrl: '/sysvar.cgi',
		ccuDatapointIdParameter: '?datapoint_id=',
		ccuIseIdParameter: '?ise_id='
	},

	// start scheduler
	start: function() {
		Log.info("Starting module: " + this.name);

		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// get additional scripts
	getScripts: function() {
		return [
			'https://code.jquery.com/jquery-1.12.4.min.js',  // this file will be loaded from the jquery servers.
		]
	},

	// get additional styles
	getStyles: function() {
		return [
			'MMM-Homematic.css',
		]
	},


	// return tranlation files
	getTranslations: function() {
		return {
				en: "translations/en.json",
				de: "translations/de.json"
		}
	},

	// Override dom generator.
	getDom: function() {
		let _self = this;
		let wrapper = $("<div/>",{class: 'small'});
		if(typeof(_self.homematicData) !== 'undefined') {
			if(typeof(this.config.datapoints) === 'object') {
				$.each(this.config.datapoints,function(){
					if(typeof(this.name) === 'string' && typeof(this.id) === 'string' && typeof(this.type) === 'string') {
						let value = _self.homematicData[_self.removeSpecialChars(this.name)];
						let text_is = "";
						let text_class = "";
						let text_with_icon_class = "";
						let warn_color = "red";
						let warn_class = "bright red";
						let icon_color = "white";
						let icon_html;
						let icon_class = "";
						let icon_size = 'medium';
						let icon_position = 'left';

						// Introduction numberUnit
						// @spitzlbergerj, 20190624
						let numberUnit = '';

						
						if((this.type.indexOf("warn") !== -1) && ((typeof(this.warnOnly) === 'string') && (this.warnOnly === 'true'))) {
							text_class = "hide";
						}

						// Setting warning color
						// @spitzlbergerj, 20190127

						if(typeof(this.warnColor) === 'string') {
							warn_color = this.warnColor;
							warn_class = "bright " + warn_color;
						}

						if(typeof(this.iconColor) === 'string') {
							icon_color = this.iconColor;
						}

						// Introduction numberUnit
						// @spitzlbergerj, 20190624
						if(typeof(this.numberUnit) === 'string') {
							numberUnit = this.numberUnit;
						}


						// Devices
						
						if(this.type.startsWith('window')) {
							// window/door
							// @spitzlberger: for HM-Sec-SCo added testing of Boolean value  
							if((value === "0") || (value === "false")) {
								text_is = _self.translate("IS_CLOSED");
								if(this.type === 'window_warn_closed') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_OPEN");
								if(this.type === 'window_warn_open') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('temp')) {
							// temperature
							let valueStr = Number(value).toLocaleString(_self.config.locale, {minimumFractionDigits: 1, maximumFractionDigits: 1});;
							
							if(this.type.startsWith('temp_') && typeof(this.threshold) === 'number') {
								if(this.type === 'temp_warn_high' && value >= this.threshold) {
									text_is = _self.translate("IS_TOO_HIGH") + " (" + valueStr + _self.config.tempUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else if(this.type === 'temp_warn_low' && value <= this.threshold) {
									text_is = _self.translate("IS_TOO_LOW") + " (" + valueStr + _self.config.tempUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else {
									text_is = _self.translate("IS_OK") + " (" + valueStr + _self.config.tempUnit + ")";
								}
							} else {
								text_is = _self.translate("IS") + " " + valueStr + _self.config.tempUnit;
							}
						} else if(this.type.startsWith('hum')) {
							// humidity
							let valueStr = Number(value).toLocaleString(_self.config.locale, {minimumFractionDigits: 0, maximumFractionDigits: 0});

							if(this.type.startsWith('hum_') && typeof(this.threshold) === 'number') {
								if(this.type === 'hum_warn_high' && value >= this.threshold) {
									text_is = _self.translate("IS_TOO_HIGH") + " (" + valueStr + _self.config.humUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else if(this.type === 'hum_warn_low' && value <= this.threshold) {
									text_is = _self.translate("IS_TOO_LOW") + " (" + valueStr + _self.config.humUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else {
									text_is = _self.translate("IS_OK") + " (" + valueStr + _self.config.humUnit + ")";
								}
							} else {
								text_is = _self.translate("IS") + " " + valueStr + _self.config.humUnit;
							}
						} else if(this.type.startsWith('shutter')) {
							// shutter
							value = value*100;
							let valueStr = Number(value).toLocaleString(_self.config.locale, {minimumFractionDigits: 0, maximumFractionDigits: 0});;
							
							if(this.type.startsWith('shutter_') && typeof(this.threshold) === 'number') {
								if(this.type === 'shutter_warn_high' && value >= this.threshold) {
									text_is = _self.translate("IS_TOO_HIGH") + " (" + valueStr + _self.config.shutterUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else if(this.type === 'shutter_warn_low' && value <= this.threshold) {
									text_is = _self.translate("IS_TOO_LOW") + " (" + valueStr + _self.config.shutterUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else {
									text_is = _self.translate("IS_OK") + " (" + valueStr + _self.config.shutterUnit + ")";
								}
							} else {
								text_is = _self.translate("IS") + " " + valueStr + _self.config.shutterUnit;
							} 
						
						// Switch and energie
						// @spitzlbergerj, 20190206

						} else if(this.type.startsWith('switch')) {
							// switch
							if(value === "false") {
								text_is = _self.translate("IS_OFF");
								if(this.type === 'switch_warn_off') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_ON");
								if(this.type === 'switch_warn_on') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('energie')) {
							// energie
							let valueStr = Number(value).toLocaleString(_self.config.locale, {minimumFractionDigits: this.precision, maximumFractionDigits: this.precision});;
							let valueUnit = '';
							
							if (this.type.startsWith('energie_a')) {
								valueUnit = _self.config.ampUnit;
							} else if (this.type.startsWith('energie_v')) {
								valueUnit = _self.config.voltUnit;
							} else if (this.type.startsWith('energie_p')) {
								valueUnit = _self.config.pwrUnit;
							} else if (this.type.startsWith('energie_e')) {
								valueUnit = _self.config.energyUnit;
							} else if (this.type.startsWith('energie_ek')) {
								valueUnit = _self.config.energyUnitK;
							} else if (this.type.startsWith('energie_f')) {
								valueUnit = _self.config.freqUnit;
							}
							
							if( ( this.type.endsWith('_high') || this.type.endsWith('_low') ) && typeof(this.threshold) === 'number') {
								if(this.type.endsWith('_high') && value >= this.threshold) {
									text_is = _self.translate("IS_TOO_HIGH") + " (" + valueStr + valueUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else if(this.type.endsWith('_low') && value <= this.threshold) {
									text_is = _self.translate("IS_TOO_LOW") + " (" + valueStr + valueUnit + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else {
									text_is = valueStr + valueUnit;
								}
							} else {
								text_is = valueStr + valueUnit;
							}
							
						} else if(this.type.startsWith('other')) {
							// other value/sensor
							let valueStr = value;
							if(typeof(this.precision) === 'number') {
								valueStr = Number(value).toLocaleString(_self.config.locale, {minimumFractionDigits: this.precision, maximumFractionDigits: this.precision});;
							}
							
							if(this.type.startsWith('other_') && typeof(this.threshold) === 'number') {
								if(this.type === 'other_warn_high' && value >= this.threshold) {
									text_is = _self.translate("IS_TOO_HIGH") + " (" + valueStr + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else if(this.type === 'other_warn_low' && value <= this.threshold) {
									text_is = _self.translate("IS_TOO_LOW") + " (" + valueStr + ")";
									text_class = warn_class;
									icon_color = warn_color;
								} else {
								text_is = _self.translate("IS_OK") + " (" + valueStr + ")";
								}
							} else {
								// Introduction numberUnit
								// @spitzlbergerj, 20190624
								text_is = _self.translate("IS") + " " + valueStr + " " + numberUnit;
							}
						} 
						
						// SysVars
						// @spitzlbergerj, 20190127

						else if(this.type.startsWith('sysvar_boolean')) {
							// SysVar boolean
							if(value === "false") {
								text_is = _self.translate("IS_FALSE");
								if(this.type === 'sysvar_boolean_warn_false') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_TRUE");
								if(this.type === 'sysvar_boolean_warn_true') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('sysvar_alarm')) {
							// SysVar alarm
							if(value === "false") {
								text_is = _self.translate("IS_NOT_TRIGGERED");
								if(this.type === 'sysvar_alarm_warn_not_triggered') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_TRIGGERED");
								if(this.type === 'sysvar_alarm_warn_triggered') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('sysvar_mashine')) {
							// SysVar Boolean; Special type machine that can run or not run
							if(value === "false") {
								text_is = _self.translate("IS_NOT_RUNNING");
								if(this.type === 'sysvar_mashine_warn_not_running') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_RUNNING");
								if(this.type === 'sysvar_mashine_warn_running') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('sysvar_presence')) {
							// SysVar boolean, special type presence that can accept the values here or not here 
							if(value === "false") {
								text_is = _self.translate("IS_AWAY");
								if(this.type === 'sysvar_presence_warn_away') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							} else {
								text_is = _self.translate("IS_HERE");
								if(this.type === 'sysvar_presence_warn_here') {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('sysvar_string')) {
							// SysVar String Value
							text_is = value;
							if(this.type === 'sysvar_string_warn_empty' && (value === '' || value === '???')) {
								text_class = warn_class;
								icon_color = warn_color;
							} else if (this.type === 'sysvar_string_warn_not_empty' && (value !== '' && value !== '???')) {
								text_class = warn_class;
								icon_color = warn_color;
							}
						} else if(this.type.startsWith('sysvar_valuelist')) {
							// SysVar value list
							text_is = _self.translate("IS") + " " + value;
							
							if(this.type.startsWith('sysvar_valuelist_') && typeof(this.reference) !== 'undefined') {
								if(this.type === 'sysvar_valuelist_warn_equals' && (value === this.reference)) {
									text_class = warn_class;
									icon_color = warn_color;
								} else if (this.type === 'sysvar_valuelist_warn_not_equals' && (value !== this.reference)) {
									text_class = warn_class;
									icon_color = warn_color;
								}
							}
						} else if(this.type.startsWith('sysvar_number')) {
							// SysVar number
							let valnum = 0;
							let valdec = 0;
							let valwarn = 0;
							if(typeof(this.precision) === 'number') {
								valdec = this.precision;
							}
							if (typeof(this.threshold) === 'number') {
								valwarn = this.threshold;
							}
							valnum = parseFloat(value).toLocaleString(_self.config.locale, {minimumFractionDigits: valdec, maximumFractionDigits: valdec});

							// Introduction numberUnit
							// @spitzlbergerj, 20190624
							text_is = valnum.toString() + " " + numberUnit;

							if(this.type === 'sysvar_number_warn_low' && valnum <= valwarn) {
								text_class = warn_class;
								icon_color = warn_color;
							}
							if(this.type === 'sysvar_number_warn_high' && valnum >= valwarn) {
								text_class = warn_class;
								icon_color = warn_color;
							}
						}
						
						if(typeof(this.icon) === 'string') {
							// show icon
							let icon_url;
							
							if((typeof(this.iconSize) === 'string')) {
								icon_size = this.iconSize;
							}
							if((typeof(this.iconPosition) === 'string')) {
								icon_position = this.iconPosition;
							}
								
							icon_class = " icon icon-" + icon_size + " " + icon_color + '-icon ';
							if(icon_position !== 'top') {
								text_with_icon_class = " text-with-icon text-with-icon-" + icon_size + " text-with-icon-" + icon_position;
							}

							if(this.icon.startsWith('default_')){
								// integrated icon
								icon_url = _self.data.path + "icons/" + this.icon.substr(8) + ".png";
							} else {
								// external icon url
								icon_url = this.icon;
							}
							icon_html = $("<div/>",{id: _self.identifier + "-" + _self.removeSpecialChars(this.name) + "-icon",class: text_class + icon_class,style: "background-image: url(" + icon_url + ");"});
							
							if(icon_position !== 'right') {
								wrapper.append(icon_html);
							}
						}
						
						if((typeof(this.iconOnly) !== 'string') || (this.iconOnly !== 'true')) {
							let textHtml = $("<div/>",{id: _self.identifier + "-" + _self.removeSpecialChars(this.name),class: text_class + text_with_icon_class});
							textHtml.html(this.name + " " + text_is);
							wrapper.append(textHtml);
						}

						if(typeof(this.icon) === 'string') {
							if(icon_position === 'right') {
								wrapper.append(icon_html);
							}
							if(icon_position !== 'top') {
								wrapper.append($("<br/>",{class: text_class}));
							}
						}
					}
				});
			}
		} else {
			let textHtml = $("<div/>",{id: _self.identifier + "-loading"});
			textHtml.html("Loading ...");
			wrapper.append(textHtml);
		}
		return wrapper[0];
	},

	// update data from homematic
	updateHomematicData: function(){
		let _self = this;
		let datapointServiceUrl = this.config.ccuProtocol + this.config.ccuHost + this.config.ccuXmlApiUrl + this.config.ccuStateServiceUrl + this.config.ccuDatapointIdParameter;
		let sysvarServiceUrl = this.config.ccuProtocol + this.config.ccuHost + this.config.ccuXmlApiUrl + this.config.ccuSysvarServiceUrl + this.config.ccuIseIdParameter;

		if(typeof(this.config.datapoints) === 'object') {
			_self.dataCounter = 0;
			_self.dataMax = this.config.datapoints.length;

			$.each(this.config.datapoints,function(){
				let _that = this;
				if(typeof(this.name) === 'string' && typeof(this.id) === 'string' && typeof(this.type) === 'string') {
					if(this.type.startsWith('sysvar_valuelist')) {
						$.get(sysvarServiceUrl + this.id, function(data) {
							let idx = data.childNodes[0].childNodes[0].attributes.value.value;
							let value = data.childNodes[0].childNodes[0].attributes.value_list.value.split(";")[idx];
							_self.homematicDataRecieved(value,_that);
						}).fail(function() {
							_self.communicationError();
						});
					} else {
						$.get(datapointServiceUrl + this.id, function(data) {
							let value = data.childNodes[0].childNodes[0].attributes.value.value;
							_self.homematicDataRecieved(value,_that);
						}).fail(function() {
							_self.communicationError();
						});
					}
				}
			});
		}
	},

	// on homematic data recieved
	homematicDataRecieved: function (data, datapoint) {
		if (this.config.debug) {
			console.log('homematic data', data);
		}
		if(typeof(this.homematicData) === 'undefined') {
			this.homematicData = [];
		}
		this.homematicData[this.removeSpecialChars(datapoint.name)] = data;
		this.dataCounter++;
		if(this.dataCounter >= this.dataMax) {
			this.updateDom(this.config.animationSpeed);
			this.scheduleUpdate();
		}
	},

	// on error getting homematic data
	communicationError: function () {
		if (this.config.debug) {
			console.log('error reading homeatic data');
		}
		this.dataCounter++;
		if(this.dataCounter >= this.dataMax) {
			// try again
			this.scheduleUpdate();
		}
	},

	// schedules next update
	scheduleUpdate: function(delay) {
		let _self = this;
		let nextLoad = this.config.updateInterval;

		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		setTimeout(function() {
			_self.updateHomematicData();
		}, nextLoad * 1000);
	},

	// removes special chars and whitespaces
	removeSpecialChars: function(text) {
		return text.replace(/[^\w]/gi, '');
	},

});
