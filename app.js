// app.js

// -----------------------------
// รายการช่อง (ดึงมาจาก default.html เดิม)
// -----------------------------
const channels = [
  {
    id: 1,
    no: '1',
    name: 'DLTV1',
    url: 'https://cdn-live.dltv.ac.th/smil:origin01-dltv-01-adaptive.smil/chunklist_w775643767_b1328000_slth.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 2,
    no: '2',
    name: 'DLTV2',
    url: 'https://cdn-live.dltv.ac.th/smil:origin01-dltv-02-adaptive.smil/chunklist_w1183199600_b1328000_slth.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 3,
    no: '3',
    name: 'ททบ.5 HD',
    url: 'https://639bc5877c5fe.streamlock.net/tv5hdlive/tv5hdlive/chunklist_w732738065.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 4,
    no: '4',
    name: 'Mono29',
    url: 'https://monomax-uiripn.cdn.byteark.com/plain/th/1080p/index.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 5,
    no: '5',
    name: 'Police TV',
    url: 'https://cdn-th-vip.livestreaming.in.th/policetv/policetv/chunklist_w110000995.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 6,
    no: '6',
    name: 'RAMA Channel',
    url: 'https://ramach.ddns.net/live/ramalive/index.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 7,
    no: '7',
    name: 'Thai Parliament TV',
    url: 'https://tv-live.tpchannel.org/live/tv_1080p.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 8,
    no: '8',
    name: 'BBC Two HD',
    url: 'https://streamer.nexyl.uk/69ef899e-8ca9-4537-9f1a-fe8b4216afbb_output_0.m3u8?session=P4nDEufYYEh38atgbxq4wB',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 9,
    no: '9',
    name: 'Fox 11 Los Angeles CA',
    url: 'https://radiovid.foxnews.com/hls/live/661547/RADIOVID/index_1328.m3u8',
    type: 'hls',
    tag: 'HD'
  },
  {
    id: 10,
    no: '10',
    name: '4K HDR MCOT Testing Channel',
    url: 'https://cdn-edge-webrtc-01.iiptvcdn.com/cdn-dash/stream1/manifest.mpd',
    type: 'dash',     // ระวัง: ส่วนใหญ่ browser จะเล่น DASH ไม่ได้ ถ้าไม่มี dash.js
    tag: '4K HDR'
  }
];

// -----------------------------
// Element อ้างอิงจาก index.html
// -----------------------------
const videoEl        = document.getElementById('video');
const channelSelect  = document.getElementById('channelSelect');
const playButton     = document.getElementById('playButton');
const fullscreenBtn  = document.getElementById('fullscreenButton');
const statusEl       = document.getElementById('status');
const installButton  = document.getElementById('installButton');

let deferredPrompt = null;

// -----------------------------
// Helper แสดงสถานะ
// -----------------------------
function setStatus(text, badgeType = 'live') {
  // badgeType: 'live' | 'error' | 'info'
  let label = 'LIVE';
  if (badgeType === 'error') label = 'ERROR';
  if (badgeType === 'info')  label = 'INFO';

  statusEl.innerHTML = `
    สถานะ: ${text}
    <span class="badge ${badgeType === 'error' ? 'error' : ''}">
      ${label}
    </span>
  `;
}

// -----------------------------
// เติมรายการช่องลง select
// -----------------------------
function populateChannels() {
  channelSelect.innerHTML = '';
  channels.forEach((ch, idx) => {
    const opt = document.createElement('option');
    opt.value = idx.toString(); // ใช้ index เป็น value
    const tagText = ch.tag ? ` (${ch.tag})` : '';
    opt.textContent = `CH${ch.no} – ${ch.name}${tagText}`;
    channelSelect.appendChild(opt);
  });
  channelSelect.selectedIndex = 0;
}

// -----------------------------
// คืนค่า channel ปัจจุบัน
// -----------------------------
function getSelectedChannel() {
  let idx = parseInt(channelSelect.value, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= channels.length) {
    idx = 0;
  }
  return channels[idx];
}

// -----------------------------
// โหลด & เล่นช่อง
// -----------------------------
function loadSelectedChannel(autoPlay = true) {
  const ch = getSelectedChannel();

  setStatus(`กำลังโหลด: CH${ch.no} – ${ch.name}…`, 'info');

  // ใช้ src ตรง ๆ (ไม่ใช้ <source>) เพื่อให้เรียบง่ายสุด
  try {
    videoEl.src = ch.url;

    // หมายเหตุ: type:'dash' ใน channel ที่ 10 จะไม่ช่วยอะไร ถ้า browser ไม่รองรับ DASH
    // ถ้าจะเอาให้ชัวร์ ต้องเพิ่ม dash.js ภายหลัง

    if (autoPlay) {
      videoEl.play()
        .then(() => {
          setStatus(`กำลังดู: CH${ch.no} – ${ch.name}`, 'live');
        })
        .catch((err) => {
          console.error('play error', err);
          setStatus('ไม่สามารถเริ่มเล่นได้ – อาจติด autoplay policy หรือ format ไม่รองรับ', 'error');
        });
    }
  } catch (e) {
    console.error('load channel error', e);
    setStatus('เกิดข้อผิดพลาดในการโหลดช่อง', 'error');
  }
}

// -----------------------------
// ปุ่มต่าง ๆ
// -----------------------------
playButton.addEventListener('click', () => {
  // ถ้ายังไม่มี src (ยังไม่เคยเลือกช่อง) ให้โหลดก่อน
  if (!videoEl.src) {
    loadSelectedChannel(true);
    return;
  }

  if (videoEl.paused || videoEl.ended) {
    videoEl.play()
      .then(() => {
        const ch = getSelectedChannel();
        setStatus(`กำลังดู: CH${ch.no} – ${ch.name}`, 'live');
      })
      .catch((err) => {
        console.error(err);
        setStatus('ไม่สามารถเล่นได้ (เช็ค autoplay / format)', 'error');
      });
  } else {
    videoEl.pause();
    setStatus('หยุดชั่วคราว (Paused)', 'info');
  }
});

channelSelect.addEventListener('change', () => {
  // เมื่อเปลี่ยนช่อง ถ้าวิดีโอกำลังเล่นอยู่ → เปลี่ยนช่องแล้วเล่นต่อ
  const wasPlaying = !videoEl.paused && !videoEl.ended;
  loadSelectedChannel(wasPlaying);
});

// ปุ่มเต็มจอ
fullscreenBtn.addEventListener('click', () => {
  const container = document.querySelector('.video-container') || videoEl;
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
    } else if (videoEl.webkitEnterFullscreen) {
      // iOS Safari
      videoEl.webkitEnterFullscreen();
    }
  }
});

// -----------------------------
// PWA install handling
// -----------------------------
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = 'inline-block';
});

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  if (result.outcome === 'accepted') {
    console.log('PWA installed');
  }
  deferredPrompt = null;
  installButton.style.display = 'none';
});

// -----------------------------
// Video events
// -----------------------------
videoEl.addEventListener('waiting', () => {
  const ch = getSelectedChannel();
  setStatus(`Buffering… CH${ch.no} – ${ch.name}`, 'info');
});

videoEl.addEventListener('playing', () => {
  const ch = getSelectedChannel();
  setStatus(`กำลังดู: CH${ch.no} – ${ch.name}`, 'live');
});

videoEl.addEventListener('error', () => {
  console.error('video error', videoEl.error);
  setStatus('เกิดข้อผิดพลาดในการเล่นสัญญาณ (ตรวจ URL / format)', 'error');
});

// -----------------------------
// Initial
// -----------------------------
window.addEventListener('load', () => {
  populateChannels();
  setStatus('เลือกช่องแล้วกด "เล่น / Play"');
});
