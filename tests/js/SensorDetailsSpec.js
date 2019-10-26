/*
 * sensor-details
 * https://github.com/gbvsilva/sensor-details-widget
 *
 * Copyright (c) 2019 REGINA-Lab
 * Licensed under the MIT license.
 */

/* globals $, MashupPlatform, MockMP, SensorDetails */

(function () {

    "use strict";

    describe("SensorDetails", function () {

        var widget;

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'widget'
            });
        });

        beforeEach(function () {
            MashupPlatform.reset();
            widget = new SensorDetails();
        });

        it("Dummy test", function () {
            expect(widget).not.toBe(null);
        });

    });

})();
