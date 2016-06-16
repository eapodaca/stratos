(function() {
  'use strict';

  describe('AddRouteController', function() {
    var addRouteController, $httpBackend, modelManager, $uibModalInstance;

    var space_guid = 'testSpace';
    var domain_guid = 'testDomain';
    var cnsiGuid = 'testCnsi';
    var applicationId = 'testApplicationId';
    var mockAddRouteResponse = {
      testCnsi: {
        metadata: {
          guid: 'testGuid'
        }
      }
    };

    beforeEach(module('green-box-console'));
    beforeEach(module('cloud-foundry.view.applications.application.summary'));

    beforeEach(inject(function($injector) {

      var context = {
        data: {
          path: null,
          port: null,
          host: null,
          space_guid: space_guid,
          domain_guid: domain_guid
        }
      };
      var content = {};

      $httpBackend = $injector.get('$httpBackend');
      var $stateParams = $injector.get('$stateParams');
      modelManager = $injector.get('app.model.modelManager');
      $uibModalInstance = {
        close: angular.noop,
        dismiss: angular.noop
      };
      var $controller = $injector.get('$controller');
      addRouteController = $controller('cloud-foundry.view.applications.application.summary.addRoutesCtrl', {
        context: context,
        content: content,
        $stateParams: $stateParams,
        modelManager: modelManager,
        $uibModalInstance: $uibModalInstance
      });


      addRouteController.cnsiGuid = cnsiGuid;
      addRouteController.applicationId = applicationId;
      spyOn($uibModalInstance, 'close').and.callThrough();
      spyOn(addRouteController, 'onAddRouteError').and.callThrough();

    }));

    it('should be defined', function() {
      expect(addRouteController).toBeDefined();
    });

    it('should have `host`, `port` and `path`properties initially set to null', function() {
      expect(addRouteController.context.data.host).toBe(null);
      expect(addRouteController.context.data.port).toBe(null);
      expect(addRouteController.context.data.path).toBe(null);
    });

    it('should have `domain_guid`, `space_guid` set to appropriate values', function() {
      expect(addRouteController.context.data.space_guid).toEqual(space_guid);
      expect(addRouteController.context.data.domain_guid).toEqual(domain_guid);
    });

    it('should successfully add a route', function() {

      $httpBackend.when('POST', '/pp/v1/proxy/v2/routes').respond(200, mockAddRouteResponse);
      $httpBackend.when('PUT', '/pp/v1/proxy/v2/routes/testGuid/apps/' + applicationId).respond(200, {});
      $httpBackend.when('GET', '/pp/v1/proxy/v2/apps/' + applicationId + '/summary').respond(200, {});

      addRouteController.addRoute();
      $httpBackend.flush();

      expect($uibModalInstance.close).toHaveBeenCalled();
      expect(addRouteController.onAddRouteError).not.toHaveBeenCalled();
    });

    it('should invoke onAddRouteError when failing to associate a route', function() {


      $httpBackend.when('POST', '/pp/v1/proxy/v2/routes').respond(200, mockAddRouteResponse);
      $httpBackend.when('PUT', '/pp/v1/proxy/v2/routes/testGuid/apps/' + applicationId).respond(500, {});

      addRouteController.addRoute();
      $httpBackend.flush();

      expect(addRouteController.onAddRouteError).toHaveBeenCalled();
      expect($uibModalInstance.close).not.toHaveBeenCalled();
      expect(addRouteController.addRouteError).toBe(true);
    });

    it('should invoke onAddRouteError when failing to add a route', function() {


      $httpBackend.when('POST', '/pp/v1/proxy/v2/routes').respond(500, mockAddRouteResponse);

      addRouteController.addRoute();
      $httpBackend.flush();

      expect(addRouteController.onAddRouteError).toHaveBeenCalled();
      expect($uibModalInstance.close).not.toHaveBeenCalled();
      expect(addRouteController.addRouteError).toBe(true);
    });

    it('should invoke onAddRouteError when failing to update AppSummary', function() {


      $httpBackend.when('POST', '/pp/v1/proxy/v2/routes').respond(200, mockAddRouteResponse);
      $httpBackend.when('PUT', '/pp/v1/proxy/v2/routes/testGuid/apps/' + applicationId).respond(200, {});
      $httpBackend.when('GET', '/pp/v1/proxy/v2/apps/' + applicationId + '/summary').respond(500, {});


      addRouteController.addRoute();
      $httpBackend.flush();

      expect(addRouteController.onAddRouteError).toHaveBeenCalled();
      expect($uibModalInstance.close).not.toHaveBeenCalled();
      expect(addRouteController.addRouteError).toBe(true);
    });

  });
})();
