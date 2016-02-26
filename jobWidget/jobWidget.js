/**
 * Created by kevi6083 on 2/16/2016.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "esri/opsdashboard/WidgetProxy",
    "esri/tasks/query",
    "workflowmanager/WMJobTask",
    "workflowmanager/WMWorkflowTask",
    "workflowmanager/Enum",
    "dojo/text!./JobWidgetTemplate.html",
    "dijit/form/Button",
    "config/settings"
], function (declare,
             lang,
             _WidgetBase,
             _TemplatedMixin,
             WidgetProxy,
             Query,
             WMJobTask,
             WMWorkflowTask,
             Enum,
             templateString,
             Button,
             settings) {
    "use strict";
    return declare("JobWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {
        templateString: templateString,
        debugName: "JobWidget",
        currentJob: null,
        jobTask: null,
        workflowTask: null,
        defaultJobName: "No Jobs Selected",
        executeBtn: null,
        markBtn: null,

        hostReady: function () {
            var self = lang.hitch(this);
            this.jobTask = new WMJobTask(settings.serverUrl);
            this.workflowTask = new WMWorkflowTask(settings.serverUrl);

            this.jobName.innerHTML = this.defaultJobName;

            //<editor-fold desc="Dijit buttons">
            this.executeBtn = new Button({
                label: "Execute Step",
                onClick: function () {
                    self.executeStep();
                }
            }, this.executeStepButton);
            this.executeBtn.startup();

            this.markBtn = new Button({
                label: "Mark As Complete",
                onClick: function () {
                    self.markStepAsComplete();
                }
            }, this.markAsCompleteButton);
            this.markBtn.startup();
            //</editor-fold>

        },
        dataSourceExpired: function (dataSource) {

            // Execute the query. A request will be sent to the server
            // to query for the features.
            // The results are in the featureSet
            dataSource.executeQuery(new Query()).then(lang.hitch(this, function (featureSet) {
                // See whether any jobs are selected
                if (featureSet.features) {
                    var feature = featureSet.features[0];
                    var jobId = feature.attributes[settings.jobId];

                    if (this.currentJob !== null && this.currentJob.id === jobId) {
                        return;
                    }

                    console.info("Retrieving job " + jobId);

                    /** Example 3a - Retrieve basic job info **/

                    /** Documentation
                     *  - http://workflowsample.esri.com/doc/javascript/jsapi/WMJobTask.html#getJob
                     *  - http://workflowsample.esri.com/doc/rest/index.html?queryjobs.html
                     */

                    /** End example 3a **/

                } else {
                    this.currentJob = null;
                    this.jobName.innerHTML = this.defaultJobName;
                    $("#workflowImg").remove();
                }
            }));
        },

        loadWorkflow: function () {
            var self = lang.hitch(this);
            self.executeBtn.setDisabled(true);
            self.markBtn.setDisabled(true);

            /** Example 3b - Get Workflow Image and current steps **/

            /** Documentation
             *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#getWorkflowImageURL
             *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#getCurrentSteps
             */

            /** End example 3b **/
        },

        /** Example 3c - Enable/disable buttons **/

        /** Documentation
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#canRunStep
         */

        /** End example 3c **/

        /** Example 3d - Execute/mark as complete **/

        /** Documentation
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#executeSteps
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#markStepsAsDone
         */

        /** End example 3d **/


    });

});


