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
                    var para = new JobCreationParameters();

                    para.jobTypeId = self.jobTypesSelect.get("value");
                    para.loi = self.aoi;
                    self.jobTask.createJob(para, self.userName, function (data) {
                        var event = "\nJob: " + data[0] + " created."
                        self.createHistory.set("value", self.createHistory.value + event);

                    });
                    self.aoi = null;
                    self.graphicsLayerProxy.clear();
                }
            }, this.btnCreateJobAttach);
            this.btnCreateJob.startup();

            //get and set the visible job types
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

            this.geoService.simplify([graphic], storeAOi);
            //store the simplified for aoi
            function storeAOi(geometries) {
                self.aoi = geometries[0];
            }

            this.inputGraphic.setGeometry(graphic);
            this.graphicsLayerProxy.addOrUpdateGraphic(this.inputGraphic);
        },

        //called on the toolbar cancel as well
        //sets the button back and clears teh toolbar to allow it to be used again
        drawingToolbarDeactivated: function () {
            this.isDrawing = false;
            this.btnDrawAoi.set("label", "Draw Aoi");
            this.deactivateDrawingToolbar(this.mapWidgetProxy);

        },

    });

});


