const pages = {
    login: document.getElementById('page-login'),
    envelope: document.getElementById('page-envelope'),
    menu: document.getElementById('page-menu'),
    content: document.getElementById('page-content'),
};

const birthdayLoginForm = document.getElementById('birthday-login-form');
const birthdayInput = document.getElementById('birthday-input');
const loginError = document.getElementById('login-error');
const contentArea = document.getElementById('content-area');
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const backgroundMusicVolume = 0.2;
const duckedMusicVolume = 0.01;

backgroundMusic.volume = backgroundMusicVolume;

function restoreBackgroundMusicVolume() {
    backgroundMusic.volume = backgroundMusicVolume;
}

function removeMusicGestureFallback() {
    document.removeEventListener('pointerdown', startMusicAfterInteraction);
    document.removeEventListener('keydown', startMusicAfterInteraction);
}

function startMusicAfterInteraction(event) {
    if (musicToggle.contains(event.target)) {
        return;
    }

    removeMusicGestureFallback();
    playBackgroundMusic();
}

async function playBackgroundMusic() {
    try {
        await backgroundMusic.play();
        removeMusicGestureFallback();
        musicToggle.textContent = '⏸ Jeda backsound';
        musicToggle.setAttribute('aria-label', 'Jeda backsound');
        musicToggle.setAttribute('aria-pressed', 'true');
    } catch (error) {
        const message = backgroundMusic.error ?
            'Musik gagal dimuat. Periksa file backsound.' :
            'Autoplay diblokir. Tekan untuk memutar musik.';
        musicToggle.textContent = backgroundMusic.error ? '⚠ Musik gagal dimuat' : '▶ Putar backsound';
        musicToggle.setAttribute('aria-label', message);
        musicToggle.title = message;
        musicToggle.setAttribute('aria-pressed', 'false');
        document.addEventListener('pointerdown', startMusicAfterInteraction);
        document.addEventListener('keydown', startMusicAfterInteraction);
        if (backgroundMusic.error) {
            console.error(message, error);
        } else {
            console.info(message);
        }
    }
}

backgroundMusic.addEventListener('error', () => {
    removeMusicGestureFallback();
    const message = 'Musik gagal dimuat. Periksa file backsound.m4a.';
    musicToggle.textContent = '⚠ Musik gagal dimuat';
    musicToggle.setAttribute('aria-label', message);
    musicToggle.title = message;
    musicToggle.setAttribute('aria-pressed', 'false');
    console.error(message);
});

musicToggle.addEventListener('click', () => {
    if (backgroundMusic.paused) {
        playBackgroundMusic();
        return;
    }

    backgroundMusic.pause();
    removeMusicGestureFallback();
    musicToggle.textContent = '▶ Putar backsound';
    musicToggle.setAttribute('aria-label', 'Putar backsound');
    musicToggle.setAttribute('aria-pressed', 'false');
});

playBackgroundMusic();

const contentTemplates = {
    journey: `
        <h2 class="title-font content-title">Journey Kenangan</h2>
        <div class="memory-gallery">
            <img class="memory-photo" src="foto1.jpg" alt="Kenangan pertama">
            <img class="memory-photo" src="foto2.jpg" alt="Kenangan kedua">
            <img class="memory-photo" src="foto3.jpg" alt="Kenangan ketiga">
            <img class="memory-photo" src="foto4.jpg" alt="Kenangan keempat">
            <img class="memory-photo" src="foto5.jpg" alt="Kenangan kelima">
            <img class="memory-photo" src="foto6.jpg" alt="Kenangan keenam">
        </div>
    `,
    moment: `
        <article class="message-card">
            <h2 class="title-font">Pesan Untukmu</h2>
            <p>"Selamat ulang tahun!!! Semoga tahun ini menjadi tahun yang membahagiakan,rezeki selalu datang,MAKIN CANTIK,makin dewasa juga pemikirannya.itu aja sih kata kata dariku,SELAMAT ULANG TAHUN YANG KE 19 YAH!😊😊"</p>
        </article>
    `,
    playlist: `
        <h2 class="title-font content-title">Pesan Suara Untukmu</h2>
        <audio class="audio-player" controls preload="metadata">
            <source src="rekaman-suara.m4a" type="audio/mp4">
            Browser kamu tidak mendukung pemutar audio.
        </audio>
    `,
    gift: `
        <iframe class="gift-scene" src="gift.html" title="Animasi bunga untuk hadiah ulang tahun"></iframe>
    `,
};

function showPage(currentPage, nextPage) {
    currentPage.classList.remove('active');
    currentPage.classList.add('hidden');
    nextPage.classList.remove('hidden');
    nextPage.classList.add('active');
}

birthdayLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (birthdayInput.value.trim() !== '30-11-2007') {
        loginError.textContent = 'Tanggalnya belum tepat, coba lagi ya 😊';
        birthdayInput.focus();
        return;
    }

    loginError.textContent = '';
    showPage(pages.login, pages.envelope);
});

document.getElementById('btn-open-envelope').addEventListener('click', () => {
    showPage(pages.envelope, pages.menu);
});

document.querySelectorAll('[data-content]').forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        const template = contentTemplates[menuItem.dataset.content];
        if (!template) {
            return;
        }

        const currentVoiceAudio = contentArea.querySelector('.audio-player');
        if (currentVoiceAudio) {
            currentVoiceAudio.pause();
        }

        contentArea.innerHTML = template;
        showPage(pages.menu, pages.content);

        const voiceAudio = contentArea.querySelector('.audio-player');
        if (voiceAudio) {
            voiceAudio.addEventListener('play', () => {
                backgroundMusic.volume = duckedMusicVolume;
            });
            ['pause', 'ended', 'error'].forEach((eventName) => {
                voiceAudio.addEventListener(eventName, restoreBackgroundMusicVolume);
            });
        }
    });
});

document.getElementById('back-btn').addEventListener('click', () => {
    const voiceAudio = contentArea.querySelector('.audio-player');
    if (voiceAudio) {
        voiceAudio.pause();
        restoreBackgroundMusicVolume();
    }

    showPage(pages.content, pages.menu);
});