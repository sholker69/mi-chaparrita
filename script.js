document.addEventListener('DOMContentLoaded', () => {
    // --- Funcionalidad de Superposición de Contraseña (Existente) ---
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('password-input');
    const enterButton = document.getElementById('enter-button');
    const errorText = document.getElementById('error-text');
    const mainContent = document.getElementById('main-content');
    const CORRECT_PASSWORDS = [
        "magodita",
        "muñequita",
        "nena",
        "bodoquita", 
        "mi amor"
    ];

    if (enterButton) {
        enterButton.addEventListener('click', () => {
            // Convierte el valor del input a minúsculas para una comparación insensible a mayúsculas
            const enteredPassword = passwordInput.value.toLowerCase();

            // Comprueba si la contraseña ingresada está en el array de contraseñas correctas
            if (CORRECT_PASSWORDS.includes(enteredPassword)) {
                passwordOverlay.style.display = 'none';
                mainContent.style.display = 'block';
                // Opcional: Desplazarse al inicio del contenido principal
                window.scrollTo(0, 0);
            } else {
                errorText.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
            }
        });

        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enterButton.click();
            }
        });
    }

    // --- Funcionalidad de Galería (Existente) ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('myModal');
    const modalContent = document.querySelector('.modal-content');
    const closeButton = document.querySelector('.close-button');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const mediaSource = item.getAttribute('data-media') || item.getAttribute('data-video-src');
            const mediaType = item.getAttribute('data-type');

            modalContent.innerHTML = ''; // Limpiar contenido previo

            if (mediaType === 'image') {
                const img = document.createElement('img');
                img.src = mediaSource;
                modalContent.appendChild(img);
            } else if (mediaType === 'video-local') {
                const video = document.createElement('video');
                video.src = mediaSource;
                video.controls = true;
                video.autoplay = true; // Reproducir automáticamente al abrir el modal
                modalContent.appendChild(video);
            }
            modal.style.display = 'block';
        });
    });

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
            // Pausar cualquier video que se esté reproduciendo al cerrar el modal
            const videoInModal = modalContent.querySelector('video');
            if (videoInModal) {
                videoInModal.pause();
            }
        });
    }

    // Cerrar modal haciendo clic fuera de la imagen/video
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            const videoInModal = modalContent.querySelector('video');
            if (videoInModal) {
                videoInModal.pause();
            }
        }
    });

    // --- Funcionalidad de Leer Más en Mensajes (Existente) ---
    const readMoreButtons = document.querySelectorAll('.read-more');

    readMoreButtons.forEach(button => {
        button.addEventListener('click', () => {
            const messageCard = button.closest('.message-card');
            const fullMessage = messageCard.querySelector('.full-message');

            if (fullMessage.style.display === 'none') {
                fullMessage.style.display = 'block';
                button.textContent = 'Leer menos';
            } else {
                fullMessage.style.display = 'none';
                button.textContent = 'Leer más';
            }
        });
    });

    // --- Nueva Funcionalidad de Letras Sincronizadas para Múltiples Canciones ---

    // Función principal para manejar una sola canción con letras
    function setupSyncedLyrics(audioElement, lyricsContainer, songId) {
        let lyrics = [];
        let currentLyricIndex = -1;

        // Cargar la letra desde un archivo LRC específico para la canción
        async function loadLyrics(songIdentifier) {
            try {
                const filepath = `lyrics/${songIdentifier}.lrc`; // Asume que los LRC están en la carpeta 'songs'
                const response = await fetch(filepath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const lrcText = await response.text();
                parseLRC(lrcText);
            } catch (error) {
                console.warn(`No se pudo cargar la letra para ${songIdentifier}:`, error);
                // Opcional: Mostrar un mensaje si la letra no se carga
                lyricsContainer.textContent = "Letra no disponible.";
            }
        }

        // Parsear el contenido del archivo LRC
        function parseLRC(lrcText) {
            lyrics = [];
            const lines = lrcText.split('\n');
            const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

            lines.forEach(line => {
                const match = timeRegex.exec(line);
                if (match) {
                    const minutes = parseInt(match[1], 10);
                    const seconds = parseInt(match[2], 10);
                    const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
                    const time = (minutes * 60 + seconds) * 1000 + milliseconds;
                    const text = match[4].trim();
                    if (text) {
                        lyrics.push({ time, text });
                    }
                }
            });
            lyrics.sort((a, b) => a.time - b.time);
        }

        // Actualizar la letra en pantalla
        function updateLyricDisplay() {
            const currentTime = audioElement.currentTime * 1000;

            let foundIndex = -1;
            for (let i = lyrics.length - 1; i >= 0; i--) {
                if (currentTime >= lyrics[i].time) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex !== currentLyricIndex) {
                // Remover clase 'active' de la letra anterior
                if (currentLyricIndex !== -1 && lyrics[currentLyricIndex]) {
                    // Si tienes una forma de resaltar la letra anterior, quítale el estilo aquí
                }

                if (foundIndex !== -1) {
                    currentLyricIndex = foundIndex;
                    lyricsContainer.textContent = lyrics[currentLyricIndex].text;
                    // Opcional: Añadir una clase 'active' para animaciones CSS
                    // lyricsContainer.classList.add('active'); // Si lo deseas para efectos visuales
                } else {
                    lyricsContainer.textContent = "";
                    // lyricsContainer.classList.remove('active');
                    currentLyricIndex = -1;
                }
            }
        }

        // Event Listeners para la canción específica
        audioElement.addEventListener('timeupdate', updateLyricDisplay);

        audioElement.addEventListener('ended', () => {
            lyricsContainer.textContent = "";
            // lyricsContainer.classList.remove('active');
            currentLyricIndex = -1;
        });

        // Cargar la letra cuando el script se inicialice para esta canción
        loadLyrics(songId);
    }

    // Encontrar todas las tarjetas de canciones y configurar cada una
    const songCards = document.querySelectorAll('.song-card');
    songCards.forEach(card => {
        const audioElement = card.querySelector('.song-audio');
        const lyricsContainer = card.querySelector('.synced-lyrics');
        const songId = lyricsContainer.getAttribute('data-song-id');

        if (audioElement && lyricsContainer && songId) {
            setupSyncedLyrics(audioElement, lyricsContainer, songId);
        }
    });
});