// =============================================================================
// KELOR.IN - Single Page Application (SPA) Logic
// Vanilla JavaScript - No Database Required
// =============================================================================

// 1. DEKLARASI VARIABEL DOM
// =============================================================================

// Screens
const landingScreen = document.getElementById('landing-screen');
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const homeScreen = document.getElementById('home-screen');
const scanScreen = document.getElementById('scan-screen');
const chatScreen = document.getElementById('chat-screen');
const profileScreen = document.getElementById('profile-screen');
const pesananScreen = document.getElementById('pesanan-screen');
const stokScreen = document.getElementById('stok-screen');

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
const avatarUploadInput = document.getElementById('avatar-upload-input');
const avatarUploadTrigger = document.getElementById('avatar-upload-trigger');

// =============================================================================
// 2. UTILITY FUNCTIONS
// =============================================================================

/**
 * Menyembunyikan semua screen utama
 */
function hideAllScreens() {
  const screens = [landingScreen, loginScreen, registerScreen, homeScreen, scanScreen, chatScreen, profileScreen, pesananScreen, stokScreen];
  screens.forEach(s => {
    if (s) {
      s.classList.add('hidden');
      s.style.display = '';
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
    // Screens yang butuh display flex
    if (['landing-screen', 'login-screen', 'register-screen', 'home-screen', 'scan-screen', 'chat-screen', 'profile-screen', 'pesanan-screen', 'stok-screen'].includes(screenId)) {
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
// 3. LOGIKA LANDING & DAFTAR
// =============================================================================

// --- Landing Screen ---
const landingBtnMasuk  = document.getElementById('landing-btn-masuk');
const landingBtnDaftar = document.getElementById('landing-btn-daftar');
const loginBackBtn     = document.getElementById('login-back-btn');
const loginToDaftar    = document.getElementById('login-to-daftar');
const registerBackBtn  = document.getElementById('register-back-btn');
const registerToLogin  = document.getElementById('register-to-login');

if (landingBtnMasuk) {
  landingBtnMasuk.addEventListener('click', () => {
    hideAllScreens();
    loginScreen.classList.remove('hidden');
    loginScreen.style.display = 'flex';
  });
}

if (landingBtnDaftar) {
  landingBtnDaftar.addEventListener('click', () => {
    hideAllScreens();
    registerScreen.classList.remove('hidden');
    registerScreen.style.display = 'flex';
  });
}

if (loginBackBtn) {
  loginBackBtn.addEventListener('click', () => {
    hideAllScreens();
    landingScreen.classList.remove('hidden');
    landingScreen.style.display = 'flex';
  });
}

if (loginToDaftar) {
  loginToDaftar.addEventListener('click', () => {
    hideAllScreens();
    registerScreen.classList.remove('hidden');
    registerScreen.style.display = 'flex';
  });
}

if (registerBackBtn) {
  registerBackBtn.addEventListener('click', () => {
    hideAllScreens();
    landingScreen.classList.remove('hidden');
    landingScreen.style.display = 'flex';
  });
}

if (registerToLogin) {
  registerToLogin.addEventListener('click', () => {
    hideAllScreens();
    loginScreen.classList.remove('hidden');
    loginScreen.style.display = 'flex';
  });
}

// --- Role selector di form Daftar ---
let selectedRole = 'petani'; // default

function selectRole(role) {
  selectedRole = role;
  const btnPetani = document.getElementById('role-petani');
  const btnUmkm   = document.getElementById('role-umkm');
  if (role === 'petani') {
    btnPetani.className = 'role-btn bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm border-2 border-green-600 transition active:scale-95';
    btnUmkm.className   = 'role-btn bg-white text-gray-600 font-bold py-2.5 rounded-xl text-sm border-2 border-gray-200 transition active:scale-95';
  } else {
    btnUmkm.className   = 'role-btn bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm border-2 border-green-600 transition active:scale-95';
    btnPetani.className = 'role-btn bg-white text-gray-600 font-bold py-2.5 rounded-xl text-sm border-2 border-gray-200 transition active:scale-95';
  }
}

// --- Proses Daftar ---
const registerBtn = document.getElementById('register-btn');
if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    const name     = document.getElementById('register-name')?.value.trim();
    const input    = document.getElementById('register-input')?.value.trim();
    const location = document.getElementById('register-location')?.value.trim();
    const pass     = document.getElementById('register-password')?.value.trim();
    const confirm  = document.getElementById('register-confirm')?.value.trim();

    if (!name || !input || !location || !pass || !confirm) {
      Swal.fire({ icon: 'error', title: 'Formulir Belum Lengkap', text: 'Mohon isi semua kolom terlebih dahulu.', confirmButtonText: 'Oke' });
      return;
    }
    if (pass !== confirm) {
      Swal.fire({ icon: 'error', title: 'Kata Sandi Tidak Cocok', text: 'Pastikan kedua kata sandi sama.', confirmButtonText: 'Oke' });
      return;
    }

    // Simpan nama & lokasi ke state (prototype, tidak ada backend)
    if (profileDisplayName)  profileDisplayName.textContent  = name;
    if (profileDisplayLocation) profileDisplayLocation.textContent = location;
    if (homeAvatarText) homeAvatarText.textContent = name.substring(0, 2).toUpperCase();
    if (profileAvatarText) profileAvatarText.textContent = name.substring(0, 2).toUpperCase();

    Swal.fire({
      icon: 'success',
      title: 'Akun Berhasil Dibuat!',
      text: `Selamat datang, ${name}! Akun Anda sebagai ${selectedRole === 'petani' ? 'Petani' : 'UMKM'} sudah aktif.`,
      confirmButtonText: 'Mulai'
    }).then(() => {
      showScreen('home-screen');
      bottomNavbar.classList.remove('hidden');
      updateNavbarIndicator('home-screen');
    });
  });
}

// =============================================================================
// 4. LOGIKA LOGIN (lanjutan dari sebelumnya — nomor section digeser)
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
        // Terapkan custom logo (hasil upload) ke semua layar
        if (mainAppLogo) {
            mainAppLogo.src = base64Image;
            mainAppLogo.classList.remove('hidden');
            if (mainAppTitle) mainAppTitle.classList.add('hidden');
        }
        if (profileLogoPreview) {
            profileLogoPreview.src = base64Image;
            profileLogoPreview.classList.remove('hidden');
            if (profileLogoPlaceholder) profileLogoPlaceholder.classList.add('hidden');
            if (btnResetLogo) btnResetLogo.classList.remove('hidden');
        }
        if (homeDynamicLogo) {
            homeDynamicLogo.src = base64Image;
            homeDynamicLogo.classList.remove('hidden');
            if (homeDefaultLogo) homeDefaultLogo.classList.add('hidden');
        }
    } else {
        // Tidak ada logo custom — biarkan hardcoded src="assets/Logo.png" tetap tampil
        // Jangan sembunyikan mainAppLogo & homeDynamicLogo karena src-nya sudah static
        if (mainAppLogo) {
            mainAppLogo.classList.remove('hidden');
            // Jangan ubah src — biarkan assets/Logo.png
        }
        if (profileLogoPreview) {
            profileLogoPreview.src = '';
            profileLogoPreview.classList.add('hidden');
            if (profileLogoPlaceholder) profileLogoPlaceholder.classList.remove('hidden');
            if (btnResetLogo) btnResetLogo.classList.add('hidden');
        }
        if (homeDynamicLogo) {
            homeDynamicLogo.classList.remove('hidden');
            if (homeDefaultLogo) homeDefaultLogo.classList.add('hidden');
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
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        Swal.fire({
            title: 'Keluar dari aplikasi?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                showScreen('landing-screen');
                bottomNavbar.classList.add('hidden');
            }
        });
    });
}

// =============================================================================
// 6b. LOGIKA PROFIL SCREEN - EDIT PROFIL, UPLOAD SERTIFIKASI, RATING
// =============================================================================

// -- Helper: buka/tutup modal bottom-sheet --
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// -- Tombol Edit Profil --
const btnEditProfil = document.getElementById('btn-edit-profil');
if (btnEditProfil) {
    btnEditProfil.addEventListener('click', () => {
        // Isi input dengan nilai saat ini dari header
        const currentName = document.getElementById('profile-display-name');
        const currentLoc  = document.getElementById('profile-display-location');
        const inputNama   = document.getElementById('input-profil-nama');
        const inputLokasi = document.getElementById('input-profil-lokasi');
        if (inputNama && currentName)   inputNama.value   = currentName.textContent;
        if (inputLokasi && currentLoc)  inputLokasi.value = currentLoc.textContent;
        openModal('modal-edit-profil');
    });
}

// -- Simpan perubahan profil --
const btnSimpanProfil = document.getElementById('btn-simpan-profil');
if (btnSimpanProfil) {
    btnSimpanProfil.addEventListener('click', () => {
        const nama   = document.getElementById('input-profil-nama')?.value.trim();
        const lokasi = document.getElementById('input-profil-lokasi')?.value.trim();

        if (!nama) {
            Swal.fire({ icon: 'warning', title: 'Nama kosong', text: 'Mohon isi nama terlebih dahulu.', confirmButtonText: 'Oke' });
            return;
        }

        // Update tampilan header profil
        const dispName = document.getElementById('profile-display-name');
        const dispLoc  = document.getElementById('profile-display-location');
        if (dispName) dispName.textContent = nama;
        if (dispLoc && lokasi) dispLoc.textContent = lokasi;

        // Simpan ke localStorage
        localStorage.setItem('kelorin_profil_nama', nama);
        if (lokasi) localStorage.setItem('kelorin_profil_lokasi', lokasi);

        closeModal('modal-edit-profil');
        Swal.fire({ icon: 'success', title: 'Profil diperbarui!', timer: 1400, showConfirmButton: false });
    });
}

// -- Tutup modal edit profil --
const btnModalProfilClose = document.getElementById('modal-profil-close');
if (btnModalProfilClose) {
    btnModalProfilClose.addEventListener('click', () => closeModal('modal-edit-profil'));
}
// Tap backdrop untuk tutup
document.getElementById('modal-edit-profil')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('modal-edit-profil');
});

// -- Tombol Upload Sertifikasi --
const btnUploadSertifikasi  = document.getElementById('btn-upload-sertifikasi');
const sertifikasiUploadInput = document.getElementById('sertifikasi-upload-input');
if (btnUploadSertifikasi && sertifikasiUploadInput) {
    btnUploadSertifikasi.addEventListener('click', () => sertifikasiUploadInput.click());

    sertifikasiUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5000000) {
            Swal.fire({ icon: 'warning', title: 'File Terlalu Besar', text: 'Maksimal ukuran sertifikasi adalah 5MB.' });
            this.value = '';
            return;
        }
        Swal.fire({
            title: 'Mengunggah Sertifikasi...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });
        setTimeout(() => {
            Swal.fire({
                icon: 'success',
                title: 'Sertifikasi Diunggah!',
                text: `File "${file.name}" berhasil disimpan. Sertifikasi akan muncul di profil publik Anda.`,
                confirmButtonText: 'Oke'
            });
            sertifikasiUploadInput.value = '';
        }, 1500);
    });
}

// -- Tombol Rating & Ulasan --
const btnRatingUlasan = document.getElementById('btn-rating-ulasan');
if (btnRatingUlasan) {
    btnRatingUlasan.addEventListener('click', () => openModal('modal-rating-ulasan'));
}

// -- Tutup modal rating --
document.getElementById('modal-rating-close')?.addEventListener('click', () => closeModal('modal-rating-ulasan'));
document.getElementById('modal-rating-ulasan')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('modal-rating-ulasan');
});

// Lokasi: Lomba Poster - V2/app.js
// =============================================================================
// MANAJEMEN AVATAR GLOBAL
// =============================================================================

function applyAvatarToUI(base64Image) {
    if (base64Image) {
        if (homeAvatarImg && homeAvatarText) {
            homeAvatarImg.src = base64Image;
            homeAvatarImg.classList.remove('hidden');
            homeAvatarText.classList.add('hidden');
        }
        if (profileAvatarImg && profileAvatarText) {
            profileAvatarImg.src = base64Image;
            profileAvatarImg.classList.remove('hidden');
            profileAvatarText.classList.add('hidden');
        }
    } else {
        if (homeAvatarImg && homeAvatarText) {
            homeAvatarImg.src = '';
            homeAvatarImg.classList.add('hidden');
            homeAvatarText.classList.remove('hidden');
        }
        if (profileAvatarImg && profileAvatarText) {
            profileAvatarImg.src = '';
            profileAvatarImg.classList.add('hidden');
            profileAvatarText.classList.remove('hidden');
        }
    }
}

if (avatarUploadTrigger && avatarUploadInput) {
    avatarUploadTrigger.addEventListener('click', () => {
        avatarUploadInput.click();
    });

    avatarUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) {
                Swal.fire({ icon: 'warning', title: 'File Terlalu Besar', text: 'Maksimal ukuran foto profil adalah 2MB.' });
                this.value = '';
                return;
            }
            Swal.fire({
                title: 'Menyinkronkan Avatar...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => { Swal.showLoading(); }
            });
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Image = event.target.result;
                localStorage.setItem('kelorin_user_avatar', base64Image); 
                applyAvatarToUI(base64Image);
                setTimeout(() => {
                    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Avatar diperbarui di seluruh sistem.', timer: 1500, showConfirmButton: false });
                }, 400); 
            };
            reader.readAsDataURL(file);
        }
    });
}

// =============================================================================
// 7. GRAFIK PENJUALAN INTERAKTIF
// =============================================================================

const salesChartData = {
    minggu_ini: {
        labels: ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'],
        values: [20, 35, 28, 45, 38, 50],
    },
    minggu_lalu: {
        labels: ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'],
        values: [15, 22, 18, 30, 25, 35],
    },
    dua_minggu_lalu: {
        labels: ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'],
        values: [10, 18, 22, 28, 20, 32],
    },
};

function renderSalesChart(period) {
    const data = salesChartData[period];
    const container = document.getElementById('sales-chart-container');
    const tooltip = document.getElementById('chart-tooltip');
    const xLabelsEl = document.getElementById('chart-x-labels');
    if (!container || !data) return;

    const W = 320, H = 130;
    const padL = 38, padR = 10, padT = 10, padB = 8;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const maxVal = 50;
    const ySteps = [0, 10, 20, 30, 40, 50];
    const values = data.values;
    const n = values.length;

    // Kalkulasi posisi titik
    const points = values.map((v, i) => ({
        x: padL + (i / (n - 1)) * chartW,
        y: padT + chartH - (v / maxVal) * chartH,
        value: v,
        label: data.labels[i],
    }));

    // Path garis dan area
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[n - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

    // Grid dan label Y-axis
    const yGrid = ySteps.map(step => {
        const y = padT + chartH - (step / maxVal) * chartH;
        return `
            <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#f3f4f6" stroke-width="1"/>
            <text x="${padL - 4}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="7" fill="#9ca3af" font-weight="700">${step}kg</text>
        `;
    }).join('');

    // Titik-titik data
    const circles = points.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="#fff" stroke="#16a34a" stroke-width="2.5"
            class="chart-point" data-value="${p.value}" data-label="${p.label}"
            style="cursor:pointer; transition: r 0.15s ease;"/>
    `).join('');

    container.innerHTML = `
        <svg class="w-full" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
            <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#16a34a"/>
                    <stop offset="100%" stop-color="#ffffff"/>
                </linearGradient>
            </defs>
            ${yGrid}
            <path d="${areaD}" fill="url(#salesGrad)" opacity="0.12"/>
            <path d="${pathD}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            ${circles}
        </svg>
    `;

    // Label X-axis
    if (xLabelsEl) {
        xLabelsEl.innerHTML = data.labels.map(l => `<span>${l}</span>`).join('');
    }

    // Tooltip interaktif
    container.querySelectorAll('.chart-point').forEach(circle => {
        const showTip = () => {
            const svgEl = container.querySelector('svg');
            const svgRect = svgEl.getBoundingClientRect();
            const vb = svgEl.viewBox.baseVal;
            const scaleX = svgRect.width / vb.width;
            const scaleY = svgRect.height / vb.height;
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const val = circle.getAttribute('data-value');
            const lbl = circle.getAttribute('data-label');

            tooltip.innerHTML = `${lbl}: <span style="color:#4ade80">${val} kg</span>`;
            tooltip.style.left = (cx * scaleX) + 'px';
            tooltip.style.top = (cy * scaleY) + 'px';
            tooltip.classList.remove('hidden');
            circle.setAttribute('r', '6');
        };
        const hideTip = () => {
            tooltip.classList.add('hidden');
            circle.setAttribute('r', '5');
        };

        circle.addEventListener('mouseenter', showTip);
        circle.addEventListener('mouseleave', hideTip);
        circle.addEventListener('touchstart', (e) => { e.preventDefault(); showTip(); }, { passive: false });
        circle.addEventListener('touchend', hideTip);
    });
}

// Sort By handler
const chartSortSelect = document.getElementById('chart-sort-select');
if (chartSortSelect) {
    chartSortSelect.addEventListener('change', () => {
        renderSalesChart(chartSortSelect.value);
    });
}

// =============================================================================
// 8. NAVIGASI BARU - PESANAN & STOK
// =============================================================================

// Tombol "Lihat Semua" di card Pesanan Masuk (home screen)
const lihatSemuaPesanan = document.getElementById('lihat-semua-pesanan');
if (lihatSemuaPesanan) {
    lihatSemuaPesanan.addEventListener('click', () => {
        showScreen('pesanan-screen');
        updateNavbarIndicator('pesanan-screen');
    });
}

// Tombol eye (👁) di tiap card pesanan masuk
document.querySelectorAll('.nav-to-pesanan').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('pesanan-screen');
        updateNavbarIndicator('pesanan-screen');
    });
});

// Tombol gear di card Stok (home screen)
const btnKelolaStok = document.getElementById('btn-kelola-stok');
if (btnKelolaStok) {
    btnKelolaStok.addEventListener('click', () => {
        showScreen('stok-screen');
        updateNavbarIndicator('stok-screen');
    });
}

// =============================================================================
// 9. INITIALIZATION - SETUP AWAL APLIKASI
// =============================================================================

// Lokasi: Lomba Poster - V2/app.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Kelor.in App - Initialized');

  // Panggil logo dari memory lokal
  const savedLogo = localStorage.getItem('kelorin_custom_logo');
  applyLogoToUI(savedLogo);
  
  const savedAvatar = localStorage.getItem('kelorin_user_avatar');
  applyAvatarToUI(savedAvatar);

  // Pulihkan nama & lokasi profil yang pernah disimpan
  const savedNama   = localStorage.getItem('kelorin_profil_nama');
  const savedLokasi = localStorage.getItem('kelorin_profil_lokasi');
  if (savedNama) {
      const el = document.getElementById('profile-display-name');
      if (el) el.textContent = savedNama;
  }
  if (savedLokasi) {
      const el = document.getElementById('profile-display-location');
      if (el) el.textContent = savedLokasi;
  }

  // State awal: sembunyikan semua, tampilkan landing page terlebih dahulu
  hideAllScreens();
  landingScreen.classList.remove('hidden');
  landingScreen.style.display = 'flex';
  bottomNavbar.classList.add('hidden');

  // Render chart awal (Minggu Ini)
  renderSalesChart('minggu_ini');
  
  console.log('✅ UI initialized - Waiting for user login...');
});

// =============================================================================
// END OF APP.JS - v2.1 (Pesanan, Stok, Grafik Penjualan Interaktif)
// =============================================================================
