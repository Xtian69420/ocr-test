const input = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const output = document.getElementById("output");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const loader = document.getElementById("loader");
const progressText = document.getElementById("progressText");

const supportedLangs = 'eng'; 

input.addEventListener("change", handleImageUpload);
document.addEventListener("paste", handlePaste);
document.addEventListener("dragover", e => e.preventDefault());
document.addEventListener("drop", handleDrop);

resetBtn.addEventListener("click", resetUI);
copyBtn.addEventListener("click", copyToClipboard);

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    readImageFile(file);
  }
}

function handlePaste(e) {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf("image") !== -1) {
      readImageFile(item.getAsFile());
      break;
    }
  }
}

function handleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    readImageFile(file);
  }
}

function readImageFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    previewImg.src = reader.result;
    startOCR(reader.result);
  };
  reader.readAsDataURL(file);
}

function startOCR(imageUrl) {
    output.value = "";
    loader.style.display = "block"; 
    progressText.style.display = "block";
    progressText.textContent = "Processing... 0%";
    loader.className = "loader";
  
    Tesseract.recognize(
      imageUrl,
      supportedLangs,
      {
        logger: m => {
          if (m.status === "recognizing text") {
            const percent = Math.floor(m.progress * 100);
            progressText.textContent = `Processing... ${percent}%`;
          }
        }
      }
    ).then(({ data: { text } }) => {
      const cleanText = text.trim();
      output.value = extractRefNumber(cleanText);
    }).catch(err => {
      output.value = "❌ Error: Could not extract text.";
      console.error(err);
    }).finally(() => {
      loader.style.display = "none";
      loader.className = ""; 
      progressText.style.display = "none";
      progressText.textContent = "";
    });
  }

  function extractRefNumber(text) {
    const lines = text.split(/\r?\n/);
  
    const labelPatterns = [
      /Ref\.?\s*No\.?/i,
      /ref\.?\s*no\.?/i,
      /Reference\s*Number/i,
      /Ref\s*Number/i
    ];
  
    for (let line of lines) {
      for (let labelPattern of labelPatterns) {
        if (labelPattern.test(line)) {

          const match = line.match(/(\d{4,}(?:\s*\d+)+)/);  
          if (match) {

            const cleanedRefNumber = match[0].replace(/\s+/g, '').trim(); 
            if (/^\d+$/.test(cleanedRefNumber)) {
              return cleanedRefNumber;  
            } else {
              return "⚠️ Reference number not found. Please try again with a VALID and CLEARER image.";
            }
          }
        }
      }
    }

    return "⚠️ Reference number not found. Please try again with a VALID and CLEARER image.";
  }
  
function resetUI() {
  input.value = "";
  previewImg.src = "../assets/image.png";
  output.value = "";
  loader.style.display = "none";
  progressText.style.display = "none";
}

function copyToClipboard() {
  const textToCopy = output.value;
  if (!textToCopy) return;

  navigator.clipboard.writeText(textToCopy).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => copyBtn.textContent = "Copy", 1500);
  }).catch(() => {

    const temp = document.createElement("textarea");
    temp.value = textToCopy;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert("Copied to clipboard!");
  });
}

function home() {
  window.location.href = "../../index.html";
}
