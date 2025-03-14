const upload = document.getElementById('upload');
const compressionRatio = document.getElementById('compressionRatio');
const compressBtn = document.getElementById('compressBtn');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadLink = document.getElementById('downloadLink');

upload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = `文件大小: ${file.size} 字节`;
        };
        reader.readAsDataURL(file);
    }
});

compressBtn.addEventListener('click', () => {
    const ratio = compressionRatio.value / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = originalImage.src;

    img.onload = () => {
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            compressedImage.src = url;
            compressedSize.textContent = `文件大小: ${blob.size} 字节`;
            downloadLink.href = url;
            downloadLink.download = 'compressed_image.jpg';
            downloadLink.style.display = 'block';
        }, 'image/jpeg', ratio);
    };
});