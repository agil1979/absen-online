// KONFIGURASI KANTOR (Ganti dengan koordinat lokasi Anda)
const OFFICE_LAT = --6.627897368604418; // Contoh: Hariang
const OFFICE_LNG = 106.2940446439117;
const MAX_DISTANCE = 100; // Jarak maksimum dalam meter (misal: 100 meter)

const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const btnAbsen = document.getElementById('btn-absen');
const locStatus = document.getElementById('location-status');

// 1. Akses Kamera
async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        video.srcObject = stream;
    } catch (err) {
        locStatus.innerHTML = "<span class='error'>Gagal akses kamera!</span>";
    }
}

// 2. Cek Lokasi Pengguna
function checkLocation() {
    if (!navigator.geolocation) {
        locStatus.innerHTML = "<span class='error'>Geolocation tidak didukung browser ini.</span>";
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const distance = calculateDistance(userLat, userLng, OFFICE_LAT, OFFICE_LNG);
        
        if (distance <= MAX_DISTANCE) {
            locStatus.innerHTML = `<span class='success'>Lokasi Terverifikasi! (Jarak: ${Math.round(distance)}m)</span>`;
            btnAbsen.disabled = false;
            document.getElementById('lat').value = userLat;
            document.getElementById('lng').value = userLng;
        } else {
            locStatus.innerHTML = `<span class='error'>Anda berada di luar radius! (Jarak: ${Math.round(distance)}m)</span>`;
            btnAbsen.disabled = true;
        }
    }, err => {
        locStatus.innerHTML = "<span class='error'>Gagal mendapatkan lokasi. Pastikan GPS aktif.</span>";
    }, { enableHighAccuracy: true });
}

// 3. Hitung Jarak (Haversine Formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Jari-jari bumi dalam meter
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 4. Ambil Foto
btnAbsen.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    document.getElementById('photo').value = imageData;
    
    preview.src = imageData;
    preview.style.display = 'block';
    video.style.display = 'none';
    
    alert("Absensi Berhasil! Data siap dikirim ke server.");
    console.log("Data Foto (Base64):", imageData);
    console.log("Koordinat:", document.getElementById('lat').value, document.getElementById('lng').value);
    
    // Di sini Anda bisa menambahkan fungsi fetch() untuk kirim data ke database/backend
});

// Jalankan fungsi saat load
window.onload = () => {
    setupCamera();
    checkLocation();
};