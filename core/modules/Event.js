
module.exports = function(){
    function Initialize(name){
        if(Event.listeners[name] === undefined) Event.listeners[name] = [];
        if(Event.contexts[name] === undefined) Event.contexts[name] = {};
    }
    function Event(name, context){
        Initialize(name);

        // This function adds a listener
        function event(listener, remove){
            if(remove){
                let index = Event.listeners[name].indexOf(listener);
                if(index > -1) Event.listeners[name].splice(index, 1);
            }
            else if(typeof listener === 'function') Event.listeners[name].push(listener);
            return event;
        };

        event.listeners = Event.listeners[name];
        event.context = Event.contexts[name];

        event.trigger = Event.trigger.bind(Event, name);
        event.listen = event;
        event.get = Event.get(name);
        event.set = Event.set(name);

        return event;
    }
    
    Event.contexts = {};
    Event.listeners = {};

    Event.listen = Event;

    Event.trigger = function(name, context){
        Initialize(name);
        if(typeof context === 'object') Event.contexts[name] = context;
        return function Trigger(){
            let args = Array.prototype.slice.call(arguments);
            for(let i=0; i<Event.listeners[name].length;i++){
                Event.listeners[name][i].apply(Event.contexts[name], args);
            }
            return Trigger;
        };
    };

    Event.get = function(name){
        Initialize(name);
        return function(attr){
            Event.contexts[name][attr];
        };
    };

    Event.set = function(name, attribute, value){
        Initialize(name);
        return function Set(attr, value){
            Event.contexts[name][attr] = value;
            return Set;
        };
    };

    Event.callback = function(){
        let context = this;
        let args = Array.prototype.slice.call(arguments);
        let called = null;
        let listeners = [];
        function Callback(listener, remove){
            if(remove){
                let index = listeners.indexOf(listener);
                if(index > -1) listeners.splice(index, 1);
            }
            else if(typeof listener === 'function'){
                if(called) listener.apply(context, called);
                else listeners.push(listener);
            }
        }
        Callback.return = function(){
            if(called) return;
            let args = Array.prototype.slice.call(arguments);
            called = args;
            listeners.forEach(function(listener){
                listener.apply(context, args);
            });
            return Callback;
        }
        if(args.length) Callback.trigger.apply(Callback, args);
        return Callback;
    }
    

    this.Event = Event;

    return Event;
};