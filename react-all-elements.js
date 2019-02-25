import React from 'react';

// var reactCurrentOwner = (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || false).ReactCurrentOwner || false;
var emptyRefsObject = new React.Component().refs;
var createElement = React.createElement;


React.createElement = function(type, props) {
    if (typeof type !== 'function') {
        return createElement.apply(this, arguments);
    };

    // var owner = reactCurrentOwner.current;
    // if (owner) {
    //     let inst = owner.stateNode;
    //     if (inst && !inst.__all_elements) {
    //         return createElement.apply(this, arguments);
    //     };
    // };

    if (!props) {
        props = arguments[1] = {};
    };

    var ref = props.ref;

    if (typeof ref === 'string') {
        props.ref = function(x) {
            var inst = owner.stateNode;
            var refs = inst.refs;

            upAllElements(inst, x);

            if (refs === emptyRefsObject) {
                refs = inst.refs = {};
            };

            if (x === null) {
                delete refs[ref];
            } else {
                refs[ref] = x;
            };
        };
    } else
    if (typeof ref === 'function') {
        props.ref = function(x) {
            upAllElements(owner.stateNode, x);
            ref(x);
        };
    } else
    if (typeof ref === 'object' && ref !== null) {
        props.ref = function(x) {
            upAllElements(owner.stateNode, x);
            ref.current = x;
        };
    } else {
        props.ref = function(x) {
            if (owner) {
                upAllElements(owner.stateNode, x);
            };
        };
    };

    var elm = createElement.apply(this, arguments);
    var owner = elm._owner;

    return elm;
};

function upAllElements(inst, cmp) {
    var all = inst.__all_elements || (inst.__all_elements = new Set());
    if (cmp) {
        all.add(cmp);
        return;
    };

    if (!inst.__isMounted) {
        all.clear();
        return;
    };

    all.forEach((x) => {
        if (!x.__isMounted) {
            all.delete(x);
        };
    });
};

// function _upAllElements(inst, cmp) {
//     var all = inst.__all_elements || (inst.__all_elements = []);
//
//     if (cmp) {
//         if (all.indexOf(cmp) === -1) {
//             all.push(cmp);
//         };
//         return;
//     };
//
//     var l = all.length;
//     var j = l - 1;
//     var i = l;
//
//     while(i--) {
//         if (!all[i].__isMounted) {
//             all[i] = all[j];
//             j -= 1;
//         };
//     };
//
//     j += 1;
//     if (l !== j) {
//         all.length = j;
//     };
// };
