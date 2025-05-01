const input = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const output = document.getElementById("output");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const loader = document.getElementById("loader");

input.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      previewImg.src = reader.result;
      startOCR(reader.result); 
    };
    reader.readAsDataURL(file);
  }
});

document.addEventListener("paste", function (e) {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = function () {
        previewImg.src = reader.result;
        startOCR(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  }
});

function startOCR(imageUrl) {
  output.value = ""; 
  loader.style.display = "block"; 

  Tesseract.recognize(
    imageUrl,
    'eng',
    {
      logger: m => console.log(m) 
    }
  ).then(({ data: { text } }) => {
    output.value = text;
    loader.style.display = "none"; 
  }).catch(err => {
    output.value = "Failed to extract text.";
    loader.style.display = "none";
    console.error(err);
  });
}

resetBtn.addEventListener("click", function () {
  input.value = "";
  previewImg.src = "../assets/image.png";
  output.value = "";
});

copyBtn.addEventListener("click", function () {
  navigator.clipboard.writeText(output.value).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  }).catch(err => {
    console.error("Copy failed:", err);
  });
});

function home(){
  window.location.href = "../../index.html"
}

document.getElementById('fileInput').addEventListener('change', function() {
  const fileName = this.files[0]?.name || "No file chosen";
  document.getElementById('fileNameDisplay').textContent = fileName;
});
