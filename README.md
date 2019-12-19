# svelte-window-component

## Description

Simple Svelte v3 Web Component for dynamically loading Svelte Components from a register

## Caveats

There's three important caveats you should consider before using this library:

-   As the description suggests, this library relies on the [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) spec for functionality.
-   Since this is a Web Component, for obvious reasons this will not be SSR'd (server-side rendered).
-   The [`WindowComponent`](/src/WindowComponent.svelte) Component is pretty much a hack, both utilizing Web Components and Svelte's internal APIs.

## Developer

### Installation

Open your terminal and install via `npm`:

```sh
npm install git+https://github.com/novacbn/svelte-window-component
```

### Usage

Firstly, you need to load the Browser bundle that's located [`dist/`](/dist):

```html
<html>
    <head>
        <script
            type="application/javascript"
            src="/path/to/svelte-window-component.umd.js"
        ></script>
    </head>
</html>
```

Next, you need to register a Svelte Component, using this Component as an example:

**SampleComponent.svelte**

```html
<h1 id="my-sample-header">
    <slot />
</h1>
```

And then registering it, utilizing the `WindowComponent` global namespace:

```js
import SampleComponent from "./SampleComponent.svelte";
const {WindowComponent} = window;

WindowComponent.register_component("my-header", SampleComponent);
```

Once registered, just utilize the `<window-component />` Web Component like so:

```html
<window-component component="my-header">
    I am a header!
</window-component>
```

Note also, all the attributes of `<window-component />` are passed into the registered Component as props.

### Recommendations

Given that `WindowComponent` is a globally accessible singleton instance, it is recommended to register Components with it utilizing a namespace to play more nicely with other library consumers.

-   Bad: `WindowComponent.register_component("my-cool-component", ...);`
-   Good: `WindowComponent.register_component("namespace-my-cool-component", ...);`

## Use Case

I came up with this roundabout solution for dynamic rendering of Svelte Components, for my [`novacbn/svelte-docs`](https://github.com/novacbn/svelte-docs) project. Where the end-developers can utilize custom `svelte-docs` provided Components within their Markdown documentation files without a custom runtime to parse and replace HTML manually.

Which parses something like:

```markdown
# Button

## Button Styles

An interactive button can be created via the [`Button`](/framework/elements/button) Component, and can be customized with different look and feels. Below, you can find all the built-in styles `Luda` supports.

### Solid Buttons

<docs-sample id="solid-buttons">
    <script>
        const {Button} = luda;
    </script>

    <Button color="primary">Primary</Button>
    <Button color="secondary">Secondary</Button>
    <Button color="dark">Dark</Button>
    <Button color="light">Light</Button>
    <Button color="danger">Danger</Button>

</docs-sample>
```

Into something like:

```html
<h1>Button</h1>

<h2>Button Styles</h2>
<p>...</p>

<h3>Solid Buttons</h3>
<window-component component="docs-sample" id="solid-button">
    ...
</window-component>
```

That way, I don't have to provide a small runtime to find and hook into DOM. But rather, utilize Web Components instead to do the heavy lifting, and support `<slot />` based elements without utilizing the non-public facing internals manually.
