<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>

export default {
    name: 'Main',
};
</script>

<style lang="scss">
@import './scss/main';

* {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
    height: 100%;
}

body {
    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif,
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol";
}

#app {
    padding: 0;
}
</style>
