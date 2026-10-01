/* ============================================================
   FIREBASE SDK
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, set, get, onValue, push, remove,
  query, orderByChild, limitToLast
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5kdNvS7aQIuXoa7QlsmnYmbza2ydmYV0",
  authDomain: "elips-nova.firebaseapp.com",
  databaseURL: "https://elips-nova-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "elips-nova",
  storageBucket: "elips-nova.firebasestorage.app",
  messagingSenderId: "1086671029659",
  appId: "1:1086671029659:web:76a40794450597eacc0d3e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* ============================================================
   KONFIGURASI
   ============================================================ */
const LEGENDARY_EVENT = {
  endDate: new Date('2026-10-02T22:00:00+07:00').getTime(),
  openHour: 20, closeHour: 22,
  hardEndDate: new Date('2026-10-02T22:00:00+07:00').getTime()
};
const TOKEN_PRICE_NORMAL = { money: 5000, diamond: 40 };
const BOOST_CONFIG = { price: 800, duration: 800000, cooldown: 240000, clickPower: 100 };
const HELPING_HAND_CONFIG = {
  priceToken: 5, priceDiamond: 25,
  duration: 2*60*1000,
  clickPowerMin: 50, clickPowerMax: 80
};

const RARITY_INFO = {
  COMMON:    { label: 'COMMON',    badgeClass: 'badge-common' },
  RARE:      { label: 'RARE',      badgeClass: 'badge-rare' },
  EXCLUSIVE: { label: 'EXCLUSIVE', badgeClass: 'badge-exclusive' },
  ETERNAL:   { label: 'ETERNAL',   badgeClass: 'badge-eternal' },
  MYTHIC:    { label: 'MYTHIC',    badgeClass: 'badge-mythic' }
};

const SKIN_DB = {
  crimson_spark: { id:'crimson_spark', name:'Crimson Spark', price:5000, currency:'money', rarity:'COMMON', category:'Starter', cls:'skin-crimson_spark', glossy:false, available:true, icon:'🔴' },
  azure_wave: { id:'azure_wave', name:'Azure Wave', price:7500, currency:'money', rarity:'COMMON', category:'Starter', cls:'skin-azure_wave', glossy:false, available:true, icon:'🔵' },
  emerald_leaf: { id:'emerald_leaf', name:'Emerald Leaf', price:10000, currency:'money', rarity:'COMMON', category:'Starter', cls:'skin-emerald_leaf', glossy:false, available:true, icon:'🟢' },
  midnight_pulse: { id:'midnight_pulse', name:'Midnight Pulse', price:50000, currency:'money', rarity:'RARE', category:'Rare Collection', cls:'skin-midnight_pulse', glossy:false, available:true, icon:'🌌' },
  blaze_runner: { id:'blaze_runner', name:'Blaze Runner', price:75000, currency:'money', rarity:'RARE', category:'Rare Collection', cls:'skin-blaze_runner', glossy:false, available:true, icon:'🔥' },
  frost_whisper: { id:'frost_whisper', name:'Frost Whisper', price:100000, currency:'money', rarity:'RARE', category:'Rare Collection', cls:'skin-frost_whisper', glossy:false, available:true, icon:'❄️' },
  golden_aura: { id:'golden_aura', name:'Golden Aura', price:150000, currency:'money', rarity:'EXCLUSIVE', category:'Exclusive Collection', cls:'skin-golden_aura', glossy:true, available:true, icon:'👑' },
  dragon_scale: { id:'dragon_scale', name:'Dragon Scale', price:225000, currency:'money', rarity:'EXCLUSIVE', category:'Exclusive Collection', cls:'skin-dragon_scale', glossy:true, available:true, icon:'🐉' },
  ocean_depth: { id:'ocean_depth', name:'Ocean Depth', price:300000, currency:'money', rarity:'EXCLUSIVE', category:'Exclusive Collection', cls:'skin-ocean_depth', glossy:true, available:true, icon:'🌊' },
  storm_bringer: { id:'storm_bringer', name:'Storm Bringer', price:400000, currency:'money', rarity:'ETERNAL', category:'Eternal Collection', cls:'skin-storm_bringer', glossy:true, available:true, icon:'⚡' },
  mystic_crystal: { id:'mystic_crystal', name:'Mystic Crystal', price:450000, currency:'money', rarity:'ETERNAL', category:'Eternal Collection', cls:'skin-mystic_crystal', glossy:true, available:true, icon:'🔮' },
  star_forge: { id:'star_forge', name:'Star Forge', price:500000, currency:'money', rarity:'ETERNAL', category:'Eternal Collection', cls:'skin-star_forge', glossy:true, available:true, icon:'🌟' },
  nova_genesis: { id:'nova_genesis', name:'Nova Genesis', price:600000, currency:'money', rarity:'MYTHIC', category:'Mythic Collection', cls:'skin-nova_genesis', glossy:false, available:true, icon:'🌌' },
  eternal_dragon: { id:'eternal_dragon', name:'Eternal Dragon', price:600000, currency:'money', rarity:'MYTHIC', category:'Mythic Collection', cls:'skin-eternal_dragon', glossy:false, available:true, icon:'🐲' },
  celestial_king: { id:'celestial_king', name:'Celestial King', price:600000, currency:'money', rarity:'MYTHIC', category:'Mythic Collection', cls:'skin-celestial_king', glossy:false, available:true, icon:'👑' },
  plasma: { id:'plasma', name:'Plasma Enduro', price:50, currency:'token', rarity:'RARE', category:'Skin Limited', cls:'skin-plasma', glossy:true, available:false, ended:true, icon:'🔵' },
  danish: { id:'danish', name:'Danish Cube', price:150, currency:'token', rarity:'EXCLUSIVE', category:'Skin Limited', cls:'skin-danish', glossy:true, available:false, ended:true, icon:'🟡' },
  emberheart: { id:'emberheart', name:'Emberheart', price:600, currency:'token', rarity:'ETERNAL', category:'Skin Limited', cls:'skin-emberheart', glossy:true, available:false, ended:true, icon:'⚪' }
};

/* ================= STATE ================= */
let currentUid = null;
let isOnline = false;

const DEFAULT_STATE = {
  money: 0, token: 0, diamond: 0, exp: 0, level: 1,
  inventory: [],
  boostEnd: 0, boostCooldown: 0,
  mysteryCooldown: 0, mysteryOpened: false,
  usedCodes: [],
  totalDiamondFromLevel: 0,
  autoEnd: 0, lastAutoTick: 0,
  devMode: false, devUsed: false,
  clanId: null,
  playerName: 'Pemain',
  playerBio: '',
  friends: {}, friendRequests: {}, sentRequests: {},
  lastOnline: 0, lastSeen: Date.now()
};

let S = { ...DEFAULT_STATE };
let autoTickInterval = null;
let chatUnsubscribe = null;
let chatHeartbeatInterval = null;
let currentClanTab = 'info';
let currentClanData = null;
let savedSearchResult = null;
let currentFriendTab = 'list';
let currentPrivateChatUid = null;
let privateChatUnsubscribe = null;
let privateChatTimerInterval = null;
let onlineUsersCache = {};
let currentInvTab = 'skin';
let invSearchQuery = '';

/* ================= UTIL ================= */
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(()=>t.classList.remove('show'), 2200);
}
function fmt(n){ return n.toLocaleString('id-ID'); }
function expNeeded(level){
  if (level >= 100) return Infinity;
  let need = 100;
  for (let i=2; i<=level; i++) need *= 3;
  return need;
}
function formatDuration(ms){
  if (ms < 0) ms = 0;
  const s = Math.ceil(ms/1000);
  const m = Math.floor(s/60);
  return `${m}m ${(s%60).toString().padStart(2,'0')}s`;
}
function formatChatTime(ts){
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  } catch(e){ return ''; }
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function updateOnlineTag(){
  const tag = document.getElementById('onlineTag');
  if (isOnline){
    tag.className = 'online-tag on';
    tag.textContent = '🟢 Online — Cloud Sync Aktif';
  } else {
    tag.className = 'online-tag off';
    tag.textContent = '🔴 Offline Mode — Data Lokal';
  }
}
function timeAgo(ts){
  if (!ts) return 'tidak diketahui';
  const diff = Date.now() - ts;
  if (diff < 0) return 'baru saja';
  const sec = Math.floor(diff / 1000);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);
  const mo = Math.floor(d / 30);
  if (sec < 60) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  if (h < 24) return `${h} jam lalu`;
  if (d < 7) return `${d} hari lalu`;
  if (w < 4) return `${w} minggu lalu`;
  if (mo < 12) return `${mo} bulan lalu`;
  return 'lama sekali';
}

const ONLINE_THRESHOLD = 60000;
function isUserOnline(uid, lastSeenTs){
  if (!lastSeenTs) return false;
  return (Date.now() - lastSeenTs) < ONLINE_THRESHOLD;
}

function getExpPerClick(){
  const level = S.level || 1;
  return 2 * Math.pow(2, level - 1);
}

function rollLevelDiamond(){
  const r = Math.random() * 100;
  if (r < 70) return 10 + Math.floor(Math.random() * 31);
  else if (r < 91) return 50 + Math.floor(Math.random() * 11);
  else if (r < 99) return 90 + Math.floor(Math.random() * 11);
  else return 130 + Math.floor(Math.random() * 21);
}

function showDiamondPop(amount){
  const el = document.createElement('div');
  el.className = 'diamond-pop';
  el.textContent = `+💎 ${amount}`;
  el.style.cssText = 'position:fixed;font-size:1.5rem;font-weight:bold;pointer-events:none;color:#7fd4ff;text-shadow:0 0 15px #00e0ff,0 0 30px #a06bff;left:50%;top:45%;z-index:1000;';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1500);
}

function getEventStatus(){
  const now = Date.now();
  if (now >= LEGENDARY_EVENT.hardEndDate) return 'ended';
  const wib = new Date(now + (7*60 + new Date().getTimezoneOffset())*60000);
  const h = wib.getHours();
  if (h >= LEGENDARY_EVENT.openHour && h < LEGENDARY_EVENT.closeHour) return 'open';
  return 'closed';
}

/* ============================================================
   STORAGE LAYER
   ============================================================ */
const Storage = {
  async load() {
    if (currentUid && isOnline){
      try {
        const snap = await get(ref(db, `users/${currentUid}`));
        const data = snap.val();
        if (data){
          localStorage.setItem('enova_cache', JSON.stringify(data));
          return data;
        }
      } catch(e){}
    }
    try {
      const local = localStorage.getItem('enova_cache');
      return local ? JSON.parse(local) : null;
    } catch(e){ return null; }
  },
  async save(data) {
    data.lastSeen = Date.now();
    localStorage.setItem('enova_cache', JSON.stringify(data));
    if (currentUid && isOnline){
      try { await set(ref(db, `users/${currentUid}`), data); } catch(e){}
    }
  },
  async wipe() {
    localStorage.removeItem('enova_cache');
    if (currentUid && isOnline){
      try { await remove(ref(db, `users/${currentUid}`)); } catch(e){}
    }
  },
  getUserId(){ return currentUid || 'local_player'; }
};

/* ============================================================
   CLAN STORAGE
   ============================================================ */
const ClanStorage = {
  async getClan(clanId) {
    try {
      const snap = await get(ref(db, `clans/${clanId}`));
      const data = snap.val();
      if (data) return data;
    } catch(e){}
    try {
      const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
      return all[clanId] || null;
    } catch(e){ return null; }
  },
  async createClan(clanId, data) {
    try {
      await set(ref(db, `clans/${clanId}`), data);
      await set(ref(db, `clanNames/${data.name.toLowerCase()}`), clanId);
      return true;
    } catch(e){}
    const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
    all[clanId] = data;
    all['_names'] = all['_names'] || {};
    all['_names'][data.name.toLowerCase()] = clanId;
    localStorage.setItem('enova_clans', JSON.stringify(all));
    return true;
  },
  async findClanByName(name) {
    const key = name.toLowerCase();
    try {
      const snap = await get(ref(db, `clanNames/${key}`));
      const data = snap.val();
      if (data) return data;
    } catch(e){}
    const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
    return (all['_names'] && all['_names'][key]) || null;
  },
  async updateClan(clanId, path, data) {
    try { await set(ref(db, `clans/${clanId}/${path}`), data); return true; } catch(e){}
    const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
    if (!all[clanId]) return false;
    const parts = path.split('/');
    let obj = all[clanId];
    for (let i=0; i<parts.length-1; i++){
      obj[parts[i]] = obj[parts[i]] || {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length-1]] = data;
    localStorage.setItem('enova_clans', JSON.stringify(all));
    return true;
  },
  async deleteInClan(clanId, path) {
    try { await remove(ref(db, `clans/${clanId}/${path}`)); return true; } catch(e){}
    const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
    if (!all[clanId]) return false;
    const parts = path.split('/');
    let obj = all[clanId];
    for (let i=0; i<parts.length-1; i++){
      if (!obj[parts[i]]) return false;
      obj = obj[parts[i]];
    }
    delete obj[parts[parts.length-1]];
    localStorage.setItem('enova_clans', JSON.stringify(all));
    return true;
  },
  async deleteClan(clanId, name) {
    try {
      await remove(ref(db, `clans/${clanId}`));
      await remove(ref(db, `clanNames/${name.toLowerCase()}`));
      return true;
    } catch(e){}
    const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
    delete all[clanId];
    if (all['_names']) delete all['_names'][name.toLowerCase()];
    localStorage.setItem('enova_clans', JSON.stringify(all));
    return true;
  },
  async sendChat(clanId, msg) {
    let success = false;
    try {
      const chatRef = ref(db, `clans/${clanId}/chat`);
      const newRef = push(chatRef);
      await set(newRef, msg);
      success = true;
    } catch(e){}
    try {
      const all = JSON.parse(localStorage.getItem('enova_clans') || '{}');
      all[clanId] = all[clanId] || {};
      all[clanId].chat = all[clanId].chat || {};
      all[clanId].chat['m_'+Date.now()+'_'+Math.random().toString(36).slice(2,5)] = msg;
      localStorage.setItem('enova_clans', JSON.stringify(all));
    } catch(e){}
    return success;
  },
  listenChat(clanId, callback) {
    const chatQuery = query(
      ref(db, `clans/${clanId}/chat`),
      orderByChild('ts'),
      limitToLast(200)
    );
    return onValue(chatQuery, snap => callback(snap.val() || {}));
  }
};

/* ============================================================
   FRIEND STORAGE
   ============================================================ */
const FriendStorage = {
  async sendRequest(toUid, fromName){
    const fromUid = Storage.getUserId();
    if (!fromUid || fromUid === 'local_player') return false;
    if (toUid === fromUid) return false;
    if (S.friends && S.friends[toUid]) return false;
    try {
      await set(ref(db, `users/${toUid}/friendRequests/${fromUid}`), {
        name: fromName, sentAt: Date.now()
      });
      await set(ref(db, `users/${fromUid}/sentRequests/${toUid}`), { sentAt: Date.now() });
      return true;
    } catch(e){ return false; }
  },
  async acceptRequest(fromUid){
    const myUid = Storage.getUserId();
    try {
      const reqSnap = await get(ref(db, `users/${myUid}/friendRequests/${fromUid}`));
      const req = reqSnap.val();
      if (!req) return false;
      const myName = S.playerName || 'Pemain';
      await set(ref(db, `users/${myUid}/friends/${fromUid}`), {
        name: req.name || 'Pemain', addedAt: Date.now()
      });
      await set(ref(db, `users/${fromUid}/friends/${myUid}`), {
        name: myName, addedAt: Date.now()
      });
      await remove(ref(db, `users/${myUid}/friendRequests/${fromUid}`));
      await remove(ref(db, `users/${fromUid}/sentRequests/${myUid}`));
      S.friends = S.friends || {};
      S.friends[fromUid] = { name: req.name || 'Pemain', addedAt: Date.now() };
      if (S.friendRequests) delete S.friendRequests[fromUid];
      return true;
    } catch(e){ return false; }
  },
  async rejectRequest(fromUid){
    const myUid = Storage.getUserId();
    try {
      await remove(ref(db, `users/${myUid}/friendRequests/${fromUid}`));
      await remove(ref(db, `users/${fromUid}/sentRequests/${myUid}`));
      if (S.friendRequests) delete S.friendRequests[fromUid];
      return true;
    } catch(e){ return false; }
  },
  async removeFriend(friendUid){
    const myUid = Storage.getUserId();
    try {
      await remove(ref(db, `users/${myUid}/friends/${friendUid}`));
      await remove(ref(db, `users/${friendUid}/friends/${myUid}`));
      if (S.friends) delete S.friends[friendUid];
      return true;
    } catch(e){ return false; }
  },
  async searchUserByName(name){
    const results = [];
    try {
      const snap = await get(ref(db, 'users'));
      const allUsers = snap.val();
      if (!allUsers) return results;
      const searchLower = name.toLowerCase();
      const myUid = Storage.getUserId();
      for (const [uid, data] of Object.entries(allUsers)){
        if (uid === myUid) continue;
        const playerName = (data.playerName || 'Pemain').toLowerCase();
        if (playerName.includes(searchLower)){
          let clanName = '-', clanTag = '-';
          if (data.clanId){
            try {
              const clanSnap = await get(ref(db, `clans/${data.clanId}`));
              const clan = clanSnap.val();
              if (clan){ clanName = clan.name || '-'; clanTag = clan.tag || '-'; }
            } catch(e){}
          }
          let ts = data.lastOnline || null;
          if (data.lastSeen && (!ts || data.lastSeen > ts)) ts = data.lastSeen;
          results.push({
            uid, name: data.playerName || 'Pemain', level: data.level || 1,
            clanName, clanTag, lastOnline: ts || 0
          });
        }
      }
    } catch(e){}
    return results;
  },
  async sendPrivateMsg(toUid, text){
    const myUid = Storage.getUserId();
    const roomId = [myUid, toUid].sort().join('_');
    try {
      const newRef = push(ref(db, `privateChats/${roomId}/messages`));
      await set(newRef, { from: myUid, to: toUid, text: text.slice(0,200), ts: Date.now() });
      return true;
    } catch(e){ return false; }
  },
  listenPrivateChat(otherUid, callback){
    const myUid = Storage.getUserId();
    const roomId = [myUid, otherUid].sort().join('_');
    const q = query(ref(db, `privateChats/${roomId}/messages`), orderByChild('ts'), limitToLast(100));
    return onValue(q, snap => callback(snap.val() || {}));
  }
};

/* ============================================================
   ONLINE HEARTBEAT
   ============================================================ */
function startOnlineHeartbeat(){
  const uid = Storage.getUserId();
  const updateLastSeen = async () => {
    if (!uid || uid === 'local_player') return;
    try {
      const now = Date.now();
      await set(ref(db, `users/${uid}/lastOnline`), now);
      await set(ref(db, `users/${uid}/lastSeen`), now);
    } catch(e){}
  };
  updateLastSeen();
  setInterval(updateLastSeen, 30000);
}

async function fetchUserLastSeen(uid){
  if (onlineUsersCache[uid] && (Date.now() - onlineUsersCache[uid].fetchedAt) < 5000){
    return onlineUsersCache[uid].ts;
  }
  try {
    const snap = await get(ref(db, `users/${uid}`));
    const data = snap.val();
    if (!data){
      onlineUsersCache[uid] = { ts: null, fetchedAt: Date.now() };
      return null;
    }
    let ts = data.lastOnline || null;
    if (data.lastSeen && (!ts || data.lastSeen > ts)){
      ts = data.lastSeen;
    }
    onlineUsersCache[uid] = { ts, fetchedAt: Date.now() };
    return ts;
  } catch(e){
    return null;
  }
}

async function fetchUserProfile(uid){
  try {
    const snap = await get(ref(db, `users/${uid}`));
    const data = snap.val();
    if (!data) return null;
    let clanName = '-', clanTag = '-';
    if (data.clanId){
      try {
        const clanSnap = await get(ref(db, `clans/${data.clanId}`));
        const clan = clanSnap.val();
        if (clan){ clanName = clan.name || '-'; clanTag = clan.tag || '-'; }
      } catch(e){}
    }
    let ts = data.lastOnline || null;
    if (data.lastSeen && (!ts || data.lastSeen > ts)) ts = data.lastSeen;
    return {
      uid, name: data.playerName || 'Pemain', level: data.level || 1,
      bio: data.playerBio || '',
      clanName, clanTag, lastOnline: ts || 0
    };
  } catch(e){ return null; }
}

/* ============================================================
   DEV KEY
   ============================================================ */
const _DEV_KEY_HASH = (() => {
  const s = "BCE093702";
  let h = 0;
  for (let i=0; i<s.length; i++){ h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h;
})();
function validateDevKey(input){
  const s = (input || '').trim().toUpperCase();
  let h = 0;
  for (let i=0; i<s.length; i++){ h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return h === _DEV_KEY_HASH && s.length === 9;
}

/* ============================================================
   PROFILE / EDIT NAME / EDIT BIO
   ============================================================ */
window.showEditNameModal = function(){
  document.getElementById('editNameModal').classList.add('show');
  document.getElementById('editNameInput').value = S.playerName || 'Pemain';
  setTimeout(()=>document.getElementById('editNameInput').focus(), 200);
};
window.closeEditNameModal = function(){
  document.getElementById('editNameModal').classList.remove('show');
};
window.savePlayerName = async function(){
  const name = (document.getElementById('editNameInput').value || '').trim();
  if (name.length < 3) return toast('❌ Nama minimal 3 karakter');
  if (name.length > 16) return toast('❌ Nama maksimal 16 karakter');
  if (!/^[A-Za-z0-9_]+$/.test(name)) return toast('❌ Hanya huruf, angka, underscore');
  S.playerName = name;
  await Storage.save(S);
  if (S.clanId){
    const uid = Storage.getUserId();
    try {
      const clan = await ClanStorage.getClan(S.clanId);
      if (clan && clan.members && clan.members[uid]){
        await ClanStorage.updateClan(S.clanId, `members/${uid}`, {
          ...clan.members[uid], name: name
        });
      }
    } catch(e){}
  }
  closeEditNameModal();
  toast(`✅ Nama diubah jadi "${name}"`);
  render();
};
document.getElementById('editNameModal').addEventListener('click', (e)=>{
  if (e.target.id === 'editNameModal') closeEditNameModal();
});

window.showEditBioModal = function(){
  document.getElementById('editBioModal').classList.add('show');
  document.getElementById('editBioInput').value = S.playerBio || '';
  document.getElementById('bioCounter').textContent = (S.playerBio || '').length;
  setTimeout(()=>document.getElementById('editBioInput').focus(), 200);
};
window.closeEditBioModal = function(){
  document.getElementById('editBioModal').classList.remove('show');
};
window.savePlayerBio = async function(){
  const bio = (document.getElementById('editBioInput').value || '').trim();
  if (bio.length > 200) return toast('❌ Bio maksimal 200 karakter');
  const emojiRegex = /[\u{1F000}-\u{1FFFF}]/u;
  if (emojiRegex.test(bio)) return toast('❌ Bio tidak boleh pakai emoji');

  S.playerBio = bio;
  await Storage.save(S);
  closeEditBioModal();
  toast('✅ Bio disimpan!');
  render();
};
document.getElementById('editBioModal').addEventListener('click', (e)=>{
  if (e.target.id === 'editBioModal') closeEditBioModal();
});
document.addEventListener('input', (e)=>{
  if (e.target.id === 'editBioInput'){
    const counter = document.getElementById('bioCounter');
    if (counter) counter.textContent = e.target.value.length;
  }
});

/* ============================================================
   RENDER
   ============================================================ */
function render(){
  document.getElementById('money').textContent = fmt(S.money);
  document.getElementById('token').textContent = fmt(S.token);
  document.getElementById('diamond').textContent = fmt(S.diamond);
  document.getElementById('level').textContent = S.level;
  const max = expNeeded(S.level);
  document.getElementById('exp').textContent = S.level>=100 ? 'MAX' : fmt(S.exp);
  document.getElementById('expMax').textContent = S.level>=100 ? '∞' : fmt(max);
  const pct = S.level>=100 ? 100 : Math.min(100, (S.exp/max)*100);
  document.getElementById('expFill').style.width = pct + '%';

  const nameDisplay = document.getElementById('playerNameDisplay');
  if (nameDisplay) nameDisplay.textContent = S.playerName || 'Pemain';

  document.getElementById('devActiveTag').style.display = S.devMode ? 'block' : 'none';

  const expBonusInfo = document.getElementById('expBonusInfo');
  if (expBonusInfo){
    const expPerClick = getExpPerClick();
    expBonusInfo.textContent = `⚡ +${fmt(expPerClick)} Exp per klik`;
  }

  const btn = document.getElementById('clickBtn');
  const now = Date.now();
  const info = document.getElementById('boostInfo');
  if (S.boostEnd > now){
    btn.classList.add('boost');
    info.textContent = `🥊 BOOST AKTIF! €${BOOST_CONFIG.clickPower}/klik — sisa ${Math.ceil((S.boostEnd-now)/1000)}s`;
  } else {
    btn.classList.remove('boost');
    info.textContent = '';
  }

  updateAutoUI(now);
  const uidEl = document.getElementById('uidDisplay');
  if (uidEl) uidEl.textContent = currentUid ? currentUid.slice(0,16)+'...' : 'local';
  const statEl = document.getElementById('statDiamondLevel');
  if (statEl) statEl.textContent = fmt(S.totalDiamondFromLevel || 0);

  renderPanels();
  renderSkinPanel();
  renderInvPanel();
  renderProfilePanel();
  if (!isUserTypingInClan()) renderClanPanel();
  
  const friendPanel = document.getElementById('panel-friend');
  if (friendPanel && !friendPanel.classList.contains('hidden')){
    if (!isUserTypingInFriends()) renderFriendPanel();
  }
}

let saveTimeout = null;
function save(){
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => Storage.save(S), 500);
}

function isUserTypingInFriends(){
  const active = document.activeElement;
  if (!active) return false;
  const panel = document.getElementById('panel-friend');
  if (!panel) return false;
  if (panel.classList.contains('hidden')) return false;
  return panel.contains(active) && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
}

/* ============================================================
   AUTO CLICKER
   ============================================================ */
function updateAutoUI(now){
  const panel = document.getElementById('autoPanel');
  const timer = document.getElementById('autoTimer');
  const btn = document.getElementById('clickBtn');
  const bonus = document.getElementById('autoBonus');
  const active = S.autoEnd > now;

  if (!active){
    panel.classList.remove('show');
    btn.classList.remove('auto');
    return;
  }
  panel.classList.add('show');
  btn.classList.add('auto');
  timer.textContent = formatDuration(S.autoEnd - now);
  timer.style.color = '#00ffc0';
  
  if (bonus){
    bonus.textContent = `+€${HELPING_HAND_CONFIG.clickPowerMin}-${HELPING_HAND_CONFIG.clickPowerMax}/klik`;
  }
}

function doAutoClick(){
  const now = Date.now();
  if (S.autoEnd <= now) return;
  const base = HELPING_HAND_CONFIG.clickPowerMin +
                Math.floor(Math.random() * (HELPING_HAND_CONFIG.clickPowerMax - HELPING_HAND_CONFIG.clickPowerMin + 1));
  S.money += base;
  addExp(getExpPerClick());
  const btn = document.getElementById('clickBtn');
  btn.style.transform = 'scale(0.97)';
  setTimeout(()=>btn.style.transform='',60);
  S.lastAutoTick = now;
  render(); save();
}

function startAutoLoop(){
  if (autoTickInterval) clearInterval(autoTickInterval);
  autoTickInterval = setInterval(()=>{
    const now = Date.now();
    if (S.autoEnd > now) doAutoClick();
    if (S.autoEnd > 0 && S.autoEnd <= now){
      S.autoEnd = 0;
      toast('👌 Helping Hand selesai.');
      save(); render();
    }
  }, 1000);
}

/* ============================================================
   CLICK MANUAL
   ============================================================ */
const clickBtn = document.getElementById('clickBtn');
clickBtn.addEventListener('click', () => {
  const now = Date.now();
  let gain;
  if (S.autoEnd > now){
    gain = HELPING_HAND_CONFIG.clickPowerMin +
           Math.floor(Math.random() * (HELPING_HAND_CONFIG.clickPowerMax - HELPING_HAND_CONFIG.clickPowerMin + 1));
  } else if (S.boostEnd > now){
    gain = BOOST_CONFIG.clickPower;
  } else {
    gain = 10 + Math.floor(Math.random()*16);
  }
  S.money += gain;
  addExp(getExpPerClick());
  render(); save();
  clickBtn.style.transform = 'scale(0.95)';
  setTimeout(()=>clickBtn.style.transform='',80);
});

function addExp(v){
  if (S.level >= 100){ S.exp = 0; return; }
  S.exp += v;
  let max = expNeeded(S.level);
  while (S.exp >= max && S.level < 100){
    S.exp -= max;
    S.level++;
    const reward = rollLevelDiamond();
    S.diamond += reward;
    S.totalDiamondFromLevel += reward;
    const rareTag = reward >= 130 ? ' 🌟 JACKPOT!' : (reward >= 90 ? ' ✨ RARE!' : (reward >= 50 ? ' 💫 GOOD!' : ''));
    toast(`🎉 Level ${S.level}! +💎 ${reward}${rareTag}`);
    showDiamondPop(reward);
    max = expNeeded(S.level);
  }
  if (S.level >= 100){ S.level = 100; S.exp = 0; }
}

/* ============================================================
   PANEL TOKO
   ============================================================ */
function renderPanels(){
  const shop = document.getElementById('panel-shop');
  const now = Date.now();
  const boostCd = Math.max(0, S.boostCooldown - now);
  const boostActive = S.boostEnd > now;
  const mysteryCd = Math.max(0, S.mysteryCooldown - now);
  const mysteryReady = !S.mysteryOpened || mysteryCd <= 0;
  const autoActive = S.autoEnd > now;

  shop.innerHTML = `
    <div class="item">
      <div class="info"><b>✴️ TOKEN LIGHT</b><br>Harga: € ${fmt(TOKEN_PRICE_NORMAL.money)} atau 💎 ${TOKEN_PRICE_NORMAL.diamond}</div>
      <div>
        <button onclick="buyToken('money')" ${S.money<TOKEN_PRICE_NORMAL.money?'disabled':''}>€${fmt(TOKEN_PRICE_NORMAL.money)}</button>
        <button onclick="buyToken('diamond')" ${S.diamond<TOKEN_PRICE_NORMAL.diamond?'disabled':''}>💎${TOKEN_PRICE_NORMAL.diamond}</button>
      </div>
    </div>
    <div class="item">
      <div class="info"><b>🥊 PUNCH MONEY FAST</b><br>+€${BOOST_CONFIG.clickPower}/klik (800s). CD 4 menit.<br>
      ${boostActive?'<span style="color:#ffb300">AKTIF</span>':boostCd>0?`CD: ${Math.ceil(boostCd/1000)}s`:'Siap'}</div>
      <button onclick="buyBoost()" ${(boostActive||boostCd>0||S.money<BOOST_CONFIG.price)?'disabled':''}>€${BOOST_CONFIG.price}</button>
    </div>
    <div class="item">
      <div class="info"><b>❔ MISTERY BOX</b><br>Hadiah acak. CD 30 menit.<br>
      ${mysteryReady?'<span style="color:#00ff90">Siap</span>':`CD: ${Math.ceil(mysteryCd/1000)}s`}</div>
      <button onclick="openMystery()" ${!mysteryReady?'disabled':''}>Buka</button>
    </div>
    <div class="item" style="border-color:#00e0a0;">
      <div class="info"><b>👌 HELPING HAND</b><br>
      Auto klik 2 menit, bonus €50-80/klik.<br>
      ${autoActive?`<span style="color:#00ff90">AKTIF — ${formatDuration(S.autoEnd-now)}</span>`:'Belum aktif'}</div>
      <div>
        <button onclick="buyHelpingHand('token')" ${(autoActive||S.token<HELPING_HAND_CONFIG.priceToken)?'disabled':''}>✴️${HELPING_HAND_CONFIG.priceToken}</button>
        <button onclick="buyHelpingHand('diamond')" ${(autoActive||S.diamond<HELPING_HAND_CONFIG.priceDiamond)?'disabled':''}>💎${HELPING_HAND_CONFIG.priceDiamond}</button>
      </div>
    </div>
  `;

  const ev = document.getElementById('panel-event');
  const status = getEventStatus();
  const eventSkins = ['plasma', 'danish', 'emberheart'].map(id => SKIN_DB[id]);

  let statusHtml = '';
  if (status === 'open'){
    statusHtml = `<div class="event-status event-open">⭐ EVENT TERBUKA — 20.00–22.00 WIB</div>`;
  } else if (status === 'closed'){
    statusHtml = `<div class="event-status event-closed">🔒 Event tertutup. Buka tiap 20.00–22.00 WIB</div>`;
  } else if (status === 'ended'){
    statusHtml = `<div class="event-status event-closed" style="background:rgba(120,120,120,0.2);border-color:#666;color:#aaa">🏁 EVENT LEGENDARY TELAH SELESAI PERMANEN</div>`;
  }

  ev.innerHTML = `
    ${statusHtml}
    <div class="notice-banner">
      <b>📢 Info:</b> Skin Limited Event sekarang ada di tab <b>👕 Skin</b>.
    </div>
    ${eventSkins.map(sk=>{
      const owned = S.inventory.some(item => item.id === sk.id);
      return `
        <div class="item ${sk.cls} glossy">
          <div class="info">
            <b>${sk.icon} ${sk.name}</b><br>${sk.rarity} • ✴️ ${sk.price}
            ${owned ? '<br><span style="color:#00ff90;font-size:0.75rem">✅ Sudah dimiliki</span>' : ''}
          </div>
          <button disabled>Lihat</button>
        </div>
      `;
    }).join('')}
  `;
}

/* ============================================================
   TOKO SKIN
   ============================================================ */
function renderSkinPanel(){
  const panel = document.getElementById('panel-skin');
  if (!panel) return;

  const categories = {};
  for (const sk of Object.values(SKIN_DB)){
    if (!categories[sk.category]) categories[sk.category] = [];
    categories[sk.category].push(sk);
  }

  const categoryOrder = [
    'Starter', 'Rare Collection', 'Exclusive Collection',
    'Eternal Collection', 'Mythic Collection', 'Skin Limited'
  ];

  let html = `
    <div class="notice-banner">
      👕 <b>Toko Skin</b> — Koleksi skin kamu.<br>
      Beli skin yang tersedia atau lihat skin limited yang sudah berakhir.
    </div>
  `;

  for (const catName of categoryOrder){
    const skins = categories[catName];
    if (!skins || !skins.length) continue;

    const isLimited = (catName === 'Skin Limited');
    const catClass = isLimited ? 'locked' : '';

    html += `<div class="skin-category ${catClass}">`;
    html += `<div class="skin-category-title">
      <span>${isLimited ? '🔒' : '📦'} ${catName}</span>
    </div>`;

    for (const sk of skins){
      const owned = S.inventory.some(item => item.id === sk.id);
      const rarity = RARITY_INFO[sk.rarity] || RARITY_INFO.COMMON;

      let priceDisplay = '';
      if (sk.currency === 'money'){
        priceDisplay = `€ ${fmt(sk.price)}`;
      } else if (sk.currency === 'token'){
        priceDisplay = `✴️ ${sk.price}`;
      }

      let statusText = '';
      let btnHtml = '';

      if (isLimited){
        statusText = '<span style="color:#ff8080">🔒 Event Berakhir</span>';
        btnHtml = `<button disabled>Beli</button>`;
      } else if (owned){
        statusText = '<span style="color:#00ff90">✅ Sudah Dimiliki</span>';
        btnHtml = `<button disabled>Beli</button>`;
      } else if (sk.available){
        statusText = '<span style="color:#00ff90">🟢 Tersedia</span>';
        btnHtml = `<button onclick="buySkin('${sk.id}')">Beli</button>`;
      } else {
        statusText = '<span style="color:#888">⏰ Coming Soon</span>';
        btnHtml = `<button disabled>Beli</button>`;
      }

      html += `
        <div class="skin-card ${sk.cls} ${sk.glossy?'glossy':''}">
          <div class="skin-name">
            <span>${sk.icon} ${escapeHtml(sk.name)}</span>
            <span class="skin-badge ${rarity.badgeClass}">${rarity.label}</span>
          </div>
          <div class="skin-meta">${statusText}</div>
          <div class="skin-price">${priceDisplay}</div>
          <div class="skin-actions">
            ${btnHtml}
          </div>
        </div>
      `;
    }

    html += `</div>`;
  }

  panel.innerHTML = html;
}

/* ============================================================
   INVENTORI
   ============================================================ */
function renderInvPanel(){
  const panel = document.getElementById('panel-inv');
  if (!panel) return;

  const active = document.activeElement;
  const isSearching = active && active.id === 'invSearchInput';

  if (isSearching){
    updateInvResult();
    return;
  }

  let html = `
    <div class="inv-tabs">
      <button class="${currentInvTab==='skin'?'active':''}" onclick="switchInvTab('skin')">👕 Skin</button>
      <button class="${currentInvTab==='item'?'active':''}" onclick="switchInvTab('item')">📦 Item</button>
    </div>
    <div class="inv-search">
      <input type="text" id="invSearchInput" placeholder="🔍 Cari ${currentInvTab==='skin'?'skin':'item'}..."
             value="${escapeHtml(invSearchQuery)}"
             oninput="onInvSearchInput(this.value)">
      <button class="clear-btn ${invSearchQuery?'show':''}" onclick="clearInvSearch()">✕</button>
    </div>
    <div id="invResultContainer"></div>
  `;

  panel.innerHTML = html;
  updateInvResult();
}

function updateInvResult(){
  const container = document.getElementById('invResultContainer');
  if (!container) return;

  const q = (invSearchQuery || '').toLowerCase().trim();

  if (currentInvTab === 'skin'){
    const skins = S.inventory.filter(it => {
      return (it.skinClass || it.type === 'Skin');
    });

    const filtered = skins.filter(it => {
      if (!q) return true;
      return (it.name || '').toLowerCase().includes(q);
    });

    if (!filtered.length){
      container.innerHTML = `<div class="inv-empty">
        ${skins.length === 0 ? 'Belum ada skin.<br>Beli di tab 👕 Skin!' : '❌ Tidak ditemukan'}
      </div>`;
      return;
    }

    let gridHtml = '<div class="inv-grid">';
    for (const it of filtered){
      const rarity = RARITY_INFO[it.rarity] || RARITY_INFO.COMMON;
      const skinDef = SKIN_DB[it.id];
      const icon = skinDef ? skinDef.icon : '👕';

      gridHtml += `
        <div class="inv-grid-item ${it.skinClass||''} ${it.glossy?'glossy':''}"
             onclick="showSkinDetail('${it.id}')">
          <div class="inv-icon">${icon}</div>
          <div class="inv-name">${escapeHtml(it.name)}</div>
          <div class="inv-rarity ${rarity.badgeClass}">${rarity.label}</div>
        </div>
      `;
    }
    gridHtml += '</div>';
    container.innerHTML = gridHtml;
  } else {
    const items = S.inventory.filter(it => {
      return !(it.skinClass || it.type === 'Skin');
    });

    const filtered = items.filter(it => {
      if (!q) return true;
      return (it.name || '').toLowerCase().includes(q);
    });

    if (!filtered.length){
      container.innerHTML = `<div class="inv-empty">
        ${items.length === 0 ? 'Belum ada item.' : '❌ Tidak ditemukan'}
      </div>`;
      return;
    }

    let html = '';
    for (const it of filtered){
      html += `
        <div class="item">
          <div class="info">
            <b>${escapeHtml(it.name)}</b><br>
            ${it.type || 'Item'} • ${it.rarity || 'COMMON'}
          </div>
          <span class="badge">${it.qty||1}x</span>
        </div>
      `;
    }
    container.innerHTML = html;
  }
}

window.switchInvTab = function(tab){
  currentInvTab = tab;
  invSearchQuery = '';
  renderInvPanel();
};

window.onInvSearchInput = function(val){
  invSearchQuery = val || '';
  const clearBtn = document.querySelector('.inv-search .clear-btn');
  if (clearBtn){
    clearBtn.classList.toggle('show', !!invSearchQuery);
  }
  updateInvResult();
};

window.clearInvSearch = function(){
  invSearchQuery = '';
  const input = document.getElementById('invSearchInput');
  if (input){ input.value = ''; input.focus(); }
  const clearBtn = document.querySelector('.inv-search .clear-btn');
  if (clearBtn) clearBtn.classList.remove('show');
  updateInvResult();
};

window.showSkinDetail = function(id){
  const sk = SKIN_DB[id];
  const owned = S.inventory.find(it => it.id === id);
  if (!sk || !owned) return;

  const rarity = RARITY_INFO[sk.rarity] || RARITY_INFO.COMMON;

  document.getElementById('skinDetailContent').innerHTML = `
    <div class="skin-card ${sk.cls} ${sk.glossy?'glossy':''}" style="margin-bottom:12px">
      <div class="skin-name">
        <span>${sk.icon} ${escapeHtml(sk.name)}</span>
        <span class="skin-badge ${rarity.badgeClass}">${rarity.label}</span>
      </div>
      <div class="skin-meta">Kategori: ${sk.category}</div>
      <div class="skin-meta">Status: ✅ Sudah Dimiliki</div>
    </div>
  `;
  document.getElementById('skinDetailModal').classList.add('show');
};
window.closeSkinDetail = function(){
  document.getElementById('skinDetailModal').classList.remove('show');
};
document.getElementById('skinDetailModal').addEventListener('click', (e)=>{
  if (e.target.id === 'skinDetailModal') closeSkinDetail();
});

/* ============================================================
   TAB PROFIL
   ============================================================ */
function renderProfilePanel(){
  const panel = document.getElementById('panel-profile');
  if (!panel) return;

  const uid = Storage.getUserId();

  let clanText = 'Tidak ada';
  if (S.clanId && currentClanData){
    clanText = `[${escapeHtml(currentClanData.tag || '-')}] ${escapeHtml(currentClanData.name || '-')}`;
  } else if (S.clanId){
    clanText = 'Memuat...';
  }

  const bioText = S.playerBio
    ? escapeHtml(S.playerBio)
    : '<span style="color:#666;font-style:italic">Belum ada bio. Klik "Edit Bio" untuk menambahkan.</span>';

  panel.innerHTML = `
    <div class="profile-tab-card">
      <div class="big-avatar">👤</div>
      <h2>${escapeHtml(S.playerName || 'Pemain')}</h2>
      <div class="bio-text ${S.playerBio?'':'empty'}">${bioText}</div>
    </div>

    <div class="profile-info-row">
      <span class="label">🏆 Level</span>
      <span class="value">${S.level}</span>
    </div>
    <div class="profile-info-row">
      <span class="label">🏰 Clan</span>
      <span class="value">${clanText}</span>
    </div>
    <div class="profile-info-row">
      <span class="label">🆔 UID</span>
      <span class="value">${escapeHtml(uid.slice(0,20))}${uid.length>20?'...':''}</span>
    </div>

    <button class="profile-edit-btn" onclick="showEditNameModal()">
      ✏️ Ubah Nama Pemain
    </button>
    <button class="profile-edit-btn" onclick="showEditBioModal()" style="background:linear-gradient(135deg,#00c060,#00ff90);color:#111">
      📝 Edit Bio
    </button>
  `;

  if (S.clanId && !currentClanData){
    ClanStorage.getClan(S.clanId).then(c => {
      if (c){
        currentClanData = c;
        const p = document.getElementById('panel-profile');
        if (p && !p.classList.contains('hidden')){
          renderProfilePanel();
        }
      }
    });
  }
}

/* ============================================================
   BELI SKIN
   ============================================================ */
window.buySkin = function(id){
  const sk = SKIN_DB[id];
  if (!sk) return toast('❌ Skin tidak ditemukan');
  if (!sk.available) return toast('🔒 Skin tidak tersedia');
  if (sk.ended) return toast('🏁 Event sudah berakhir');

  const alreadyOwned = S.inventory.some(item => item.id === id);
  if (alreadyOwned) return toast(`⚠️ Kamu sudah punya ${sk.name}!`);

  if (sk.currency === 'money'){
    if (S.money < sk.price) return toast(`❌ Uang tidak cukup! Butuh €${fmt(sk.price)}`);
    S.money -= sk.price;
  } else if (sk.currency === 'token'){
    if (S.token < sk.price) return toast(`❌ Token tidak cukup! Butuh ✴️${sk.price}`);
    S.token -= sk.price;
  }

  S.inventory.push({
    id: sk.id, name: sk.name, type: 'Skin', rarity: sk.rarity,
    skinClass: sk.cls, glossy: sk.glossy, qty: 1
  });

  toast(`⭐ ${sk.name} dibeli!`);
  render(); save();
};

/* ============================================================
   AKSI TOKO LAIN
   ============================================================ */
window.buyToken = function(mode){
  if (mode === 'money'){
    if (S.money < TOKEN_PRICE_NORMAL.money) return toast('❌ Uang tidak cukup!');
    S.money -= TOKEN_PRICE_NORMAL.money; S.token++;
    toast('✴️ +1 Token Light');
  } else if (mode === 'diamond'){
    if (S.diamond < TOKEN_PRICE_NORMAL.diamond) return toast('❌ Diamond tidak cukup!');
    S.diamond -= TOKEN_PRICE_NORMAL.diamond; S.token++;
    toast('✴️ +1 Token Light');
  } else return;
  render(); save();
};

window.buyBoost = function(){
  const now = Date.now();
  if (S.boostEnd>now || S.boostCooldown>now || S.money<BOOST_CONFIG.price) return;
  S.money -= BOOST_CONFIG.price;
  S.boostEnd = now + BOOST_CONFIG.duration;
  S.boostCooldown = now + BOOST_CONFIG.cooldown;
  toast(`🥊 Boost aktif!`);
  render(); save();
};

window.openMystery = function(){
  const now = Date.now();
  if (S.mysteryOpened && S.mysteryCooldown>now) return;
  const r = Math.random()*100;
  if (r<75){ S.token+=2; toast('🎁 +✴️ 2 Token'); }
  else if (r<90){ S.token+=5; toast('🎁 +✴️ 5 Token'); }
  else { S.money+=1000; toast('🎁 +€ 1.000!'); }
  S.mysteryOpened = true;
  S.mysteryCooldown = now + 1800000;
  render(); save();
};

window.buyHelpingHand = function(mode){
  const now = Date.now();
  if (S.autoEnd > now) return toast('Masih aktif!');
  if (mode === 'token'){
    if (S.token < HELPING_HAND_CONFIG.priceToken) return toast('Token kurang!');
    S.token -= HELPING_HAND_CONFIG.priceToken;
  } else if (mode === 'diamond'){
    if (S.diamond < HELPING_HAND_CONFIG.priceDiamond) return toast('Diamond kurang!');
    S.diamond -= HELPING_HAND_CONFIG.priceDiamond;
  } else return;

  S.autoEnd = now + HELPING_HAND_CONFIG.duration;
  S.lastAutoTick = now;

  if (!S.inventory.some(i=>i.id==='helping_hand')){
    S.inventory.push({ id:'helping_hand', name:'👌 Helping Hand', type:'Consumable', rarity:'UTILITY', qty:1 });
  }
  toast('👌 Helping Hand aktif!');
  render(); save();
};

/* ============================================================
   CLAN SYSTEM
   ============================================================ */
function isUserTypingInClan(){
  const active = document.activeElement;
  if (!active) return false;
  const clanPanel = document.getElementById('panel-clan');
  if (!clanPanel) return false;
  if (clanPanel.classList.contains('hidden')) return false;
  return clanPanel.contains(active) &&
         (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
}

async function renderClanPanel(){
  const panel = document.getElementById('panel-clan');
  if (!panel) return;
  const uid = Storage.getUserId();

  if (currentClanTab === 'chat' && document.getElementById('clanChat')) return;
  if (isUserTypingInClan()) return;

  if (!S.clanId){
    const savedQuery = savedSearchResult ? savedSearchResult.query : '';
    const savedHtml = savedSearchResult ? savedSearchResult.html : '';
    panel.innerHTML = `
      <div class="clan-hero">
        <div class="clan-tag">BELUM PUNYA CLAN</div>
        <h2>🏰 Gabung atau Buat Clan</h2>
      </div>
      <div class="clan-search-box">
        <h4>🔍 Cari Clan by Nama</h4>
        <input type="text" id="clanSearchInput" placeholder="cth: Nova Warriors"
               value="${escapeHtml(savedQuery)}"
               onkeydown="if(event.key==='Enter'){event.preventDefault();searchClan();}">
        <button class="btn-blue" style="width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;font-weight:bold" onclick="searchClan()">Cari</button>
        <div id="clanSearchResult" style="margin-top:10px">${savedHtml}</div>
      </div>
      <div class="clan-btn-row" style="grid-template-columns:1fr">
        <button class="btn-green" onclick="showCreateClanModal()">➕ Buat Clan Baru (💎50)</button>
      </div>
    `;
    return;
  }

  const clan = await ClanStorage.getClan(S.clanId);
  if (!clan){ S.clanId = null; save(); toast('⚠️ Clan tidak ditemukan.'); renderClanPanel(); return; }
  currentClanData = clan;
  if (!clan.members || !clan.members[uid]){
    S.clanId = null; save(); toast('⚠️ Kamu sudah tidak di clan ini.'); renderClanPanel(); return;
  }

  const myRole = clan.members[uid].role;
  const memberCount = Object.keys(clan.members).length;
  const isOwner = myRole === 'owner';
  const isAdmin = myRole === 'admin' || isOwner;

  let html = `
    <div class="clan-hero">
      <div class="clan-tag">[${escapeHtml(clan.tag)}]</div>
      <h2>${escapeHtml(clan.name)}</h2>
      <div class="meta">Level <b>${clan.level||1}</b> • <b>${memberCount}</b>/20 • Role: <b>${myRole.toUpperCase()}</b></div>
      ${clan.description ? `<div class="meta" style="margin-top:6px;color:#bbb">"${escapeHtml(clan.description)}"</div>` : ''}
    </div>
    <div class="clan-tabs">
      <button class="${currentClanTab==='info'?'active':''}" onclick="switchClanTab('info')">👥 Member</button>
      <button class="${currentClanTab==='chat'?'active':''}" onclick="switchClanTab('chat')">💬 Chat</button>
      <button class="${currentClanTab==='manage'?'active':''}" onclick="switchClanTab('manage')">⚙️ Manage</button>
    </div>
  `;

  if (currentClanTab === 'info'){
    const members = Object.entries(clan.members).sort((a,b)=>{
      const order = {owner:0, admin:1, member:2};
      return (order[a[1].role]||9) - (order[b[1].role]||9);
    });

    const memberUids = members.map(([muid])=>muid);
    const onlineStatuses = {};
    const lastSeenMap = {};
    await Promise.all(memberUids.map(async (muid) => {
      const ts = await fetchUserLastSeen(muid);
      onlineStatuses[muid] = isUserOnline(muid, ts);
      lastSeenMap[muid] = ts;
    }));

    for (const [muid, m] of members){
      const isMe = muid === uid;
      const roleClass = m.role==='owner'?'role-owner':(m.role==='admin'?'role-admin':'');
      const isOn = onlineStatuses[muid];
      const dotClass = isOn ? 'on' : 'off';
      const muted = m.mutedUntil && m.mutedUntil > Date.now();
      const lastSeenText = isOn ? '' : ` <span style="color:#666;font-size:0.65rem">• ${timeAgo(lastSeenMap[muid])}</span>`;
      
      html += `
        <div class="clan-member-row">
          <div>
            <span class="online-dot ${dotClass}"></span>
            ${isMe?'⭐ ':''}<b>${escapeHtml(m.name||'Pemain')}</b>
            <span style="color:#aaa;font-size:0.7rem"> • Lv.${m.level||1}</span>${lastSeenText}
            ${muted ? `<span class="muted-badge">🔇 MUTED</span>` : ''}
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <span class="role ${roleClass}">${m.role.toUpperCase()}</span>
            ${isOwner && !isMe ? `
              <button onclick="showMuteModal('${muid}', '${escapeHtml(m.name||'Pemain')}')" style="padding:4px 8px;font-size:0.65rem;border-radius:6px;border:none;background:#ff4060;color:white;cursor:pointer">🔇</button>
              <button onclick="showTransferConfirm('${muid}', '${escapeHtml(m.name||'Pemain')}')" style="padding:4px 8px;font-size:0.65rem;border-radius:6px;border:none;background:#ffb300;color:#111;cursor:pointer">👑</button>
              <button onclick="kickMember('${muid}')" style="padding:4px 8px;font-size:0.65rem;border-radius:6px;border:none;background:#a01030;color:white;cursor:pointer">Kick</button>
            ` : ''}
          </div>
        </div>
      `;
    }
  }
  else if (currentClanTab === 'chat'){
    const me = clan.members[uid];
    const isMuted = me.mutedUntil && me.mutedUntil > Date.now();
    let muteInfo = '';
    if (isMuted){
      const remain = Math.ceil((me.mutedUntil - Date.now()) / 60000);
      muteInfo = `<div style="background:rgba(255,60,90,0.2);border:1px solid #ff4060;color:#ffb0b0;padding:8px;border-radius:8px;margin-bottom:8px;font-size:0.75rem;text-align:center">
        🔇 Kamu sedang dibisukan. Sisa ~${remain} menit.
      </div>`;
    }
    html += `
      ${muteInfo}
      <div class="clan-chat" id="clanChat"></div>
      <div class="chat-input-row">
        <input type="text" id="chatInput" placeholder="${isMuted?'Kamu dibisukan':'Ketik pesan...'}" maxlength="200"
               ${isMuted?'disabled':''}
               onkeydown="if(event.key==='Enter'){event.preventDefault();sendChatMsg();}">
        <button onclick="sendChatMsg()" ${isMuted?'disabled':''}>Kirim</button>
      </div>
    `;
  }
  else {
    html += `<div style="padding:8px 0">
      <button class="btn-red" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:bold;margin-bottom:8px" onclick="leaveClan()">🚪 Keluar dari Clan</button>
      ${isOwner ? `
        <button class="btn-blue" style="width:100%;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:bold;margin-bottom:8px" onclick="showTransferModal()">👑 Transfer Kepemilikan</button>
        <button class="danger-btn" onclick="disbandClan()">💥 Bubarkan Clan</button>
      ` : ''}
      <div style="margin-top:14px;font-size:0.75rem;color:#888">
        <b>Info Clan:</b><br>ID: ${escapeHtml(S.clanId)}<br>
        Dibuat: ${new Date(clan.createdAt||Date.now()).toLocaleString('id-ID')}
      </div>
    </div>`;
  }

  panel.innerHTML = html;
  if (currentClanTab === 'chat'){
    if (!chatUnsubscribe) startChatListener(S.clanId);
  } else { stopChatListener(); }
}

window.switchClanTab = function(tab){
  if (currentClanTab === 'chat' && tab !== 'chat') stopChatListener();
  currentClanTab = tab;
  renderClanPanel();
};

window.searchClan = async function(){
  const input = document.getElementById('clanSearchInput');
  const result = document.getElementById('clanSearchResult');
  if (!input || !result) return;
  const name = (input.value || '').trim();
  if (name.length < 3){
    result.innerHTML = '<div style="color:#ff8080;font-size:0.8rem">Minimal 3 karakter</div>';
    savedSearchResult = null;
    return;
  }
  result.innerHTML = '<div style="color:#aaa;font-size:0.8rem">Mencari...</div>';
  const clanId = await ClanStorage.findClanByName(name);
  if (!clanId){
    result.innerHTML = '<div style="color:#ff8080;font-size:0.8rem">❌ Clan tidak ditemukan</div>';
    savedSearchResult = { query: name, html: result.innerHTML };
    return;
  }
  const clan = await ClanStorage.getClan(clanId);
  if (!clan){
    result.innerHTML = '<div style="color:#ff8080;font-size:0.8rem">❌ Clan tidak ditemukan</div>';
    savedSearchResult = { query: name, html: result.innerHTML };
    return;
  }
  const memberCount = Object.keys(clan.members||{}).length;
  const html = `
    <div class="clan-list-item">
      <div class="info">
        <b>[${escapeHtml(clan.tag)}] ${escapeHtml(clan.name)}</b><br>
        <span style="color:#aaa">${memberCount}/20 member • ${clan.type==='open'?'🌐 Open':'🔒 Closed'}</span>
      </div>
      <button onclick="joinClan('${clanId}')">${clan.type==='open'?'Join':'Ajukan'}</button>
    </div>
  `;
  result.innerHTML = html;
  savedSearchResult = { query: name, clanId: clanId, html: html };
};

window.joinClan = async function(clanId){
  if (S.clanId) return toast('Sudah punya clan!');
  const clan = await ClanStorage.getClan(clanId);
  if (!clan) return toast('Clan tidak ditemukan');
  const uid = Storage.getUserId();
  const memberCount = Object.keys(clan.members||{}).length;
  if (memberCount >= 20) return toast('Clan penuh');

  if (clan.type === 'closed'){
    await ClanStorage.updateClan(clanId, `applications/${uid}`, {
      appliedAt: Date.now(), level: S.level, name: S.playerName
    });
    toast('📩 Aplikasi terkirim!');
  } else {
    await ClanStorage.updateClan(clanId, `members/${uid}`, {
      role:'member', joinedAt:Date.now(), name:S.playerName, level:S.level, lastSeen: Date.now()
    });
    S.clanId = clanId;
    await Storage.save(S);
    toast(`✅ Bergabung ke "${clan.name}"!`);
  }
  savedSearchResult = null;
  render();
};

window.showCreateClanModal = function(){
  if (S.clanId) return toast('Sudah punya clan!');
  if (S.diamond < 50) return toast('Butuh 💎50');
  document.getElementById('createClanModal').classList.add('show');
};
window.closeCreateClanModal = function(){
  document.getElementById('createClanModal').classList.remove('show');
};

window.submitCreateClan = async function(){
  const name = (document.getElementById('newClanName').value||'').trim();
  const tag = (document.getElementById('newClanTag').value||'').trim().toUpperCase();
  const desc = (document.getElementById('newClanDesc').value||'').trim();
  const type = document.getElementById('newClanType').value;

  if (name.length < 3 || name.length > 20) return toast('❌ Nama 3-20 karakter');
  if (tag.length < 2 || tag.length > 5) return toast('❌ Tag 2-5 karakter');
  if (!/^[A-Z0-9]+$/.test(tag)) return toast('❌ Tag huruf kapital & angka');
  if (S.diamond < 50) return toast('❌ Diamond kurang');

  const existing = await ClanStorage.findClanByName(name);
  if (existing) return toast('❌ Nama sudah dipakai!');

  S.diamond -= 50;
  const clanId = 'clan_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  const uid = Storage.getUserId();

  await ClanStorage.createClan(clanId, {
    name, tag, description: desc,
    ownerUid: uid, createdAt: Date.now(),
    level: 1, totalScore: 0, type,
    members: { [uid]: { role:'owner', joinedAt:Date.now(), name:S.playerName, level:S.level, lastSeen: Date.now() } }
  });

  S.clanId = clanId;
  await Storage.save(S);
  closeCreateClanModal();
  toast(`✅ Clan "${name}" dibuat!`);
  currentClanTab = 'info';
  savedSearchResult = null;
  render();
};

window.kickMember = async function(targetUid){
  if (!S.clanId) return;
  const clan = await ClanStorage.getClan(S.clanId);
  const uid = Storage.getUserId();
  if (clan.members[uid].role !== 'owner') return toast('Hanya owner');
  if (targetUid === uid) return;
  if (!confirm('Kick pemain ini?')) return;
  await ClanStorage.deleteInClan(S.clanId, `members/${targetUid}`);
  toast('👋 Member di-kick.');
  renderClanPanel();
};

window.showTransferModal = async function(){
  if (!S.clanId) return;
  const clan = await ClanStorage.getClan(S.clanId);
  if (!clan) return;
  const uid = Storage.getUserId();
  if (clan.members[uid].role !== 'owner') return toast('Hanya owner');

  const defaultActions = document.getElementById('transferDefaultActions');
  if (defaultActions) defaultActions.style.display = 'grid';

  const list = document.getElementById('transferList');
  const others = Object.entries(clan.members).filter(([muid]) => muid !== uid);
  if (!others.length){
    list.innerHTML = '<div style="text-align:center;color:#888;padding:20px">Tidak ada anggota lain</div>';
  } else {
    list.innerHTML = others.map(([muid, m])=>`
      <div class="transfer-list-item">
        <div class="info"><b>${escapeHtml(m.name||'Pemain')}</b><br>Lv.${m.level||1} • ${m.role.toUpperCase()}</div>
        <button onclick="confirmTransfer('${muid}', '${escapeHtml(m.name||'Pemain')}')">👑 Transfer</button>
      </div>
    `).join('');
  }
  document.getElementById('transferModal').classList.add('show');
};

window.closeTransferModal = function(){
  document.getElementById('transferModal').classList.remove('show');
  const defaultActions = document.getElementById('transferDefaultActions');
  if (defaultActions) defaultActions.style.display = 'grid';
};

window.showTransferConfirm = async function(targetUid, targetName){
  if (!S.clanId) return;
  const defaultActions = document.getElementById('transferDefaultActions');
  if (defaultActions) defaultActions.style.display = 'none';

  document.getElementById('transferList').innerHTML = `
    <div style="text-align:center;padding:10px">
      <div style="font-size:1rem;margin-bottom:10px">Yakin transfer kepemilikan ke <b>${escapeHtml(targetName)}</b>?</div>
      <div style="font-size:0.8rem;color:#888;margin-bottom:14px">Kamu akan menjadi Admin setelah ini.</div>
      <div class="modal-actions">
        <button class="btn-cancel" onclick="cancelTransferConfirm()">Batal</button>
        <button class="btn-confirm" id="transferConfirmBtn" style="background:linear-gradient(135deg,#ffb300,#ff6600);color:#111" onclick="confirmTransfer('${targetUid}', '${escapeHtml(targetName)}')">Ya, Transfer</button>
      </div>
    </div>
  `;
  document.getElementById('transferModal').classList.add('show');
};

window.cancelTransferConfirm = function(){
  closeTransferModal();
  setTimeout(() => showTransferModal(), 250);
};

window.confirmTransfer = async function(targetUid, targetName){
  if (!S.clanId) return;
  const clan = await ClanStorage.getClan(S.clanId);
  if (!clan) return;
  const uid = Storage.getUserId();
  if (clan.members[uid].role !== 'owner') return;

  const btn = document.getElementById('transferConfirmBtn');
  if (btn){ btn.disabled = true; btn.textContent = '⏳ Memproses...'; }

  try {
    await ClanStorage.updateClan(S.clanId, `members/${targetUid}`, {
      ...clan.members[targetUid], role:'owner'
    });
    await ClanStorage.updateClan(S.clanId, `members/${uid}`, {
      ...clan.members[uid], role:'admin'
    });
    await ClanStorage.updateClan(S.clanId, 'ownerUid', targetUid);

    closeTransferModal();
    toast(`👑 Kepemilikan clan ditransfer ke ${targetName}`);
    renderClanPanel();
  } catch(e){
    if (btn){ btn.disabled = false; btn.textContent = 'Ya, Transfer'; }
    toast('❌ Gagal transfer, coba lagi');
  }
};

let muteTargetUid = null;
let muteSelectedDays = 1;
window.showMuteModal = function(targetUid, targetName){
  muteTargetUid = targetUid;
  muteSelectedDays = 1;
  document.getElementById('muteTargetName').textContent = targetName;
  document.querySelectorAll('#muteOptions button').forEach(b=>{
    b.classList.toggle('selected', parseInt(b.dataset.days) === 1);
  });
  const btn = document.getElementById('muteConfirmBtn');
  if (btn){ btn.disabled = false; btn.textContent = 'Bisukan'; }
  document.getElementById('muteModal').classList.add('show');
};
window.closeMuteModal = function(){
  document.getElementById('muteModal').classList.remove('show');
  muteTargetUid = null;
};
window.selectMuteDays = function(days){
  muteSelectedDays = days;
  document.querySelectorAll('#muteOptions button').forEach(b=>{
    b.classList.toggle('selected', parseInt(b.dataset.days) === days);
  });
};
window.confirmMute = async function(){
  if (!muteTargetUid || !S.clanId){ closeMuteModal(); return; }
  const clan = await ClanStorage.getClan(S.clanId);
  if (!clan) { closeMuteModal(); return; }
  const uid = Storage.getUserId();
  if (clan.members[uid].role !== 'owner') return toast('Hanya owner');

  const btn = document.getElementById('muteConfirmBtn');
  if (btn){ btn.disabled = true; btn.textContent = '⏳...'; }

  try {
    const mutedUntil = Date.now() + (muteSelectedDays * 24 * 60 * 60 * 1000);
    const target = clan.members[muteTargetUid];
    await ClanStorage.updateClan(S.clanId, `members/${muteTargetUid}`, {
      ...target, mutedUntil, mutedBy: uid
    });
    closeMuteModal();
    toast(`🔇 ${target.name||'Member'} dibisukan ${muteSelectedDays} hari`);
    renderClanPanel();
  } catch(e){
    if (btn){ btn.disabled = false; btn.textContent = 'Bisukan'; }
    toast('❌ Gagal mute');
  }
};

window.leaveClan = async function(){
  if (!S.clanId) return;
  const clan = await ClanStorage.getClan(S.clanId);
  const uid = Storage.getUserId();
  const myRole = clan.members[uid]?.role;
  if (myRole === 'owner' && Object.keys(clan.members).length > 1){
    return toast('⚠️ Transfer kepemilikan dulu!');
  }
  if (!confirm('Yakin keluar?')) return;
  if (myRole === 'owner') await ClanStorage.deleteClan(S.clanId, clan.name);
  else await ClanStorage.deleteInClan(S.clanId, `members/${uid}`);
  S.clanId = null;
  await Storage.save(S);
  toast('👋 Keluar dari clan.');
  currentClanTab = 'info';
  render();
};

window.disbandClan = async function(){
  if (!S.clanId) return;
  const clan = await ClanStorage.getClan(S.clanId);
  const uid = Storage.getUserId();
  if (clan.members[uid].role !== 'owner') return;
  if (!confirm(`Bubarkan "${clan.name}"?`)) return;
  await ClanStorage.deleteClan(S.clanId, clan.name);
  S.clanId = null;
  await Storage.save(S);
  toast('💥 Clan dibubarkan.');
  render();
};

/* ============================================================
   CHAT CLAN
   ============================================================ */
function startChatListener(clanId){
  stopChatListener();
  chatUnsubscribe = ClanStorage.listenChat(clanId, renderChat);
  chatHeartbeatInterval = setInterval(() => {
    if (!chatUnsubscribe && S.clanId === clanId && currentClanTab === 'chat'){
      chatUnsubscribe = ClanStorage.listenChat(clanId, renderChat);
    }
  }, 5000);
}
function stopChatListener(){
  if (chatUnsubscribe){ chatUnsubscribe(); chatUnsubscribe = null; }
  if (chatHeartbeatInterval){ clearInterval(chatHeartbeatInterval); chatHeartbeatInterval = null; }
}
function renderChat(chatObj){
  const container = document.getElementById('clanChat');
  if (!container) return;
  const msgs = Object.entries(chatObj || {})
    .map(([id,m]) => ({id, ...m}))
    .sort((a,b) => (a.ts||0) - (b.ts||0));
  const myUid = Storage.getUserId();
  if (!msgs.length){
    container.innerHTML = '<div style="text-align:center;color:#666;font-size:0.8rem;padding:20px">Belum ada pesan.</div>';
    return;
  }
  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  container.innerHTML = msgs.map(m => {
    const time = formatChatTime(m.ts);
    return `
      <div class="chat-msg ${m.uid===myUid?'me':''}">
        <b>${escapeHtml(m.name||'Anon')}</b>: ${escapeHtml(m.text||'')}
        <span class="chat-time">🕐 ${time}</span>
      </div>
    `;
  }).join('');
  if (isAtBottom) container.scrollTop = container.scrollHeight;
}
window.sendChatMsg = async function(){
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text || !S.clanId) return;

  const clan = await ClanStorage.getClan(S.clanId);
  if (clan){
    const me = clan.members[Storage.getUserId()];
    if (me && me.mutedUntil && me.mutedUntil > Date.now()){
      return toast('🔇 Kamu sedang dibisukan!');
    }
  }

  await ClanStorage.sendChat(S.clanId, {
    uid: Storage.getUserId(),
    name: S.playerName || 'Pemain',
    text: text.slice(0,200),
    ts: Date.now()
  });
  input.value = '';
  input.focus();
};

/* ============================================================
   FRIEND SYSTEM
   ============================================================ */
let savedFriendQuery = '';
let savedFriendResultHtml = '';

function renderFriendPanel(){
  const panel = document.getElementById('panel-friend');
  if (!panel) return;

  let html = `
    <div class="friend-tabs">
      <button class="${currentFriendTab==='list'?'active':''}" onclick="switchFriendTab('list')">👥 Teman</button>
      <button class="${currentFriendTab==='requests'?'active':''}" onclick="switchFriendTab('requests')">📩 Permintaan</button>
      <button class="${currentFriendTab==='add'?'active':''}" onclick="switchFriendTab('add')">➕ Tambah</button>
    </div>
  `;

  if (currentFriendTab === 'list'){
    const friends = Object.entries(S.friends || {});
    if (!friends.length){
      html += '<div style="text-align:center;color:#888;padding:20px">Belum ada teman.<br>Yuk cari teman di tab "➕ Tambah"!</div>';
    } else {
      friends.sort((a,b) => a[1].name.localeCompare(b[1].name));
      for (const [fuid, f] of friends){
        html += `
          <div class="friend-row" data-fuid="${fuid}">
            <div class="left">
              <span class="online-dot off"></span>
              <span class="name">${escapeHtml(f.name)}</span>
              <div class="sub" id="friendSub-${fuid}">Memeriksa...</div>
            </div>
            <div class="actions">
              <button class="btn-small-blue" onclick="openProfile('${fuid}')">👤</button>
              <button class="btn-small-purple" onclick="openPrivateChat('${fuid}', '${escapeHtml(f.name)}')">💬</button>
              <button class="btn-small-red" onclick="removeFriendConfirm('${fuid}')">✕</button>
            </div>
          </div>
        `;
      }
    }
  }
  else if (currentFriendTab === 'requests'){
    const requests = Object.entries(S.friendRequests || {});
    if (!requests.length){
      html += '<div style="text-align:center;color:#888;padding:20px">Tidak ada permintaan.</div>';
    } else {
      for (const [ruid, req] of requests){
        html += `
          <div class="friend-row">
            <div class="left">
              <span class="name">${escapeHtml(req.name || 'Pemain')}</span>
              <div class="sub">Ingin berteman</div>
            </div>
            <div class="actions">
              <button class="btn-small-green" onclick="acceptFriend('${ruid}')">✓</button>
              <button class="btn-small-red" onclick="rejectFriend('${ruid}')">✕</button>
            </div>
          </div>
        `;
      }
    }
  }
  else if (currentFriendTab === 'add'){
    html += `
      <div class="clan-search-box">
        <h4>🔍 Cari Pemain by Nama</h4>
        <input type="text" id="friendSearchInput" placeholder="Ketik nama pemain..."
               value="${escapeHtml(savedFriendQuery)}"
               onkeydown="if(event.key==='Enter'){event.preventDefault();searchFriend();}">
        <button class="btn-blue" style="width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;font-weight:bold" onclick="searchFriend()">Cari</button>
        <div id="friendSearchResult" style="margin-top:10px">${savedFriendResultHtml}</div>
      </div>
    `;
  }

  panel.innerHTML = html;
  if (currentFriendTab === 'list') updateFriendOnlineStatuses();
}

async function updateFriendOnlineStatuses(){
  const friends = Object.entries(S.friends || {});
  for (const [fuid, _] of friends){
    const row = document.querySelector(`.friend-row[data-fuid="${fuid}"]`);
    if (!row) continue;
    const dot = row.querySelector('.online-dot');
    const sub = document.getElementById(`friendSub-${fuid}`);
    const ts = await fetchUserLastSeen(fuid);
    const online = isUserOnline(fuid, ts);
    if (dot) dot.className = 'online-dot ' + (online ? 'on' : 'off');
    if (sub){
      if (online){
        sub.textContent = '🟢 Online';
        sub.style.color = '#00ff90';
      } else if (ts){
        sub.textContent = `🕐 Terakhir online: ${timeAgo(ts)}`;
        sub.style.color = '#888';
      } else {
        sub.textContent = '⚫ Offline';
        sub.style.color = '#666';
      }
    }
  }
}

window.switchFriendTab = function(tab){
  currentFriendTab = tab;
  if (tab !== 'add'){ savedFriendQuery = ''; savedFriendResultHtml = ''; }
  renderFriendPanel();
};

window.searchFriend = async function(){
  const input = document.getElementById('friendSearchInput');
  const result = document.getElementById('friendSearchResult');
  if (!input || !result) return;
  const name = (input.value || '').trim();
  savedFriendQuery = name;
  if (name.length < 2){
    result.innerHTML = '<div style="color:#ff8080;font-size:0.8rem">Minimal 2 karakter</div>';
    savedFriendResultHtml = result.innerHTML;
    return;
  }
  result.innerHTML = '<div style="color:#aaa;font-size:0.8rem">Mencari...</div>';
  const users = await FriendStorage.searchUserByName(name);
  const myUid = Storage.getUserId();

  if (!users.length){
    result.innerHTML = '<div style="color:#ff8080;font-size:0.8rem">❌ Tidak ditemukan</div>';
    savedFriendResultHtml = result.innerHTML;
    return;
  }

  let html = '';
  for (const u of users.slice(0, 20)){
    const isFriend = S.friends && S.friends[u.uid];
    const isSent = S.sentRequests && S.sentRequests[u.uid];
    const isSelf = u.uid === myUid;
    const online = isUserOnline(u.uid, u.lastOnline);
    const dotClass = online ? 'on' : 'off';
    const statusText = online ? '🟢 Online' : `🕐 ${timeAgo(u.lastOnline)}`;

    let actionBtn = '';
    if (isSelf) actionBtn = '<button class="btn-small-gray" disabled>Kamu</button>';
    else if (isFriend) actionBtn = `
      <button class="btn-small-blue" onclick="openProfile('${u.uid}')">👤</button>
      <button class="btn-small-purple" onclick="openPrivateChat('${u.uid}', '${escapeHtml(u.name)}')">💬</button>
    `;
    else if (isSent) actionBtn = '<button class="btn-small-gray" disabled>⏳</button>';
    else actionBtn = `
      <button class="btn-small-blue" onclick="openProfile('${u.uid}')">👤</button>
      <button class="btn-small-green" onclick="sendFriendRequest('${u.uid}')">➕</button>
    `;

    html += `
      <div class="friend-row">
        <div class="left">
          <span class="online-dot ${dotClass}"></span>
          <span class="name">${escapeHtml(u.name)}</span>
          <div class="sub">Lv.${u.level} • [${escapeHtml(u.clanTag)}] ${escapeHtml(u.clanName)}</div>
          <div class="sub" style="${online?'color:#00ff90':'color:#888'}">${statusText}</div>
        </div>
        <div class="actions">${actionBtn}</div>
      </div>
    `;
  }
  result.innerHTML = html;
  savedFriendResultHtml = html;
};

window.sendFriendRequest = async function(toUid){
  if (S.friends && S.friends[toUid]) return toast('Sudah berteman');
  if (S.sentRequests && S.sentRequests[toUid]) return toast('Sudah kirim permintaan');
  const ok = await FriendStorage.sendRequest(toUid, S.playerName || 'Pemain');
  if (ok){
    S.sentRequests = S.sentRequests || {};
    S.sentRequests[toUid] = { sentAt: Date.now() };
    save();
    toast('📩 Permintaan terkirim!');
    searchFriend();
  } else toast('❌ Gagal');
};

window.acceptFriend = async function(fromUid){
  const ok = await FriendStorage.acceptRequest(fromUid);
  if (ok){ save(); toast('✅ Berteman!'); renderFriendPanel(); }
  else toast('❌ Gagal');
};

window.rejectFriend = async function(fromUid){
  const ok = await FriendStorage.rejectRequest(fromUid);
  if (ok){ save(); toast('❌ Ditolak'); renderFriendPanel(); }
};

window.removeFriendConfirm = async function(fuid){
  const f = S.friends[fuid];
  if (!f) return;
  if (!confirm(`Hapus ${f.name}?`)) return;
  const ok = await FriendStorage.removeFriend(fuid);
  if (ok){ save(); toast('👋 Dihapus'); renderFriendPanel(); }
};

window.openProfile = async function(uid){
  const profile = await fetchUserProfile(uid);
  if (!profile) return toast('❌ Tidak ditemukan');
  const online = isUserOnline(uid, profile.lastOnline);
  const statusHtml = online 
    ? '<span style="color:#00ff90">🟢 Online</span>' 
    : `<span style="color:#888">🕐 Terakhir online: ${timeAgo(profile.lastOnline)}</span>`;
  const isSelf = uid === Storage.getUserId();
  const isFriend = S.friends && S.friends[uid];

  let actionHtml = '';
  if (!isSelf && !isFriend){
    actionHtml = `<button class="btn-primary" style="width:100%;padding:10px;border-radius:10px;border:none;cursor:pointer;font-weight:bold;margin-top:10px" onclick="closeProfileModal();sendFriendRequest('${uid}')">➕ Tambah Teman</button>`;
  } else if (isFriend){
    actionHtml = `<button class="btn-primary" style="width:100%;padding:10px;border-radius:10px;border:none;cursor:pointer;font-weight:bold;margin-top:10px" onclick="closeProfileModal();openPrivateChat('${uid}', '${escapeHtml(profile.name)}')">💬 Chat Pribadi</button>`;
  }

  const bioHtml = profile.bio 
    ? `<div style="font-size:0.8rem;color:#ddd;font-style:italic;margin-top:6px;padding:8px;background:rgba(0,0,0,0.3);border-radius:6px">${escapeHtml(profile.bio)}</div>`
    : '';

  document.getElementById('profileContent').innerHTML = `
    <div class="profile-card">
      <div class="avatar">👤</div>
      <h3>${escapeHtml(profile.name)}</h3>
      ${bioHtml}
      <div class="meta">🏆 Level <b>${profile.level}</b></div>
      <div class="meta">🏰 Clan: <b>[${escapeHtml(profile.clanTag)}] ${escapeHtml(profile.clanName)}</b></div>
      <div class="meta">${statusHtml}</div>
      ${actionHtml}
    </div>
  `;
  document.getElementById('profileModal').classList.add('show');
};
window.closeProfileModal = function(){
  document.getElementById('profileModal').classList.remove('show');
};

window.openPrivateChat = async function(otherUid, otherName){
  currentPrivateChatUid = otherUid;
  document.getElementById('privateChatName').textContent = otherName;
  document.getElementById('privateChatModal').classList.add('show');
  const ts = await fetchUserLastSeen(otherUid);
  const online = isUserOnline(otherUid, ts);
  document.getElementById('privateChatStatus').innerHTML = online
    ? '<span style="color:#00ff90">🟢 Online</span>'
    : `<span style="color:#888">🕐 Terakhir online: ${timeAgo(ts)}</span>`;
  stopPrivateChatListener();
  privateChatUnsubscribe = FriendStorage.listenPrivateChat(otherUid, renderPrivateChat);
  if (privateChatTimerInterval) clearInterval(privateChatTimerInterval);
  privateChatTimerInterval = setInterval(async () => {
    if (!currentPrivateChatUid) return;
    const ts2 = await fetchUserLastSeen(currentPrivateChatUid);
    const online2 = isUserOnline(currentPrivateChatUid, ts2);
    document.getElementById('privateChatStatus').innerHTML = online2
      ? '<span style="color:#00ff90">🟢 Online</span>'
      : `<span style="color:#888">🕐 Terakhir online: ${timeAgo(ts2)}</span>`;
  }, 10000);
};

window.closePrivateChat = function(){
  document.getElementById('privateChatModal').classList.remove('show');
  stopPrivateChatListener();
  currentPrivateChatUid = null;
  if (privateChatTimerInterval){
    clearInterval(privateChatTimerInterval);
    privateChatTimerInterval = null;
  }
};

function stopPrivateChatListener(){
  if (privateChatUnsubscribe){ privateChatUnsubscribe(); privateChatUnsubscribe = null; }
}

function renderPrivateChat(chatObj){
  const container = document.getElementById('privateChatBox');
  if (!container) return;
  const msgs = Object.entries(chatObj || {})
    .map(([id,m]) => ({id, ...m}))
    .sort((a,b) => (a.ts||0) - (b.ts||0));
  const myUid = Storage.getUserId();
  if (!msgs.length){
    container.innerHTML = '<div style="text-align:center;color:#666;font-size:0.8rem;padding:20px">Belum ada pesan.</div>';
    return;
  }
  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
  container.innerHTML = msgs.map(m => {
    const time = formatChatTime(m.ts);
    const isMe = m.from === myUid;
    return `
      <div class="chat-msg ${isMe?'me':''}">
        ${escapeHtml(m.text||'')}
        <span class="chat-time">🕐 ${time}</span>
      </div>
    `;
  }).join('');
  if (isAtBottom) container.scrollTop = container.scrollHeight;
}

window.sendPrivateMsg = async function(){
  if (!currentPrivateChatUid) return;
  const input = document.getElementById('privateChatInput');
  const text = (input.value || '').trim();
  if (!text) return;
  const ok = await FriendStorage.sendPrivateMsg(currentPrivateChatUid, text);
  if (ok){ input.value = ''; input.focus(); }
  else toast('❌ Gagal');
};

function startUserDataListener(){
  if (!currentUid) return;
  onValue(ref(db, `users/${currentUid}/friendRequests`), snap => {
    S.friendRequests = snap.val() || {};
    save();
    const panel = document.getElementById('panel-friend');
    if (panel && !panel.classList.contains('hidden')){
      if (!isUserTypingInFriends()) renderFriendPanel();
    }
  });
  onValue(ref(db, `users/${currentUid}/friends`), snap => {
    S.friends = snap.val() || {};
    save();
    const panel = document.getElementById('panel-friend');
    if (panel && !panel.classList.contains('hidden')){
      if (!isUserTypingInFriends()) renderFriendPanel();
    }
  });
  onValue(ref(db, `users/${currentUid}/sentRequests`), snap => {
    S.sentRequests = snap.val() || {};
    save();
  });
}

/* ============================================================
   REDEEM
   ============================================================ */
const CODES = {
  'ENOVA-ORIGIN-2026': ()=>{ S.token+=2; S.money+=1000; return '+✴️2 & +€1.000'; },
  'ELIX-9F2M-V6TR':    ()=>{ S.token+=4; return '+✴️4'; },
  'EVGN-2P8L-Q5NX':    ()=>{ S.token+=12; return '+✴️12'; }
};
window.redeemCode = function(){
  const input = document.getElementById('redeemInput');
  const code = input.value.trim().toUpperCase();
  if (!code) return;
  if (S.usedCodes.includes(code)) return toast('Kode sudah ditukar!');
  if (!CODES[code]) return toast('Kode tidak valid!');
  const reward = CODES[code]();
  S.usedCodes.push(code);
  input.value = '';
  toast('🎁 Berhasil! ' + reward);
  render(); save();
};

/* ============================================================
   DEV MODE
   ============================================================ */
window.activateDevMode = function(){
  const input = document.getElementById('devKeyInput');
  const key = input.value;
  if (!validateDevKey(key)){ toast('❌ Developer Key tidak valid!'); input.value = ''; return; }
  if (S.devUsed){ toast('⚡ Paket developer sudah diklaim.'); input.value = ''; return; }
  document.getElementById('devModal').classList.add('show');
  input.value = '';
};
window.closeDevModal = function(){ document.getElementById('devModal').classList.remove('show'); };
window.claimDevReward = function(){
  document.getElementById('devModal').classList.remove('show');
  if (S.devUsed) return;
  S.diamond += 3000;
  S.token   += 5000;
  S.money   += 100000;
  addExp(250000);
  S.devMode = true;
  S.devUsed = true;
  toast('⚡ DEVELOPER MODE AKTIF!');
  showDiamondPop(3000);
  render(); save();
};
document.getElementById('devModal').addEventListener('click', (e)=>{
  if (e.target.id === 'devModal') closeDevModal();
});

/* ============================================================
   RESET
   ============================================================ */
window.showResetModal = function(){
  const btn = document.getElementById('resetConfirmBtn');
  if (btn){ btn.disabled = false; btn.textContent = 'Ya, Reset'; }
  document.getElementById('resetModal').classList.add('show');
};
window.closeResetModal = function(){ document.getElementById('resetModal').classList.remove('show'); };
window.confirmReset = async function(){
  const btn = document.getElementById('resetConfirmBtn');
  if (btn){ btn.disabled = true; btn.textContent = '⏳ Memproses...'; }
  
  document.getElementById('resetModal').classList.remove('show');
  if (S.clanId){
    try {
      const clan = await ClanStorage.getClan(S.clanId);
      const uid = Storage.getUserId();
      if (clan && clan.members && clan.members[uid]){
        if (clan.members[uid].role === 'owner' && Object.keys(clan.members).length === 1){
          await ClanStorage.deleteClan(S.clanId, clan.name);
        } else {
          await ClanStorage.deleteInClan(S.clanId, `members/${uid}`);
        }
      }
    } catch(e){}
  }
  await Storage.wipe();
  S = { ...DEFAULT_STATE };
  savedSearchResult = null;
  savedFriendQuery = '';
  savedFriendResultHtml = '';
  invSearchQuery = '';
  currentInvTab = 'skin';
  render();
  await Storage.save(S);
  toast('🗑️ Data berhasil direset.');
};

document.getElementById('resetModal').addEventListener('click', (e)=>{
  if (e.target.id === 'resetModal') closeResetModal();
});
document.getElementById('createClanModal').addEventListener('click', (e)=>{
  if (e.target.id === 'createClanModal') closeCreateClanModal();
});
document.getElementById('profileModal').addEventListener('click', (e)=>{
  if (e.target.id === 'profileModal') closeProfileModal();
});
document.getElementById('privateChatModal').addEventListener('click', (e)=>{
  if (e.target.id === 'privateChatModal') closePrivateChat();
});
document.getElementById('transferModal').addEventListener('click', (e)=>{
  if (e.target.id === 'transferModal') closeTransferModal();
});
document.getElementById('muteModal').addEventListener('click', (e)=>{
  if (e.target.id === 'muteModal') closeMuteModal();
});
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape'){
    closeResetModal();
    closeDevModal();
    closeCreateClanModal();
    closeEditNameModal();
    closeEditBioModal();
    closeProfileModal();
    closePrivateChat();
    closeTransferModal();
    closeMuteModal();
    closeSkinDetail();
  }
});

/* ============================================================
   NAV
   ============================================================ */
document.querySelectorAll('.nav button').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    document.getElementById('panel-'+b.dataset.panel).classList.remove('hidden');
    if (b.dataset.panel === 'clan') renderClanPanel();
    else if (b.dataset.panel === 'friend') renderFriendPanel();
    else if (b.dataset.panel === 'skin') renderSkinPanel();
    else if (b.dataset.panel === 'inv') renderInvPanel();
    else if (b.dataset.panel === 'profile') renderProfilePanel();
    else stopChatListener();
  });
});

/* ============================================================
   INIT — TANPA LOADING SCREEN
   ============================================================ */
async function initFirebase(){
  return new Promise((resolve) => {
    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved){
        resolved = true;
        isOnline = false;
        updateOnlineTag();
        resolve();
      }
    }, 4000);

    onAuthStateChanged(auth, async (user) => {
      if (resolved) return;
      if (user){
        currentUid = user.uid;
        isOnline = true;
        updateOnlineTag();
        console.log('✅ Firebase UID:', currentUid);
        clearTimeout(timeoutId);
        resolved = true;
        resolve();
      } else {
        try {
          await signInAnonymously(auth);
        } catch(e){
          if (resolved) return;
          isOnline = false;
          updateOnlineTag();
          clearTimeout(timeoutId);
          resolved = true;
          resolve();
        }
      }
    });
  });
}

async function init(){
  // ★ Fire-and-forget: JALANKAN di background
  initFirebase().then(async () => {
    try {
      const saved = await Storage.load();
      if (saved){
        S = { ...DEFAULT_STATE, ...saved };
        S.friends = S.friends || {};
        S.friendRequests = S.friendRequests || {};
        S.sentRequests = S.sentRequests || {};
        S.playerBio = S.playerBio || '';
        render();
      }
    } catch(e){}
    if (currentUid && isOnline){
      try {
        const now = Date.now();
        await set(ref(db, `users/${currentUid}/lastOnline`), now);
        await set(ref(db, `users/${currentUid}/lastSeen`), now);
      } catch(e){}
    }
    startOnlineHeartbeat();
    startUserDataListener();
  });

  // ★ Load cache lokal DULU, langsung tampil
  try {
    const local = localStorage.getItem('enova_cache');
    if (local){
      S = { ...DEFAULT_STATE, ...JSON.parse(local) };
    }
  } catch(e){}

  // Auto-click offline catch-up
  const now = Date.now();
  if (S.autoEnd > 0 && S.autoEnd <= now){
    S.autoEnd = 0;
  } else if (S.autoEnd > now && S.lastAutoTick > 0){
    const elapsed = now - S.lastAutoTick;
    const ticks = Math.floor(elapsed / 1000);
    if (ticks > 0 && ticks < 3600){
      const maxCatchup = Math.min(ticks, 120);
      let gainedMoney = 0, gainedExp = 0;
      const expPerClick = getExpPerClick();
      for (let i=0; i<maxCatchup; i++){
        const base = HELPING_HAND_CONFIG.clickPowerMin +
                     Math.floor(Math.random() * (HELPING_HAND_CONFIG.clickPowerMax - HELPING_HAND_CONFIG.clickPowerMin + 1));
        gainedMoney += base;
        gainedExp += expPerClick;
      }
      S.money += gainedMoney;
      addExp(gainedExp);
      S.lastAutoTick = now - (elapsed % 1000);
      setTimeout(()=>toast(`👌 Auto click offline: +€${fmt(gainedMoney)}`), 800);
    }
  }

  render();
  startAutoLoop();
  setInterval(render, 1000);
  setInterval(save, 5000);

  setTimeout(()=>toast('🎮 Selamat bermain!'), 500);
}

init();