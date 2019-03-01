import React from 'react';

var reactCurrentOwner = (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || false).ReactCurrentOwner || false;
var emptyRefsObject = new React.Component().refs;
var defineProperty = Object.defineProperty;
var createElement = React.createElement;
var REF_FUNC = Symbol('REF_FUNC');
var REF_MAP = Symbol('REF_MAP');

React.createElement = function(type, props) {
    if (typeof type === 'function' && type.prototype.isReactComponent) {
        var p = getProps(type, props);
        if (p) {
            arguments[1] = props = p;
        };
    };

    return createElement.apply(this, arguments);
};

function getProps(type, props) {
    // if (typeof type !== 'function' || !type.prototype.isReactComponent) {
    //     return;
    // };

    var owner = reactCurrentOwner.current;
    if (!owner) {
        return;
    };

    var inst = getInstances(owner);
    if (!inst) {
        return;
    };

    if (!props) {
        return {ref: getEmptyRef(inst)};
    };

    var ref = props.ref || null;
    var map = inst[REF_MAP];
    if (!map) {
        defineProperty(inst, REF_MAP, {
            enumerable: false,
            value: map = new Map(),
        });
    };

    var fun = map.get(ref);
    if (fun) {
        props.ref = fun;
        return;
    };

    if (!ref) {
        props.ref = getEmptyRef(inst);
        return;
    };

    if (typeof ref === 'string') {
        let refs = inst.refs;
        if (refs === emptyRefsObject) {
            refs = inst.refs = {};
        };

        map.set(ref, fun = function(x) {
            upAllElements(inst, x);

            var refs = inst.refs;
            if (x === null) {
                delete refs[ref];
                map.delete(ref);

            } else {
                refs[ref] = x;
            };
        });
        props.ref = fun;
        return;
    };

    if (typeof ref === 'function') {
        let func = map.get(ref);
        if (!func) {
            map.set(ref, func = function(x) {
                upAllElements(owner.stateNode, x);
                ref.current = x;
                if (!x) {
                    map.delete(ref);
                };
            });
        };
        props.ref = func;
        return;
    };

    if (typeof ref === 'object') {
        let func = map.get(ref);
        if (!func) {
            map.set(ref, func = function(x) {
                upAllElements(owner.stateNode, x);
                ref.current = x;
                if (!x) {
                    map.delete(ref);
                };
            });
        };
        props.ref = func;
        return;
    };

};

function getInstances(owner) {
    var inst = owner.stateNode;
    if (!inst) {
        var re;
        while(re = owner.return) {
            if (typeof owner.type === 'function') {
                if (owner.type.prototype.isReactComponent) {
                    return owner.stateNode;
                };
            };
            owner = re;
        };
        return null;
    };

    return owner.stateNode;
};

function getEmptyRef(inst) {
    let ref = inst[REF_FUNC];
    if (!ref) {
        defineProperty(inst, REF_FUNC, {
            enumerable: false,
            value: ref = (x) => {
                upAllElements(inst, x)
            },
        });
    };
    return ref;
};


function upAllElements(inst, cmp) {
    if (inst.__isMounted === false) {
        var all = inst.__all_elements;
        if (all) {
            all.clear();
        };
        return;
    };

    var all = inst.__all_elements || (inst.__all_elements = new Set());
    if (cmp) {
        all.add(cmp);
    };


    all.forEach((x) => {
        if (x.__isMounted === false) {
            all.delete(x);
        };
    });
};
