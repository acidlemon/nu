;(function (global, document, nu) {
    var idCounter       = 0,
        delegateEventRe = /^(\S+)\s*(.*)$/,
        viewOptions     = [
            "model"      , "collection" , "el"      , "id"     ,
            "attributes" , "className"  , "tagName" , "events"
        ];

    function uniqueId(prefix) {
        var id = ++idCounter + "";

        return prefix ? prefix + id : id;
    }

    function extend(protoProps, staticProps) {
        var parent = this,
            child, surrogate;

        if (protoProps && nu.has(protoProps, "constructor")) {
            child = protoProps.constructor;
        }
        else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }

        nu.extend(child, parent, staticProps);

        surrogate = function () {
            this.constructor = child;
        };

        surrogate.prototype = parent.prototype;
        child.prototype     = new surrogate();

        if (protoProps) {
            nu.extend(child.prototype, protoProps);
        }

        child.__super__ = parent.prototype;

        return child;
    }

    function View(options) {
        options      = options || {};
        this.cid     = uniqueId("view_");
        this._events = [];

        // console.log(viewOptions);
        // console.log(nu.pick(options, viewOptions));
        // console.log(nu.pick(options));
        nu.extend(this, nu.pick(options, viewOptions));
        // console.log(nu.pick(options, viewOptions));
        this._ensureElement();
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    }

    View.prototype = {
        tagName: "div",
        initialize: function () {},
        render: function () {
            return this;
        },
        remove: function () {
            this.el.remove();
            this.stopListening();

            return this;
        },
        setElement: function (element, delegate) {
            if (this.el) {
                this.undelegateEvents();
            }

            this.el = nu(element);

            if (delegate !== false) {
                this.delegateEvents();
            }

            return this;
        },
        delegateEvents: function (events) {
            events = events || nu.result(this, "events");

            if (!events) {
                return this;
            }

            var self = this,
                method, match, eventName, selector;

            nu.each(events, function (key, value) {
                method = !nu.isFunction(events[key]) ? self[events[key]] : events[key];

                if (method) {
                    match     = key.match(delegateEventRe);
                    eventName = match[1];
                    selector  = match[2];
                    method    = method.bind(self);

                    self._events.push(eventName);
                    // eventName += ".delegateEvents" + self.cid;

                    if (selector === "") {
                        self.el.on(eventName, method);
                    }
                    else {
                        self.el.on(eventName, selector, method);
                    }
                }
            });

            return this;
        },
        undelegateEvents: function () {
            // this.el.off(".delegateEvents" + this.cid);
            // this.el.off(this._events.join(" "));

            return this;
        },
        _ensureElement: function () {
            var element, attrs;

            if (!this.el) {
                element = document.createElement(this.tagName);
                attrs   = nu.extend({}, this.attributes);

                if (this.id) {
                    attrs.id = this.id;
                }
                if (this.className) {
                    attrs["class"] = this.className;
                }

                this.el = nu(element).attr(attrs);
                this.setElement(this.el, false);
            }
            else {
                this.setElement(this.el, false);
            }
        }
    };

    View.extend = extend;
    nu.view     = View;
})(this, this.document, this.Nu);
