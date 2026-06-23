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

const homeDynamicLogo = document.getElementById('home-dynamic-logo');
const homeDefaultLogo = document.getElementById('home-default-logo');
const homeScrollContainer = document.getElementById('home-scroll-container');
const homeWhiteLayer = document.getElementById('home-white-layer');
const benefitsCarousel = document.getElementById('benefits-carousel');
const carouselIndicators = document.getElementById('carousel-indicators');

// Avatar Elements
const homeAvatarImg = document.getElementById('home-avatar-img');
const homeAvatarText = document.getElementById('home-avatar-text');
const profileAvatarImg = document.getElementById('profile-avatar-img');
const profileAvatarText = document.getElementById('profile-avatar-text');

// =============================================================================
// 2. UTILITY FUNCTIONS
// =============================================================================

/**
 * Menyembunyikan semua screen utama
 */
function hideAllScreens() {
  const screens = [loginScreen, homeScreen, scanScreen, chatScreen, profileScreen];
  screens.forEach(s => {
    if (s) {
      s.classList.add('hidden');
      s.style.display = ''; // Reset inline style agar hidden class bekerja
    }
  });
  scanScreen.classList.remove('flex');
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
    // Semua screen utama butuh display flex agar layout flex-col bekerja
    if (screenId === 'home-screen' || screenId === 'scan-screen' || 
        screenId === 'chat-screen' || screenId === 'profile-screen') {
      screen.style.display = 'flex';
    }
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

/**
 * Event Listener untuk efek parallax border-radius di Home Screen
 * Layer putih naik ketika di-scroll, background hijau/logo tetap diam
 */
if (homeScrollContainer && homeWhiteLayer) {
    homeScrollContainer.addEventListener('scroll', () => {
        // Threshold kecil (20px) agar efek terasa responsif
        const scrolled = homeScrollContainer.scrollTop;
        if (scrolled > 20) {
            homeWhiteLayer.classList.remove('rounded-t-[2.5rem]');
            homeWhiteLayer.classList.add('rounded-t-none');
        } else {
            homeWhiteLayer.classList.add('rounded-t-[2.5rem]');
            homeWhiteLayer.classList.remove('rounded-t-none');
        }
    }, { passive: true });
}

/**
 * Event Listener untuk logika sinkronisasi Carousel & Indikator
 */
if (benefitsCarousel && carouselIndicators) {
    const dots = carouselIndicators.children;
    
    benefitsCarousel.addEventListener('scroll', () => {
        const scrollPosition = benefitsCarousel.scrollLeft;
        const cardWidth = benefitsCarousel.clientWidth;
        
        // Mencegah pembagian dengan nol jika UI belum dirender browser
        if (cardWidth === 0) return;
        
        // Kalkulasi indeks slide aktif (dibulatkan ke kartu terdekat)
        const activeIndex = Math.round(scrollPosition / cardWidth);
        
        // Manipulasi warna indikator berdasarkan state
        for (let i = 0; i < dots.length; i++) {
            if (i === activeIndex) {
                dots[i].classList.remove('bg-gray-200');
                dots[i].classList.add('bg-green-500');
            } else {
                dots[i].classList.remove('bg-green-500');
                dots[i].classList.add('bg-gray-200');
            }
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
  showScreen('home-screen');
  bottomNavbar.classList.remove('hidden');
  
  // Set indikator navbar ke Home (screen default setelah login)
  updateNavbarIndicator('home-screen');
  
  // Reset form
  loginInput.value = '';
  loginPassword.value = '';
  
  console.log('✅ Login berhasil! Selamat datang.');
}

/**
 * Menangani login dengan Google (simulasi)
 */
function handleGoogleLogin() {
  console.log('?? Tombol Google diklik - Simulasi Google Sign-In');
  
  // Tanpa validasi input, langsung login
  showScreen('home-screen');
  bottomNavbar.classList.remove('hidden');
  
  // Set indikator navbar ke Home
  updateNavbarIndicator('home-screen');
  
  // Reset form
  loginInput.value = '';
  loginPassword.value = '';
  
  console.log('✅ Login dengan Google berhasil!');
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
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetScreenId = btn.getAttribute('data-screen');
    showScreen(targetScreenId);
    updateNavbarIndicator(targetScreenId);

    // Otomatis gulir kembali ke paling atas jika menekan tombol Home
    // Ini mengembalikan bentuk border membulat dan memperlihatkan logo
    if (targetScreenId === 'home-screen' && homeScrollContainer) {
        homeScrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        if(mainAppLogo) {
            mainAppLogo.src = base64Image;
            mainAppLogo.classList.remove('hidden');
            mainAppTitle.classList.add('hidden');
        }
        
        // Terapkan ke Layar Profil
        if(profileLogoPreview) {
            profileLogoPreview.src = base64Image;
            profileLogoPreview.classList.remove('hidden');
            profileLogoPlaceholder.classList.add('hidden');
            btnResetLogo.classList.remove('hidden');
        }

        // Terapkan ke Layar Home
        if(homeDynamicLogo) {
            homeDynamicLogo.src = base64Image;
            homeDynamicLogo.classList.remove('hidden');
            homeDefaultLogo.classList.add('hidden');
        }
    } else {
        // Reset ke teks bawaan
        if(mainAppLogo) {
            mainAppLogo.src = '';
            mainAppLogo.classList.add('hidden');
            mainAppTitle.classList.remove('hidden');
        }
        
        if(profileLogoPreview) {
            profileLogoPreview.src = '';
            profileLogoPreview.classList.add('hidden');
            profileLogoPlaceholder.classList.remove('hidden');
            btnResetLogo.classList.add('hidden');
        }

        if(homeDynamicLogo) {
            homeDynamicLogo.src = '';
            homeDynamicLogo.classList.add('hidden');
            homeDefaultLogo.classList.remove('hidden');
        }
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
  
  // State awal: sembunyikan semua, tampilkan login
  hideAllScreens();
  loginScreen.classList.remove('hidden');
  loginScreen.style.display = 'flex';
  bottomNavbar.classList.add('hidden');
  
  console.log('✅ UI initialized - Waiting for user login...');
});

// =============================================================================
// END OF APP.JS
// =============================================================================
