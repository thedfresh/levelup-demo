'use strict';

angular.module('levelUp.locator', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/locator', {
        templateUrl: 'locator/index.html',
        controller: 'LocatorCtrl',
        controllerAs: 'vm'
    });
}])

.controller('LocatorCtrl', ['$http', '$document', '$filter', function($http, $document, $filter) {

    var vm = this;
    vm.initMap = initMap;
    vm.locations = [];
    vm.markers = [];
    vm.categories = [];
    vm.selectedCategories = [];

    function getData() {
        return $http.get('https://gist.githubusercontent.com/aripollak/2590fb80d71d2dc136a315cf4b608537/raw/dbd05012e9afd0d2064d33bda1640262f976f4f1/locations.json').then(function(response) {
            angular.forEach(response.data, function(merchant) {
                // category list
                angular.forEach(merchant.location.category_names, function(category) {
                    if (vm.categories.indexOf(category) < 0) {
                        vm.categories.push(category);
                    }
                });
                // all locations
                vm.locations.push(merchant.location);
            })
            initMap();
        });
    };

    var map;
    var bounds = new google.maps.LatLngBounds();

    function initMap() {

        map = new google.maps.Map($document[0].querySelector('#map'), {});
        map.fitBounds(bounds);
        map.panToBounds(bounds);

        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);

        // map tiles
        function CoordMapType(tileSize) {
            this.tileSize = tileSize;
        }
        CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
            var div = ownerDocument.createElement('div');
            div.innerHTML = coord;
            div.style.width = this.tileSize.width + 'px';
            div.style.height = this.tileSize.height + 'px';
            div.style.fontSize = '10';
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '1px';
            div.style.borderColor = '#AAAAAA';
            return div;
        };
        map.overlayMapTypes.insertAt(0, new CoordMapType(new google.maps.Size(256, 256)));

        // set up the default map
        angular.forEach(vm.locations, function(location) {
            var latLng = new google.maps.LatLng(location.latitude, location.longitude);
            bounds.extend(latLng);
            var marker = new google.maps.Marker({
                title: location.merchant_name,
                position: latLng
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(getCard(location));
                infowindow.open(map, this);
            });
            addMarker(marker);
            // array of markers to filter on
            vm.markers.push(marker);
        })

    }

    function addMarker(marker) {
        marker.setMap(map);
    }

    function removeMarker(location) {
        var marker = $filter('filter')(vm.markers, { title: location.merchant_name })[0];
        marker.setMap(null);
    }

    // search filter
    vm.merchantFilter = function() {
        angular.forEach(vm.locations, function(location) {
            if (location.merchant_name.toLowerCase().indexOf(vm.nameFilter.toLowerCase()) === -1) {
                removeMarker(location);
            } else {
                var marker = $filter('filter')(vm.markers, { title: location.merchant_name })[0];
                addMarker(marker)
            }
        })
    }

    // info card
    function getCard(location) {
        return '<div style="width:200px;">' +
            '<img class="rounded-circle " height="75" src="' + location.image_url + '" alt="Card image cap">' +
            '<h6>' + location.merchant_name + ' ' + //(location.name ? ' (' + location.name + ') ' : ' ') +
            //(location.merchant_description ? '<p>' + location.merchant_description : '') +
            (location.facebook_url ? '<a href="' + location.facebook_url + '"><i class="fa fa-facebook fa-small"></i></a> ' : '') +
            (location.twitter_url ? '<a href="' + location.twitter_url + '"><i class="fa fa-twitter fa-small"></i></a> ' : '') +
            (location.yelp_url ? '<a href="' + location.yelp_url + '"><i class="fa fa-yelp fa-small"></i></a> ' : '') +
            '</h6>' +
            '<p>' +
            (location.menu ? '<a href="' + location.menu + '"><i class="fa fa-bars"></i></a> menu / ' : '') +
            (location.delivery_menu_url ? '<a href="' + location.delivery_menu_url + '"><i class="fa fa-car"></i> delivery menu</a><br/>' : '') +
            (location.hours ? location.hours + '<br/' : '') +
            location.phone + '<br/>' +
            '</p>' +
            '<address>' +
            location.street_address + '<br/>' +
            location.locality + ',' + location.region + '<br/>' +
            location.postal_code + '<br/>' +
            '</address>' +
            '<div>'
    }

    // vm.categoryFilter = function() {
    // 
    // }

    // vm.typeFilter = function() {
    //  "fulfillment_types": [ "delivery", "in_store", "pickup" ]
    // }

    getData();
}]);