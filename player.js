
(function(){
  const playlist = [
  {
    "title": "Bất Công",
    "file": "Bat_cong.m4a",
    "img": "1 (16).jpg",
    "artist": "Sora Nguyễn"
  },
  {
    "title": "Tấm Lòng Cửu Long",
    "file": "Ricky Star - Tấm Lòng Cửu Long (Official Music Video) - YouTube.mp3",
    "img": "1 (24).jpg",
    "artist": "Ricky Star"
  },
  {
    "title": "Nơi Đâu Cũng Thấy Em",
    "file": "[Vietsub+Pinyin] Nơi đâu cũng thấy em - Đội trưởng - 哪里都是你- 队长 - 𝙄 𝙬𝙖𝙣𝙩 𝙮𝙤𝙪 𝙗𝙖𝙘𝙠 - YouTube.mp3",
    "img": "1 (22).jpg",
    "artist": "Đội trưởng"
  },
  {
    "title": "Cảm Ơn Người Đã Thức Cùng Tôi",
    "file": "Cảm Ơn Người Đã Thức Cùng Tôi - YouTube.mp3",
    "img": "1 (21).jpg",
    "artist": "YouTube"
  },
  {
    "title": "Cảm Ơn Đã Ở Bên",
    "file": "CAPTAIN BOY x B RAY - CẢM ƠN ĐÃ Ở BÊN (Official Lyric Video) - YouTube.mp3",
    "img": "1 (32).jpg",
    "artist": "CAPTAIN BOY x B RAY"
  },
 {
  "title": "Hello Em Có Khỏe Không",
  "file": "hello_em_co_khoe_khong .mp3 - Dfoxie37 & Myhoa & Tuann - YouTube.mp3",
  "img": "1 (7).jpg",
  "artist": "Dfoxie37 & Myhoa & Tuann"
},
  {
    "title": "Hoa Hoàn Châu",
    "file": "HOA HOÀN CHÂU - Yamix Hầu Ca ft. Nguyệt Ngân Ma Giáo x Prod.Minh Tường - Video Lyric - YouTube.mp3",
    "img": "1 (30).jpg",
    "artist": "Yamix Hầu Ca"
  },
  {
    "title": "Best of J97",
    "file": "JACK - J97 - Best of J97 - One Click Collection (Dành tặng các bạn Đom Đóm) - YouTube.mp3",
    "img": "1 (29).jpg",
    "artist": "JACK - J97"
  },
  {
    "title": "Một Ngày Nào Đó",
    "file": "MỘT NGÀY NÀO ĐÓ - YouTube.mp3",
    "img": "1 (17).jpg",
    "artist": "YouTube"
  },
  {
    "title": "Bất Phàm",
    "file": "Vietsub -- Bất Phàm - Vương Tranh Lượng (Bản Cải Biên) (OST Phàm Nhân Tu Tiên) - YouTube.mp3",
    "img": "1 (11).jpg",
    "artist": "Vương Tranh Lượng"
  },
  {
    "title": "Hiểu Ta 知我",
    "file": "Vietsub -- Hiểu Ta知我 - Nga Lâu (OST Kiếm Lai) - YouTube.mp3",
    "img": "1 (13).jpg",
    "artist": "Nga Lâu"
  },
  {
    "title": "一路生花",
    "file": "一路生花 - YouTube.mp3",
    "img": "1 (9).jpg",
    "artist": "YouTube"
  },
  {
    "title": "关山酒",
    "file": "等什么君歌曲关山酒动态歌词MV - YouTube.mp3",
    "img": "1 (25).jpg",
    "artist": "等什么君"
  },
  {
    "title": "風夜行",
    "file": "蔣雪兒 - 風夜行 - 紅塵的故事都忘了 - [動態歌詞 Lyric Video] - YouTube.mp3",
    "img": "1 (23).jpg",
    "artist": "蔣雪兒"
  },
  {
    "title": "辞九门回忆",
    "file": "辞九门回忆 - YouTube.mp3",
    "img": "1 (35).jpg",
    "artist": "YouTube"
  }
];
  const root = (location.pathname.includes('/pages/') || location.pathname.includes('\\pages\\')) ? '../' : '';
  let currentSongIndex = 0;
  let shuffle = false;
  let repeat = false;
  const $ = (id) => document.getElementById(id);
  const player = $('soraAudio');
  const box = $('soraPlayer');
  if (!player || !box) return;
  const cover = $('soraCover');
  const title = $('soraTitle');
  const artist = $('soraArtist');
  const playBtn = $('soraPlayPause');
  const prevBtn = $('soraPrev');
  const nextBtn = $('soraNext');
  const progress = $('soraProgress');
  const cur = $('soraCurrent');
  const dur = $('soraDuration');
  const volume = $('soraVolume');
  const list = $('soraList');
  const toggleList = $('soraToggleList');
  const shuffleBtn = $('soraShuffle');
  const repeatBtn = $('soraRepeat');
  const checkBtn = $('soraCheck');
  const status = $('soraStatus');
  const errors = new Set();
  const STORAGE_KEY = 'sora_music_state_v1';
  let pendingSeekTime = 0;


  function fmt(sec){
    if(!isFinite(sec)) return '00:00';
    const m=Math.floor(sec/60), s=Math.floor(sec%60);
    return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }
  function fileUrl(song){ return root + 'music/' + song.file; }
  function imgUrl(song){ return root + 'images/' + song.img; }
  function setStatus(text){ if(status) status.textContent = text || ''; }

  function saveState(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        index: currentSongIndex,
        time: player.currentTime || 0,
        playing: !player.paused,
        volume: Number(player.volume || 0.8),
        shuffle: !!shuffle,
        repeat: !!repeat,
        savedAt: Date.now()
      }));
    } catch(e) {}
  }

  function readState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function applySeekWhenReady(time){
    pendingSeekTime = Number(time || 0);
    if (player.readyState >= 1 && pendingSeekTime > 0 && isFinite(player.duration)) {
      try {
        player.currentTime = Math.min(pendingSeekTime, Math.max(0, player.duration - 0.2));
      } catch(e) {}
      pendingSeekTime = 0;
    }
  }

  function renderList(){
    if(!list) return;
    list.innerHTML='';
    playlist.forEach((song, i) => {
      const item=document.createElement('div');
      item.className='sora-song' + (i===currentSongIndex?' active':'') + (errors.has(i)?' error':'');
      item.innerHTML='<img src="'+imgUrl(song)+'" alt=""><div><strong>'+song.title+'</strong><span>'+song.artist+(errors.has(i)?' • lỗi file/đường dẫn':'')+'</span></div>';
      item.onclick=()=>{ loadSong(i); playSong(); };
      list.appendChild(item);
    });
  }

  function loadSong(i, time = 0){
    currentSongIndex = (i + playlist.length) % playlist.length;
    const song = playlist[currentSongIndex];
    player.src = fileUrl(song);
    cover.src = imgUrl(song);
    title.textContent = song.title;
    artist.textContent = song.artist || 'Sora Nguyễn';
    box.style.setProperty('--player-bg', "url('" + imgUrl(song) + "')");
    cur.textContent = fmt(time || 0); dur.textContent='00:00'; progress.value=0;
    applySeekWhenReady(time);
    saveState();
    setStatus('Đang chọn: ' + song.title);
    renderList();
  }
  async function playSong(){
    try { await player.play(); playBtn.textContent='⏸'; setStatus('Đang phát: ' + playlist[currentSongIndex].title); saveState(); }
    catch(e){ playBtn.textContent='▶'; saveState(); setStatus('Trình duyệt chặn tự phát, bài đã giữ đúng thời gian. Bấm ▶ để phát tiếp.'); }
  }
  function pauseSong(){ player.pause(); playBtn.textContent='▶'; setStatus('Đã tạm dừng'); saveState(); }
  function togglePlay(){ player.paused ? playSong() : pauseSong(); }
  function nextSong(){
    if(shuffle){ loadSong(Math.floor(Math.random()*playlist.length)); }
    else { loadSong(currentSongIndex + 1); }
    playSong();
  }
  function prevSong(){ loadSong(currentSongIndex - 1); playSong(); }

  playBtn.onclick=togglePlay;
  nextBtn.onclick=nextSong;
  prevBtn.onclick=prevSong;
  player.onloadedmetadata=()=>{
    dur.textContent=fmt(player.duration);
    if (pendingSeekTime > 0) {
      try {
        player.currentTime = Math.min(pendingSeekTime, Math.max(0, player.duration - 0.2));
        cur.textContent = fmt(player.currentTime);
        progress.value = player.duration ? (player.currentTime / player.duration) * 100 : 0;
      } catch(e) {}
      pendingSeekTime = 0;
    }
  };
  player.ontimeupdate=()=>{
    cur.textContent=fmt(player.currentTime);
    progress.value=player.duration?(player.currentTime/player.duration)*100:0;
    saveState();
  };
  progress.oninput=()=>{ if(player.duration) { player.currentTime=(progress.value/100)*player.duration; saveState(); } };
  volume.oninput=()=>{ player.volume=Number(volume.value); saveState(); };
  player.onplay=()=>{ playBtn.textContent='⏸'; saveState(); };
  player.onpause=()=>{ playBtn.textContent='▶'; saveState(); };
  player.onended=()=>{ repeat ? (player.currentTime=0, playSong()) : nextSong(); };
  player.onerror=()=>{
    errors.add(currentSongIndex);
    setStatus('Không phát được: ' + playlist[currentSongIndex].file + ' — kiểm tra tên file trong thư mục music.');
    renderList();
    setTimeout(()=>nextSong(), 900);
  };
  toggleList.onclick=()=> box.classList.toggle('open');
  shuffleBtn.onclick=()=>{ shuffle=!shuffle; shuffleBtn.classList.toggle('active', shuffle); setStatus(shuffle?'Đã bật phát ngẫu nhiên':'Đã tắt phát ngẫu nhiên'); saveState(); };
  repeatBtn.onclick=()=>{ repeat=!repeat; repeatBtn.classList.toggle('active', repeat); setStatus(repeat?'Đã bật lặp bài':'Đã tắt lặp bài'); saveState(); };
  checkBtn.onclick=()=>{
    setStatus('Đang kiểm tra nhanh playlist...');
    playlist.forEach((song, i)=>{
      const a=new Audio(fileUrl(song));
      a.preload='metadata';
      a.onloadedmetadata=()=>{ if(i===playlist.length-1) setStatus('Kiểm tra xong. Bài lỗi sẽ bị làm mờ trong danh sách.'); };
      a.onerror=()=>{ errors.add(i); renderList(); };
    });
  };
  const saved = readState();
  if (saved) {
    currentSongIndex = Number.isInteger(saved.index) ? saved.index : 0;
    shuffle = !!saved.shuffle;
    repeat = !!saved.repeat;
    player.volume = typeof saved.volume === 'number' ? saved.volume : Number(volume.value || .8);
    volume.value = player.volume;
    shuffleBtn.classList.toggle('active', shuffle);
    repeatBtn.classList.toggle('active', repeat);
    loadSong(currentSongIndex, Number(saved.time || 0));
    if (saved.playing) {
      setTimeout(() => playSong(), 450);
    }
  } else {
    player.volume = Number(volume.value || .8);
    loadSong(0, 0);
  }
  renderList();
  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);
})();
