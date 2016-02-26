/**
 * Created by kevi6083 on 2/16/2016.
 */

define([
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "esri/opsdashboard/WidgetProxy",
    "dojo/text!./ReportWidgetTemplate.html",
    "dojo/_base/lang",

    //WMX Include
    "workflowmanager/WMJobTask",
    "workflowmanager/supportclasses/JobQueryParameters",
    "charting/PieChart",
    "config/settings"
], function (declare,
             _WidgetBase,
             _TemplatedMixin,
             WidgetProxy,
             templateString,
             lang,
             WMJobTask,
             JobQueryParameters,
             PieChart,
             settings) {
    "use strict";

    return declare("ReportWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {
        templateString: templateString,
        debugName: "ReportWidget",

        wmJobTask: null,
        queryResults: null,

        //controlling variables

        hostReady: function () {
            /** Create the new Job Task **/
            this.wmJobTask = new WMJobTask(settings.serverUrl);

            this.statsPieChart = new PieChart({hasLegend: true}).placeAt(this.pieChartContainer);
            this.statsPieChart.startup();
            this.getJobsByQueryID(settings.queryID);
        },

        /** Demo 1 - Get info from query **/

        /** Documentation
         *   - http://workflowsample.esri.com/doc/rest/index.html?queryjobs.html
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMJobTask.html#queryJobsByID
         **/


        // ** End Demo 1 **/

        populateQueryResults: function (data) {
            // populate the queryResults
            this.queryResults = data;
            this.populateChart();
        },


        populateChart: function () {
            var self = lang.hitch(this);
            var currentCategorizedByValue = settings.currentCategorizedByValue;
            var data = this.queryResults;

            var uniqueValues = new Array();
            var uniqueValuesKeys = new Array();

            for (var key in data.rows) {
                var row = data.rows[key];
                if (uniqueValues[row[currentCategorizedByValue]] === undefined) {
                    uniqueValues[row[currentCategorizedByValue]] = 0;
                    uniqueValuesKeys.push(row[currentCategorizedByValue]);
                }
                uniqueValues[row[currentCategorizedByValue]] += 1;
            }
            this.statsPieChart.prepareData(uniqueValuesKeys, uniqueValues);
        }

    });

});


