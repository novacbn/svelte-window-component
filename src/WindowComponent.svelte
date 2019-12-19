<script context="module">
    import {detach, insert, noop} from "svelte/internal";

    /**
     * Represents the currently registered Svelte Components
     */
    const REGISTERED_COMPONENTS = {};

    /**
     * Returns the data structure needed to passed Svelte Component via API
     */
    function create_slots(slots) {
        // source: https://github.com/sveltejs/svelte/issues/2588#issuecomment-488343541

        const svelte_slots = {};

        function createSlotFn(element) {
            return function() {
                return {
                    c: noop,

                    m: function mount(target, anchor) {
                        insert(target, element, anchor);
                    },

                    d: function destroy(detaching) {
                        if (detaching) {
                            detach(element);
                        }
                    },

                    l: noop
                };
            };
        }

        for (const slot_name in slots) {
            svelte_slots[slot_name] = [createSlotFn(slots[slot_name])];
        }

        return svelte_slots;
    }

    /**
     * Returns the `HTMLElement.attributes` as a plain `Object<string, string>`
     */
    function get_attributes(attributes) {
        const object = {};
        for (const index in attributes) {
            const attribute = attributes[index];
            if (attribute.value !== undefined) object[attribute.name] = attribute.value;
        }

        return object;
    }

    /**
     * Registers a new Component that `<window-component />` can utilize
     * @param {string} identifier
     * @param {Component} Component
     */
    export function register_component(identifier, Component) {
        REGISTERED_COMPONENTS[identifier] = Component;
    }
</script>

<script>
    import {get_current_component} from "svelte/internal";

    const {cancelIdleCallback, requestIdleCallback} = window;

    export let component = "";

    const root = get_current_component();
    const attributes = get_attributes(root.attributes);
    const shadow_root = root.shadowRoot;
    window.attrs = root.attributes;
    let callback_identifier;
    let Component;
    let default_slot;

    /**
     * Updates the current Svelte Component needing rendered, awaits until the Browser is idle before updating
     */
    function update_component(component) {
        if (callback_identifier) cancelIdleCallback(requestIdleCallback);

        callback_identifier = requestIdleCallback(() => {
            const _Component = REGISTERED_COMPONENTS[component];
            if (!_Component) {
                throw new ReferenceError(
                    `bad change to 'WindowComponent.component' (component '${component}' not registered)`
                );
            }

            Component = _Component;
        });
    }

    $: if (component) update_component(component);

    let _component;
    $: {
        if (shadow_root && default_slot && Component) {
            if (_component) {
                _component.$destroy();
                _component = null;
            }

            console.log({attributes});
            _component = new Component({
                target: shadow_root,
                props: {
                    ...attributes,
                    $$scope: {},
                    $$slots: create_slots({default: default_slot})
                }
            });
        }
    }
</script>

<!--
    IMPLEMENTATION NOTE:
        This entire file is one big hack, of both Svelte and Web Components with the following workflow:
        -   WindowComponent is compiled as the Web Component `<window-component />` and utilized via `<window-component component="component-name">...</window-component>` in markup
            -   Renders the passed in default slot contents into a `<template>`, and fetches the WebComponent tech's actual `<slot />`'s `HTMLElement`
        -   WindowComponent creates new instance of selected registered Component
            -   Fetches WebComponent's Shadow Root `HTMLElement` instance from `get_current_component` of `svelte/internal`, and uses as host element for Component
            -   Using workaround function provided by **creaven**, which utilizes internal Svelte APIs, the actual WebComponent `<slot />` is passed as default slot contents
-->

<svelte:options tag="window-component" />

<template>
    <slot bind:this={default_slot} />
</template>
