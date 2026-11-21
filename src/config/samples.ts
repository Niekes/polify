// the images in public/samples, named after their file; the first opens a new artwork
export const samples: string[] = [
    'van-gogh-irises',
    'bruegel-the-harvesters',
    'caillebotte-paris-street-rainy-day',
    'cassatt-the-childs-bath',
    'cezanne-basket-of-apples',
    'church-heart-of-the-andes',
    'friedrich-wanderer-above-the-sea-of-fog',
    'gauguin-mahana-no-atua',
    'hokusai-fine-wind-clear-morning',
    'homer-after-the-hurricane',
    'klimt-the-kiss',
    'monet-gare-saint-lazare',
    'monet-impression-sunrise',
    'monet-stacks-of-wheat',
    'renoir-two-sisters',
    'seurat-grande-jatte',
    'toulouse-lautrec-at-the-moulin-rouge',
    'turner-fighting-temeraire',
    'van-gogh-cafe-terrace-at-night',
    'hokusai-great-wave',
    'van-gogh-starry-night-over-the-rhone',
    'van-gogh-the-poets-garden',
    'van-gogh-wheat-field-with-cypresses',
    'vermeer-girl-with-a-pearl-earring'
];

export const sampleImageUrl = (name: string) => `${import.meta.env.BASE_URL}samples/${name}.avif`;
