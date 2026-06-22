// =============================================================================
// KELOR.IN - Single Page Application (SPA) Logic
// Vanilla JavaScript - No Database Required
// =============================================================================

// 1. DEKLARASI VARIABEL DOM
// =============================================================================

// Screens
const loginScreen = document.getElementById('login-screen');
const homeScreen = document.getElementById('home-screen');
const scanScreen = document.getElementById('scan-screen');
const chatScreen = document.getElementById('chat-screen');
const profileScreen = document.getElementById('profile-screen');

// Navbar
const bottomNavbar = document.getElementById('bottom-navbar');
const navButtons = document.querySelectorAll('.nav-btn');

// Login Elements
const loginBtn = document.getElementById('login-btn');
const googleBtn = document.getElementById('google-btn');
const loginInput = document.getElementById('login-input');
const loginPassword = document.getElementById('login-password');

// Scan Elements
// Scan Elements
const scanMenu = document.getElementById('scan-menu');
const activeCameraView = document.getElementById('active-camera-view');
const btnOpenCamera = document.getElementById('btn-open-camera');
const btnCloseCamera = document.getElementById('btn-close-camera');
const btnUploadFoto = document.getElementById('btn-upload-foto');
const fileUploadInput = document.getElementById('file-upload-input');

const cameraFeed = document.getElementById('camera-feed');
const mockupLeaf = document.getElementById('mockup-leaf');
const flashEffect = document.getElementById('flash-effect');
const shutterBtn = document.getElementById('shutter-btn');
let streamReference = null;

// Profile & Logo Elements
const mainAppLogo = document.getElementById('main-app-logo');
const mainAppTitle = document.getElementById('main-app-title');
const profileLogoPreview = document.getElementById('profile-logo-preview');
const profileLogoPlaceholder = document.getElementById('profile-logo-placeholder');
const logoUploadInput = document.getElementById('logo-upload-input');
const btnResetLogo = document.getElementById('btn-reset-logo');
const btnLogout = document.getElementById('btn-logout');

// =============================================================================
// 2. UTILITY FUNCTIONS
// =============================================================================

/**
 * Menyembunyikan semua screen utama
 */
function hideAllScreens() {
  loginScreen.classList.add('hidden');
  homeScreen.classList.add('hidden');
  scanScreen.classList.add('hidden');
  scanScreen.classList.remove('flex'); // Pembersihan khusus scan
  chatScreen.classList.add('hidden');
  profileScreen.classList.add('hidden'); // Tambahan baru
}

/**
 * Menampilkan screen tertentu berdasarkan ID
 * @param {string} screenId - ID dari screen yang akan ditampilkan
 */
function showScreen(screenId) {
  hideAllScreens();
  
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
    // Jika itu scan-screen, pastikan defaultnya flex
    if(screenId === 'scan-screen') screen.classList.add('flex');
  }

  // Safety Protocol: Matikan hardware kamera dan reset UI scan ke Menu
  if (typeof stopCamera === "function") stopCamera();
  if (activeCameraView && scanMenu) {
      activeCameraView.classList.add('hidden');
      activeCameraView.classList.remove('flex');
      scanMenu.classList.remove('hidden');
  }
}

/**
 * Mengubah indikator aktif pada navbar
 * @param {string} targetScreenId - ID screen yang sedang aktif
 */
function updateNavbarIndicator(targetScreenId) {
  navButtons.forEach(btn => {
    const btnScreenId = btn.getAttribute('data-screen');
    
    if (btnScreenId === targetScreenId) {
      // Tombol aktif: ubah warna teks menjadi hijau
      btn.classList.remove('text-gray-600');
      btn.classList.add('text-green-600', 'font-semibold');
    } else {
      // Tombol tidak aktif: kembalikan warna ke abu-abu
      btn.classList.remove('text-green-600', 'font-semibold');
      btn.classList.add('text-gray-600');
    }
  });
}

// =============================================================================
// 3. LOGIKA LOGIN
// =============================================================================

/**
 * Menangani proses login (baik via MASUK atau Google)
 */
function handleLogin() {
  const phoneOrEmail = loginInput.value.trim();
  const password = loginPassword.value.trim();
  
  // Validasi input minimal
  if (!phoneOrEmail || !password) {
    Swal.fire({
      icon: 'error',
      title: 'Akses Ditolak',
      text: 'Mohon isi Nomor Telepon/Email dan Kata Sandi.',
      confirmButtonText: 'Mengerti'
    });
    return;
  }
  
  // Sembunyikan login screen, tampilkan home dan navbar
  loginScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  bottomNavbar.classList.remove('hidden');
  
  // Set indikator navbar ke Home (screen default setelah login)
  updateNavbarIndicator('home-screen');
  
  // Reset form
  loginInput.value = '';
  loginPassword.value = '';
  
  console.log('? Login berhasil! Selamat datang.');
}

/**
 * Menangani login dengan Google (simulasi)
 */
function handleGoogleLogin() {
  console.log('?? Tombol Google diklik - Simulasi Google Sign-In');
  
  // Tanpa validasi input, langsung login
  loginScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  bottomNavbar.classList.remove('hidden');
  
  // Set indikator navbar ke Home
  updateNavbarIndicator('home-screen');
  
  // Reset form
  loginInput.value = '';
  loginPassword.value = '';
  
  console.log('? Login dengan Google berhasil!');
}

// Event listeners untuk login
loginBtn.addEventListener('click', handleLogin);
googleBtn.addEventListener('click', handleGoogleLogin);

// Allow Enter key untuk submit login
loginInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLogin();
});
loginPassword.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLogin();
});

// =============================================================================
// 4. LOGIKA NAVIGASI SPA (BOTTOM NAVBAR)
// =============================================================================

/**
 * Menangani klik pada tombol navbar
 */
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetScreenId = btn.getAttribute('data-screen');
    showScreen(targetScreenId);
    updateNavbarIndicator(targetScreenId);
  });
});

// =============================================================================
// 5. LOGIKA SCAN DAUN & MANAJEMEN KAMERA
// =============================================================================

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        streamReference = stream;
        cameraFeed.srcObject = stream;
        cameraFeed.classList.remove('hidden');
        mockupLeaf.classList.add('hidden');
        console.log('✅ Kamera fisik aktif');
    } catch (err) {
        console.error('❌ Akses kamera gagal:', err);
        cameraFeed.classList.add('hidden');
        mockupLeaf.classList.remove('hidden');
    }
}

function stopCamera() {
    if (streamReference) {
        streamReference.getTracks().forEach(track => track.stop());
        streamReference = null;
        console.log('✅ Kamera dimatikan');
    }
}

// Navigasi UI Scan
btnOpenCamera.addEventListener('click', () => {
    scanMenu.classList.add('hidden');
    activeCameraView.classList.remove('hidden');
    activeCameraView.classList.add('flex');
    startCamera();
});

btnCloseCamera.addEventListener('click', () => {
    stopCamera();
    activeCameraView.classList.add('hidden');
    activeCameraView.classList.remove('flex');
    scanMenu.classList.remove('hidden');
});

// UI Kustom untuk Animasi Loading Profesional
const customLoadingHTML = `
    <div class="flex flex-col items-center justify-center my-2">
        <div class="relative w-20 h-20 flex items-center justify-center bg-green-50 rounded-full mb-4 shadow-inner">
            <svg class="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <div class="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-sm font-medium text-gray-600">Memproses pigmen dan struktur seluler...</p>
    </div>
`;

// Simulasi Unggah File
btnUploadFoto.addEventListener('click', () => {
    fileUploadInput.click();
});

fileUploadInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        Swal.fire({
            title: 'Menganalisis Gambar',
            html: customLoadingHTML,
            showConfirmButton: false,
            allowOutsideClick: false,
            timer: 2000
        }).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Daun Terdeteksi',
                text: 'Kondisi daun kelor sangat sehat dengan nutrisi optimal.',
                confirmButtonText: 'Kembali ke Beranda'
            }).then((result) => {
                if (result.isConfirmed || result.isDismissed) {
                    fileUploadInput.value = ''; 
                    showScreen('home-screen');
                    updateNavbarIndicator('home-screen');
                }
            });
        });
    }
});

// Tombol Shutter (Kamera)
shutterBtn.addEventListener('click', () => {
    // 1. Eksekusi Flash Effect
    flashEffect.classList.remove('hidden');
    flashEffect.classList.add('opacity-100');
    
    setTimeout(() => {
        flashEffect.classList.remove('opacity-100');
        setTimeout(() => flashEffect.classList.add('hidden'), 100); 
    }, 100);

    // 2. Matikan hardware di background
    stopCamera();
    activeCameraView.classList.add('hidden');
    activeCameraView.classList.remove('flex');
    scanMenu.classList.remove('hidden');

    // 3. Analisis simulasi berantai dengan animasi kustom
    Swal.fire({
        title: 'Memindai Objek',
        html: customLoadingHTML,
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 2000
    }).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Analisis Selesai',
            text: 'Daun kelor terdeteksi dengan kualitas sangat baik.',
            confirmButtonText: 'Lihat Hasil di Beranda'
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                showScreen('home-screen');
                updateNavbarIndicator('home-screen');
            }
        });
    });
});

// =============================================================================
// 6. MANAJEMEN LOGO DINAMIS (LOCALSTORAGE) & LOGOUT
// =============================================================================

function applyLogoToUI(base64Image) {
    if (base64Image) {
        // Terapkan ke Layar Login
        mainAppLogo.src = base64Image;
        mainAppLogo.classList.remove('hidden');
        mainAppTitle.classList.add('hidden');
        
        // Terapkan ke Layar Profil
        profileLogoPreview.src = base64Image;
        profileLogoPreview.classList.remove('hidden');
        profileLogoPlaceholder.classList.add('hidden');
        btnResetLogo.classList.remove('hidden');
    } else {
        // Reset ke teks bawaan
        mainAppLogo.src = '';
        mainAppLogo.classList.add('hidden');
        mainAppTitle.classList.remove('hidden');
        
        profileLogoPreview.src = '';
        profileLogoPreview.classList.add('hidden');
        profileLogoPlaceholder.classList.remove('hidden');
        btnResetLogo.classList.add('hidden');
    }
}

// Event Listener Upload Logo
logoUploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2000000) { // Batas 2MB
            Swal.fire({ icon: 'warning', title: 'File Terlalu Besar', text: 'Maksimal ukuran logo adalah 2MB.' });
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Image = event.target.result;
            localStorage.setItem('kelorin_custom_logo', base64Image); // Simpan permanen di browser
            applyLogoToUI(base64Image);
            
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Logo aplikasi telah diperbarui.', timer: 1500, showConfirmButton: false });
        };
        reader.readAsDataURL(file);
    }
});

// Event Listener Reset Logo
btnResetLogo.addEventListener('click', () => {
    localStorage.removeItem('kelorin_custom_logo');
    applyLogoToUI(null);
    logoUploadInput.value = '';
});

// Event Listener Logout
btnLogout.addEventListener('click', () => {
    Swal.fire({
        title: 'Keluar dari aplikasi?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444' // Warna merah untuk logout
    }).then((result) => {
        if (result.isConfirmed) {
            showScreen('login-screen');
            bottomNavbar.classList.add('hidden');
        }
    });
});

// =============================================================================
// 7. INITIALIZATION - SETUP AWAL APLIKASI
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Kelor.in App - Initialized');


  // Panggil logo dari memory lokal
  const savedLogo = localStorage.getItem('kelorin_custom_logo');
  applyLogoToUI(savedLogo);
  
  // State awal: tampilkan login screen, sembunyikan yang lain
  loginScreen.classList.remove('hidden');
  homeScreen.classList.add('hidden');
  scanScreen.classList.add('hidden');
  chatScreen.classList.add('hidden');
  bottomNavbar.classList.add('hidden');
  
  console.log('?? UI initialized - Waiting for user login...');
});

// =============================================================================
// END OF APP.JS
// =============================================================================
