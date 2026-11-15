// the images in public/gallery, named after their file
export const gallery: string[] = Array.from({ length: 39 }, (_, i) => `image-${i}`);

export const galleryImageUrl = (name: string) => `${import.meta.env.BASE_URL}gallery/${name}.avif`;
