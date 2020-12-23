<template>
    <div class="faq">
        <div class="faq__what">
            <h2>What is Polify?</h2>
            <p>
                Polify is a tool to create low poly backgrounds & wallpapers.
                You can use them on your mobile device,
                on your desktop pc or as a graphic designer you could use them as design assets.
            </p>
        </div>
        <div class="faq__implement">
            <h2>Can you implement a new feature?</h2>
            <p>
                Yes, please send me an email to polify [at] niekes.com with detailed
                information about your feature request and I will try implement it
                as soon as possible.
            </p>
        </div>
        <div class="faq__copyright">
            <h2>Who owns the copyright?</h2>
            <p>You own the copyright to any image that you created using polify.niekes.com.</p>
        </div>
        <div class="faq__about">
            <h2>About</h2>
            <p>
                My name is Stefan Nieke,
                I am a Front-end Engineer and a UI/UX Designer based in Berlin, Germany.
                If you want we can connect on social media. Please check <a
                    target="_blank"
                    href="https://www.niekes.com"
                >niekes.com</a>.
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Faq',
};
</script>

<style lang="scss" scoped>
.faq {
    margin: 0 auto;
    max-width: $breakpoint-md;
    padding: $padding-y * 2 $padding-x * 2;
    width: 100%;

    a {
        color: $black;
    }

    p {
        margin: 0 0 $margin-y * 4 0;
    }

    h2 {
        margin: 0 0 $margin-y 0;
    }
}
</style>
