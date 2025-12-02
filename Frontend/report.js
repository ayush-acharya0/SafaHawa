// File preview functionality
const evidenceInput = document.getElementById("evidence");
const cameraInput = document.getElementById("cameraInput");
const filePreview = document.getElementById("filePreview");
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");
const getLocationBtn = document.getElementById("getLocationBtn");
const locationInput = document.getElementById("location");

// Button event listeners
if (cameraBtn) {
  cameraBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission or default button behavior
    // Reset value to ensure change event fires even if same file selected
    if (cameraInput) {
      cameraInput.value = "";
      cameraInput.click();
    } else {
      console.error("Camera input element not found!");
      showToast("Camera unavailable", "error");
    }
  });
}

if (galleryBtn) {
  galleryBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (evidenceInput) {
      evidenceInput.value = "";
      evidenceInput.click();
    }
  });
}

// Geolocation functionality
if (getLocationBtn) {
  getLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      getLocationBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Locating...';
      getLocationBtn.disabled = true;

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Attempt to get address using Nominatim (OpenStreetMap)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "PokharaPollutionReporter/1.0",
                },
              }
            );
            const data = await response.json();

            if (data && data.display_name) {
              locationInput.value = data.display_name;
              showToast("Location found!");
            } else {
              locationInput.value = `${latitude}, ${longitude}`;
              showToast("Location coordinates found!");
            }
          } catch (error) {
            console.error("Geocoding error:", error);
            locationInput.value = `${latitude}, ${longitude}`;
            showToast(
              "Location coordinates found (Address lookup failed)!",
              "error"
            );
          } finally {
            getLocationBtn.innerHTML =
              '<i class="fas fa-location-arrow"></i> Get Location';
            getLocationBtn.disabled = false;
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMsg = "Unable to retrieve your location.";
          if (error.code === 1) errorMsg = "Location permission denied.";
          else if (error.code === 2) errorMsg = "Location unavailable.";
          else if (error.code === 3) errorMsg = "Location request timed out.";

          showToast(errorMsg + " Please enter manually.", "error");
          getLocationBtn.innerHTML =
            '<i class="fas fa-location-arrow"></i> Get Location';
          getLocationBtn.disabled = false;
        },
        options
      );
    } else {
      showToast("Geolocation is not supported by your browser.", "error");
    }
  });
}

// Store all selected files
let allFiles = [];

function updateFilePreview() {
  filePreview.innerHTML = "";

  allFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";

    if (file.type.startsWith("image")) {
      const img = document.createElement("img");
      img.src = url;
      previewItem.appendChild(img);
    } else if (file.type.startsWith("video")) {
      const vid = document.createElement("video");
      vid.src = url;
      vid.controls = true;
      previewItem.appendChild(vid);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => {
      allFiles.splice(index, 1);
      updateFilePreview();
    };

    previewItem.appendChild(removeBtn);
    filePreview.appendChild(previewItem);
  });
}

// Handle file selection
function handleFileSelect(event) {
  if (event.target.files.length) {
    Array.from(event.target.files).forEach((file) => {
      // If it's from the camera (often named 'image.jpg'), let's give it a better name
      let fileToAdd = file;
      if (file.name === "image.jpg" || file.name === "video.mp4") {
        const timestamp = new Date().getTime();
        const extension = file.name.split(".").pop();
        const newName = `Evidence_${timestamp}.${extension}`;
        // Create a new file object with the new name
        fileToAdd = new File([file], newName, { type: file.type });
      }

      allFiles.push(fileToAdd);
    });
    updateFilePreview();
    // Reset input value so selecting the same file works again
    event.target.value = "";
  }
}

if (evidenceInput) {
  evidenceInput.addEventListener("change", handleFileSelect);
}

if (cameraInput) {
  cameraInput.addEventListener("change", handleFileSelect);
}


// Form submission
const reportForm = document.getElementById("reportForm");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
/*
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const vehicleCategory = document.getElementById("vehicleCategory").value;
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
  const pollutionType = document.getElementById("pollutionType").value;
  const location = document.getElementById("location").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const details = document.getElementById("details").value.trim();

  if (
    !vehicleCategory ||
    !vehicleNumber ||
    !pollutionType ||
    !location ||
    !details
  ) {
    showToast("Please fill all required fields marked with *", "error");
    return;
  }

  // Update stats using the shared API function from stats.js if available,
  // or implement direct call here if stats.js functions are not global

  // Check if updateStats exists (it is defined in stats.js which is loaded in index.html but not report.html yet)
  // We need to ensure stats.js logic is available or replicated here.
  // To make it simpler, let's replicate the API hit logic here.

  const NAMESPACE = "pokhara-pollution-control-prod";

  // Hit the API to increment
  fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/total`).catch(console.error);

  if (pollutionType === "Smoke") {
    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/smoke`).catch(
      console.error
    );
  } else if (pollutionType === "Noise") {
    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/noise`).catch(
      console.error
    );
  } else if (pollutionType === "Leak") {
    fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/leak`).catch(
      console.error
    );
  }

  // Also update local storage as fallback/cache
  let reportData = JSON.parse(localStorage.getItem("reportData")) || {
    total: 0,
    smoke: 0,
    noise: 0,
    leak: 0,
  };

  reportData.total++;

  if (pollutionType === "Smoke") {
    reportData.smoke++;
  } else if (pollutionType === "Noise") {
    reportData.noise++;
  } else if (pollutionType === "Leak") {
    reportData.leak++;
  }

  localStorage.setItem("reportData", JSON.stringify(reportData));

  // Prepare email content
  const fileName = allFiles.length
    ? allFiles.map((f) => f.name).join(", ")
    : "No file attached";
  const subject = encodeURIComponent(`Pollution Report - ${vehicleNumber}`);
  const body = encodeURIComponent(
    `Vehicle Category: ${vehicleCategory}
Vehicle Number: ${vehicleNumber}
Pollution Type: ${pollutionType}
Location: ${location}
Phone Number: ${phone || "Not provided"}
Details: ${details}
Evidence: [PLEASE ATTACH FILE: ${fileName}]

[⚠️ REMINDER: You must click the paperclip icon 📎 and attach the photo/video manually before sending]`
  );

  // Open email client
  const mailtoLink = `mailto:statetrafficgandaki@gmail.com?subject=${subject}&body=${body}`;

  // Try to open immediately
  window.location.href = mailtoLink;

  // Show success message with clear instruction
  // Use setTimeout to allow the alert to render after the redirect logic initiates
  setTimeout(() => {
    alert(
      `⚠️ IMPORTANT STEP REQUIRED ⚠️\n\nYour email app is opening.\n\nYou MUST manually attach the photo(s) you just took.\n\nLook for the 'Paperclip' 📎 icon in your email app and attach the photos from your gallery.`
    );
  }, 1000);

  showToast("Opening email... Don't forget to attach the photos!");

  // Reset form after a delay
  setTimeout(() => {
    reportForm.reset();
    filePreview.innerHTML = "";
    allFiles = [];
  }, 2000);
});*/

// Toast notification function
function showToast(message, type = "success") {
  toastMessage.textContent = message;
  toast.className = "toast";

  if (type === "error") {
    toast.classList.add("error");
    toast.querySelector("i").className = "fas fa-exclamation-circle";
  } else {
    toast.querySelector("i").className = "fas fa-check-circle";
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}
