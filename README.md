# Workflow Manager Dashboard Samples

This project contains 3 sample ArcGIS Workflow Manager Operations Dashboard widgets.

Widgets
-------

![Operations Dashboard Screenshot](doc/screenshots/OperationsDashboard.png)

### Reports Widget

This widget shows an overview of all of the jobs in the Workflow Manager system in pie chart form.
It also allows you to hover over sections of each section of the pie to view information about how many jobs are in that category.

![Reports Widget Screenshot](/doc/screenshots/ReportWidget.png)

### Create Job Widget

This widget allows you to create new jobs of any active Job Type, with an optional Area of Interest (AOI).

![Create Job Widget Screenshot](/doc/screenshots/CreateJobWidget.png)

### Job Workflow Widget

This widget allows you to select an AOI on the map and see the name and workflow of the selected job.
It also allows you to execute or mark steps as complete when allowed.

![Job Workflow Widget Screenshot](/docs/screenshots/JobWorkflowWidget.png)

Instructions
------------

1) Download the source code and save to a local folder or clone the repository
1) Edit the configuration options in config/settings.js.
1) Create a new ArcGIS Online Web Map which will be the basis of your operations view.
..* This Web Map should contain the AOI layer for the Workflow Manager view
![Add Layer Screenshot](/doc/screenshots/AddLayer.png)
1)  Either
[open Operations Dashboard in Dev Mode](https://developers.arcgis.com/javascript/jshelp/operations-dashboard-extensibility-test-debug.html)
or [deploy the widgets for use in Operations Dashboard](https://developers.arcgis.com/javascript/jshelp/operations-dashboard-extensibility-deploy-overview.html)
1) Create a new Operations View using the Web Map created earlier.
..* Turn on the option for the AOI layer to be selectable
![Selectable Option](/doc/screenshots/ConfigureMap.png)
1) Add the widgets to the Operations View
..* When adding the Job Workflow Widget, use the Selection of the AOI layer as the Data Source
![Configuring Job Workflow Widget](/doc/screenshots/ConfigureJobWorkflowWidget.png)


Resources
---------

For more information, see the Workflow Manager JS API documentation at
<http://workflowsample.esri.com/doc/javascript/jsapi/index.html>
and the Operations Dashboard Extensibility documentation at
<https://developers.arcgis.com/javascript/jshelp/operations-dashboard-extensibility-overview.html>

Contributing
------------

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

Licensing
---------
Copyright 2016 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/workflowmanager-dashboard-samples/master/license.txt) file.

[](Esri Tags: ArcGIS Workflow Manager Operations Dashboard)
[](Esri Language: JavaScript)