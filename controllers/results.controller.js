'use strict';

var _ 		= require('underscore');
var ss 		= require('simple-statistics');


var ResultsController = function() {
	var _this 	= this;

	_this.calculateResults 	= calculateResults;
	_this.calculateFlow		= calculateFlow;
	
	// do fancy math and return package of results data
	function calculateResults(table) {
		var lnData 	= ln(table);
		var uz 		= _.unzip(lnData);
		var x 		= uz[0];
		var y 		= uz[1];

		var lr 		= linearRegression(lnData);
		var c 		= flowCoeff(x, y, lr.m);
		var powData = powerData(table, c, lr.m);

		var results = {
			n 	: lr.m,
			c 	: c,
			r2	: lr.r2,
			pDat: powData,
			f 	: c*Math.pow(data.ref,lr.m),
			nr	: Math.round(100*(c*Math.pow(data.ref,lr.m) / data.envArea)) / 100
		};

		return results;
	}

	function calculateFlow(eDP, fDP, coeffs) {
		return Math.round(Math.pow((fDP - Math.abs(eDP)*coeffs['K1']), coeffs['N']) * (coeffs['K'] + coeffs['K3'] * fDP));
	}

	// performs log-log transform of data
	function ln(data) {
		return _.map(data, function(a){return [Math.log(a[0]), Math.log(a[1])]});
	}

	// return m,b and r^2 of linear regression
	function linearRegression(data) {
		var coefficients = ss.linearRegression(data);
		var line 		 = ss.linearRegressionLine(coefficients);
		var rSquared 	 = ss.rSquared(data, line);

		return {
			m: coefficients.m,
			b: coefficients.b,
			r2: rSquared
		};
	}

	// calculate flow coefficient
	function flowCoeff(x, y, n){
		var x_bar = ss.mean(x);
		var y_bar = ss.mean(y);

		return Math.exp(y_bar - n * x_bar);
	}

	// calculate power law trend data
	function powerData(data, c, n) {
		return _.map(data, function(d){return [d[0], c * Math.pow(d[0], n)]});
	}
}

module.exports = ResultsController;


