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
export function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}