
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Navigator.svelte generated by Svelte v3.47.0 */

    const file$1 = "src/Navigator.svelte";

    function create_fragment$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Main";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Sequence Setting";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Param Setting";
    			add_location(button0, file$1, 0, 0, 0);
    			add_location(button1, file$1, 1, 0, 22);
    			add_location(button2, file$1, 2, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button2, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navigator', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navigator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navigator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigator",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let navi;
    	let t0;
    	let main;
    	let input0;
    	let t1;
    	let button0;
    	let t3;
    	let input1;
    	let t4;
    	let button1;
    	let t6;
    	let input2;
    	let t7;
    	let input3;
    	let t8;
    	let input4;
    	let t9;
    	let input5;
    	let t10;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;
    	navi = new Navigator({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navi.$$.fragment);
    			t0 = space();
    			main = element("main");
    			input0 = element("input");
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "submit";
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "GetCurrentConfig";
    			t6 = space();
    			input2 = element("input");
    			t7 = space();
    			input3 = element("input");
    			t8 = space();
    			input4 = element("input");
    			t9 = space();
    			input5 = element("input");
    			t10 = space();
    			button2 = element("button");
    			button2.textContent = "Set";
    			add_location(input0, file, 40, 1, 786);
    			attr_dev(button0, "type", "button");
    			add_location(button0, file, 41, 1, 820);
    			add_location(input1, file, 42, 1, 910);
    			attr_dev(button1, "type", "button");
    			add_location(button1, file, 43, 1, 939);
    			add_location(input2, file, 44, 1, 1024);
    			add_location(input3, file, 45, 1, 1072);
    			add_location(input4, file, 46, 1, 1115);
    			add_location(input5, file, 47, 1, 1157);
    			attr_dev(button2, "type", "button");
    			add_location(button2, file, 48, 1, 1196);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 39, 0, 778);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navi, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, input0);
    			set_input_value(input0, /*inputNumber*/ ctx[2]);
    			append_dev(main, t1);
    			append_dev(main, button0);
    			append_dev(main, t3);
    			append_dev(main, input1);
    			set_input_value(input1, /*number*/ ctx[1]);
    			append_dev(main, t4);
    			append_dev(main, button1);
    			append_dev(main, t6);
    			append_dev(main, input2);
    			set_input_value(input2, /*CurrentConfig*/ ctx[0].controlType);
    			append_dev(main, t7);
    			append_dev(main, input3);
    			set_input_value(input3, /*CurrentConfig*/ ctx[0].gearA1);
    			append_dev(main, t8);
    			append_dev(main, input4);
    			set_input_value(input4, /*CurrentConfig*/ ctx[0].gearB);
    			append_dev(main, t9);
    			append_dev(main, input5);
    			set_input_value(input5, /*CurrentConfig*/ ctx[0].PR);
    			append_dev(main, t10);
    			append_dev(main, button2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[10]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[11]),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[12]),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputNumber*/ 4 && input0.value !== /*inputNumber*/ ctx[2]) {
    				set_input_value(input0, /*inputNumber*/ ctx[2]);
    			}

    			if (dirty & /*number*/ 2 && input1.value !== /*number*/ ctx[1]) {
    				set_input_value(input1, /*number*/ ctx[1]);
    			}

    			if (dirty & /*CurrentConfig*/ 1 && input2.value !== /*CurrentConfig*/ ctx[0].controlType) {
    				set_input_value(input2, /*CurrentConfig*/ ctx[0].controlType);
    			}

    			if (dirty & /*CurrentConfig*/ 1 && input3.value !== /*CurrentConfig*/ ctx[0].gearA1) {
    				set_input_value(input3, /*CurrentConfig*/ ctx[0].gearA1);
    			}

    			if (dirty & /*CurrentConfig*/ 1 && input4.value !== /*CurrentConfig*/ ctx[0].gearB) {
    				set_input_value(input4, /*CurrentConfig*/ ctx[0].gearB);
    			}

    			if (dirty & /*CurrentConfig*/ 1 && input5.value !== /*CurrentConfig*/ ctx[0].PR) {
    				set_input_value(input5, /*CurrentConfig*/ ctx[0].PR);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navi.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navi.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navi, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let CurrentConfig = {
    		controlType: 'rotary',
    		gearA1: 3.3,
    		gearB: 4.4,
    		PR: 100.1
    	};

    	let number;
    	let inputNumber;

    	const request = async endpoint => {
    		const resp = await fetch(`http://localhost:8000/api${endpoint}`);
    		const result = await resp.json();
    		return result;
    	};

    	const getNumberFromBackend = async no => {
    		const result = await request(`/post/${no}`);
    		$$invalidate(1, number = result.data);
    	};

    	const getCurrentConfig = async () => {
    		const result = await request('/currentConfig');
    		$$invalidate(0, CurrentConfig = result);
    	};

    	const getSetConfig = async cf => {
    		await request('/setConfig/${cf}');
    	}; //CurrentConfig = result;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		inputNumber = this.value;
    		$$invalidate(2, inputNumber);
    	}

    	const click_handler = () => getNumberFromBackend(inputNumber);

    	function input1_input_handler() {
    		number = this.value;
    		$$invalidate(1, number);
    	}

    	const click_handler_1 = () => getCurrentConfig();

    	function input2_input_handler() {
    		CurrentConfig.controlType = this.value;
    		$$invalidate(0, CurrentConfig);
    	}

    	function input3_input_handler() {
    		CurrentConfig.gearA1 = this.value;
    		$$invalidate(0, CurrentConfig);
    	}

    	function input4_input_handler() {
    		CurrentConfig.gearB = this.value;
    		$$invalidate(0, CurrentConfig);
    	}

    	function input5_input_handler() {
    		CurrentConfig.PR = this.value;
    		$$invalidate(0, CurrentConfig);
    	}

    	const click_handler_2 = () => getCurrentConfig();

    	$$self.$capture_state = () => ({
    		Navi: Navigator,
    		CurrentConfig,
    		number,
    		inputNumber,
    		request,
    		getNumberFromBackend,
    		getCurrentConfig,
    		getSetConfig
    	});

    	$$self.$inject_state = $$props => {
    		if ('CurrentConfig' in $$props) $$invalidate(0, CurrentConfig = $$props.CurrentConfig);
    		if ('number' in $$props) $$invalidate(1, number = $$props.number);
    		if ('inputNumber' in $$props) $$invalidate(2, inputNumber = $$props.inputNumber);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		CurrentConfig,
    		number,
    		inputNumber,
    		getNumberFromBackend,
    		getCurrentConfig,
    		input0_input_handler,
    		click_handler,
    		input1_input_handler,
    		click_handler_1,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
