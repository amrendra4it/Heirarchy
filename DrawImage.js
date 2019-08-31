// Define the `phonecatApp` module
var phonecatApp = angular.module('phonecatApp', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
phonecatApp.controller('PhoneListController', function PhoneListController($scope) {

	var settings = {};
	settings.zoomlevel = 1.0;
	$scope.rectangle = [];
	var nestedCount = [];
	var heirarchyArray = [];
	var maxLength = 0;
	$scope.totalWidth = 0;
	var totalWidth = 0;
	$scope.totalHeight = 0;
	$scope.zoomlevel = 1.0;
	settings.shapeType = "square";
	settings.fillType = "gradient";
	gradient = null;
	settings.lineWidth = 5;
	settings.blockSize = 100;
	settings.blockGap = 10;
	settings.verticalGap = 200;
	$scope.treeSettings = settings;
	$scope.autosize = true;
	$scope.renderType = "svg";
	$scope.dataToDraw = [{
		"text": "Building1", "hoverDetails": {
			"Total No of units": 1202,
			"Total No of Residential Units": 12,
			"Year Built": 1998
		}, childs: [
			{
				"text": "Shelter Building122", childs: [
					{ "text": "Unit1" }
				]
			},
			{
				"text": "Shelter Building2", childs: [
					{ "text": "Unit2" },
					{ "text": "Unit3" ,
				childs:[{

					"text":"sdfsdfd"
				}]}
				]
			},
			{
				"text": "Shelter Building3", childs: [
					{ "text": "Unit4" },
					{ "text": "Unit5" },
					{ "text": "Unit6" },
					{ "text": "Unit7" },
					{ "text": "Unit8" },
					{ "text": "Unit9" },
					{ "text": "Unit10" },
					{ "text": "Unit11" },
					{ "text": "Unit12" },
					{ "text": "Unit14" },
					{ "text": "Unit13" },
					{ "text": "Unit15" }
				]
			}
		]
	}];

	$scope.zoomIn = function () {

		zoomInOut(0.1);
	}
	$scope.zoomOut = function () {
		zoomInOut(-0.1);
	}

	var zoomInOut = function (range) {
		$scope.treeSettings.zoomlevel = $scope.treeSettings.zoomlevel + range;
		//drawChild();
	}

	$scope.reDraw = function () {

		$scope.treeSettings.zoomlevel = 1.0
		$scope.treeSettings.shapeType = "square";
		$scope.treeSettings.fillType = "gradient";
		$scope.treeSettings.blockSize = 100;
		//drawChild();
	}

	$scope.squareBuilding = function () {
		$scope.treeSettings.shapeType = "square";
		//drawChild();
	}
	$scope.circleBuilding = function () {
		$scope.treeSettings.shapeType = "circle";
		//drawChild();
	}


	$scope.setGradient = function () {
		$scope.treeSettings.fillType = "gradient";
		//drawChild();
	}

	$scope.setColor = function () {
		$scope.treeSettings.fillType = "color";
		//drawChild();
	}

	$scope.setblockSize = function (multiplier) {
		$scope.treeSettings.blockSize = 100 * multiplier;
		//setImageTotalWidth();
		//drawChild();
	}

	$scope.setLineWidth = function (width) {
		lineWidth = width;
		//drawChild();
	}

	$scope.setBoxShadow = function (isShadow, shadowBlur) {
		$scope.treeSettings.isShadow = isShadow;
		$scope.treeSettings.shadowBlur = shadowBlur;

	}
	$scope.setLineCurve = function (curveValue) {
		$scope.treeSettings.lineCurve = curveValue;
	}
	$scope.setfont = function (fontSize) {
		$scope.treeSettings.font = fontSize;
	}
	$scope.setAutoSize = function (autoSize) {
		$scope.autosize = autoSize;
	}
	//drawSVG(dataToDraw);

});

