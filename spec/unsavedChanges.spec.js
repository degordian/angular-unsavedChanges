describe('UnsavedChanges', function() {

    var unsavedDev,
        rootScope,
        formTemplate,
        ngView,
        pageNav1,
        pageNav2,
        scope,
        theForm,
        parentScope,
        theClearButton,
        theSubmitButton,
        pageController,
        unsavedChanges,
        unsavedDevProviderCache,
        defaultMessageReload,
        defaultMessageNavigate,
        translateProvider,
        unsavedWarningsConfig,
        clearButton,
        $templateCache,
        $routeProviderCache,
        $rootScope,
        $controller,
        $location,
        $provide,
        $route,
        $window,
        $compile,
        $scope;

    beforeEach(module('ngRoute'));
    beforeEach(module('unsavedChanges'));
    beforeEach(module('pascalprecht.translate'));

    // cache providers
    beforeEach(module(function($compileProvider, $routeProvider, $provide, unsavedWarningsConfigProvider, $translateProvider) {

        // cache the provider for access in tests
        $routeProviderCache = $routeProvider;
        unsavedWarningsConfigProviderCache = unsavedWarningsConfigProvider;
        translateProvider = $translateProvider;

        translateProvider.translations('en', {
            TEST: 'Hello'
        }).translations('es', {
            TEST: '¡hola'
        });

        translateProvider.preferredLanguage('es');
        translateProvider.fallbackLanguage('en');

        function MyCtrl($scope) {
            //$scope.state = 'WORKS';
            controllerScope = $scope;
            //console.log('hello?');
        };
        
        clearButton = angular.element('<button id="clear" type="button" unsaved-warning-clear>Clear</button>');

        var formTemplate = angular.element('<div>' +
            '<form name="testForm" unsaved-warning-form>' +
            '<input name="test" type="text" ng-model="test"/>' +
            '<button id="submit" type="submit"></button>' +
            clearButton +
            '</form>' +
            '</div>');

        // setup test routes
        $routeProviderCache
            .when('/page1', {
                controller: MyCtrl,
                template: formTemplate
            })
            .when('/page2', {
                controller: MyCtrl,
                template: formTemplate
            })
            .otherwise({
                redirectTo: '/page1'
            });

        // mock = {
        //     alert: jasmine.createSpy(),
        //     alert: jasmine.createSpy(),
        //     scrollTo: jasmine.createSpy()
        // };

        // $provide.value('$window', mock);

        // setup message defaults
        defaultMessageReload = "You will lose unsaved changes if you reload this page";
        defaultMessageNavigate = "You will lose unsaved changes if you leave this page";

    }));

    // modules
    beforeEach(inject(function(_$rootScope_, _$controller_, _$compile_, _$sniffer_, _$location_, _$window_, _$route_, _$templateCache_, _unsavedWarningsConfig_) {

        // grab our injected variables
        $sniffer = _$sniffer_;
        $compile = _$compile_;
        $location = _$location_;
        $window = _$window_;
        $route = _$route_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $templateCache = _$templateCache_;
        scope = $rootScope.$new();
        unsavedWarningsConfig = _unsavedWarningsConfig_;

        var parentController = function() {};

        ngView = angular.element('<div ng-view></div>');
        $compile(ngView)($rootScope);

        $location.path('/page1');
        $rootScope.$digest();



        // MyCtrl = function($scope) {
        //   controllerScope = $scope;
        //   log.push('ctrl-init');
        // };



        // var pageController = $controller({
        //     $scope: parentScope
        // });

        // var mock = function() {};

        // mock.prototype.confirm = function() {
        //     return true;
        // }

        // // spies!
        spyOn(console, 'log').andCallThrough();
        // spyOn($window, 'confirm').andCallThrough();

        // // selector for the form, since it's within the group
        // theForm = scope.$$childTail.testForm;
        // theClearButton = formTemplate.find('#clear');
        // theSubmitButton = formTemplate.find('#submit');

    }));

    describe('Directives', function() {

        describe('Clear', function() {

            it('registers with attr unsaved-warning-clear', function() {
                //expect(theClearButton.hasClass('ng-scope')).toEqual(true);
                console.log(clearButton);           
            });

            // it should be registered within a form...
            // @todo throw warning or document
            it('sets parent form to setPristine() when clicked', function() {});

        });

        describe('Form', function() {

            //it('registers with attr unsaved-warning-form', function() {});

            it('adds listener to onbeforeunload to detect page reload', function() {
                expect($window.onbeforeunload.toString()).toContain('allFormsClean()');
            });

            it('adds listener $locationChangeStart', function() {
                expect(controllerScope.$parent.$$listeners.$locationChangeStart.toString()).toContain('!allFormsClean()');
            });

            it('removes listener when scope is destroyed', function() {});

        });

    });

    describe('Provider Configuration', function() {

        ddescribe('enable logging', function() {

            it('defaults to false', function() {
                expect(unsavedWarningsConfigProviderCache.logEnabled).toEqual(false);
            });

            it('sets logging enabled', function() {
                unsavedWarningsConfigProviderCache.logEnabled = true;
                expect(unsavedWarningsConfig.logEnabled).toEqual(true);
            });

            describe('logging enabled', function() {

                beforeEach(function() {
                    unsavedWarningsConfigProviderCache.logEnabled = true;
                });

                it('logs messages with 1 argument', function() {
                    unsavedWarningsConfig.logIfEnabled('testing');
                    expect(console.log).toHaveBeenCalledWith('testing');
                });

                it('logs messages with 2 or more arguments', function() {
                    unsavedWarningsConfig.logIfEnabled('testing', 'second', 'third');
                    expect(console.log).toHaveBeenCalledWith('testing', 'second', 'third');
                });

            });

            describe('logging disabled', function() {

                it('does not log', function() {
                    unsavedWarningsConfig.logIfEnabled('testing', 'second', 'third');
                    expect(console.log).not.toHaveBeenCalled();
                });

            });


        });

        describe('custom navigate message', function() {

            it('has a nice default', function() {
                expect(unsavedWarningsConfig.navigateMessage).toEqual(defaultMessageNavigate);
            });

            it('sets config', function() {
                unsavedWarningsConfigProviderCache.navigateMessage = 'Testing!';
                expect(unsavedWarningsConfig.navigateMessage).toEqual('Testing!');
            });

            it('gets at runtime', function() {
                expect(unsavedWarningsConfig.navigateMessage).toEqual(defaultMessageNavigate);
            });

        });

        describe('custom reload message', function() {

            it('has a nice default', function() {
                expect(unsavedWarningsConfig.reloadMessage).toEqual(defaultMessageReload);
            });

            it('sets in config', function() {
                unsavedWarningsConfigProviderCache.reloadMessage = 'Testing!';
                expect(unsavedWarningsConfig.reloadMessage).toEqual('Testing!');
            });

            it('gets at runtime', function() {
                expect(unsavedWarningsConfig.reloadMessage).toEqual(defaultMessageReload);
            });

        });

        describe('watch for custom event', function() {

            it('defaults to $locationChangeStart', function() {
                expect(unsavedWarningsConfig.routeEvent).toEqual('$locationChangeStart');
            });

            it('sets in config', function() {
                unsavedWarningsConfigProviderCache.routeEvent = '$hotDamn';
                expect(unsavedWarningsConfig.routeEvent).toEqual('$hotDamn');
            });

            it('gets at runtime', function() {
                expect(unsavedWarningsConfig.routeEvent).toEqual('$locationChangeStart');
            });

        });

        describe('use translate service', function() {
            
            beforeEach(function() {
                unsavedWarningsConfigProviderCache.navigateMessage = 'TEST';
            })

            it('defaults to using the translate service, if available', function() {
                unsavedWarningsConfigProviderCache.useTranslateService = false;
                expect(unsavedWarningsConfig.getNavigateMessageTranslated()).toEqual('TEST');
            });

            it('can use translate service if available', function() {
                expect(unsavedWarningsConfig.getNavigateMessageTranslated()).toEqual('¡hola');
            });

        });

    });

});
