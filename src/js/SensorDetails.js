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
        var sensor_containers = document.getElementsByClassName('sensor-container');
        var sensorESP_containers = document.getElementsByClassName('sensorESP-container');
        var tabInfo = document.getElementById('info_panel_button');

        // ESPNPITI Sensor elements
        var espInfoDeviceImage = document.getElementById('deviceImage_sensorESP');
        var sensorESP_update_date = document.getElementById('sensorESP_updateDate');
        var sensorESP_id =  document.getElementById('sensorESP_id');
        var sensorESP_tipo = document.getElementById('sensorESP_tipo');
        var sensorESP_correnteA = document.getElementById('sensorESP_correnteA');
        var sensorESP_correnteB = document.getElementById('sensorESP_correnteB');
        var sensorESP_correnteC = document.getElementById('sensorESP_correnteC');
        var sensorESP_correnteTHDA = document.getElementById('sensorESP_correnteTHDA');
        var sensorESP_correnteTHDB = document.getElementById('sensorESP_correnteTHDB');
        var sensorESP_correnteTHDC = document.getElementById('sensorESP_correnteTHDC');
        var sensorESP_potencia_ativaA = document.getElementById('sensorESP_potencia_ativaA');
        var sensorESP_potencia_ativaB = document.getElementById('sensorESP_potencia_ativaB');
        var sensorESP_potencia_ativaC = document.getElementById('sensorESP_potencia_ativaC');
        var sensorESP_potencia_reativaA = document.getElementById('sensorESP_potencia_reativaA');
        var sensorESP_potencia_reativaB = document.getElementById('sensorESP_potencia_reativaB');
        var sensorESP_potencia_reativaC = document.getElementById('sensorESP_potencia_reativaC');
        var sensorESP_potencia_aparenteA = document.getElementById('sensorESP_potencia_aparenteA');
        var sensorESP_potencia_aparenteB = document.getElementById('sensorESP_potencia_aparenteB');
        var sensorESP_potencia_aparenteC = document.getElementById('sensorESP_potencia_aparenteC');
        var sensorESP_fator_potenciaA = document.getElementById('sensorESP_fator_potenciaA');
        var sensorESP_fator_potenciaB = document.getElementById('sensorESP_fator_potenciaB');
        var sensorESP_fator_potenciaC = document.getElementById('sensorESP_fator_potenciaC');
        var sensorESP_periodoA = document.getElementById('sensorESP_periodoA');
        var sensorESP_periodoB = document.getElementById('sensorESP_periodoB');
        var sensorESP_periodoC = document.getElementById('sensorESP_periodoC');
        var sensorESP_voltagemA = document.getElementById('sensorESP_voltagemA');
        var sensorESP_voltagemB = document.getElementById('sensorESP_voltagemB');
        var sensorESP_voltagemC = document.getElementById('sensorESP_voltagemC');
        var sensorESP_voltagemTHDA = document.getElementById('sensorESP_voltagemTHDA');
        var sensorESP_voltagemTHDB = document.getElementById('sensorESP_voltagemTHDB');
        var sensorESP_voltagemTHDC = document.getElementById('sensorESP_voltagemTHDC');
        var sensorESP_anguloAB = document.getElementById('sensorESP_anguloAB');
        var sensorESP_anguloAC = document.getElementById('sensorESP_anguloAC');
        var sensorESP_anguloBC = document.getElementById('sensorESP_anguloBC');
        var sensorESP_endereco = document.getElementById('sensorESP_endereco');
        var sensorESP_latitude = document.getElementById('sensorESP_latitude');
        var sensorESP_longitude = document.getElementById('sensorESP_longitude');

        // Regina Sensor elements
        var rInfoDeviceImage = document.getElementById('deviceImage_sensor');
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
        var sensor_endereco = document.getElementById('sensor_endereco');
        var sensor_latitude = document.getElementById('sensor_latitude');
        var sensor_longitude = document.getElementById('sensor_longitude');
        

        // ESPNPITI Sensor gauges variables
        let espTensaoGaugeChart, espPotenciaGaugeChart, espCorrenteGaugeChart;

        // Regina Sensor gauges variables
        let rTensaoGaugeChart, rPotenciaGaugeChart, rCorrenteGaugeChart;
        
        // Generic data and options for the gauges
        var data1, data2, data3;
        var options1, options2, options3;

        google.charts.load('current', {'packages':['gauge']});
        google.charts.setOnLoadCallback(drawGauges);

        function drawGauges() {    
            rTensaoGaugeChart = new google.visualization.Gauge(document.getElementById('reginaTensaoGaugeChart'));
            espTensaoGaugeChart = new google.visualization.Gauge(document.getElementById('espTensaoGaugeChart'));
            
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
            
            rPotenciaGaugeChart = new google.visualization.Gauge(document.getElementById('reginaPotenciaGaugeChart'));
            espPotenciaGaugeChart = new google.visualization.Gauge(document.getElementById('espPotenciaGaugeChart'));
            
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

            rCorrenteGaugeChart = new google.visualization.Gauge(document.getElementById('reginaCorrenteGaugeChart'));
            espCorrenteGaugeChart = new google.visualization.Gauge(document.getElementById('espCorrenteGaugeChart'));
            
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

            rTensaoGaugeChart.draw(data1, options1);
            espTensaoGaugeChart.draw(data1, options1);
            rPotenciaGaugeChart.draw(data2, options2);
            espPotenciaGaugeChart.draw(data2, options2);
            rCorrenteGaugeChart.draw(data3, options3);
            espCorrenteGaugeChart.draw(data3, options3);
        }

        var updateGauges = function updateGauges(t, w, a, entityType) {
            data1.setValue(0, 1, t);
            data2.setValue(0, 1, w);
            data3.setValue(0, 1, a);
            if(entityType === "Sensor") {
                rTensaoGaugeChart.draw(data1, options1);
                rPotenciaGaugeChart.draw(data2, options2);
                rCorrenteGaugeChart.draw(data3, options3);    
            }else if(entityType === "SensorESP") {
                espTensaoGaugeChart.draw(data1, options1);
                espPotenciaGaugeChart.draw(data2, options2);
                espCorrenteGaugeChart.draw(data3, options3);
            }
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
                if(entityInfo.id.match(/Regina/g))
                    rInfoDeviceImage.className = "infoDeviceImage sensor";
                else
                    rInfoDeviceImage.className = "infoDeviceImage poi";

                updateGauges(entityInfo.Tensao_V, entityInfo.Pot_Ativa_W, entityInfo.Corrente_A, "Sensor");
                
                if(entityInfo.TimeInstant != " ")
                    sensor_update_date.innerHTML = moment(entityInfo.TimeInstant).subtract(180, 'seconds').fromNow();
                else
                    sensor_update_date.innerHTML = "n/a";

                // Sensor Details
                sensor_id.innerHTML = entityInfo.id;
                sensor_tipo.innerHTML = entityInfo.type;
                sensor_corrente.innerHTML = (parseFloat(entityInfo.Corrente_A)) ? (entityInfo.Corrente_A+" A") : "n/a";
                sensor_fator_potencia.innerHTML = (parseFloat(entityInfo.Fat_Potencia_VA)) ? (entityInfo.Fat_Potencia_VA+" kVAr") : "n/a";
                sensor_fator_potenciaT.innerHTML = (parseFloat(entityInfo.Fat_Potencia_Total_VA)) ? (entityInfo.Fat_Potencia_Total_VA+" kVAr") : "n/a";
                sensor_potencia_aparente.innerHTML = (parseFloat(entityInfo.Pot_Aparente_W)) ? (entityInfo.Pot_Aparente_W+" W") : "n/a";
                sensor_potencia_aparenteT.innerHTML = (parseFloat(entityInfo.Pot_Aparente_Total_VA)) ? (entityInfo.Pot_Aparente_Total_VA+" WA") : "n/a";
                sensor_potencia_ativa.innerHTML = (parseFloat(entityInfo.Pot_Ativa_W)) ? (entityInfo.Pot_Ativa_W+" W") : "n/a";
                sensor_potencia_ativaT.innerHTML = (parseFloat(entityInfo.Pot_Ativa_Total_W)) ? (entityInfo.Pot_Ativa_Total_W+" W") : "n/a";
                sensor_potencia_reativa.innerHTML = (parseFloat(entityInfo.Pot_Reativa_VAR)) ? (entityInfo.Pot_Reativa_VAR+" VAR") : "n/a";
                sensor_potencia_reativaT.innerHTML = (parseFloat(entityInfo.Pot_Reativa_Total_VAR)) ? (entityInfo.Pot_Reativa_Total_VAR+" VAR") : "n/a";
                sensor_tensao.innerHTML = (parseFloat(entityInfo.Tensao_V)) ? (entityInfo.Tensao_V+" V") : "n/a";
                sensor_tensaoT.innerHTML = (parseFloat(entityInfo.Tensao_Total_V)) ? (entityInfo.Tensao_Total_V+" V") : "n/a";
                sensor_endereco.innerHTML = entityInfo.endereco.rua+" - "+entityInfo.endereco.bairro+" - "+entityInfo.endereco.cidade+", "+entityInfo.endereco.cep;
                sensor_longitude.innerHTML = entityInfo.location.coordinates[0]+" &deg";
                sensor_latitude.innerHTML = entityInfo.location.coordinates[1]+" &deg";

            } else if (entityInfo.type === "SensorESP") {
                
                espInfoDeviceImage.className = "infoDeviceImage sensorESP";

                updateGauges(entityInfo.voltagem_a, entityInfo.power_active_a, entityInfo.corrente_a, "SensorESP");

                if(entityInfo.TimeInstant != " ")
                    sensorESP_update_date.innerHTML = moment(entityInfo.TimeInstant).subtract(180, 'seconds').fromNow();
                else
                    sensorESP_update_date.innerHTML = "n/a";

                // Details
                sensorESP_id.innerHTML = entityInfo.id;
                sensorESP_tipo.innerHTML = entityInfo.type;
                sensorESP_correnteA.innerHTML = (parseFloat(entityInfo.corrente_a)) ? (entityInfo.corrente_a+" A") : "n/a";
                sensorESP_correnteB.innerHTML = (parseFloat(entityInfo.corrente_b)) ? (entityInfo.corrente_b+" A") : "n/a";
                sensorESP_correnteC.innerHTML = (parseFloat(entityInfo.corrente_c)) ? (entityInfo.corrente_c+" A") : "n/a";
                sensorESP_correnteTHDA.innerHTML = (parseFloat(entityInfo.current_THD_A)) ? (entityInfo.current_THD_A+" A") : "n/a";
                sensorESP_correnteTHDB.innerHTML = (parseFloat(entityInfo.current_THD_B)) ? (entityInfo.current_THD_B+" A") : "n/a";
                sensorESP_correnteTHDC.innerHTML = (parseFloat(entityInfo.current_THD_C)) ? (entityInfo.current_THD_C+" A") : "n/a";
                sensorESP_potencia_ativaA.innerHTML = (parseFloat(entityInfo.power_active_a)) ? (entityInfo.power_active_a+" W") : "n/a";
                sensorESP_potencia_ativaB.innerHTML = (parseFloat(entityInfo.power_bctive_b)) ? (entityInfo.power_bctive_b+" W") : "n/a";
                sensorESP_potencia_ativaC.innerHTML = (parseFloat(entityInfo.power_cctive_c)) ? (entityInfo.power_cctive_c+" W") : "n/a";
                sensorESP_potencia_reativaA.innerHTML = (parseFloat(entityInfo.power_reactive_A)) ? (entityInfo.power_reactive_A+" W") : "n/a";
                sensorESP_potencia_reativaB.innerHTML = (parseFloat(entityInfo.power_reactive_B)) ? (entityInfo.power_reactive_B+" W") : "n/a";
                sensorESP_potencia_reativaC.innerHTML = (parseFloat(entityInfo.power_reactive_C)) ? (entityInfo.power_reactive_C+" W") : "n/a";
                sensorESP_potencia_aparenteA.innerHTML = (parseFloat(entityInfo.power_apparent_A)) ? (entityInfo.power_apparent_A+" W") : "n/a";
                sensorESP_potencia_aparenteB.innerHTML = (parseFloat(entityInfo.power_bpparent_B)) ? (entityInfo.power_bpparent_B+" W") : "n/a";
                sensorESP_potencia_aparenteC.innerHTML = (parseFloat(entityInfo.power_cpparent_C)) ? (entityInfo.power_cpparent_C+" W") : "n/a";
                sensorESP_fator_potenciaA.innerHTML = (parseFloat(entityInfo.power_factor_A)) ? (entityInfo.power_factor_A+" kVAr") : "n/a";
                sensorESP_fator_potenciaB.innerHTML = (parseFloat(entityInfo.power_factor_B)) ? (entityInfo.power_factor_B+" kVAr") : "n/a";
                sensorESP_fator_potenciaC.innerHTML = (parseFloat(entityInfo.power_factor_C)) ? (entityInfo.power_factor_C+" kVAr") : "n/a";
                sensorESP_periodoA.innerHTML = (parseFloat(entityInfo.periodo_A)) ? (entityInfo.periodo_A+" s") : "n/a";
                sensorESP_periodoB.innerHTML = (parseFloat(entityInfo.periodo_B)) ? (entityInfo.periodo_B+" s") : "n/a";
                sensorESP_periodoC.innerHTML = (parseFloat(entityInfo.periodo_C)) ? (entityInfo.periodo_C+" s") : "n/a";
                sensorESP_voltagemA.innerHTML = (parseFloat(entityInfo.voltagem_a)) ? (entityInfo.voltagem_a+" V") : "n/a";
                sensorESP_voltagemB.innerHTML = (parseFloat(entityInfo.voltagem_b)) ? (entityInfo.voltagem_b+" V") : "n/a";
                sensorESP_voltagemC.innerHTML = (parseFloat(entityInfo.voltagem_c)) ? (entityInfo.voltagem_c+" V") : "n/a";
                sensorESP_voltagemTHDA.innerHTML = (parseFloat(entityInfo.voltagem_THD_A)) ? (entityInfo.voltagem_THD_A+" V") : "n/a";
                sensorESP_voltagemTHDB.innerHTML = (parseFloat(entityInfo.voltagem_THD_B)) ? (entityInfo.voltagem_THD_B+" V") : "n/a";
                sensorESP_voltagemTHDC.innerHTML = (parseFloat(entityInfo.voltagem_THD_C)) ? (entityInfo.voltagem_THD_C+" V") : "n/a";
                sensorESP_anguloAB.innerHTML = (parseFloat(entityInfo.angle_a_b)) ? (entityInfo.angle_a_b+" &deg") : "n/a";
                sensorESP_anguloAC.innerHTML = (parseFloat(entityInfo.angle_a_c)) ? (entityInfo.angle_a_c+" &deg") : "n/a";
                sensorESP_anguloBC.innerHTML = (parseFloat(entityInfo.angle_b_c)) ? (entityInfo.angle_b_c+" &deg") : "n/a";
                sensorESP_endereco.innerHTML = entityInfo.endereco.rua+" - "+entityInfo.endereco.bairro+" - "+entityInfo.endereco.cidade+", "+entityInfo.endereco.cep;
                sensorESP_longitude.innerHTML = entityInfo.location.coordinates[0]+" &deg";
                sensorESP_latitude.innerHTML = entityInfo.location.coordinates[1]+" &deg";

            } else if (entityInfo.type === "Thing") {
                MashupPlatform.widget.log("Nothing to do with Thing entities!");
            }else {
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
                hideAllElements(sensorESP_containers);
                /*hideAllElements(gro_containers);
                hideAllElements(par_containers);
                hideAllElements(was_containers);
                hideAllElements(lse_containers);*/
                break;
            case "SensorESP":
                hideAllElements(sensor_containers);
                showAllElements(sensorESP_containers);
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
