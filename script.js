//dom elements
const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");
const songCover = document.getElementById("song-cover");

const sortOptions = document.getElementById("sort-options");

const progressSlider = document.getElementById("progress-slider");
const progressFill = document.getElementById("progress-fill");

const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration-time");

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

const audio = new Audio();

let userData = {
  songs: [...allSongs],
  currentSong: null,
  songCurrentTime: 0,
  repeatMode: "off",
};


// play song
const playSong = (id) => {
  const song = userData?.songs.find(s => s.id === id);
  if (!song) return;

  audio.src = song.src;
  audio.title = song.title;
  songCover.src = song.cover;

  if (!userData.currentSong || userData.currentSong.id !== song.id) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = userData.songCurrentTime;
  }

  userData.currentSong = song;

  playButton.classList.add("playing");

  highlightCurrentSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();

  audio.play();
};


// pause
const pauseSong = () => {
  userData.songCurrentTime = audio.currentTime;

  playButton.classList.remove("playing");
  audio.pause();
};


// next / prev
const playNextSong = () => {
  if (!userData.currentSong) {
    playSong(userData.songs[0].id);
    return;
  }

  const index = getCurrentSongIndex();
  const next = userData.songs[index + 1];

  if (next) playSong(next.id);
};


const playPreviousSong = () => {
  if (!userData.currentSong) return;

  const index = getCurrentSongIndex();
  const prev = userData.songs[index - 1];

  if (prev) playSong(prev.id);
};


// repeat mode 
const handleRepeatMode = () => {
  if (userData.repeatMode === "off") {
    userData.repeatMode = "one";
    repeatButton.classList.add("active");
    repeatButton.classList.add("repeat-one");
    repeatButton.setAttribute("aria-label", "Repeat one");
  } else if (userData.repeatMode === "one") {
    userData.repeatMode = "all";
    repeatButton.setAttribute("aria-label", "Repeat all");
  } else {
    userData.repeatMode = "off";
    repeatButton.classList.remove("active", "repeat-one");
    repeatButton.setAttribute("aria-label", "Repeat off");
  }
};


// delete song
const deleteSong = (id) => {
  if (userData.currentSong && userData.currentSong.id === id) {
    userData.currentSong = null;
    userData.songCurrentTime = 0;

    pauseSong();
    setPlayerDisplay();
  }

  userData.songs = userData.songs.filter(s => s.id !== id);

  renderSongs(userData.songs);
  highlightCurrentSong();
  setPlayButtonAccessibleText();
};


// UI
const setPlayerDisplay = () => {
  const titleEl = document.getElementById("player-song-title");
  const artistEl = document.getElementById("player-song-artist");

  const song = userData.currentSong;

  titleEl.textContent = song ? song.title : "";
  artistEl.textContent = song ? song.artist : "";

  durationEl.textContent = song ? song.duration : "0:00";
  currentTimeEl.textContent = "0:00";
  progressFill.style.width = "0%";
};


// highlight
const highlightCurrentSong = () => {
  const items = document.querySelectorAll(".playlist-song");

  items.forEach(el => el.removeAttribute("aria-current"));

  const current = userData.currentSong;
  if (!current) return;

  const el = document.getElementById(`song-${current.id}`);
  if (el) el.setAttribute("aria-current", "true");
};


// render
const renderSongs = (songs) => {
  let html = "";

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];

    html += `
      <li id="song-${song.id}" class="playlist-song">
        <button class="playlist-song-info" onclick="playSong(${song.id})">
          <span class="playlist-song-title">${song.title}</span>
          <span class="playlist-song-artist">${song.artist}</span>
          <span class="playlist-song-duration">${song.duration}</span>
        </button>

        <button onclick="deleteSong(${song.id})"
          class="playlist-song-delete"
          aria-label="Delete ${song.title}">
          ✕
        </button>
      </li>
    `;
  }

  playlistSongs.innerHTML = html;

  if (songs.length === 0) {
    const btn = document.createElement("button");
    btn.textContent = "Reset Playlist";
    btn.id = "reset";

    btn.onclick = () => {
      userData.songs = [...allSongs];
      renderSongs(sortSongs());
      setPlayButtonAccessibleText();
      btn.remove();
    };

    playlistSongs.appendChild(btn);
  }
};


// accessible text
const setPlayButtonAccessibleText = () => {
  const song = userData.currentSong || userData.songs[0];

  playButton.setAttribute(
    "aria-label",
    song ? `Play ${song.title}` : "Play"
  );
};


// index helper 
const getCurrentSongIndex = () => {
  return userData.songs.indexOf(userData.currentSong);
};


// events
playButton.addEventListener("click", () => {
  if (!userData.currentSong) {
    playSong(userData.songs[0].id);
  } else {
    playSong(userData.currentSong.id);
  }
});

pauseButton.onclick = pauseSong;
nextButton.onclick = playNextSong;
previousButton.onclick = playPreviousSong;
repeatButton.onclick = handleRepeatMode;


// sliders
progressSlider.addEventListener("input", (e) => {
  const t = (e.target.value / 100) * audio.duration;
  progressFill.style.width = e.target.value + "%";
  currentTimeEl.textContent = formatTime(t);
});

progressSlider.addEventListener("change", (e) => {
  audio.currentTime = (e.target.value / 100) * audio.duration;
});

volumeSlider.oninput = (e) => {
  audio.volume = e.target.value / 100;
};


// audio
audio.addEventListener("timeupdate", () => {
  const percent = (audio.currentTime / audio.duration) * 100 || 0;
  progressFill.style.width = percent + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("ended", () => {
  const index = getCurrentSongIndex();
  const next = userData.songs[index + 1];

  if (userData.repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  if (next) {
    playNextSong();
  } else {
    userData.currentSong = null;
    userData.songCurrentTime = 0;

    pauseSong();
    setPlayerDisplay();
    highlightCurrentSong();
    setPlayButtonAccessibleText();
  }
});


// sort 
const sortSongs = () => {
  userData.songs.sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });

  return userData.songs;
};


// init
renderSongs(sortSongs());
setPlayButtonAccessibleText();
audio.volume = volumeSlider.value / 100;