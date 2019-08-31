// Define the `phonecatApp` module
var phonecatApp = angular.module('phonecatApp', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
phonecatApp.controller('PhoneListController', function PhoneListController($scope) {
	$scope.rectangle = [];
	var nestedCount = [];
	var heirarchyArray = [];
	var maxLength = 0;
	$scope.totalWidth = 0;
	var totalWidth = 0;
	$scope.totalHeight = 0;
	$scope.zoomlevel = 1.0;
	$scope.shapeType = "square";
	$scope.fillType = "gradient";
	gradient = null;
	lineWidth=5;
	$scope.blockSize = 100;
	blockGap = 10;
	verticalGap = 50;

	var dataToDraw = [{
		"text": "Building1", childs: [
			{
				"text": "Shelter Building1", childs: [
					{ "text": "Unit1" }
				]
			},
			{
				"text": "Shelter Building2", childs: [
					{ "text": "Unit2" },
					{ "text": "Unit3" }
				]
			}
		]
	}];
	function drawSVG(dataSource) {
		nestedCount = [];
		maxLength = 0;
		if (dataSource && dataSource.length > 0) {
			nestedCount.push(dataSource.length);
			heirarchyArray.push([]);
			for (var i = 0; i < dataSource.length; i++) {
				var heirarchyElement = {
					"parent": null,
					"text": dataSource[i].text,
					"id": "0-" + i
				};
				heirarchyArray[0].push(heirarchyElement);
				getChildCountLevelWise(dataSource[i], 1, "0-" + i);
			}
		}
		setImageTotalWidth();
		//totalWidth = (maxLength * $scope.blockSize) + ((maxLength + 1) * blockGap);
		drawChild();
	}

	function getChildCountLevelWise(nestedSource, level, parent) {
		if (nestedSource && nestedSource.childs && nestedSource.childs.length) {
			if (nestedCount.length >= level + 1) {
				nestedCount[level] += nestedSource.childs.length;
				if (nestedCount[level] > maxLength) {
					maxLength = nestedCount[level];
				}
			} else {
				nestedCount[level] = nestedSource.childs.length;
				heirarchyArray.push([]);
			}

			for (var i = 0; i < nestedSource.childs.length; i++) {
				var heirarchyElement = {
					"parent": parent,
					"text": nestedSource.childs[i].text
				};
				heirarchyArray[level].push(heirarchyElement);
				getChildCountLevelWise(nestedSource.childs[i], level + 1, level + "-" + (heirarchyArray[level].length - 1));
			}


		}

	}
	// function drawChild() {
	// 	for (var heirarchyLevel = 0; heirarchyLevel < maxLength; heirarchyLevel++) {

	// 		console.log("TOP:" + ((heirarchyLevel * 100) + (heirarchyLevel * 50)));
	// 		var margin = (totalWidth - (100 * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
	// 		for (var heirarchyControl = 0; heirarchyControl < nestedCount[heirarchyLevel]; heirarchyControl++) {
	// 			$scope.rectangle.push({
	// 				"x": ((margin * (heirarchyControl + 1)) + (100 * heirarchyControl)),
	// 				"y": ((heirarchyLevel * 100) + (heirarchyLevel * 50)),
	// 				"margin": margin
	// 			});

	// 			console.log("Left:" + ((heirarchyControl * (margin + 1)) + (100 * heirarchyControl)));
	// 		}
	// 	}
	// 	if (maxLength >= 1) {
	// 		$scope.totalHeight = ((maxLength * 100) + (maxLength * 50));
	// 		$scope.totalWidth = totalWidth;
	// 	}

	// }

	function drawChild() {
		var canvas = document.getElementById("canvasHeirarchy");
		var ctx = canvas.getContext('2d');
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		var lingrad = ctx.createLinearGradient(0, 0, 0, 150);
		lingrad.addColorStop(0, '#00ABEB');
		lingrad.addColorStop(0.5, '#fff');
		lingrad.addColorStop(0.5, '#26C000');
		lingrad.addColorStop(1, '#fff');
		var radgrad4 = ctx.createRadialGradient(0, 150, 50, 0, 140, 90);
		radgrad4.addColorStop(0, '#F4F201');
		radgrad4.addColorStop(0.8, '#E4C700');
		radgrad4.addColorStop(1, 'rgba(228, 199, 0, 0)');

		ctx.scale($scope.zoomlevel, $scope.zoomlevel);
		if (heirarchyArray && heirarchyArray.length && heirarchyArray.length > 0) {
			for (var heirarchyLevel = 0; heirarchyLevel < heirarchyArray.length; heirarchyLevel++) {

				var margin = (totalWidth - ($scope.blockSize * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
				for (var heirarchyControl = 0; heirarchyControl < nestedCount[heirarchyLevel]; heirarchyControl++) {
					var xAxis = ((margin * (heirarchyControl + 1)) + ($scope.blockSize * heirarchyControl));
					var yAxis = ((heirarchyLevel * $scope.blockSize) + (heirarchyLevel * verticalGap))
					//ctx.strokeRect(xAxis, yAxis, 100, 100);
					//ctx.fillStyle = "red";
					ctx.fillStyle = lingrad;
					//ctx.fillStyle = radgrad4;
					drawBuilding(xAxis, yAxis, $scope.blockSize, $scope.blockSize, ctx);
					// ctx.fillRect(xAxis, yAxis, 100, 100);
					ctx.textBaseline = "middle"
					ctx.textAlign = "center";
					ctx.strokeText(heirarchyArray[heirarchyLevel][heirarchyControl].text, xAxis + ($scope.blockSize / 2), yAxis + ($scope.blockSize / 2), $scope.blockSize);
					drawArrow(ctx, heirarchyLevel, heirarchyControl, heirarchyArray[heirarchyLevel][heirarchyControl].parent)

					//console.log("x is " + xAxis + ": y is" + yAxis);
					// $scope.rectangle.push({
					// 	"x": xAxis,
					// 	"y": yAxis,
					// 	"text": heirarchyArray[heirarchyLevel][heirarchyControl].text,
					// 	"textY": yAxis,
					// 	//d="M10,30 H190 M10,60 H190 M10,90 H190 M10,120 H190"
					// 	"pathd": "M" + (xAxis + 10) + "," + (yAxis + 30) + " H" + (xAxis + 100) + "M" + (xAxis + 10) + "," + (yAxis + 60) + "H" + (xAxis + 100) + "M" + (xAxis + 10) + "," + (yAxis + 90) + "H100",
					// 	"parent": heirarchyArray[heirarchyLevel][heirarchyControl].parent,
					// 	"blockId": "block" + (heirarchyLevel) + "-" + (heirarchyControl),
					// 	"textId": "text" + (heirarchyLevel) + "-" + (heirarchyControl),
					// 	"pathId": "path" + (heirarchyLevel) + "-" + (heirarchyControl)

					// });

					//console.log("Left:" + ((heirarchyControl * (margin + 1)) + (100 * heirarchyControl)));
				}
			}
			if (maxLength >= 1) {
				$scope.totalHeight = ((maxLength * $scope.blockSize) + (maxLength * verticalGap));
				$scope.totalWidth = totalWidth;
			}


		}

	}

	function setImageTotalWidth() {
		totalWidth = (maxLength * $scope.blockSize) + ((maxLength + 1) * blockGap);

	}
	function drawBuilding(x, y, height, width, ctx) {
		switch ($scope.shapeType) {
			case "circle":
				ctx.beginPath();
				ctx.arc(x + (width / 2), y + (height / 2), height / 2, 0, Math.PI * 2);
				fillColor(ctx);
				ctx.fill();
				ctx.closePath();
				break;

			default:
				fillColor(ctx);
				ctx.fillRect(x, y, height, width);

				break;
		}

	}

	function fillColor(ctx) {

		switch ($scope.fillType) {
			case "gradient":


				// Fill with gradient
				ctx.fillStyle = gradient;
				// Create gradient
				gradient = ctx.createLinearGradient(0.000, 150.000, 300.000, 150.000);
				// Add colors
				gradient.addColorStop(0.044, 'rgba(69, 62, 214, 1.000)');
				gradient.addColorStop(0.495, 'rgba(5, 104, 252, 1.000)');
				gradient.addColorStop(0.976, 'rgba(11, 2, 170, 1.000)');
				// gradient = ctx.createLinearGradient(0, 0, 0, 150);
				// gradient.addColorStop(0, '#00ABEB');
				// gradient.addColorStop(0.5, '#fff');
				// gradient.addColorStop(0.5, '#26C000');
				// gradient.addColorStop(1, '#fff');
				ctx.fillStyle = gradient;
				break;
			default:
				ctx.fillStyle = "red";
				break;
		}
	}

	function drawArrow(ctx, heirarchyLevel, heirarchyElement, parent) {
		if (parent) {
			var res = parent.split("-");
			if (res && res.length == 2) {
				var parentHeirarchyLevel = res[0];
				var parentHeirarchyElement = 0;
				if (!isNaN(res[1])) {
					parentHeirarchyElement = parseInt(res[1]);
				}
				var margin = (totalWidth - ($scope.blockSize * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
				var marginParent = (totalWidth - ($scope.blockSize * nestedCount[parentHeirarchyLevel])) / (nestedCount[parentHeirarchyLevel] + 1)
				var parentXAxis = ((marginParent * (parentHeirarchyElement + 1)) + ($scope.blockSize * parentHeirarchyElement));
				var parentYAxis = ((parentHeirarchyLevel * $scope.blockSize) + (parentHeirarchyLevel * verticalGap))
				var xAxis = ((margin * (heirarchyElement + 1)) + ($scope.blockSize * heirarchyElement));
				var yAxis = ((heirarchyLevel * $scope.blockSize) + (heirarchyLevel * verticalGap))
				//var parentConnectionLine = new Path2D();
				ctx.beginPath();
				ctx.moveTo(Math.floor(parentXAxis + ($scope.blockSize / 2)), parentYAxis + $scope.blockSize);
				//ctx.lineWidth=lineWidth;
				ctx.lineTo(Math.floor(parentXAxis + ($scope.blockSize / 2)), parentYAxis + $scope.blockSize + (verticalGap / 2));
				ctx.moveTo(Math.floor(xAxis + ($scope.blockSize / 2)), yAxis);
				ctx.lineTo(Math.floor(xAxis + ($scope.blockSize / 2)), yAxis - (verticalGap / 2));
				ctx.moveTo(Math.floor(xAxis + ($scope.blockSize / 2)), yAxis - (verticalGap / 2));
				ctx.lineTo(Math.floor(parentXAxis + ($scope.blockSize / 2)), parentYAxis + $scope.blockSize + (verticalGap / 2));
				//ctx.stroke(parentConnectionLine);
				ctx.closePath();
				// ctx.moveTo(0, 0);
				// ctx.fill();
				ctx.stroke();
				//console.log("marginParent is" + marginParent +  "parent is " + parent + "parentHeirarchyElement :" + parentHeirarchyElement + " parent x is " + Math.floor(parentXAxis + 50) + ": parent y is" + (parentYAxis + 50) + "totalWidth : " + totalWidth);
				//console.log("nestedCount is " + JSON.stringify(nestedCount));
			}


		}
	}
	$scope.zoomIn = function () {
		zoomInOut(0.1);
	}
	$scope.zoomOut = function () {
		zoomInOut(-0.1);
	}

	var zoomInOut = function (range) {
		$scope.zoomlevel = $scope.zoomlevel + range;

		drawChild();
	}

	$scope.reDraw = function () {
		$scope.zoomlevel = 1.0
		$scope.shapeType = "square";
		$scope.fillType = "gradient";
		$scope.blockSize = 100;
		drawChild();
	}

	$scope.squareBuilding = function () {
		$scope.shapeType = "square";
		drawChild();
	}
	$scope.circleBuilding = function () {
		$scope.shapeType = "circle";
		drawChild();
	}


	$scope.setGradient = function () {
		$scope.fillType = "gradient";
		drawChild();
	}

	$scope.setColor = function () {
		$scope.fillType = "color";
		drawChild();
	}

	$scope.setblockSize = function (multiplier) {
		$scope.blockSize = 100 * multiplier;
		setImageTotalWidth();
		drawChild();
	}

	$scope.setLineWidth = function (width) {
		lineWidth = width;
		drawChild();
	}
	drawSVG(dataToDraw);

});

