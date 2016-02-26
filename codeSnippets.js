// <editor-fold desc="Example 1 - Report Widget to show info about all jobs">

getJobsByQueryID: function (queryID) {
    var self = lang.hitch(this);
    //query function
    self.wmJobTask.queryJobsByID(queryID, settings.userName, lang.hitch(self, function (data) {
        self.populateQueryResults(data);
    }));
},
// </editor-fold>

// <editor-fold desc="Example 2a - Get list of job types">

this.wmConfigurationTask.getServiceInfo(function (response) {
    var activeJobTypes = dojo.filter(response.jobTypes, function (item) {
        return item.state == Enum.JobTypeState.ACTIVE;
    });
    self.jobTypesSelect.set("store", new Memory({data: activeJobTypes, idProperty: "id"}));
    if (activeJobTypes.length > 0) {
        self.jobTypesSelect.set("disabled", false);
        self.jobTypesSelect.set("value", activeJobTypes[0].id);  // by default select first item
        self.btnCreateJob.set("disabled", false);
    }
});
// </editor-fold>

// <editor-fold desc="Example 2b - Create Job">

var creationParams = new JobCreationParameters();
creationParams.jobTypeId = self.jobTypesSelect.get("value");
creationParams.loi = self.aoi;

// Display status
self.startUpScreen.style.display = "none";
self.progressScreen.style.display = "";

self.jobTask.createJob(creationParams, self.userName, function (data) {
    // Hide status
    self.startUpScreen.style.display = "";
    self.progressScreen.style.display = "none";

    // Show in the list of created jobs
    var event = "\nJob: " + data[0] + " created."
    self.createHistory.set("value", self.createHistory.value + event);

    // Clear out the old AOI
    self.aoi = null;
    self.graphicsLayerProxy.clear();

});
// </editor-fold>

/**
 * Example 2c - AOI
 *  - Just inline
 * **/

// <editor-fold desc="Example 3a - Get basic info about the job">

this.jobTask.getJob(jobId, function (data) {
    this.currentJob = data;
    this.jobName.innerHTML = data.name;
    this.loadWorkflow();
}.bind(this));
// </editor-fold>

// <editor-fold desc="Example 3b - Get Workflow Image and current steps">
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

// get current steps for workflow
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
// </editor-fold>

// <editor-fold desc="Example 3c - Enable/disable buttons">
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


checkCanMarkStepAsDone: function (step) {
    this.canMarkStepAsDone = (step.canSkip || step.hasBeenExecuted
        || (step.stepType.executionType == Enum.StepExecutionType.PROCEDURAL)) && this.currentJob.assignedTo === settings.userName;

    // disable the mark as done button as needed
    this.markBtn.setDisabled(!(this.canMarkStepAsDone));
},
// </editor-fold>

// <editor-fold desc="Example 3d - Execute/mark as complete">
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
// </editor-fold>