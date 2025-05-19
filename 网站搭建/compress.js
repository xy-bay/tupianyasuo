const upload = document.getElementById('upload');
const dropArea = document.getElementById('dropArea');
const imageQuality = document.getElementById('imageQuality'); // 新增图像质量选择
const qualityValue = document.getElementById('qualityValue'); // 显示当前质量值
const compressBtn = document.getElementById('compressBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn'); // 新增下载 ZIP 按钮
const originalImagesContainer = document.getElementById('originalImages');
const compressedImagesContainer = document.getElementById('compressedImages');
const progressBar = document.getElementById('progress');
const progressContainer = document.getElementById('progressBar');

let zip = new JSZip(); // 创建 ZIP 实例
let filesArray = []; // 存储文件的数组

// 拖放事件处理
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // 防止默认行为
    dropArea.style.borderColor = '#000'; // 改变边框颜色
});

dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = '#ccc'; // 恢复边框颜色
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault(); // 防止默认行为
    dropArea.style.borderColor = '#ccc'; // 恢复边框颜色

    const files = event.dataTransfer.files; // 获取拖放的文件
    handleFiles(files); // 处理文件
});

// 处理文件
function handleFiles(files) {
    const fileArray = Array.from(files);
    filesArray = filesArray.concat(fileArray); // 将新文件添加到现有文件数组
    originalImagesContainer.innerHTML = ''; // 清空之前的预览
    compressedImagesContainer.innerHTML = ''; // 清空压缩后的预览
    zip = new JSZip(); // 重置 ZIP 实例

    filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            originalImagesContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// 选择文件
upload.addEventListener('change', (event) => {
    const files = event.target.files; // 获取选择的文件
    handleFiles(files); // 处理文件
});

// 点击拖放区域以选择文件
dropArea.addEventListener('click', () => {
    upload.click(); // 触发文件选择对话框
});

// 处理压缩
compressBtn.addEventListener('click', () => {
    const quality = imageQuality.value / 100; // 获取用户选择的质量值

    // 清空之前的压缩图片
    compressedImagesContainer.innerHTML = '';
    progressBar.style.width = '0%'; // 重置进度条
    document.getElementById('completionMessage').style.display = 'none'; // 隐藏处理完成信息

    let processedCount = 0; // 记录已处理的文件数量

    // 按顺序处理每个文件
    filesArray.forEach((file, index) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width; // 使用原始宽度
                canvas.height = img.height; // 使用原始高度
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);

                    // 创建压缩后的图片
                    const compressedImg = document.createElement('img');
                    compressedImg.src = url;
                    compressedImg.style.maxWidth = '100%';
                    compressedImagesContainer.appendChild(compressedImg);

                    // 创建下载链接
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = `compressed_image_${index + 1}.jpg`; // 设置下载文件名
                    downloadLink.textContent = '下载压缩后的图片';
                    downloadLink.style.display = 'block'; // 显示下载链接
                    compressedImagesContainer.appendChild(downloadLink);

                    // 将压缩后的图片添加到 ZIP 文件
                    blob.name = `compressed_image_${index + 1}.jpg`; // 设置文件名
                    zip.file(blob.name, blob); // 添加到 ZIP

                    // 更新已处理的文件数量
                    processedCount++;
                    const progress = (processedCount / filesArray.length) * 100;
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = Math.round(progress) + '%';

                    // 新增：当进度条满时显示处理完成信息
                    if (processedCount === filesArray.length) {
                        document.getElementById('completionMessage').style.display = 'block'; // 显示处理完成信息
                    }
                }, 'image/jpeg', quality); // 使用用户选择的质量值
            };
        };

        reader.readAsDataURL(file);
    });
});

// 下载 ZIP 文件
downloadZipBtn.addEventListener('click', () => {
    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'compressed_images.zip'); // 下载 ZIP 文件
    });
});

// 更新质量值显示
imageQuality.addEventListener('input', () => {
    qualityValue.textContent = imageQuality.value; // 显示当前质量值
});