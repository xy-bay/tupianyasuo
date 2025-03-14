const convertBtn = document.getElementById('convertBtn');
const formatSelect = document.getElementById('formatSelect');
const convertedImage = document.getElementById('convertedImage');
const convertedSize = document.getElementById('convertedSize');
const originalImage = document.getElementById('originalImage');
const downloadLink = document.getElementById('downloadLink');

document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        originalImage.style.display = 'block';
    };
    
    if (file) {
        reader.readAsDataURL(file);
    }
});

convertBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = originalImage.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            convertedImage.src = url;
            convertedSize.textContent = `文件大小: ${blob.size} 字节`;
            downloadLink.href = url;
            downloadLink.download = `converted_image.${format.split('/')[1]}`;
            downloadLink.style.display = 'block';
        }, format);
    };
});