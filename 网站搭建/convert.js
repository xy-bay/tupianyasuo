const convertUpload = document.getElementById('convertUpload');
const targetFormat = document.getElementById('targetFormat');
const convertBtn = document.getElementById('convertBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const convertedImagesContainer = document.getElementById('convertedImages');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const completionMessage = document.getElementById('completionMessage');

let zip = new JSZip(); // 创建 ZIP 实例

convertBtn.addEventListener('click', () => {
    const files = convertUpload.files;
    if (files.length === 0) {
        alert("请先选择文件！");
        return;
    }

    convertedImagesContainer.innerHTML = '';
    zip = new JSZip(); // 重置 ZIP 实例
    progressBar.style.display = 'block'; // 显示进度条
    completionMessage.style.display = 'none'; // 隐藏完成提示
    progress.style.width = '0%'; // 重置进度条
    progress.textContent = '0%'; // 重置进度文本

    const totalFiles = files.length;
    let processedFiles = 0; // 记录已处理的文件数量

    // 先读取所有文件
    Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const format = targetFormat.value;
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const convertedImg = document.createElement('img');
                    convertedImg.src = url;
                    convertedImg.style.maxWidth = '100%';
                    convertedImagesContainer.appendChild(convertedImg);

                    // 添加到 ZIP 文件
                    blob.name = `converted_image.${format}`;
                    zip.file(blob.name, blob);

                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = blob.name;
                    downloadLink.textContent = '下载转换后的图片';
                    downloadLink.className = 'download-link'; // 添加类名
                    convertedImagesContainer.appendChild(downloadLink);

                    processedFiles++;
                    const currentProgress = (processedFiles / totalFiles) * 100;
                    progress.style.width = `${currentProgress}%`;
                    progress.textContent = `${Math.round(currentProgress)}%`;

                    // 如果所有文件都处理完，显示完成信息
                    if (processedFiles === totalFiles) {
                        downloadZipBtn.style.display = 'block'; // 显示下载 ZIP 按钮
                        completionMessage.style.display = 'block'; // 显示转换完成提示
                        progress.style.width = '100%'; // 填满进度条
                        progress.textContent = '100%'; // 更新进度文本
                    }
                }, format);
            };
        };
        reader.readAsDataURL(file);
    });
});

// 下载 ZIP 文件
downloadZipBtn.addEventListener('click', () => {
    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'converted_images.zip'); // 下载 ZIP 文件
    });
});