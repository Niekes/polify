<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import BaseTerminal from './BaseTerminal.vue';

const isOpen = defineModel<boolean>({ default: false });

const install =
    'claude mcp add --scope user chrome-devtools -- npx -y chrome-devtools-mcp@latest --categoryExperimentalWebmcp=true --chromeArg=--enable-features=WebMCP';

// where the app really runs, such as another dev server port or a fork
const prompt = `Open ${window.location.origin}${import.meta.env.BASE_URL} and turn the artwork into 400 hexagons from a radial magma gradient, in grayscale.`;

const needs = [
    { label: 'Claude Code', href: 'https://code.claude.com/docs/en/overview' },
    { label: 'Chrome 150 or later' },
    { label: 'Node.js', href: 'https://nodejs.org/' }
];
</script>

<template>
    <BaseModal v-model="isOpen">
        <template #title>Use Polify with an AI agent</template>
        <div class="flex flex-col gap-6">
            <p>Describe the artwork you want, and an AI agent sets the source, shape and colors.</p>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">How it works</h4>
                <p>
                    Polify runs entirely in your browser and offers its tools to AI agents through
                    <a class="link" href="https://webmachinelearning.github.io/webmcp/">WebMCP</a>;
                    there is no Polify server, and an uploaded image never leaves your device.
                    Claude Code reaches into the browser through
                    <a class="link" href="https://github.com/ChromeDevTools/chrome-devtools-mcp"
                        >Chrome DevTools MCP</a
                    >, a small helper that runs on your machine via Node.js and opens its own Chrome
                    window.
                </p>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">You need</h4>
                <ul class="list-disc pl-6">
                    <li v-for="need in needs" :key="need.label">
                        <a v-if="need.href" class="link" :href="need.href" v-text="need.label" />
                        <template v-else>{{ need.label }}</template>
                    </li>
                </ul>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">1. Connect Claude Code</h4>
                <p>Run this once in a terminal:</p>
                <BaseTerminal prefix="$" :code="install" />
                <p>
                    In a running session, run <code>/mcp</code> to connect, or restart Claude Code.
                </p>
                <p class="text-sm text-base-content/70">
                    Working on Polify itself? Claude Code started in the repository offers the
                    helper from <code>.mcp.json</code>, so you can skip this step.
                </p>
            </section>

            <section class="flex flex-col gap-2">
                <h4 class="font-semibold">2. Ask for an artwork</h4>
                <p>Tell Claude Code where Polify is and what you want:</p>
                <BaseTerminal prefix=">" :code="prompt" />
                <p>
                    The agent cannot upload a picture, but it can work with one you uploaded. The
                    browser's back button undoes its changes.
                </p>
            </section>
        </div>
    </BaseModal>
</template>
