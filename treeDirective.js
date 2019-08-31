phonecatApp.directive('treeDesign', function () {
    return {
        restrict: 'E',
        // transclude: true,
        scope: {
            dataSource: "=datasource",
            treeSettings: "=treesettings",
            autoSize: "=autosize",
            renderType: "=rendertype"
        },
        templateUrl: 'template-tree.html',
        // link: function (scope, element, attrs) {

        // },
        link: function (scope, element, attrs) {
            var nestedCount = [];
            var heirarchyArray = [];
            var maxLength = 0;
            //$scope.totalWidth = 0;
            var totalWidth = 0;
            totalHeight = 0;
            //zoomlevel = 1.0;
            //$scope.shapeType = "square";
            //$scope.fillType = "gradient";
            //gradient = null;
            //lineWidth=5;
            //$scope.blockSize = 100;
            //blockGap = 10;
            //verticalGap = 50;

            var innerSeetings;
            var drawingsPositions = {};
            scope.selectedBuilding = "";
            scope.toolTipHoverDetails = {};
            scope.rectangle = [];
            scope.svgAttribute = {};
            scope.drawHeirarchy = function () {
                nestedCount = [];
                maxLength = 0;
                heirarchyArray = [];
                scope.settings = scope.treeSettings;
                if (scope.dataSource && scope.dataSource.length > 0) {
                    nestedCount.push(scope.dataSource.length);
                    heirarchyArray.push([]);
                    for (var i = 0; i < scope.dataSource.length; i++) {
                        var heirarchyElement = {
                            "parent": null,
                            "text": scope.dataSource[i].text,
                            "id": "0-" + i,
                            "maxChildCount": getChildCountLevelWise(scope.dataSource[i], 1, "0-" + i),
                            "hoverDetails": scope.dataSource[i].hoverDetails
                        };

                        heirarchyArray[0].push(heirarchyElement);
                    }
                    setImageTotalWidth();
                }

                //totalWidth = (maxLength * blockSize) + ((maxLength + 1) * blockGap);
                if (scope.settings && scope.renderType !== "svg") {
                    drawChild();
                }
                else if (scope.settings) {

                    drawSvgNode();
                }
            }

            function getChildCountLevelWise(nestedSource, level, parent) {
                var maxChildCount = 0
                var maxChildCountTillThis = 0
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
                        var currentChildCount = getChildCountLevelWise(nestedSource.childs[i], level + 1, level + "-" + (heirarchyArray[level].length));
                        maxChildCount += currentChildCount;

                        var heirarchyElement = {
                            "parent": parent,
                            "text": nestedSource.childs[i].text,
                            "id": level + "-" + (heirarchyArray[level].length),
                            "maxChildCount": currentChildCount,
                            "maxChildCountTillThis": maxChildCountTillThis,
                            "hoverDetails": nestedSource.childs[i].hoverDetails
                        };
                        maxChildCountTillThis += currentChildCount;
                        heirarchyArray[level].push(heirarchyElement);

                    }
                    return maxChildCount;

                }
                else {
                    return 1;

                }
            }
            function drawSvgNode() {
                scope.rectangle = [];
                drawingsPositions = [];
                for (var heirarchyLevel = 0; heirarchyLevel < maxLength; heirarchyLevel++) {

                    //console.log("TOP:" + ((heirarchyLevel * 100) + (heirarchyLevel * 50)));
                    var margin = (totalWidth - (100 * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
                    for (var heirarchyControl = 0; heirarchyControl < nestedCount[heirarchyLevel]; heirarchyControl++) {
                        var xAxis = 0;//((margin * (heirarchyControl + 1)) + (scope.settings.blockSize * heirarchyControl));
                        var yAxis = ((heirarchyLevel * scope.settings.blockSize) + (heirarchyLevel * scope.settings.verticalGap))
                        margin = 15;
                        var previousControlDrawingPosition = {};
                        var previousControlMaxXAxis = 0;
                        if (heirarchyControl != 0) {

                            previousControlDrawingPosition = drawingsPositions[heirarchyLevel + '-' + (heirarchyControl - 1)];
                            if (previousControlDrawingPosition && previousControlDrawingPosition.maxXAxis) {
                                previousControlMaxXAxis = previousControlDrawingPosition.maxXAxis;
                            }

                        }
                        currentContolDrawingPosition = {
                            maxXAxis: previousControlMaxXAxis + ((margin + scope.settings.blockSize) * heirarchyArray[heirarchyLevel][heirarchyControl].maxChildCount)
                        };
                        if (scope.svgAttribute.maxXAxis) {
                            if (scope.svgAttribute.maxXAxis < currentContolDrawingPosition.maxXAxis) {
                                scope.svgAttribute.maxXAxis = currentContolDrawingPosition.maxXAxis;
                            }
                            if (scope.svgAttribute.maxYAxis < yAxis + scope.settings.blockSize) {
                                scope.svgAttribute.maxYAxis = yAxis + scope.settings.blockSize
                            }
                        }
                        else {
                            scope.svgAttribute.maxXAxis = currentContolDrawingPosition.maxXAxis;
                            scope.svgAttribute.maxYAxis = yAxis + scope.settings.blockSize
                        }


                        xAxis = previousControlMaxXAxis + ((currentContolDrawingPosition.maxXAxis - previousControlMaxXAxis) / 2) - (scope.settings.blockSize / 2);
                        currentContolDrawingPosition.xAxis = xAxis;
                        currentContolDrawingPosition.yAxis = yAxis;

                        drawingsPositions[heirarchyLevel + '-' + (heirarchyControl)] = currentContolDrawingPosition;
                        scope.rectangle.push({
                            "x": xAxis, //((margin * (heirarchyControl + 1)) + (100 * heirarchyControl)),
                            "y": yAxis, //((heirarchyLevel * 100) + (heirarchyLevel * 50)),
                            "margin": margin,
                            "pathd": "M" + (xAxis + 10) + "," + (yAxis + 30) + " H" + (xAxis + scope.settings.blockSize - 10) + "M" + (xAxis + 10) + "," + (yAxis + 60) + "H" + (xAxis + scope.settings.blockSize - 10) + "M" + (xAxis + 10) + "," + (yAxis + scope.settings.blockSize - 10) + "H100",
                            "parent": heirarchyArray[heirarchyLevel][heirarchyControl].parent,
                            "blockId": "block" + (heirarchyLevel) + "-" + (heirarchyControl),
                            "textId": "text" + (heirarchyLevel) + "-" + (heirarchyControl),
                            "pathId": "path" + (heirarchyLevel) + "-" + (heirarchyControl),
                            "textRefPathId": "#path" + (heirarchyLevel) + "-" + (heirarchyControl),
                            "parentArrowd": drawSVGArrow(heirarchyLevel, heirarchyControl, heirarchyArray[heirarchyLevel][heirarchyControl].parent, currentContolDrawingPosition),
                            "parentArrowId": "conp" + (heirarchyLevel) + "-" + (heirarchyControl),
                            "text": heirarchyArray[heirarchyLevel][heirarchyControl].text,
                            "hoverDetails": heirarchyArray[heirarchyLevel][heirarchyControl].hoverDetails,
                            "centerX":xAxis + ((scope.settings.blockSize)/2),
                            "centerY":yAxis + ((scope.settings.blockSize)/2),
                            "radius" :((scope.settings.blockSize)/2)
                        });

                        //console.log(drawSVGArrow(heirarchyLevel, heirarchyControl, heirarchyArray[heirarchyLevel][heirarchyControl].parent));
                    }
                }
                if (maxLength >= 1) {
                    scope.totalHeight = ((maxLength * 100) + (maxLength * 50));
                    scope.totalWidth = totalWidth;
                }
                scope.svgAttribute.viewBox = "0 0 " + scope.svgAttribute.maxXAxis + " " + scope.svgAttribute.maxYAxis;


            }
            function drawSVGArrow(heirarchyLevel, heirarchyElement, parent) {
                if (parent) {

                    var res = parent.split("-");
                    if (res && res.length == 2) {
                        var parentHeirarchyLevel = res[0];
                        var parentHeirarchyElement = 0;
                        if (!isNaN(res[1])) {
                            parentHeirarchyElement = parseInt(res[1]);
                        }
                        // var margin = (totalWidth - (scope.settings.blockSize * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
                        // var marginParent = (totalWidth - (scope.settings.blockSize * nestedCount[parentHeirarchyLevel])) / (nestedCount[parentHeirarchyLevel] + 1)
                        // var parentXAxis = ((marginParent * (parentHeirarchyElement + 1)) + (scope.settings.blockSize * parentHeirarchyElement));
                        // var parentYAxis = ((parentHeirarchyLevel * scope.settings.blockSize) + (parentHeirarchyLevel * scope.settings.verticalGap))
                        // var xAxis = ((margin * (heirarchyElement + 1)) + (scope.settings.blockSize * heirarchyElement));
                        // var yAxis = ((heirarchyLevel * scope.settings.blockSize) + (heirarchyLevel * scope.settings.verticalGap))
                        var xAxis = currentContolDrawingPosition.xAxis;
                        var yAxis = currentContolDrawingPosition.yAxis;

                        var parentXAxis = drawingsPositions[parent].xAxis;
                        var parentYAxis = drawingsPositions[parent].yAxis;
                        // return "M " + (xAxis + (scope.settings.blockSize / 2)) + "," + yAxis + " C"
                        // + (parentXAxis + (scope.settings.blockSize / 2)) + "," +
                        // (parentYAxis + scope.settings.blockSize) +
                        // " " + ((parentXAxis + (scope.settings.blockSize / 2)) - scope.treeSettings.lineCurve) + "," +
                        // (parentYAxis - scope.treeSettings.lineCurve) +
                        // " " + (parentXAxis + (scope.settings.blockSize / 2)) + "," + (parentYAxis + scope.settings.blockSize);

                        if (scope.settings.lineCurve == 0) {
                            return "M " + (xAxis + (scope.settings.blockSize / 2)) + "," + yAxis + " v -"
                                + ((scope.settings.verticalGap) / 2) + " h" + (parentXAxis - xAxis) + " v-" + ((scope.settings.verticalGap) / 2);

                        } else {
                            return "M " + (xAxis + (scope.settings.blockSize / 2)) + "," + yAxis + " C"
                                + (xAxis + (scope.settings.blockSize / 2) - 15) + "," +
                                (yAxis - 15) +
                                " " + ((parentXAxis + (scope.settings.blockSize / 2)) + 15) + "," +
                                ((parentYAxis + scope.settings.blockSize) + 15) +
                                " " + (parentXAxis + (scope.settings.blockSize / 2)) + "," + (parentYAxis + scope.settings.blockSize);

                        }




                    }


                }
            }

            function drawChild() {
                if (scope.autosize) {
                    element.find('canvas')[0].setAttribute("width", totalWidth);
                }
                else {
                    element.find('canvas')[0].setAttribute("width", 1000);
                }
                //var canvas = document.getElementById("canvasHeirarchy");
                var ctx = element.find('canvas')[0].getContext('2d');//element[0].getContext('2d');
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                if (scope.autosize) {
                    ctx.clearRect(0, 0, totalWidth, 1000);
                }
                ctx.clearRect(0, 0, 1000, 1000);
                // canvas.addEventListener('mousemove', function (event) {
                //     if (event.region) {
                //         alert('Building ' + JSON.stringify(event));
                //     }
                // });
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

                ctx.scale(scope.settings.zoomlevel, scope.settings.zoomlevel);
                if (heirarchyArray && heirarchyArray.length && heirarchyArray.length > 0) {
                    for (var heirarchyLevel = 0; heirarchyLevel < heirarchyArray.length; heirarchyLevel++) {

                        var margin = (totalWidth - (scope.settings.blockSize * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
                        for (var heirarchyControl = 0; heirarchyControl < nestedCount[heirarchyLevel]; heirarchyControl++) {
                            var xAxis = ((margin * (heirarchyControl + 1)) + (scope.settings.blockSize * heirarchyControl));
                            var yAxis = ((heirarchyLevel * scope.settings.blockSize) + (heirarchyLevel * scope.settings.verticalGap))
                            //ctx.strokeRect(xAxis, yAxis, 100, 100);
                            //ctx.fillStyle = "red";
                            ctx.fillStyle = lingrad;
                            //ctx.fillStyle = radgrad4;
                            drawBuilding(xAxis, yAxis, scope.settings.blockSize, scope.settings.blockSize, ctx, heirarchyArray[heirarchyLevel][heirarchyControl].id);
                            // ctx.fillRect(xAxis, yAxis, 100, 100);
                            ctx.textBaseline = "middle"
                            ctx.textAlign = "center";
                            if (scope.treeSettings.font) {
                                ctx.font = scope.treeSettings.font;
                            }
                            ctx.setLineDash([]);
                            ctx.strokeText(heirarchyArray[heirarchyLevel][heirarchyControl].text, xAxis + (scope.settings.blockSize / 2), yAxis + (scope.settings.blockSize / 2), scope.settings.blockSize);
                            drawArrow(ctx, heirarchyLevel, heirarchyControl, heirarchyArray[heirarchyLevel][heirarchyControl].parent)

                            //console.log("x is " + xAxis + ": y is" + yAxis);
                            // scope.settings.rectangle.push({
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
                        scope.settings.totalHeight = ((maxLength * scope.settings.blockSize) + (maxLength * scope.settings.verticalGap));
                        scope.settings.totalWidth = totalWidth;
                    }


                }

            }

            function setImageTotalWidth() {
                totalWidth = (maxLength * scope.settings.blockSize) + ((maxLength + 1) * scope.settings.blockGap);

            }
            function drawBuilding(x, y, height, width, ctx, id) {
                switch (scope.settings.shapeType) {
                    case "circle":
                        ctx.beginPath();
                        ctx.arc(x + (width / 2), y + (height / 2), height / 2, 0, Math.PI * 2);
                        fillColor(ctx);
                        ctx.fill();
                        //ctx.addHitRegion({ "id": id });
                        ctx.closePath();
                        break;

                    default:
                        ctx.beginPath();
                        fillColor(ctx);
                        ctx.fillRect(x, y, height, width);
                        //ctx.addHitRegion({ "id": id });
                        ctx.closePath();
                        break;
                }

            }

            function fillColor(ctx) {

                switch (scope.settings.fillType) {
                    case "gradient":


                        // Fill with gradient
                        ctx.fillStyle = gradient;
                        // Create gradient
                        gradient = ctx.createLinearGradient(0.000, 0.000, 1000.000, 1000.000);
                        // Add colors
                        gradient.addColorStop(0.044, 'rgb(255,99,132)');
                        gradient.addColorStop(0.495, 'rgba(11, 2, 170, 1.000)');
                        gradient.addColorStop(0.976, 'rgba(11, 2, 170, 1.000)');
                        // gradient = ctx.createLinearGradient(0, 0, 0, 150);
                        // gradient.addColorStop(0, '#00ABEB');
                        // gradient.addColorStop(0.5, '#fff');
                        // gradient.addColorStop(0.5, '#26C000');
                        // gradient.addColorStop(1, '#fff');
                        ctx.fillStyle = gradient;
                        break;
                    default:
                        ctx.fillStyle = "#FF6384";
                        break;
                }
                if (scope.treeSettings.isShadow) {
                    ctx.shadowColor = '#008cff';
                    ctx.shadowBlur = scope.treeSettings.shadowBlur;
                }
                else {
                    ctx.shadowColor = '#FF6384';
                    ctx.shadowBlur = 0;
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
                        var margin = (totalWidth - (scope.settings.blockSize * nestedCount[heirarchyLevel])) / (nestedCount[heirarchyLevel] + 1)
                        var marginParent = (totalWidth - (scope.settings.blockSize * nestedCount[parentHeirarchyLevel])) / (nestedCount[parentHeirarchyLevel] + 1)
                        var parentXAxis = ((marginParent * (parentHeirarchyElement + 1)) + (scope.settings.blockSize * parentHeirarchyElement));
                        var parentYAxis = ((parentHeirarchyLevel * scope.settings.blockSize) + (parentHeirarchyLevel * scope.settings.verticalGap))
                        var xAxis = ((margin * (heirarchyElement + 1)) + (scope.settings.blockSize * heirarchyElement));
                        var yAxis = ((heirarchyLevel * scope.settings.blockSize) + (heirarchyLevel * scope.settings.verticalGap))
                        //var parentConnectionLine = new Path2D();




                        drawCurveBetweenTwoPoints(xAxis + (scope.settings.blockSize / 2), yAxis, parentXAxis + (scope.settings.blockSize / 2), parentYAxis + scope.settings.blockSize, ctx);

                        //drawCurveBetweenTwoPoints(xAxis + (scope.settings.blockSize / 2), yAxis, parentXAxis + (scope.settings.blockSize / 2), parentYAxis + scope.settings.blockSize, ctx);
                        //drawCurveBetweenTwoPoints(xAxis + (scope.settings.blockSize / 2), yAxis, parentXAxis + (scope.settings.blockSize / 2), parentYAxis + scope.settings.blockSize, ctx);

                        //ctx.setLineDash([1, 5]);
                        // ctx.moveTo(Math.floor(parentXAxis + (scope.settings.blockSize / 2)), parentYAxis + scope.settings.blockSize);
                        // //ctx.lineWidth=lineWidth;
                        // ctx.lineTo(Math.floor(parentXAxis + (scope.settings.blockSize / 2)), parentYAxis + scope.settings.blockSize + (scope.settings.verticalGap / 2));
                        // ctx.moveTo(Math.floor(xAxis + (scope.settings.blockSize / 2)), yAxis);
                        // ctx.lineTo(Math.floor(xAxis + (scope.settings.blockSize / 2)), yAxis - (scope.settings.verticalGap / 2));
                        // ctx.moveTo(Math.floor(xAxis + (scope.settings.blockSize / 2)), yAxis - (scope.settings.verticalGap / 2));
                        // ctx.lineTo(Math.floor(parentXAxis + (scope.settings.blockSize / 2)), parentYAxis + scope.settings.blockSize + (scope.settings.verticalGap / 2));

                    }


                }
            }

            function drawCurveBetweenTwoPoints(x1, y1, x2, y2, ctx) {

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                //ctx.lineTo(x2+10,y2+10);
                if (scope.treeSettings.lineCurve && scope.treeSettings.lineCurve > 0) {
                    ctx.bezierCurveTo(x1 - scope.treeSettings.lineCurve, y1 - scope.treeSettings.lineCurve, x2 + scope.treeSettings.lineCurve, y2 + scope.treeSettings.lineCurve, x2, y2);
                } else {
                    ctx.lineTo(x2, y2);
                }
                //ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2, x2, y2);

                ctx.stroke();
                ctx.closePath();
                // ctx.bezierCurveTo(x1, y1-100, x2  , y1 +100, x2, y2);

                // var centerX,centerY,radius;
                // if (((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)) > 0) {
                //     centerX = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1))) + x1;
                //     centerY = y1;
                //     radius=Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1))) ;
                // } else {

                //     centerX = Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2))) + x2;
                //     centerY=y2
                //     radius=Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2))) ;

                //}

                //ctx.arc(centerX, centerY, radius, 0, 60, false);


            }

            scope.$watch('treeSettings', function (newValue, oldValue) {

                scope.settings = angular.copy(newValue);
                if (scope.settings) {

                    //var totalWidth = 0;
                    //totalHeight = 0;
                    if (!scope.settings.zoomlevel) {
                        scope.settings.zoomlevel = 1.0
                    }
                    if (!scope.settings.shapeType) {
                        scope.settings.shapeType = "square";
                    }

                    if (!scope.settings.fillType) {
                        scope.settings.fillType = "color";
                    }

                    if (!scope.settings.blockSize) {
                        scope.settings.blockSize = 100;
                    }

                    if (!scope.settings.blockGap) {
                        scope.settings.blockGap = 10;
                    }

                    if (!scope.settings.verticalGap) {
                        scope.settings.verticalGap = 50;
                    }

                    if (!scope.settings.lineCurve) {
                        scope.settings.lineCurve = 0;
                    }

                    scope.settings.lineWidth = 5;


                }
                scope.drawHeirarchy();

            }, true);

            scope.$watch(attrs.dataSource, function (value) {
                //scope.dataSource = value;
                scope.drawHeirarchy();

            });
            scope.$watch('autosize', function (value) {
                //scope.dataSource = value;
                scope.drawHeirarchy();

            });

            scope.handleClick = function (rectangle) {
                alert("This is " + rectangle.text);
            }

            scope.handleArrowClick = function (block, parentBlock) {
                alert(parentBlock.text + " is parent of " + block.text);
            }

            scope.hoverOut = function (rectangle) {

                $("#blockTootip").hide();
            }
            scope.hoverIn = function (rectangle, event) {
                y = event.pageY;
                x = event.pageX;
                if (rectangle && rectangle.hoverDetails) {
                    scope.toolTipHoverDetails = rectangle.hoverDetails;
                }
                else {
                    scope.toolTipHoverDetails = undefined;
                }
                scope.selectedBuilding = rectangle.text;
                $("#blockTootip").css("display", "block");
                $("#blockTootip").css("top", y + 'px')
                $("#blockTootip").css("left", x + 'px')

            }

            scope.GetZoomLevl = function () {
                return "scale(" + scope.settings.zoomlevel + ")";
            }
        }
    }
});