define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./PieChart/templates/PieChart.html",
    "dojo/i18n!./PieChart/nls/Strings",

    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/on",
    "dojo/query",
    "dijit/registry",
    
    "dijit/form/CheckBox",
    "dijit/form/ToggleButton",
    
    "dojox/charting/Chart",
    "dojox/charting/widget/Legend",
    "dojox/charting/widget/SelectableLegend",
    "dojox/charting/plot2d/Pie",
    "dojox/charting/action2d/Highlight",
    "dojox/charting/action2d/Tooltip",
    "dojox/charting/action2d/MoveSlice",
    "dojox/charting/Theme",
    "dojox/charting/themes/PlotKit/green", // theme
    "dojox/charting/StoreSeries",
    
    "dojo/fx",
    "dojo/_base/fx",
    "dijit/registry",
     
], function (
    declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, template, i18n,
    arrayUtil, lang, topic, domStyle, domConstruct, domClass, on, query, registry, 
    CheckBox, ToggleButton,
    Chart, Legend, SelectableLegend, Pie, Highlight, Tooltip, MoveSlice, Theme, greenTheme, StoreSeries, 
    coreFx, baseFx, registry) {
        
    (function() {
        var css = [require.toUrl("charting/PieChart/css/PieChart.css")];
        var head = document.getElementsByTagName("head").item(0),
            link;
        for(var i = 0, il = css.length; i < il; i++) {
            link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = css[i].toString();
            head.appendChild(link);
        }
    }());

    return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {

        templateString: template,
        pieChart: false,
        pieLegend: false,
        expanderTB: null,

        //additional variables
        fieldArr: [],

        constructor: function () {
        },

        postCreate: function () {
            this.inherited(arguments);
            
            // not used (once used again -> set opacity: 0 as start value in "Container" attach-point in template)
            //initialize expander 
            //this.initExpander();

            //set chart header if there is one
            if (this.header != null) {
                this.chartTitleNode.innerHTML = this.header;
            }
            else {
                //domStyle.set(this.chartTitleUnderlineNode, "display", "none");
            }

            var strokeStyle = { color: "#EFEFEF", width: 2 };
            var currentTheme = new Theme({
                colors: [
                    "#1F517F",
                    "#3A7532",
                    "#239999",
                    "#DB8F2A",
                    "#C12B2B",
                    "#3E308E",
                    "#87275E",
                    "#5EA1D3",
                    "#76CC7A",
                    "#62D7DD",
                    "#F7C959",
                    "#F45353",
                    "#5F4CC9",
                    "#C65495",
                    "#AAAFAF",
                    "#777B7B",
                    "#333535"
                ]
            });
            currentTheme.chart.fill = "transparent";
            currentTheme.plotarea.fill = "transparent";

            this.pieChart = new Chart(this.chartContainerNode);
            this.pieChart.setTheme(currentTheme);
            this.pieChart.addPlot("default", {
                type: "Pie",
                labels: false,
                font: "normal normal 10pt Tahoma",
                fontColor: "#333",
                labelOffset: -40,
                labelStyle: "columns",
                radius: 110,
                animate: true,
                markers: true,
                stroke: strokeStyle
            }).addSeries("Status", []); // no data added when initialized

            this.pieChart.render();
            if (this.hasLegend != null && this.hasLegend) {
                this.pieLegend = new Legend({ chart: this.pieChart, horizontal: false }, this.legendContainerNode);
            }

            if (this.title != null) {
                this.pieChartTitle.innerHTML = this.title;
                domStyle.set(this.pieChartTitle, "display", "block");
            }

        },

        startup: function () {
            console.log("PieChart started");
           //this.createSeries();
        },
        
        //store the category and group
        prepareData: function (arrKeys, arrData) {
            var self = lang.hitch(this);
            this.chartContainerNode.className = "pie";
            var data = [];
            var intIndex = 0;
            var intTotal = 0;
            //prepare for values with empty strings
            for (var key in arrData) {
                var obj = arrData[key];
                if (!key) {
                    delete arrData.key;
                    arrData["N/A"] = obj;
                }
            }

            this.fieldArr = [];

            arrayUtil.forEach(arrKeys, function (value, index) {
                //prepare for values with empty strings
                if (!value) {
                    value = "N/A";
                }
                if (arrData[value] == undefined) {
                    arrData[value] = 0;
                }
                data.push({ id: index, text: value, y: arrData[value] });
                //fill array with important things
                self.fieldArr.push(data[index].text);
                intTotal += arrData[value];
                intIndex += 1;
            });

            //grab graph title, aka grouped by selection
            var dataStore = new Object;
            dataStore.total = intTotal;
            dataStore.data = data;
            this.updateSeries("", dataStore);
            this.pieChart.resize(270, '100%');
        },

        /*
        Example

        dataStore: {
            data: [
                { id=0, text="Landbase Updates", y=56},
                { id=1, text="Data Edits", y=61},
                { id=2, text="Create Version", y=63}
            ],
            total: 180
        }
        */

        updateSeries: function (title, dataStore) {
            //update chart header
            this.chartTitleNode.innerHTML = title ? title : "N/A";
            //add tooltips to the data
            var updatedSeries = arrayUtil.map(dataStore.data, function (wedge) {
                var percentage = wedge.y / dataStore.total;
                percentage = percentage.toFixed(2);
                if (!wedge.y) {
                    wedge.y = 0;
                }
                return {
                    y: wedge.y,
                    text: wedge.text,
                    tooltip: wedge.text + ": <span style='font-weight:bold'>" + wedge.y + "</span> (" + Math.round(percentage * 100) + "%)"
                };
            });

            this.pieChart.updateSeries("Status", updatedSeries);
            new MoveSlice(this.pieChart, "default");
            new Tooltip(this.pieChart, "default");
            this.pieChart.render();
            if (this.pieLegend) {
                this.pieLegend.refresh();
            }
        },
    });
});