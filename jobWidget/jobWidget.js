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
                if (featureSet.features && featureSet.features.length > 0) {
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

                    this.jobTask.getJob(jobId, function (data) {
                        this.currentJob = data;
                        this.jobName.innerHTML = data.name;
                        this.loadWorkflow();
                    }.bind(this));

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

            var jobId = self.currentJob.id;
            var imageUrl = self.workflowTask.getWorkflowImageURL(jobId);

            // if workflow image already exists, refresh it
            if ($("#workflowImg").length) {
                // reload image
                $("#workflowImg").attr("src", imageUrl + "?timestamp=" + new Date().getTime());
            } else {
                var addHTML = "<img name='workflowImg' id='workflowImg' src='" + imageUrl + "' width='275' style='margin-left: 2.88px;' >";
                $("#workflowContents").append(addHTML);
            }

            //// get current steps for workflow
            self.workflowTask.getCurrentSteps(jobId,
                function (steps) {
                    var currentStep = steps[0];
                    self.currentStep = currentStep;              // current step
                    self.checkCanMarkStepAsDone(currentStep);    // check if step can be marked as done
                    self.checkCanRunStep(currentStep);           // check if step can be run
                },
                function (error) {
                    showError("Workflow Error", error);
                }
            );

            // show div element
            $("#workflowContents").show();

            /** End example 3b **/
        },

        /** Example 3c - Enable/disable buttons **/

        /** Documentation
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#canRunStep
         */

        checkCanRunStep: function (step) {
            var self = lang.hitch(this);
            self.canRunStep = false;

            if (self.currentJob.assignedTo !== settings.userName) {
                return;
            }

            //Use the workflowTask to check if a step can be run or not
            self.workflowTask.canRunStep(self.currentJob.id, step.id, settings.userName,
                function (stepStatus) {
                    if (stepStatus == Enum.StepRunnableStatus.CAN_RUN) {
                        self.canRunStep = true;
                    }
                    self.executeBtn.setDisabled(!(self.canRunStep));
                },
                function (error) {
                    self.executeBtn.setDisabled(true);
                    console.error(error);
                }
            );
        },

        //
        //Check if step can be marked as done
        //
        checkCanMarkStepAsDone: function (step) {
            this.canMarkStepAsDone = (step.canSkip || step.hasBeenExecuted
                || (step.stepType.executionType == Enum.StepExecutionType.PROCEDURAL)) && this.currentJob.assignedTo === settings.userName;

            // disable the mark as done button as needed
            this.markBtn.setDisabled(!(this.canMarkStepAsDone));
        },

        /** End example 3c **/

        /** Example 3d - Execute/mark as complete **/

        /** Documentation
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#executeSteps
         *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMWorkflowTask.html#markStepsAsDone
         */

        executeStep: function () {
            var self = lang.hitch(this);

            var jobId = self.currentJob.id;
            var stepIds = [self.currentStep.id];
            self.workflowTask.executeSteps(jobId, stepIds, settings.userName, false,
                function (data) {
                    // check for any execution errors
                    if (data != null && data.length > 0) {
                        var result = data[0];
                        if (result.threwError) {
                            self.showError("Workflow Error", result.errorDescription);
                        }
                    }
                    // reload workflow
                    self.loadWorkflow();
                },
                function (error) {
                    console.error(error);
                }
            );
        },

        markStepAsComplete: function () {
            var self = lang.hitch(this);

            var stepIds = [self.currentStep.id];
            self.workflowTask.markStepsAsDone(self.currentJob.id, stepIds, settings.userName,
                function (data) {
                    self.loadWorkflow();
                },
                function (error) {
                    console.error(error);
                }
            );
        }

        /** End example 3d **/
    });

});


