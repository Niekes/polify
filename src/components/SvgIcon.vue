<template>
    <svg><use :xlink:href="xlink"></use></svg>
</template>

<script>
export default {
    name: 'SvgIcon',

    props: {
        xlink: String,
    },
};
</script>

<style lang="scss" scoped>
svg {
    display: block;
}
</style>
