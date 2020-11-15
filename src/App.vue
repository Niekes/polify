<template>
    <div id="app">
        <router-view />
        <svg id="stripe-pattern">
            <defs>
                <pattern
                    id="pattern-stripe"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                >
                    <path
                        fill="#fff"
                        d="M0 0h4v8H0z"
                    />
                </pattern>
                <mask id="mask-stripe">
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#pattern-stripe)"
                    />
                </mask>
            </defs>
        </svg>
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

#stripe-pattern {
    height: 5000000000px;
    left: -999999999px;
    pointer-events: none;
    position: absolute;
    user-select: none;
    width: 5000000000px;
    z-index: -1000000;
}
</style>
