const {register_component} = require("./dist/svelte-window-component.umd");

/**
 * Registers a new Component that `<window-component />` can utilize
 * @param {string} identifier
 * @param {Component} Component
 */
exports.register_component = register_component;
