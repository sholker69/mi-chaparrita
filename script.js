document.addEventListener('DOMContentLoaded', () => {
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('password-input');
    const enterButton = document.getElementById('enter-button');
    const errorText = document.getElementById('error-text');
    const mainContent = document.getElementById('main-content');

    const correctPassword = ""; // ¡¡¡IMPORTANTE: CAMBIA ESTA CONTRASEÑA POR LA REAL!!!

    enterButton.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            passwordOverlay.style.display = 'none';
            mainContent.style.display = 'block'; // Muestra el contenido principal
            initializePageContent(); // Llama a la función para inicializar el contenido
        } else {
            errorText.textContent = "Contraseña incorrecta. Intenta de nuevo.";
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enterButton.click();
        }
    });

    // Función principal para inicializar el contenido de la página, incluyendo la sincronización de letras
    function initializePageContent() {
        // --- Modal Functionality ---
        const modal = document.getElementById("myModal");
        const closeBtn = document.getElementsByClassName("close-button")[0];
        const galleryItems = document.querySelectorAll(".gallery-item");
        const modalContent = document.querySelector(".modal-content");
        let currentVideoElement = null; // Para guardar la referencia al video que se está reproduciendo

        galleryItems.forEach(item => {
            item.addEventListener("click", function() {
                const mediaUrl = this.dataset.media;
                const videoSrc = this.dataset.videoSrc; // Nuevo atributo para videos locales
                const mediaType = this.dataset.type;

                modalContent.innerHTML = ''; // Limpiar contenido previo

                if (mediaType === "image") {
                    const img = document.createElement("img");
                    img.src = mediaUrl;
                    img.alt = "Contenido de la galería";
                    modalContent.appendChild(img);
                    currentVideoElement = null; // Reiniciar referencia de video
                } else if (mediaType === "video-youtube") {
                    const iframe = document.createElement("iframe");
                    iframe.src = mediaUrl;
                    iframe.setAttribute("frameborder", "0");
                    iframe.setAttribute("allowfullscreen", "");
                    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
                    modalContent.appendChild(iframe);
                    currentVideoElement = null; // Reiniciar referencia de video
                } else if (mediaType === "video-local") {
                    const videoContainer = document.createElement('div');
                    videoContainer.classList.add('video-player-container');

                    const video = document.createElement('video');
                    video.src = videoSrc;
                    video.preload = 'metadata'; // Carga metadatos para obtener duración, etc.
                    video.poster = this.querySelector('img').src; // Usa la miniatura como poster
                    videoContainer.appendChild(video);

                    const controls = document.createElement('div');
                    controls.classList.add('video-controls');
                    
                    // Play/Pause Button
                    const playPauseBtn = document.createElement('button');
                    playPauseBtn.classList.add('play-pause-btn');
                    const playIcon = document.createElement('i');
                    playIcon.classList.add('fas', 'fa-play');
                    playPauseBtn.appendChild(playIcon);
                    controls.appendChild(playPauseBtn);

                    // Progress Bar
                    const progressBarContainer = document.createElement('div');
                    progressBarContainer.classList.add('progress-bar-container');
                    const progressBar = document.createElement('div');
                    progressBar.classList.add('progress-bar');
                    progressBarContainer.appendChild(progressBar);
                    controls.appendChild(progressBarContainer);

                    // Time Display
                    const timeDisplay = document.createElement('span');
                    timeDisplay.classList.add('time-display');
                    timeDisplay.textContent = '00:00 / 00:00';
                    controls.appendChild(timeDisplay);

                    // Volume Control
                    const volumeControlDiv = document.createElement('div');
                    volumeControlDiv.classList.add('volume-control');
                    const volumeBtn = document.createElement('button');
                    const volumeIcon = document.createElement('i');
                    volumeIcon.classList.add('fas', 'fa-volume-up');
                    volumeBtn.appendChild(volumeIcon);
                    const volumeSlider = document.createElement('input');
                    volumeSlider.setAttribute('type', 'range');
                    volumeSlider.setAttribute('min', '0');
                    volumeSlider.setAttribute('max', '1');
                    volumeSlider.setAttribute('step', '0.01');
                    volumeSlider.setAttribute('value', '1'); // Default to max volume
                    volumeControlDiv.appendChild(volumeBtn);
                    volumeControlDiv.appendChild(volumeSlider);
                    controls.appendChild(volumeControlDiv);

                    // Fullscreen Button
                    const fullscreenBtn = document.createElement('button');
                    fullscreenBtn.classList.add('fullscreen-btn');
                    const fullscreenIcon = document.createElement('i');
                    fullscreenIcon.classList.add('fas', 'fa-expand');
                    fullscreenBtn.appendChild(fullscreenIcon);
                    controls.appendChild(fullscreenBtn);

                    videoContainer.appendChild(controls);
                    modalContent.appendChild(videoContainer);

                    currentVideoElement = video; // Guarda la referencia al video local

                    // Event Listeners for Custom Controls
                    playPauseBtn.addEventListener('click', () => {
                        if (video.paused || video.ended) {
                            video.play();
                            playIcon.classList.remove('fa-play');
                            playIcon.classList.add('fa-pause');
                            videoContainer.classList.remove('show-controls');
                        } else {
                            video.pause();
                            playIcon.classList.remove('fa-pause');
                            playIcon.classList.add('fa-play');
                            videoContainer.classList.add('show-controls'); // Show controls when paused
                        }
                    });

                    video.addEventListener('timeupdate', () => {
                        const progress = (video.currentTime / video.duration) * 100;
                        progressBar.style.width = `${progress}%`;
                        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
                    });

                    video.addEventListener('loadedmetadata', () => {
                        timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
                    });

                    progressBarContainer.addEventListener('click', (e) => {
                        const clickX = e.offsetX;
                        const width = progressBarContainer.clientWidth;
                        video.currentTime = (clickX / width) * video.duration;
                    });

                    volumeSlider.addEventListener('input', () => {
                        video.volume = volumeSlider.value;
                        if (video.volume === 0) {
                            volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
                            volumeIcon.classList.add('fa-volume-mute');
                        } else if (video.volume < 0.5) {
                            volumeIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
                            volumeIcon.classList.add('fa-volume-down');
                        } else {
                            volumeIcon.classList.remove('fa-volume-down', 'fa-volume-mute');
                            volumeIcon.classList.add('fa-volume-up');
                        }
                    });

                    volumeBtn.addEventListener('click', () => {
                        if (video.volume > 0) {
                            video.volume = 0;
                            volumeSlider.value = 0;
                            volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
                            volumeIcon.classList.add('fa-volume-mute');
                        } else {
                            video.volume = 1; // Restore full volume
                            volumeSlider.value = 1;
                            volumeIcon.classList.remove('fa-volume-mute', 'fa-volume-down');
                            volumeIcon.classList.add('fa-volume-up');
                        }
                    });

                    fullscreenBtn.addEventListener('click', () => {
                        if (videoContainer.requestFullscreen) {
                            videoContainer.requestFullscreen();
                        } else if (videoContainer.mozRequestFullScreen) { /* Firefox */
                            videoContainer.mozRequestFullScreen();
                        } else if (videoContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                            videoContainer.webkitRequestFullscreen();
                        } else if (videoContainer.msRequestFullscreen) { /* IE/Edge */
                            videoContainer.msRequestFullscreen();
                        }
                    });

                    video.addEventListener('ended', () => {
                        playIcon.classList.remove('fa-pause');
                        playIcon.classList.add('fa-play');
                        progressBar.style.width = '0%'; // Reset progress
                        videoContainer.classList.add('show-controls'); // Show controls when ended
                    });

                    video.addEventListener('pause', () => {
                        playIcon.classList.remove('fa-pause');
                        playIcon.classList.add('fa-play');
                        videoContainer.classList.add('show-controls');
                    });

                    video.addEventListener('play', () => {
                        playIcon.classList.remove('fa-play');
                        playIcon.classList.add('fa-pause');
                        videoContainer.classList.remove('show-controls');
                    });

                    // Initial state for controls (visible on hover)
                    videoContainer.classList.add('show-controls'); // Initially show controls
                }
                modal.style.display = "block";
            });
        });

        closeBtn.addEventListener("click", function() {
            modal.style.display = "none";
            // Detener cualquier video de YouTube o local al cerrar el modal
            if (currentVideoElement) {
                currentVideoElement.pause();
                currentVideoElement.currentTime = 0; // Reinicia el video
                currentVideoElement = null;
            }
            const iframe = modalContent.querySelector("iframe");
            if (iframe) {
                iframe.src = iframe.src; // Esto recarga el iframe y detiene el video de YouTube
            }
        });

        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                if (currentVideoElement) {
                    currentVideoElement.pause();
                    currentVideoElement.currentTime = 0;
                    currentVideoElement = null;
                }
                const iframe = modalContent.querySelector("iframe");
                if (iframe) {
                    iframe.src = iframe.src;
                }
            }
        });

        // Helper function to format time (e.g., 1:30 -> 01:30)
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(remainingSeconds).padStart(2, '0');
            return `${formattedMinutes}:${formattedSeconds}`;
        }


        // --- Read More Functionality for Messages ---
        const readMoreButtons = document.querySelectorAll('.message-card .read-more');

        readMoreButtons.forEach(button => {
            button.addEventListener('click', () => {
                const fullMessage = button.previousElementSibling; // El div .full-message
                if (fullMessage.style.display === 'none' || fullMessage.style.display === '') {
                    fullMessage.style.display = 'block';
                    button.textContent = 'Leer menos';
                } else {
                    fullMessage.style.display = 'none';
                    button.textContent = 'Leer más';
                }
            });
        });

        // --- Lyrics Synchronization Logic ---

        // Función para parsear el formato de letra
        function parseLyrics(lyricsText) {
            const lines = lyricsText.split('\n');
            const parsed = [];
            lines.forEach(line => {
                const timeTags = line.match(/\[\d{2}:\d{2}.\d{3}\]/g);
                const text = line.replace(/\[\d{2}:\d{2}.\d{3}\]/g, '').trim();

                if (timeTags && text) {
                    // Usamos el primer timestamp como el tiempo de inicio de la línea
                    const firstTag = timeTags[0];
                    const [min, sec, ms] = firstTag.replace(/[\[\]]/g, '').split(/[:.]/).map(Number);
                    const timeInSeconds = (min * 60) + sec + (ms / 1000);
                    parsed.push({ time: timeInSeconds, text: text });
                }
            });
            // Ordenar las líneas por tiempo para asegurar la correcta visualización
            parsed.sort((a, b) => a.time - b.time);
            return parsed;
        }

        // Nueva función asíncrona para cargar y procesar archivos .lrc
        async function loadAndSyncLyrics(audioElement) {
            const songCard = audioElement.closest('.song-card');
            const syncedLyricsDiv = songCard.querySelector('.synced-lyrics');
            const songId = syncedLyricsDiv.dataset.songId;
            // Define la ruta a tus archivos .lrc. Asegúrate de que esta ruta sea correcta.
            const lyricsFilePath = `lyrics/lyrics-${songId}.lrc`; 

            try {
                const response = await fetch(lyricsFilePath);
                if (!response.ok) {
                    // Si el archivo LRC no se encuentra, mostramos un mensaje en la interfaz.
                    if (response.status === 404) {
                        syncedLyricsDiv.innerHTML = `<p style="color: grey; text-align: center; font-style: italic;">Letra no disponible aún.</p>`;
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return; // Salimos de la función si no se pudo cargar la letra
                }
                const lyricsText = await response.text();
                const parsedLyrics = parseLyrics(lyricsText);

                // Limpiar cualquier letra previa
                syncedLyricsDiv.innerHTML = '';

                // Crear los elementos de la letra y añadirlos al contenedor
                parsedLyrics.forEach((line, index) => {
                    const p = document.createElement('p');
                    p.textContent = line.text;
                    p.dataset.time = line.time; // Guardar el tiempo en un data attribute
                    p.classList.add('lyrics-line');
                    syncedLyricsDiv.appendChild(p);
                });

                // Añadir el listener para la sincronización
                audioElement.addEventListener('timeupdate', () => {
                    const currentTime = audioElement.currentTime;
                    const lyricsLines = syncedLyricsDiv.querySelectorAll('.lyrics-line');

                    lyricsLines.forEach((line, index) => {
                        const lineTime = parseFloat(line.dataset.time);
                        const nextLineTime = parsedLyrics[index + 1] ? parsedLyrics[index + 1].time : Infinity;

                        // Activa la línea si el tiempo actual está entre el inicio de esta línea y el inicio de la siguiente
                        if (currentTime >= lineTime && currentTime < nextLineTime) {
                            line.classList.add('active-lyrics-line');
                        } else {
                            line.classList.remove('active-lyrics-line');
                        }

                        // Para desplazarse automáticamente y mantener la línea activa visible dentro del recuadro fijo.
                        // La propiedad `scroll-behavior: smooth` en CSS hará la animación.
                        if (line.classList.contains('active-lyrics-line')) {
                            const containerHeight = syncedLyricsDiv.clientHeight;
                            const lineHeight = line.offsetHeight;
                            const lineOffsetTop = line.offsetTop;

                            // Calcular la posición de desplazamiento para intentar centrar la línea activa
                            const scrollPosition = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2);
                            syncedLyricsDiv.scrollTop = scrollPosition;
                        }
                    });
                });

                // Al finalizar la canción, remover la clase activa y volver al inicio
                audioElement.addEventListener('ended', () => {
                    syncedLyricsDiv.querySelectorAll('.lyrics-line').forEach(line => {
                        line.classList.remove('active-lyrics-line');
                    });
                    // Opcional: activar la primera línea al final si se desea un reset visual
                    if (syncedLyricsDiv.firstChild) {
                        syncedLyricsDiv.firstChild.classList.add('active-lyrics-line');
                    }
                    syncedLyricsDiv.scrollTop = 0; // Vuelve al inicio del contenedor
                });

                // Cuando la canción se carga por primera vez o se reinicia
                audioElement.addEventListener('loadedmetadata', () => {
                    syncedLyricsDiv.scrollTop = 0; // Asegura que la letra esté al inicio al cargar
                    syncedLyricsDiv.querySelectorAll('.lyrics-line').forEach((line, index) => {
                        line.classList.remove('active-lyrics-line');
                        if (index === 0) { // Activa la primera línea al cargar o reiniciar
                            line.classList.add('active-lyrics-line');
                        }
                    });
                });

            } catch (error) {
                console.error(`Error loading lyrics for ${songId}:`, error);
                syncedLyricsDiv.innerHTML = `<p style="color: red; text-align: center;">Error al cargar la letra.</p>`;
            }
        }

        const audioPlayers = document.querySelectorAll('.song-audio');
        audioPlayers.forEach(audio => {
            loadAndSyncLyrics(audio); // Llama a la nueva función para cada reproductor de audio
        });
    }
});