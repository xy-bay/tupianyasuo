// 文件路径: 网站搭建/convertToFile.js
const fileUpload = document.getElementById('fileUpload');
const convertToFileBtn = document.getElementById('convertToFileBtn');
const downloadFileBtn = document.getElementById('downloadFileBtn');
const filePreview = document.getElementById('filePreview');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const completionMessage = document.getElementById('completionMessage');
const fileFormat = document.getElementById('fileFormat');

convertToFileBtn.addEventListener('click', () => {
    const files = fileUpload.files;
    if (files.length === 0) {
        alert("请先选择文件！");
        return;
    }

    filePreview.innerHTML = '';
    progressBar.style.display = 'block'; // 显示进度条
    completionMessage.style.display = 'none'; // 隐藏完成提示
    progress.style.width = '0%'; // 重置进度条
    progress.textContent = '0%'; // 重置进度文本

    const totalFiles = files.length;
    let processedFiles = 0; // 记录已处理的文件数量
    const images = []; // 存储所有图片的 base64 数据
    const imageSizes = []; // 存储图片的原始尺寸

    Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                images.push(img.src); // 将每张图片的 base64 数据存储到数组中
                imageSizes.push({ width: img.width, height: img.height }); // 存储图片的原始尺寸
                processedFiles++;

                // 更新进度
                const currentProgress = (processedFiles / totalFiles) * 100;
                progress.style.width = `${currentProgress}%`;
                progress.textContent = `${Math.round(currentProgress)}%`;

                // 如果所有文件都处理完，生成合成文件
                if (processedFiles === totalFiles) {
                    const format = fileFormat.value;
                    if (format === 'pdf') {
                        // 使用 jsPDF 库将所有图片合成一个 PDF
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF();

                        images.forEach((imgData, index) => {
                            const { width, height } = imageSizes[index];
                            const aspectRatio = width / height;
                            const pdfWidth = 190; // PDF 页面宽度
                            const pdfHeight = pdfWidth / aspectRatio; // 根据原始比例计算高度

                            pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth, pdfHeight); // 添加图片到 PDF
                            if (index < images.length - 1) {
                                pdf.addPage(); // 添加新页面
                            }
                        });

                        const pdfBlob = pdf.output('blob');
                        const url = URL.createObjectURL(pdfBlob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;
                        downloadLink.download = '合成文件.pdf';
                        downloadLink.textContent = '下载合成的 PDF 文件';
                        downloadLink.className = 'download-link'; // 添加类名
                        filePreview.appendChild(downloadLink);

                        // 显示 PDF 文件的预览
                        const pdfPreview = document.createElement('iframe');
                        pdfPreview.src = url;
                        pdfPreview.width = '100%';
                        pdfPreview.height = '500px';
                        filePreview.appendChild(pdfPreview);
                    } else if (format === 'word') {
                        // 使用 docx.js 库生成一个 Word 文件
                        const doc = new window.docx.Document();
                        images.forEach((imgData, index) => {
                            const { width, height } = imageSizes[index];
                            const imageRun = new window.docx.ImageRun({
                                data: imgData,
                                transformation: {
                                    width: width, // 使用原始宽度
                                    height: height, // 使用原始高度
                                },
                            });
                            doc.addSection({
                                children: [new window.docx.Paragraph(imageRun)],
                            });
                        });

                        window.docx.Packer.toBlob(doc).then((blob) => {
                            const url = URL.createObjectURL(blob);
                            const downloadLink = document.createElement('a');
                            downloadLink.href = url;
                            downloadLink.download = '合成文件.docx';
                            downloadLink.textContent = '下载合成的 Word 文件';
                            downloadLink.className = 'download-link'; // 添加类名
                            filePreview.appendChild(downloadLink);

                            // 显示 Word 文件的预览
                            const wordPreview = document.createElement('iframe');
                            wordPreview.src = url;
                            wordPreview.width = '100%';
                            wordPreview.height = '500px';
                            filePreview.appendChild(wordPreview);
                        });
                    }

                    // 显示合成完成信息
                    completionMessage.style.display = 'block'; // 显示合成完成提示
                    progress.style.width = '100%'; // 填满进度条
                    progress.textContent = '100%'; // 更新进度文本
                }
            };
        };
        reader.readAsDataURL(file);
    });
});