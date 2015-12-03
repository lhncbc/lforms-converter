'use strict';


  describe('Should test lforms-converter', function () {

    var page = require('./demopage.po');


    beforeAll(function() {
      setAngularSite(true);
      browser.get('/');
    });


    it('should display converted lforms widget', function() {
      expect(page.panelTitle.getText()).toBe('Test Form');
    });


    describe('should test skip logic', function () {


      it('Should hide targets', function() {
        expect(page.skipLogicTarget1.isPresent()).toBeFalsy();
        expect(page.skipLogicTarget2.isPresent()).toBeFalsy();
      });


      it('Should display targets on setting source to Yes', function() {
        // Trigger with source
        page.skipLogicSource.sendKeys('Yes');
        page.skipLogicSource.sendKeys(protractor.Key.TAB);

        expect(page.skipLogicTarget1.isDisplayed()).toBeTruthy();
        expect(page.skipLogicTarget2.isDisplayed()).toBeTruthy();
      });
    });
});