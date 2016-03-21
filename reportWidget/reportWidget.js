/**
 Copyright 2016 Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.

 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,

 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 See the License for the specific language governing permissions and
 limitations under the License.?
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
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMJobTask.html
         **/

        getJobsByQueryID: function (queryID) {
            var self = lang.hitch(this);
            //query function
            self.wmJobTask.queryJobsByID(queryID, settings.userName, lang.hitch(self, function (data) {
                self.populateQueryResults(data);
            }));
        },

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


