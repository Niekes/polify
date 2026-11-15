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

            <!-- the imprint as published by polify 1, word for word -->
            <section lang="de" class="text-sm">
                <h4 class="font-semibold">Impressum</h4>
                <h5 class="mt-2 font-semibold">Angaben gemäß § 5 TMG</h5>
                <p class="mt-1">
                    Stefan Nieke<br />
                    Karl-Marx-Allee 102<br />
                    10243 Berlin
                </p>
                <h5 class="mt-2 font-semibold">Kontakt</h5>
                <p class="mt-1">
                    Telefon: +4915678523933<br />
                    E-Mail: polify [at] niekes.com
                </p>
                <h5 class="mt-2 font-semibold">Haftung für Inhalte</h5>
                <p class="mt-1">
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
                    Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind
                    wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                    gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen,
                    die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p class="mt-1">
                    Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach
                    den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
                    ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
                    möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
                    diese Inhalte umgehend entfernen.
                </p>
                <h5 class="mt-2 font-semibold">Haftung für Links</h5>
                <p class="mt-1">
                    Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
                    keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                    Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                    Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden
                    zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
                    Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
                <p class="mt-1">
                    Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
                    konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden
                    von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                </p>
                <h5 class="mt-2 font-semibold">Urheberrecht</h5>
                <p class="mt-1">
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                    unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                    Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                    bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                    Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                    Gebrauch gestattet.
                </p>
                <p class="mt-1">
                    Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden
                    die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als
                    solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung
                    aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden
                    von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                </p>
            </section>
        </div>
    </BaseModal>
</template>
