Avrelia-JavaScript
==================

General
-------
AJS requires following libraries / frameworks to work:
- jQuery
- Twitter Bootstrap

The AJS Framework is structured similar the the example bellow:

    + controllers/
    + libraries/
        log.js
        ...
    + models/
    map.json
    map.inc.json
    ajs.js
    routes.js

Adding New Files
----------------

As we add a new file (most likely we'll be adding controllers), we must add reference for it, to the map.inc.json file. Additional to that, each controller, library and model must be registered in the AJS namespace. We don't want any code in the global space.

NOTE: Please don't change generic ```map.json```, instead use ```map.inc.json``` to add your files.

First thing we need to do is to call AJS.register method and pass in the name of the controller or the library we want to register. This follows the directory structure itself; the only two differences are, that individual segments are capitalized (and camel-cased for multiple words) and that first word is in singular form, so instead of controllers we have Controller, and instead of libraries we have Library. Lets see how this is done for the events/index.js controller.

    AJS.register('Controller.Events.Index', ...

The second parameter of register method is actual controller's logic, wrapped in function:

    AJS.register('Controller.Events.Index', function() {
        // Controller's Logic Here
    }, ...

Third parameter (boolean), indicate if function which we just passed in, should be executed imminently. If true, then the result will be -registered- otherwise the functions itself. In most cases this will be true, and default (if you don't provide this parameter) is true.

    AJS.register('Controller.Events.Index', function() {
        // Controller's Logic Here
    }, false);

The example of log.js library:

    AJS.register('Library.Log', function() {
        // Log's Logic Here
    });

Using Controllers and Libraries
------------------------------

All controllers, libraries and models are accessible through AJS object (AJS.Library, AJS.Controller, AJS.Model). Lets see this in an example:

    AJS.register('Controller.Events.Index', function() {
    
        var Lib      = AJS.Library,
            base_url = Lib.Config.get('base_url'),
            Messages = new Lib.Message('#my_messages_wrapper');

        Lib.Log.info('Hello world!');

        AJS.Controller.Events.Sidebar.trigger_something();

        Messages
            .info('Hello world!')
            .show();
    });

Libraries overview
------------------

### AJS

#### void AJS.register( string namespace, function exe_class, boolean autorun )

Register new controller, model or library. Example:

    AJS.register('Controller.Animals.Cat', function() {

        // Controller's logic here
    }, true);

#### string AJS.l( string key, object params )

Shortcut for ```AJS.Library.Language.translate()```

#### string AJS.url( string uri )

Using ```AJS.Library.Config.get('base_url')``` to get full url.

#### object AJS.Library.<Library Name>
#### object AJS.Controller.<Controller Name>
#### object AJS.Model.<Model Name>

--------------------------------------------------------------------------------

### AJS.Library.Config

Config is provided thought ```window.AJS_Config```, in following format:

    {
        'key' : 'Value'
    }

Following options are currently supported by the framework itself:

    base_url                string  Define web-site's default URL like: http://domain.tld
    is_debug                boolean If true, Log messages will be send to the console
    auto_init_controllers   boolean If true, all controllers will be automatically executed.
                                    Set this to false, if you're using routes.js

#### mixed AJS.Library.Config.get( string key, mixed default_value )

    AJS.Library.Config.get('my_name', 'Marko');

--------------------------------------------------------------------------------

### AJS.Library.Form

Form new to be constructed, call var FormObj = new AJS.Library.Form( object options )

Following options are available:
    
    form       : object jQuery reference
    [ignore]   : array  An array of fields which should be ignored.
    [defaults] : array  Default value for when particular field has no value.
    [append]   : array  List of fields which we want to append to the rest of the form fields.

#### object FormObj.do_reset()

Trigger reset action on the form, and returns reference to itself.

#### object FormObj.do_empty()

Will empty the form, set all fields to be empty, unchecked, etc... Returns reference to itself.

#### object FormObj.append_field( object $field )

Append new (jQuery) form field to the rest. This is useful if we want to use external form's fields.

#### object FormObj.refresh_fields()

Useful if we add / remove some fields in since last form request. In first submit 
or after ignore_fields modification fields will be auto refresh.

#### array FormObj.get_fields_raw()

Return list of all fields in following format:
    
    [
        {name:'name', value:'value', field:$jquery_ref},
        ...
    ]

#### object FormObj.get_fields_post()

Get fields in format which can be posted, example:

    {key: value, another: value: third: [array, values, in]}

In case of check-boxes, etc.. will return only checked items.

--------------------------------------------------------------------------------

### AJS.Library.Language

Languages are provided thought ```window.AJS_Dictionary```, in following format:

    {
        'KEY' : 'Value'
    }

#### string AJS.Library.Language.translate( string key, object params )

You can use shortcut ```string AJS.l( string key, object params )```.

--------------------------------------------------------------------------------

### AJS.Library.Log

#### void AJS.Library.Log.log( string message )
#### void AJS.Library.Log.info( string message )
#### void AJS.Library.Log.warn( string message )
#### void AJS.Library.Log.debug( string message )
#### void AJS.Library.Log.error( string message )