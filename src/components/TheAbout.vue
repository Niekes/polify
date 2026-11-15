<script setup lang="ts">
import BaseModal from './BaseModal.vue';

const isOpen = defineModel<boolean>({ default: false });

const questions = [
    {
        question: 'What is Polify?',
        answer: 'Polify turns an image or a gradient into low poly art made of triangles, cells or hexagons. Use it as a wallpaper, a background for your phone or a design asset, or as inspiration for your next artwork.'
    },
    {
        question: 'Where do my images go?',
        answer: 'Nowhere. Polify runs in your browser: an uploaded image never leaves your device, and nothing is stored or tracked. A link carries every setting of an artwork, but never an uploaded image.'
    },
    {
        question: 'Who owns the copyright?',
        answer: 'You own the copyright to any artwork you create with Polify.'
    },
    {
        question: 'Can you implement a new feature?',
        answer: 'Probably. Open an issue on GitHub with what you would like to do.'
    }
];
</script>

<template>
    <BaseModal v-model="isOpen">
        <template #title>About</template>
        <div class="flex flex-col gap-4">
            <section v-for="item in questions" :key="item.question">
                <h4 class="font-semibold" v-text="item.question" />
                <p v-text="item.answer" />
            </section>

            <!-- the imprint of polify 1, translated; the facts and the cited sections are unchanged -->
            <section class="text-sm">
                <h4 class="font-semibold">Legal notice</h4>
                <h5 class="mt-2 font-semibold">Information pursuant to § 5 TMG</h5>
                <p class="mt-1">Stefan Nieke<br />Karl-Marx-Allee 102<br />10243 Berlin, Germany</p>
                <h5 class="mt-2 font-semibold">Contact</h5>
                <p class="mt-1">Phone: +4915678523933<br />Email: polify [at] niekes.com</p>
                <h5 class="mt-2 font-semibold">Liability for content</h5>
                <p class="mt-1">
                    As a service provider, we are responsible for our own content on these pages
                    under general law pursuant to § 7 (1) TMG. Under §§ 8 to 10 TMG, however, we are
                    not obliged to monitor transmitted or stored third-party information or to
                    investigate circumstances that indicate unlawful activity.
                </p>
                <p class="mt-1">
                    Obligations to remove or block the use of information under general law remain
                    unaffected. Liability in this respect is only possible from the moment we become
                    aware of a specific infringement. As soon as we become aware of such
                    infringements, we will remove the content concerned immediately.
                </p>
                <h5 class="mt-2 font-semibold">Liability for links</h5>
                <p class="mt-1">
                    Our offer contains links to external third-party websites whose content we
                    cannot influence. We therefore cannot accept any liability for this third-party
                    content. The respective provider or operator of the linked pages is always
                    responsible for their content. The linked pages were checked for possible legal
                    violations at the time of linking. No unlawful content was recognisable at that
                    time.
                </p>
                <p class="mt-1">
                    Permanent monitoring of the content of linked pages is not reasonable without
                    concrete evidence of an infringement. As soon as we become aware of
                    infringements, we will remove such links immediately.
                </p>
                <h5 class="mt-2 font-semibold">Copyright</h5>
                <p class="mt-1">
                    The content and works created by the site operators on these pages are subject
                    to German copyright law. Reproduction, editing, distribution and any kind of use
                    beyond the limits of copyright law require the written consent of the respective
                    author or creator. Downloads and copies of this site are only permitted for
                    private, non-commercial use.
                </p>
                <p class="mt-1">
                    Insofar as the content on this site was not created by the operator, the
                    copyrights of third parties are respected. In particular, third-party content is
                    marked as such. Should you nevertheless become aware of a copyright
                    infringement, please let us know. As soon as we become aware of infringements,
                    we will remove such content immediately.
                </p>
            </section>
        </div>
    </BaseModal>
</template>
