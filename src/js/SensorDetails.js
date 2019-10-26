/*
 * sensor-details
 * https://github.com/gbvsilva/sensor-details-widget
 *
 * Copyright (c) 2019 REGINA-Lab
 * Licensed under the MIT license.
 */

/* exported SensorDetails */

var SensorDetails = (function () {

    "use strict";

    // =========================================================================
    // CLASS DEFINITION
    // =========================================================================

    var entityInfo;
    var timezone, failLoadingTimer, dateModified; 
    // , lastEChartOptions, echart, maxLux, pendingNotifications, alertTabIcon 

    var SensorDetails = function SensorDetails() {
        timezone = MashupPlatform.prefs.get('timezone');
        moment.locale('pt-br');

        // Containers
        var sensor_containers = document.getElementsByClassName("sensor-container");
        var tabInfo = document.getElementById("info_panel_button");

        // Sensor elements
        var infoDeviceImage = document.getElementById('deviceImage_sensor');
        var sensor_id = document.getElementById('sensor_id');
        var sensor_update_date = document.getElementById('sensor_updateDate');
        var sensor_tipo = document.getElementById('sensor_tipo');
        var sensor_corrente = document.getElementById('sensor_corrente');
        var sensor_fator_potencia = document.getElementById('sensor_fator_potencia');
        var sensor_fator_potenciaT = document.getElementById('sensor_fator_potenciaT');
        var sensor_potencia_aparente = document.getElementById('sensor_potencia_aparente');
        var sensor_potencia_aparenteT = document.getElementById('sensor_potencia_aparenteT');
        var sensor_potencia_ativa = document.getElementById('sensor_potencia_ativa');
        var sensor_potencia_ativaT = document.getElementById('sensor_potencia_ativaT');
        var sensor_potencia_reativa = document.getElementById('sensor_potencia_reativa');
        var sensor_potencia_reativaT = document.getElementById('sensor_potencia_reativaT');
        var sensor_tensao = document.getElementById('sensor_tensao');
        var sensor_tensaoT = document.getElementById('sensor_tensaoT');
        var sensor_latitude = document.getElementById('sensor_latitude');
        var sensor_longitude = document.getElementById('sensor_longitude');
        
        var tensaoGaugeChart, potenciaGaugeChart, correnteGaugeChart;
        var data1, data2, data3;
        var options1, options2, options3;

        google.charts.load('current', {'packages':['gauge']});
        google.charts.setOnLoadCallback(drawGauges);

        function drawGauges() {    
            tensaoGaugeChart = new google.visualization.Gauge(document.getElementById('tensaoGaugeChart'));
            data1 = google.visualization.arrayToDataTable([
              ['Label', 'Value'],
              ['Tensão', 0]
            ]);
            options1 = {
              width: 100, height: 100,
              min: 0, max: 300,
              redFrom: 0, redTo: 150,
              yellowFrom:150, yellowTo: 175,
              greenFrom: 175, greenTo: 250,
              minorTicks: 5
            };
            potenciaGaugeChart = new google.visualization.Gauge(document.getElementById('potenciaGaugeChart'));
            data2 = google.visualization.arrayToDataTable([
              ['Label', 'Value'],
              ['Potência', 0]
            ]);
            options2 = {
              width: 100, height: 100,
              min: 0, max: 45000,
              greenFrom: 0, greenTo: 40000,
              yellowFrom: 40000, yellowTo: 42500,
              redFrom: 42500, redTo: 45000,
              minorTicks: 5
            };
            correnteGaugeChart = new google.visualization.Gauge(document.getElementById('correnteGaugeChart'));
            data3 = google.visualization.arrayToDataTable([
              ['Label', 'Value'],
              ['Corrente', 0]
            ]);
            options3 = {
                width: 100, height: 100,
                min: 0, max: 150,
                greenFrom: 0, greenTo: 140,
                yellowFrom: 140, yellowTo: 145,
                redFrom: 145, redTo: 150,
                minorTicks: 5
            }

            tensaoGaugeChart.draw(data1, options1);
            potenciaGaugeChart.draw(data2, options2);
            correnteGaugeChart.draw(data3, options3);
            /* setInterval(function() {
                data1.setValue(0, 1, t);
                tensaoGaugeChart.draw(data1, options1);
            }, 1000);
            setInterval(function() {
                data2.setValue(0, 1, w);
                potenciaGaugeChart.draw(data2, options2);
            }, 1000);
            setInterval(function() {
                data3.setValue(0, 1, a);
                correnteGaugeChart.draw(data3, options3);
            }, 1000); */
        }

        var updateGauges = function updateGauges(t, w, a) {
            data1.setValue(0, 1, t);
            data2.setValue(0, 1, w);
            data3.setValue(0, 1, a);
            tensaoGaugeChart.draw(data1, options1);
            potenciaGaugeChart.draw(data2, options2);
            correnteGaugeChart.draw(data3, options3);
        };

        var showStatusFromFieldElement = (current_status) => {
            clearTimeout(failLoadingTimer);
            var isUpdate = false;
            if (entityInfo != null && current_status != null && entityInfo.id == current_status.id) {
                // Update
                isUpdate = true;
                let filter_events = false; // MashupPlatform.prefs.get('filter_events');

                if (filter_events && current_status.dateModified != null && current_status.dateModified === entityInfo.dateModified) {
                    // TODO: Used currently to filter the event flow caused by the IoTAgents
                    // testCounter++;
                    return;
                } if (current_status.dateModified != null) {
                    dateModified = moment(current_status.dateModified).valueOf();
                } else {
                    dateModified = moment().valueOf();
                }
                // MashupPlatform.widget.log(entityInfo.dateModified + " -> " + testCounter + " updates discarded for " + entityInfo.id, MashupPlatform.log.INFO);
                // testCounter = 0;
            } else if (current_status != null) {
                // new entity
                isUpdate = false;
                adaptViewByType(current_status.type);
            } else {
                entityInfo = null;
                return;
            }
            entityInfo = current_status;
            MashupPlatform.widget.log(`entityInfo -> ${JSON.stringify(entityInfo)}`, MashupPlatform.log.WARN);
            // We are going to set values of the template
            setTitles(entityInfo);

            // Sensor
            if (entityInfo.type === "Sensor") {

                // Info Image
                infoDeviceImage.className = "infoDeviceImage sensor";

                updateGauges(entityInfo.Tensao_V, entityInfo.Pot_Ativa_W, entityInfo.Corrente_A);
                
                if(entityInfo.TimeInstant != " ")
                    sensor_update_date.innerHTML = moment(entityInfo.TimeInstant).subtract(180, 'seconds').fromNow();
                else
                    sensor_update_date.innerHTML = "n/a";

                // Sensor Details
                sensor_id.innerHTML = entityInfo.id;
                sensor_tipo.innerHTML = entityInfo.type;
                sensor_corrente.innerHTML = (parseFloat(entityInfo.Corrente_A)) ? (entityInfo.Corrente_A+" A") : "n/a";
                sensor_fator_potencia.innerHTML = (parseFloat(entityInfo.Fat_Potencia_VA)) ? (entityInfo.Fat_Potencia_VA+" VA") : "n/a";
                sensor_fator_potenciaT.innerHTML = (parseFloat(entityInfo.Fat_Potencia_Total_VA)) ? (entityInfo.Fat_Potencia_Total_VA+" VA") : "n/a";
                sensor_potencia_aparente.innerHTML = (parseFloat(entityInfo.Pot_Aparente_W)) ? (entityInfo.Pot_Aparente_W+" W") : "n/a";
                sensor_potencia_aparenteT.innerHTML = (parseFloat(entityInfo.Pot_Aparente_Total_VA)) ? (entityInfo.Pot_Aparente_Total_VA+" WA") : "n/a";
                sensor_potencia_ativa.innerHTML = (parseFloat(entityInfo.Pot_Ativa_W)) ? (entityInfo.Pot_Ativa_W+" W") : "n/a";
                sensor_potencia_ativaT.innerHTML = (parseFloat(entityInfo.Pot_Ativa_Total_W)) ? (entityInfo.Pot_Ativa_Total_W+" W") : "n/a";
                sensor_potencia_reativa.innerHTML = (parseFloat(entityInfo.Pot_Reativa_VAR)) ? (entityInfo.Pot_Reativa_VAR+" VAR") : "n/a";
                sensor_potencia_reativaT.innerHTML = (parseFloat(entityInfo.Pot_Reativa_Total_VAR)) ? (entityInfo.Pot_Reativa_Total_VAR+" VAR") : "n/a";
                sensor_tensao.innerHTML = (parseFloat(entityInfo.Tensao_V)) ? (entityInfo.Tensao_V+" V") : "n/a";
                sensor_tensaoT.innerHTML = (parseFloat(entityInfo.Tensao_Total_V)) ? (entityInfo.Tensao_Total_V+" V") : "n/a";
                sensor_longitude.innerHTML = entityInfo.location.coordinates[0]+" &deg";
                sensor_latitude.innerHTML = entityInfo.location.coordinates[1]+" &deg";

                // Corrente, Pot_Reativa, date_time, potencia, corrente, TimeInstant, Latitud, ,Longitud, , Pot_Aparente, Pot_Ativa

            } else if (entityInfo.type === "Thing") {
                MashupPlatform.widget.log("Nothing to do with Thing entities!");
            } else {
                // Unknown Entity type
                MashupPlatform.widget.log("unknown entity type: " + entityInfo.type, MashupPlatform.log.WARN);
            }

            if (!isUpdate) {
                MashupPlatform.widget.drawAttention();
            }
        };      

        var fillIfNotEmpty = function fillIfNotEmpty(element, value, parser) {
            if (value != null) {
                if (parser != null) {
                    value = parser(value);
                }
                element.innerText = value;
                element.parentNode.classList.remove('hidden');
            } else {
                element.parentNode.classList.add('hidden');
                element.innerText = "n/a";
            }
        };

        var setTitles = function setTitles(entity) {
            var title = document.getElementById('title');
            var subtitle = document.getElementById('subtitle');
            title.innerText = entity.id;
            subtitle.innerText = entity.type;
        };

        var getAddressString = function getAddressString(address) {

            if (address == null) {
                return "n/a";
            };

            var theAddress = address.streetAddress != null ? address.streetAddress : "";
            theAddress += address.postalCode != null ? (" (" + address.postalCode + ")") : "";

            if (address.addressLocality != null) {
                if (theAddress != "") {
                    theAddress += ", " + address.addressLocality;
                } else {
                    theAddress = address.addressLocality;
                }
            }
            if (address.addressCountry != null) {
                if (theAddress != "") {
                    theAddress += ", " + address.addressCountry;
                } else {
                    theAddress = address.addressCountry;
                }
            }

            return theAddress;
        };

        var adaptViewByType = function adaptViewByType(type) {
            switch (type) {
            case "Sensor":
                showAllElements(sensor_containers);
                /*hideAllElements(cab_containers);
                hideAllElements(gro_containers);
                hideAllElements(par_containers);
                hideAllElements(was_containers);
                hideAllElements(lse_containers);*/
                break;
            }
        };

        

        var showAllElements = function showAllElements(elemList) {
            [].forEach.call(elemList, function (v) {
                v.classList.remove("hidden");
            });
        };

        var hideAllElements = function hideAllElements(elemList) {
            [].forEach.call(elemList, function (v) {
                v.classList.add("hidden");
            });
        };

        MashupPlatform.wiring.registerCallback("status_data", showStatusFromFieldElement);

        /* MashupPlatform.prefs.registerCallback(function (new_preferences) {

        }.bind(this));*/
    };

    // =========================================================================
    // PRIVATE MEMBERS
    // =========================================================================

    /* test-code */
    SensorDetails.prototype = {
    };

    /* end-test-code */

    return SensorDetails;

})();
