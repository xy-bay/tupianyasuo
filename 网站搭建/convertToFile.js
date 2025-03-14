const upload = document.getElementById('upload');
const fileTypeSelect = document.getElementById('fileTypeSelect');
const createFileBtn = document.getElementById('createFileBtn');
const uploadedImagesContainer = document.createElement('div');
const downloadLink = document.getElementById('downloadLink');

document.querySelector('.preview').appendChild(uploadedImagesContainer);

upload.addEventListener('change', (event) => {
    const files = event.target.files;
    uploadedImagesContainer.innerHTML = ''; // 清空之前的图片

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.margin = '10px 0';
            uploadedImagesContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});

createFileBtn.addEventListener('click', () => {
    const fileType = fileTypeSelect.value;
    const images = uploadedImagesContainer.querySelectorAll('img');

    if (fileType === 'pdf') {
        // 使用 jsPDF 库生成 PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let imgCount = 0;

        images.forEach((image, index) => {
            const imgData = image.src;
            doc.addImage(imgData, 'JPEG', 10, 10, 190, 0);
            imgCount++;

            if (index < images.length - 1) {
                doc.addPage();
            }
        });

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        downloadLink.href = url;
        downloadLink.download = 'generated_file.pdf';
        downloadLink.style.display = 'block';
    } else if (fileType === 'docx') {
        // 使用 docx.js 库生成 Word 文件
        const doc = new window.docx.Document();
        const promises = [];

        images.forEach((image) => {
            const imgData = image.src;
            const imageRun = new window.docx.ImageRun({
                data: imgData,
                transformation: {
                    width: 600,
                    height: 400,
                },
            });
            doc.addSection({
                children: [new window.docx.Paragraph(imageRun)],
            });
            promises.push(window.docx.Packer.toBlob(doc));
        });

        Promise.all(promises).then((blobs) => {
            const url = URL.createObjectURL(blobs[0]);
            downloadLink.href = url;
            downloadLink.download = 'generated_file.docx';
            downloadLink.style.display = 'block';
        });
    }
});