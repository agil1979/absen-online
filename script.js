// GANTI DENGAN KOORDINAT KANTOR ANDA
const OFFICE_LAT = 6.62789935070247; 
const OFFICE_LNG = 106.29401655211633;
const MAX_DISTANCE = 100; // Meter

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const btnAbsen = document.getElementById('btn-absen');
const locStatus = document.getElementById('location-status');

// Fungsi Setup Kamera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, 
            audio: false 
        });
        video.srcObject = stream;
        console.log("Kamera aktif");
    } catch (err) {
        locStatus.innerHTML = "<span class='error'>Gagal akses kamera!</span>";
        console.error(err);
    }
}

// Fungsi Hitung Jarak (Haversine yang lebih aman)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Jari-jari bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Fungsi Cek Lokasi
function checkLocation() {
    if (!navigator.geolocation) {
        locStatus.innerHTML = "Browser tidak mendukung GPS";
        return;
    }

    locStatus.innerHTML = "Sedang mendapatkan koordinat...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const uLat = position.coords.latitude;
            const uLng = position.coords.longitude;
            const dist = getDistance(uLat, uLng, OFFICE_LAT, OFFICE_LNG);

            console.log("User Lat:", uLat, "User Lng:", uLng, "Jarak:", dist);

            if (dist <= MAX_DISTANCE) {
                locStatus.innerHTML = `<span class='success'>LOKASI TERVERIFIKASI (${Math.round(dist)}m)</span>`;
                btnAbsen.disabled = false;
                document.getElementById('lat').value = uLat;
                document.getElementById('lng').value = uLng;
            } else {
                locStatus.innerHTML = `<span class='error'>DI LUAR RADIUS (${Math.round(dist)}m)</span>`;
                btnAbsen.disabled = true;
            }
        },
        (err) => {
            locStatus.innerHTML = `<span class='error'>GPS Error: ${err.message}</span>`;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// Tombol Ambil Foto
btnAbsen.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/png');
    preview.src = photoData;
    preview.style.display = 'block';
    video.style.display = 'none';
    
    alert("Absensi Berhasil!");
});

// Jalankan saat halaman dibuka
window.addEventListener('DOMContentLoaded', () => {
    setupCamera();
    checkLocation();
});