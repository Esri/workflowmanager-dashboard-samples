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
    "dojo/text!./CreateJobWidgetTemplate.html",
    "dojo/_base/array",

    "esri/graphic",
    "esri/symbols/SimpleFillSymbol",

    "workflowmanager/WMJobTask",
    "workflowmanager/WMWorkflowTask",
    "workflowmanager/WMConfigurationTask",
    "workflowmanager/Enum",
    "workflowmanager/supportclasses/JobCreationParameters",
    "esri/tasks/GeometryService",
    "config/settings",


    "dijit/form/Button",
    "dijit/form/FilteringSelect",
    "dojo/store/Memory",
    "dijit/form/Textarea"


], function (declare,
             lang,
             _WidgetBase,
             _TemplatedMixin,
             WidgetProxy,
             Query,
             templateString,
             arrayUtil,
             Graphic,
             SimpleFillSymbol,
             WMJobTask,
             WMWorkflowTask,
             WMConfigurationTask,
             Enum,
             JobCreationParameters,
             GeometryService,
             settings,
             Button,
             FilteringSelect,
             Memory,
             Textarea) {
    "use strict";
    return declare("JobWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {
        templateString: templateString,
        debugName: "JobWidget",
        currentJob: null,
        jobTask: null,
        workflowTask: null,
        defaultJobName: "No Jobs Selected",
        isDrawing: false,
        aoi: null,
        userName: null,

        hostReady: function () {
            var self = lang.hitch(this);
            this.jobTypeName = "Select Job Type";
            this.jobTask = new WMJobTask(settings.serverUrl);
            this.wmConfigurationTask = new WMConfigurationTask(settings.serverUrl);
            this.geoService = new GeometryService(settings.geoServerUrl);
            this.userName = settings.userName;

            var symbol = new SimpleFillSymbol();
            this.inputGraphic = new Graphic(null, symbol);

            //<editor-fold desc="Create Widgets - Example 2b is within this region">
            this.jobTypesSelect = new FilteringSelect({
                id: "createJobTypesSelect",
                name: "createJobTypesSelect",
                disabled: true,
            }, this.cboJobTypes);
            this.jobTypesSelect.startup();

            this.createHistory = new Textarea({
                name: "createHistory",
                value: "Created Jobs:",
                readOnly: true,
                style: "max-height: 222px;"
            }, "createHistory")
            this.createHistory.startup();

            this.btnDrawAoi = new Button({
                label: "Draw Aoi",
                onClick: function () {
                    if (self.isDrawing)
                        this.drawingToolbarDeactivated();
                    else {
                        this.set("label", "Cancel Draw");
                        self.drawPolygon();
                        self.isDrawing = true;
                    }

                }
            }, this.btnDrawAoiAttach);
            this.btnDrawAoi.startup();

            this.btnCreateJob = new Button({
                label: "Create Job",
                style: "float: right; margin-right: 8px;",
                onClick: function () {
                    /** Example 2b - Create Job **/

                    /** Documentation
                     *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMJobTask.html
                     *   - http://workflowsample.esri.com/doc/rest/index.html?createjob.html
                     */

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
                    /** End Example 2b **/
                }
            }, this.btnCreateJobAttach);
            this.btnCreateJob.startup();
            //</editor-fold>

            /** Example 2a - Get and set the visible job types **/

            /** Documentation
             *   - http://workflowsample.esri.com/doc/rest/index.html?wmserver.html
             *   - http://workflowsample.esri.com/doc/javascript/jsapi/WMConfigurationTask.html
             *
             *  Also a new method for just job types available to the user at 10.4
             */

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

            /** End Example 2a **/


            //creates the graphic layer we will work on
            return self.mapWidgetProxy.createGraphicsLayerProxy().then(lang.hitch(this, function (graphicsLayerProxy) {
                this.graphicsLayerProxy = graphicsLayerProxy;
            }));
        },

        //activates toolbar
        drawPolygon: function () {
            this.activateDrawingToolbar({geometryTypes: ["polygon"]}).then(lang.hitch(this, function (result) {
                if (!result)
                    console.log("Error activating drawing toolbar");
            }), lang.hitch(this, function (err) {
                console.log("Error activating drawing toolbar " + err);
            }));
        },

        //activates upon completing the polygon
        toolbarDrawComplete: function (graphic) {
            var self = lang.hitch(this);

            this.drawingToolbarDeactivated();

            /** Example 2c - AOI **/
            this.geoService.simplify([graphic], storeAOi);
            //store the simplified for aoi
            function storeAOi(geometries) {
                self.aoi = geometries[0];
            }

            /** End example 2c **/

            this.inputGraphic.setGeometry(graphic);
            this.graphicsLayerProxy.addOrUpdateGraphic(this.inputGraphic);
        },

        //called on the toolbar cancel as well
        //sets the button back and clears teh toolbar to allow it to be used again
        drawingToolbarDeactivated: function () {
            this.isDrawing = false;
            this.btnDrawAoi.set("label", "Draw Aoi");
            this.deactivateDrawingToolbar(this.mapWidgetProxy);

        }
    });
});


