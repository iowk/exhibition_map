export function createImageEntry(image, imageTitle){
    let form_data = new FormData();
    form_data.append('src', image, image.name);
    form_data.append('name', imageTitle);
    return form_data;
}
export function createCoverImageEntry(image){
    let form_data = new FormData();
    form_data.append('coverImageSrc', image, image.name);
    return form_data;
}