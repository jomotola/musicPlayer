//dom elements -> references to html elements
const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");
const songCover = document.getElementById("song-cover");
const sortControls = document.querySelector('.sort-controls');
const sortOptions = document.getElementById('sort-options');
const progressSlider = document.getElementById("progress-slider");
const progressFill = document.getElementById("progress-fill");
const currentTimeDisplay = document.getElementById("current-time");
const durationTimeDisplay = document.getElementById("duration-time");
const volumeSlider = document.getElementById("volume-slider");
const repeatButton = document.getElementById("repeat");

//all songs in the web player
const allSongs = [
    {
        id: 0,
        title: "7/11",
        artist: "Beyoncé",
        duration: "3:34",
        src: "songs/01 - 7_11.mp3",
        cover: "images/selftitled.jpg"
    },
    {
        id: 1,
        title: "Broken Clocks",
        artist: "SZA",
        duration: "3:51",
        src: "songs/SZA - Broken Clocks.mp3",
        cover: "images/ctrl.jpg"
    },
    {
        id: 2,
        title: "Virgo's Groove",
        artist: "Beyoncé",
        duration: "6:09",
        src: "songs/09 Virgo's Groove.mp3",
        cover: "images/renaissance.jpg"
    },
    {
        id: 3,
        title: "Thinking Bout You",
        artist: "Frank Ocean",
        duration: "3:21",
        src: "songs/02 Thinkin Bout You.mp3",
        cover: "images/channelOrange.jpg"
    },
    {
        id: 4,
        title: "PUSH 2 START",
        artist: "Tyla",
        duration: "2:37",
        src: "songs/02. PUSH 2 START.mp3",
        cover: "images/tyla+.jpg"
    },
    {
        id: 5,
        title: "Truth or Dare",
        artist: "Tyla",
        duration: "3:10",
        src: "songs/Tyla-Truth-or-Dare-(FlexyOkay.com).mp3",
        cover: "images/tyla.jpg"
    },
    {
        id: 6,
        title: "Needy",
        artist: "Ariana Grande",
        duration: "2:52",
        src: "songs/02 needy.mp3",
        cover: "images/thankUnext.jpg"
    },
    {
        id: 7,
        title: "Wine Pon You",
        artist: "Doja Cat",
        duration: "3:39",
        src: "songs/04 Wine Pon You (feat. Konshens).mp3",
        cover: "images/amala-deluxe.jpg"
    },
    {
        id: 8,
        title: "Juicy",
        artist: "Doja Cat",
        duration: "3:21",
        src: "songs/14 Juicy.mp3",
        cover: "images/amala-deluxe.jpg"
    },
    {
        id: 9,
        title: "All Night",
        artist: "Beyoncé",
        duration: "5:22",
        src: "songs/All Night.mp4",
        cover: "images/lemonade.jpg",
    },
    {
        id: 10,
        title: "Schoolin' Life",
        artist: "Beyoncé",
        duration: "4:53",
        src: "songs/Schoolin' Life.mp4",
        cover: "images/4album.jpg"
    }
];

// AUDIO SETUP - Audio player and user state
const audio = new Audio();
let userData = {
    songs: [...allSongs],
    currentSong: null,
    songCurrentTime: 0,
    repeatMode: "off",
};

// PLAYBACK FUNCTIONS - Core audio control

// Play a song by ID - loads audio, updates display, and starts playback
const playSong = (id) => {
    const song = userData?.songs.find((song) => song.id === id);
    audio.src = song.src;
    audio.title = song.title;
    songCover.src = song.cover;

    // Reset time if song is different, otherwise resume from saved position
    if (userData?.currentSong === null || userData?.currentSong.id !== song.id) {
        audio.currentTime = 0;
    } else {
        audio.currentTime = userData?.songCurrentTime;
    }
    userData.currentSong = song;
    playButton.classList.add("playing");

    highlightCurrentSong();
    setPlayerDisplay();
    setPlayButtonAccessibleText();
    audio.play();
};

// Pause the current song and save playback position
const pauseSong = () => {
  userData.songCurrentTime = audio.currentTime;
    playButton.classList.remove("playing");
    audio.pause();
};

// Play the next song in the playlist
const playNextSong = () => {
  if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    const currentSongIndex = getCurrentSongIndex();
    const nextSong = userData?.songs[currentSongIndex + 1];
        playSong(nextSong.id);
    }
};

// Play the previous song in the playlist
const playPreviousSong = () => {
   if (userData?.currentSong === null) return;
   else {
    const currentSongIndex = getCurrentSongIndex();
    const previousSong = userData?.songs[currentSongIndex - 1];
        playSong(previousSong.id);
    }
};

// UTILITY FUNCTIONS - Helper functions

// Convert seconds to MM:SS time format
const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
// Update the progress bar and time display during playback
const updateProgressDisplay = () => {
    const progressPercent = (audio.currentTime / audio.duration) * 100 || 0;
    progressFill.style.width = `${progressPercent}%`;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
};
// Toggle repeat mode between off and repeat one song
const handleRepeatMode = () => {
    if (userData.repeatMode === "off") {
        userData.repeatMode = "one";
        repeatButton.classList.add("active");
        repeatButton.classList.add("repeat-one");
        repeatButton.setAttribute("aria-label", "Repeat one");
    } else {
        userData.repeatMode = "off";
        repeatButton.classList.remove("active", "repeat-one");
        repeatButton.setAttribute("aria-label", "Repeat off");
    }
};

// old shuffle function - replaced with sort menu shuffle option
// const shuffle = () => {
//   userData?.songs.sort(() => Math.random() - 0.5);
//   userData.currentSong = null;
//   userData.songCurrentTime = 0;
//   renderSongs(userData?.songs);
//   pauseSong();
//   setPlayerDisplay();
//   setPlayButtonAccessibleText();
// };

// PLAYLIST MANAGEMENT - Handle song list

// Delete a song from the playlist by ID
const deleteSong = (id) => {
  // Stop playing if deleted song is currently playing
  if (userData?.currentSong?.id === id) {
    userData.currentSong = null;
    userData.songCurrentTime = 0;
    pauseSong();
    setPlayerDisplay();
  }

  // Remove song from array and refresh display
    userData.songs = userData?.songs.filter((song) => song.id !== id);
    renderSongs(userData?.songs);
    highlightCurrentSong();
    setPlayButtonAccessibleText();

};

// UI UPDATE FUNCTIONS - Update display elements

// Update the main player display with current song info
const setPlayerDisplay = () => {
    const playingSong = document.getElementById("player-song-title");
    const songArtist = document.getElementById("player-song-artist");
    const currentTitle = userData?.currentSong?.title;
    const currentArtist = userData?.currentSong?.artist;
    const currentDuration = userData?.currentSong?.duration;

    playingSong.textContent = currentTitle ? currentTitle : "";
    songArtist.textContent = currentArtist ? currentArtist : "";
    durationTimeDisplay.textContent = currentDuration ? currentDuration : "0:00";
    currentTimeDisplay.textContent = "0:00";
    progressFill.style.width = "0%";
};
// Highlight the currently playing song in the playlist
const highlightCurrentSong = () => {
    const playlistSongElements = document.querySelectorAll(".playlist-song");
    const songToHighlight = document.getElementById(
        `song-${userData?.currentSong?.id}`
    );

    playlistSongElements.forEach((songEl) => {
        songEl.removeAttribute("aria-current");
    });

    if (songToHighlight) songToHighlight.setAttribute("aria-current", "true");
};

const renderSongs = (array) => {
    const songsHTML = array
        .map((song) => {
            return `
      <li id="song-${song.id}" class="playlist-song">
      <button class="playlist-song-info" onclick="playSong(${song.id})">
          <span class="playlist-song-title">${song.title}</span>
          <span class="playlist-song-artist">${song.artist}</span>
          <span class="playlist-song-duration">${song.duration}</span>
      </button>
      <button onclick="deleteSong(${song.id})" class="playlist-song-delete" aria-label="Delete ${song.title}">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#4d4d62"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.32587 5.18571C5.7107 4.90301 6.28333 4.94814 6.60485 5.28651L8 6.75478L9.39515 5.28651C9.71667 4.94814 10.2893 4.90301 10.6741 5.18571C11.059 5.4684 11.1103 5.97188 10.7888 6.31026L9.1832 7.99999L10.7888 9.68974C11.1103 10.0281 11.059 10.5316 10.6741 10.8143C10.2893 11.097 9.71667 11.0519 9.39515 10.7135L8 9.24521L6.60485 10.7135C6.28333 11.0519 5.7107 11.097 5.32587 10.8143C4.94102 10.5316 4.88969 10.0281 5.21121 9.68974L6.8168 7.99999L5.21122 6.31026C4.8897 5.97188 4.94102 5.4684 5.32587 5.18571Z" fill="white"/></svg>
        </button>
      </li>
      `;
        })
        .join("");

    playlistSongs.innerHTML = songsHTML;
  // Show reset button if all songs have been deleted    
    if (userData?.songs.length === 0) {
        const resetButton = document.createElement("button");
        const resetText = document.createTextNode("Reset Playlist");

        resetButton.id = "reset";
        resetButton.ariaLabel = "Reset playlist";
        resetButton.appendChild(resetText);
        playlistSongs.appendChild(resetButton);

        resetButton.addEventListener("click", () => {
            userData.songs = [...allSongs];

            renderSongs(sortSongs());
            setPlayButtonAccessibleText();
            resetButton.remove();
        });

    };

};

// Update play button aria-label for accessibility
const setPlayButtonAccessibleText = () => {
  const song = userData?.currentSong || userData?.songs[0];
    playButton.setAttribute(
        "aria-label",
        song?.title ? `Play ${song.title}` : "Play"
    );
};

// Get the index of the currently playing song
const getCurrentSongIndex = () => userData?.songs.indexOf(userData?.currentSong);

// EVENT LISTENERS - Button and control interactions

// Play button - start playing current or first song
playButton.addEventListener("click", () => {
    if (userData?.currentSong === null) {
        playSong(userData?.songs[0].id);
    } else {
        playSong(userData?.currentSong.id);
    }
});

// Pause button
pauseButton.addEventListener("click",  pauseSong);

// Next button - skip to next song
nextButton.addEventListener("click", playNextSong);

// Previous button - go to previous song
previousButton.addEventListener("click", playPreviousSong);

// Repeat button - toggle repeat mode
repeatButton.addEventListener("click", handleRepeatMode);

// Progress slider - seek to position when released
progressSlider.addEventListener("change", (e) => {
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
    updateProgressDisplay();
});

// Progress slider input - update display while dragging
progressSlider.addEventListener("input", (e) => {
  const newTime = (e.target.value / 100) * audio.duration;
  progressFill.style.width = `${e.target.value}%`;
  currentTimeDisplay.textContent = formatTime(newTime);
});

// Volume slider - adjust audio volume
volumeSlider.addEventListener("change", (e) => {
  audio.volume = e.target.value / 100;
});

// AUDIO EVENTS - Handle audio element events

// Update progress bar during playback
audio.addEventListener("timeupdate", updateProgressDisplay);

// Set duration display when audio loads
audio.addEventListener("loadedmetadata", () => {
    progressSlider.max = "100";
    durationTimeDisplay.textContent = formatTime(audio.duration);
});

// Shuffle button - show sorting menu
shuffleButton.addEventListener("click", () => {
    sortControls.style.display = "block";
});

// Sort options dropdown - sort playlist based on selection
sortOptions.addEventListener("change", () => {
    const selectedOption = sortOptions.value;

    // Handle different sort options
    switch(selectedOption) {
        // Sort by song title alphabetically
        case "title":
            userData?.songs.sort((a, b) => a.title.localeCompare(b.title));
            userData.currentSong = null;
            userData.songCurrentTime = 0;

            renderSongs(userData?.songs);
            pauseSong();
            setPlayerDisplay();
            setPlayButtonAccessibleText();
            break;

        case "artist":
            userData?.songs.sort((a, b) => a.artist.localeCompare(b.artist));
            userData.currentSong = null;
            userData.songCurrentTime = 0;

            renderSongs(userData?.songs);
            pauseSong();
            setPlayerDisplay();
            setPlayButtonAccessibleText();
            break;

        case "duration":
            userData?.songs.sort((a, b) => a.duration.localeCompare(b.duration));
            userData.currentSong = null;
            userData.songCurrentTime = 0;

            renderSongs(userData?.songs);
            pauseSong();
            setPlayerDisplay();
            setPlayButtonAccessibleText();
            break;

        case "random":
            userData?.songs.sort(() => Math.random() - 0.5);
            userData.currentSong = null;
            userData.songCurrentTime = 0;

            renderSongs(userData?.songs);
            pauseSong();
            setPlayerDisplay();
            setPlayButtonAccessibleText();
            break;

    }
})

// Song ended event - handle repeat modes and play next song
audio.addEventListener("ended", () => {
    const currentSongIndex = getCurrentSongIndex();
    const nextSongExists = userData?.songs[currentSongIndex + 1] !== undefined;

    if (userData.repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
    } else if (userData.repeatMode === "all") {
        if (nextSongExists) {
            playNextSong();
        } else {
            playSong(userData?.songs[0].id);
        }
    } else {
        if (nextSongExists) {
            playNextSong();
        } else {
            userData.currentSong = null;
            userData.songCurrentTime = 0;
            pauseSong();
            setPlayerDisplay();
            highlightCurrentSong();
            setPlayButtonAccessibleText();
        }
    }
});
// Sort songs alphabetically by title (default sort)
const sortSongs = () => {
    userData?.songs.sort((a, b) => {
        if (a.title < b.title) {
            return -1;
        }

        if (a.title > b.title) {
            return 1;
        }

        return 0;
    });

    return userData?.songs;
};

// ============================================
// INITIALIZATION - Load songs and set defaults
// ============================================
renderSongs(sortSongs());
setPlayButtonAccessibleText();
audio.volume = volumeSlider.value / 100;